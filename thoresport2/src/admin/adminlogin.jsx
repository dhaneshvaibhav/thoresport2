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
      const res = await axios.post('https://thoresport2-backend.onrender.com/org/login', { email, password });
      localStorage.setItem('orgToken', res.data.token);
      setMessage('✅ Sign in successful! Redirecting...');
      setTimeout(() => navigate('/admin/dashboard'), 1000);
    } catch (err) {
      setMessage('❌ Invalid email or password.');
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card} className="admin-login-card">
        <div style={styles.logo}>⚡</div>
        <h2 style={styles.title}>Admin Sign In</h2>

        <input
          type="email"
          placeholder="Admin Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
          required
        />

        <button onClick={handleSignin} style={styles.button}>
          Sign In as Admin
        </button>

        {message && (
          <p style={{ marginTop: '1rem', color: message.startsWith('✅') ? '#0f0' : '#f33' }}>
            {message}
          </p>
        )}
      </div>

      {/* Responsive CSS */}
      <style>
        {`
          @media (max-width: 600px) {
            .admin-login-card {
              width: 90% !important;
              padding: 1.5rem !important;
            }

            input, button {
              font-size: 1rem !important;
              padding: 0.8rem !important;
            }
          }
        `}
      </style>
    </div>
  );
}

const styles = {
  page: {
    backgroundColor: '#0a0a0a',
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: '"Orbitron", sans-serif',
    padding: '1rem',
  },
  card: {
    backgroundColor: '#111',
    border: '1px solid #00f0ff',
    borderRadius: '10px',
    padding: '2rem',
    width: '350px',
    textAlign: 'center',
    boxShadow: '0 0 15px #00f0ff',
  },
  logo: {
    fontSize: '2.5rem',
    color: '#00f0ff',
    marginBottom: '1rem',
  },
  title: {
    color: '#00f0ff',
    marginBottom: '1.5rem',
    fontSize: '1.5rem',
  },
  input: {
    backgroundColor: '#1a1a1a',
    color: '#00f0ff',
    border: '1px solid #00f0ff',
    padding: '0.7rem',
    borderRadius: '5px',
    width: '100%',
    marginBottom: '1rem',
    outline: 'none',
    fontSize: '1rem',
  },
  button: {
    backgroundColor: '#00f0ff',
    color: '#000',
    border: 'none',
    padding: '0.7rem',
    borderRadius: '5px',
    width: '100%',
    cursor: 'pointer',
    fontWeight: 'bold',
    boxShadow: '0 0 10px #00f0ff',
    transition: '0.3s',
    fontSize: '1rem',
  },
};

export default Adminlogin;
