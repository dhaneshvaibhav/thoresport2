const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient("https://ltsombfuwcalqigfxccd.supabase.co","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0c29tYmZ1d2NhbHFpZ2Z4Y2NkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyOTk0MDUsImV4cCI6MjA2Njg3NTQwNX0.FzNBXrbO1HrBMVZVkuLi_8JFI37AoEIpl8LhASRR5As");
const JWT_SECRET = 'cococolapepsi'; // Use a strong secret in production

app.post('/org-login', async (req, res) => {
  const { email, password } = req.body;
  // Fetch org by email
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

app.listen(4000, () => console.log('Org Auth server running on port 4000')); 