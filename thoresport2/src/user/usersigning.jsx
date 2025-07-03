import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import logo from '../assets/logo.png';

function UserSigning() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  const handleEmailLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setMsg(`❌ ${error.message}`);
    } else {
      setMsg('✅ Login successful!');
      setTimeout(() => {
        navigate('/');
      }, 1000);
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) console.error(error.message);
  };

  return (
    <div style={containerStyle}>
      {/* Glowing Logo */}
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <img
          src={logo}
          alt="ThorEsports Logo"
          style={{
            width: '90px',
            animation: 'glowPulse 2s infinite ease-in-out',
          }}
        />
      </div>

      <h2 style={headingStyle}>Login</h2>

      <input
        type="email"
        placeholder="Email Address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={inputStyle}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={inputStyle}
      />

      <button onClick={handleEmailLogin} style={buttonStyle}>
        Sign In with Email
      </button>

      <button onClick={handleGoogleLogin} style={buttonStyle}>
        Sign In with Google
      </button>

      {msg && (
        <p
          style={{
            color: msg.startsWith('✅') ? '#0DCAF0' : 'red',
            textAlign: 'center',
            marginTop: '1rem',
          }}
        >
          {msg}
        </p>
      )}

      <p style={footerTextStyle}>
        Don't have an account?{' '}
        <span style={linkStyle} onClick={() => navigate('/signup')}>
          Sign Up
        </span>
      </p>

      {/* Orbitron Font & Keyframes */}
      <link
        href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap"
        rel="stylesheet"
      />
      <style>{`
        @keyframes glowPulse {
          0% { filter: drop-shadow(0 0 0px #0DCAF0); }
          50% { filter: drop-shadow(0 0 12px #0DCAF0) brightness(1.3); }
          100% { filter: drop-shadow(0 0 0px #0DCAF0); }
        }
      `}</style>
    </div>
  );
}

// 🔧 Styling
const containerStyle = {
  padding: '2rem',
  maxWidth: '400px',
  width: '90%',
  margin: '8rem auto',
  fontFamily: "'Orbitron', sans-serif",
  border: '2px solid #0DCAF0',
  borderRadius: '12px',
  boxShadow: '0 0 25px #0DCAF080',
  backgroundColor: '#000000',
  color: '#ffffff',
};

const headingStyle = {
  textAlign: 'center',
  fontSize: '2rem',
  marginBottom: '1.5rem',
  color: '#0DCAF0',
};

const inputStyle = {
  display: 'block',
  marginBottom: '1.2rem',
  width: '100%',
  padding: '0.8rem',
  fontSize: '1rem',
  backgroundColor: '#111111',
  color: '#ffffff',
  border: '1px solid #0DCAF0',
  borderRadius: '8px',
  outline: 'none',
  fontFamily: "'Orbitron', sans-serif",
};

const buttonStyle = {
  width: '100%',
  padding: '0.8rem',
  backgroundColor: '#0DCAF0',
  color: '#000',
  fontWeight: '600',
  fontSize: '1rem',
  border: 'none',
  borderRadius: '8px',
  marginBottom: '1rem',
  cursor: 'pointer',
  fontFamily: "'Orbitron', sans-serif",
};

const footerTextStyle = {
  textAlign: 'center',
  fontSize: '0.9rem',
  color: '#aaaaaa',
};

const linkStyle = {
  color: '#0DCAF0',
  cursor: 'pointer',
  marginLeft: '0.3rem',
  fontWeight: '600',
};

export default UserSigning;
