const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(
  "https://ltsombfuwcalqigfxccd.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0c29tYmZ1d2NhbHFpZ2Z4Y2NkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTk0MDUsImV4cCI6MjA2Njg3NTQwNX0.FzNBXrbO1HrBMVZVkuLi_8JFI37AoEIpl8LhASRR5As"
);
const JWT_SECRET = 'cococolapepsi'; // Use a strong secret in production

app.post('/org-login', async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase
    .from('organizations')
    .select('id, email, password')
    .eq('email', email)
    .single();

  if (error || !data || data.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Create JWT
  const token = jwt.sign(
    { orgId: data.id, email: data.email, type: 'organization' },
    JWT_SECRET,
    { expiresIn: '2h' }
  );

  res.json({ token });
});

app.post('/create-tournament', async (req, res) => {
  // Get the token from the Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });

  const token = authHeader.split(' ')[1];
  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  const organization_id = decoded.orgId;
  if (!organization_id) {
    return res.status(400).json({ error: 'Organization ID not found in token' });
  }

  // Prepare tournament data
  const {
    name,
    logo_url,
    prize_pool,
    num_lobbies,
    teams_per_lobby,
    game,
    mode,
    start_date,
    end_date,
    lobby_urls
  } = req.body;

  // Validate required fields
  if (
    !name || !num_lobbies || !teams_per_lobby || !game || !mode ||
    !start_date || !end_date || !Array.isArray(lobby_urls)
  ) {
    return res.status(400).json({ error: 'Missing required tournament fields' });
  }

  // Insert into Supabase
  const { error } = await supabase.from('tournaments').insert([{
    name,
    logo_url,
    prize_pool,
    num_lobbies,
    teams_per_lobby,
    game,
    mode,
    start_date,
    end_date,
    lobby_urls,
    organization_id
  }]);

  if (error) {
    return res.status(500).json({ error: error.message || 'Failed to create tournament' });
  }

  res.json({ success: true });
});

app.get('/tournaments', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tournaments')
      .select('*');
    if (error) throw error;
    // Sort by prize_pool descending (convert to number if needed)
    const sorted = (data || []).sort((a, b) => parseFloat(b.prize_pool) - parseFloat(a.prize_pool));
    res.json({ tournaments: sorted });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to fetch tournaments' });
  }
});

app.listen(4000, () => console.log('Org Auth server running on port 4000')); 