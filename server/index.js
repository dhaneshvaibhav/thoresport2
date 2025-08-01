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

// In-memory storage for demo (replace with DB in production)
const tournamentVotes = {}; // { requestId: { teamId, tournamentId, responses: { email: 'accept'|'decline' } } }


// Tournament invite endpoint
app.post('/tournament-invite', async (req, res) => {
  const { registrationId, teamId, tournamentId, teamEmails, tournamentName } = req.body;
  if (!registrationId || !teamId || !tournamentId || !teamEmails || !tournamentName) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Generate a unique request ID (for in-memory, but you should use registrationId for DB)
  const requestId = registrationId; // Use registrationId as the requestId for consistency
  tournamentVotes[requestId] = { teamId, tournamentId, teamEmails, responses: {} };

  // Send email to each member with unique accept/decline links
  for (const email of teamEmails) {
    const acceptLink = http://localhost:4000/tournament-response?requestId=${requestId}&email=${encodeURIComponent(email)}&response=accept;
    const declineLink = http://localhost:4000/tournament-response?requestId=${requestId}&email=${encodeURIComponent(email)}&response=decline;
    const html = `
      <p>You are invited to join tournament: <b>${tournamentName}</b></p>
      <p>
        <a href="${acceptLink}">Accept</a> | 
        <a href="${declineLink}">Decline</a>
      </p>
    `;
    await sendMail({ to: email, subject: Tournament Invitation: ${tournamentName}, html });
  }

  res.json({ success: true, requestId });
});

// Tournament response endpoint
app.get('/tournament-response', async (req, res) => {
  const { requestId, email, response } = req.query;
  if (!requestId || !email || !response) {
    return res.status(400).send('Invalid response link.');
  }
  if (!tournamentVotes[requestId]) {
    return res.status(404).send('Request not found.');
  }

  tournamentVotes[requestId].responses[email] = response;

  // When a member responds:
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

  // Check if all members responded
  const total = Object.keys(tournamentVotes[requestId].responses).length;
  const teamSize = Object.keys(tournamentVotes[requestId].responses).length; // For demo, use responses length
  // In production, use teamEmails.length

  // Count votes
  const { data: responses } = await supabase
    .from('tournament_join_responses')
    .select('response')
    .eq('registration_id', requestId);

  const accepts = responses.filter(r => r.response === 'accept').length;
  const declines = responses.filter(r => r.response === 'decline').length;

  // For demo, decide when all responded
  if (total === tournamentVotes[requestId].teamEmails.length) {
    if (accepts === tournamentVotes[requestId].teamEmails.length) {
      // All accepted: update registration status in DB
      await supabase
        .from('tournament_registrations')
        .update({ status: 'registered' })
        .eq('id', requestId);

      res.send('All members accepted. Team joined the tournament!');
    } else {
      // At least one declined: update registration status in DB
      await supabase
        .from('tournament_registrations')
        .update({ status: 'declined' })
        .eq('id', requestId);

      res.send('One or more members declined. Team will not join the tournament.');
    }
  } else {
    res.send('Your response has been recorded. Waiting for other members.');
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log('Server running on port ${PORT});
});