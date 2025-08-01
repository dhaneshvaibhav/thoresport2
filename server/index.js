const express = require('express');
const sendMail = require('./sendMail');
require('dotenv').config();
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  "https://ltsombfuwcalqigfxccd.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0c29tYmZ1d2NhbHFpZ2Z4Y2NkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTk0MDUsImV4cCI6MjA2Njg3NTQwNX0.FzNBXrbO1HrBMVZVkuLi_8JFI37AoEIpl8LhASRR5As"
);

// Import org-auth-server router
const orgRouter = require('./org-auth-server');

const app = express();
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

// Mount org endpoints at /org
app.use('/org', orgRouter);

// Registration email endpoint
app.post('/send-registration-email', async (req, res) => {
  const { teamEmails, subject, html } = req.body;
  if (!teamEmails || !subject || !html) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    await sendMail({ to: teamEmails, subject, html });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Announcement email endpoint
app.post('/send-announcement-email', async (req, res) => {
  const { emails, subject, html } = req.body;
  if (!emails || !subject || !html) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    await sendMail({ to: emails, subject, html });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});




// Tournament invite endpoint
app.post('/tournament-invite', async (req, res) => {
  const { registrationId, teamId, tournamentId, teamEmails, tournamentName } = req.body;
  if (!registrationId || !teamId || !tournamentId || !teamEmails || !tournamentName) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Check if registration exists and is pending
  const { data: reg, error: regError } = await supabase
    .from('tournament_registrations')
    .select('id, status')
    .eq('id', registrationId)
    .maybeSingle();
  if (regError) {
    return res.status(500).json({ error: 'Error checking registration.' });
  }
  if (!reg) {
    return res.status(404).json({ error: 'Registration not found.' });
  }
  if (reg.status !== 'pending') {
    return res.status(400).json({ error: 'Registration is not pending.' });
  }

  // For each member, insert a row with response 'not_declared' if not already present, and send invite email
  for (const email of teamEmails) {
    // Upsert with response 'not_declared' (only if not already present)
    await supabase
      .from('tournament_join_responses')
      .upsert([
        {
          registration_id: registrationId,
          member_email: email,
          response: 'not_declared',
          responded_at: new Date().toISOString(),
        }
      ], { onConflict: ['registration_id', 'member_email'] });

    const acceptLink = `http://localhost:4000/tournament-response?requestId=${registrationId}&email=${encodeURIComponent(email)}&response=accept`;
    const declineLink = `http://localhost:4000/tournament-response?requestId=${registrationId}&email=${encodeURIComponent(email)}&response=decline`;
    const html = `
      <p>You are invited to join tournament: <b>${tournamentName}</b></p>
      <p>
        <a href="${acceptLink}">Accept</a> | 
        <a href="${declineLink}">Decline</a>
      </p>
    `;
    await sendMail({ to: email, subject: `Tournament Invitation: ${tournamentName}`, html });
  }

  res.json({ success: true, requestId: registrationId });
});

// Tournament response endpoint
app.get('/tournament-response', async (req, res) => {
  const { requestId, email, response } = req.query;
  if (!requestId || !email || !response) {
    return res.status(400).send('Invalid response link.');
  }

  // Update the member's response
  await supabase
    .from('tournament_join_responses')
    .upsert([
      {
        registration_id: requestId,
        member_email: email,
        response,
        responded_at: new Date().toISOString(),
      }
    ], { onConflict: ['registration_id', 'member_email'] });

  // Get the registration to find the team_id
  const { data: reg, error: regError } = await supabase
    .from('tournament_registrations')
    .select('team_id')
    .eq('id', requestId)
    .maybeSingle();
  if (regError || !reg) {
    return res.status(404).send('Registration not found.');
  }

  // Get all active team members for this team
  const { data: members, error: membersError } = await supabase
    .from('team_members')
    .select('profiles ( email )')
    .eq('team_id', reg.team_id)
    .eq('status', 'active');
  if (membersError) {
    return res.status(500).send('Error fetching team members.');
  }
  const memberEmails = (members || []).map(m => m.profiles?.email).filter(Boolean);
  if (memberEmails.length === 0) {
    return res.status(400).send('No team members found.');
  }

  // Get all responses for this registration
  const { data: responses, error: respError } = await supabase
    .from('tournament_join_responses')
    .select('member_email, response')
    .eq('registration_id', requestId);
  if (respError) {
    return res.status(500).send('Error fetching responses.');
  }

  // Check if all members have responded (none are 'not_declared')
  const responsesMap = {};
  for (const r of responses) {
    responsesMap[r.member_email] = r.response;
  }
  const allResponded = memberEmails.every(email => responsesMap[email] && responsesMap[email] !== 'not_declared');
  const allAccepted = memberEmails.every(email => responsesMap[email] === 'accept');
  const anyDeclined = memberEmails.some(email => responsesMap[email] === 'decline');

  if (allResponded) {
    if (allAccepted) {
      // All accepted: update registration status in DB
      await supabase
        .from('tournament_registrations')
        .update({ status: 'registered' })
        .eq('id', requestId);
      return res.send('All members accepted. Team joined the tournament!');
    } else if (anyDeclined) {
      // At least one declined: update registration status in DB
      await supabase
        .from('tournament_registrations')
        .update({ status: 'declined' })
        .eq('id', requestId);
      return res.send('One or more members declined. Team will not join the tournament.');
    }
  }
  return res.send('Your response has been recorded. Waiting for other members.');
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});