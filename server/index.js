const express = require('express');
const sendMail = require('./sendMail');
require('dotenv').config();

// Import org-auth-server router
const orgRouter = require('./org-auth-server');

const app = express();
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

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 