import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Adminlogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSignin = async () => {
    setMessage('');
    try {
      const res = await axios.post('http://localhost:4000/org-login', { email, password });
      localStorage.setItem('orgToken', res.data.token);
      setMessage('✅ Sign in successful! Redirecting...');
      setTimeout(() => navigate('/admin/dashboard'), 1000);
    } catch (err) {
      setMessage('❌ Invalid email or password.');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: 'auto', padding: '2rem' }}>
      <h2>Admin Sign In</h2>

      <input
        type="email"
        placeholder="Admin Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ display: 'block', marginBottom: '1rem', width: '100%', padding: '0.5rem' }}
        required
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ display: 'block', marginBottom: '1rem', width: '100%', padding: '0.5rem' }}
        required
      />

      <button onClick={handleSignin} style={{ width: '100%', padding: '0.5rem' }}>
        Sign In as Admin
      </button>

      {message && <p style={{ marginTop: '1rem', color: message.startsWith('✅') ? 'green' : 'red' }}>{message}</p>}
    </div>
  );
}

export default Adminlogin;
