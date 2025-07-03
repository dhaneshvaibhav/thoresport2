import { useState } from 'react'; 
import { supabase } from '../supabase';
import logo from '../assets/logo.png'; // replace with your logo path

function UserSignup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');

  const handleSignup = async () => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMsg(`❌ ${error.message}`);
    } else {
      setMsg('✅ Signup successful! Check your email to confirm.');
      console.log('Signup data:', data);
    }
  };

  return (
    <div style={wrapperStyle}>
      <div style={formStyle}>
        <img src={logo} alt="Logo" style={logoStyle} />
        <h2 style={titleStyle}>Sign Up</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={inputStyle}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={inputStyle}
        />

        <button onClick={handleSignup} style={buttonStyle}>
          Create Account
        </button>

        {msg && (
          <p style={{ ...messageStyle, color: msg.startsWith('✅') ? '#0DCAF0' : 'red' }}>
            {msg}
          </p>
        )}

        <p style={bottomText}>
          Already have an account?{' '}
          <a href="/login" style={linkStyle}>Login</a>
        </p>
      </div>

      {/* 👇 Keyframe animation injected inside the component */}
      <style>
        {`
          @keyframes glowPulse {
            0% {
              filter: drop-shadow(0 0 0px #0DCAF0);
              transform: scale(1);
            }
            50% {
              filter: drop-shadow(0 0 10px #0DCAF0);
              transform: scale(1.05);
            }
            100% {
              filter: drop-shadow(0 0 0px #0DCAF0);
              transform: scale(1);
            }
          }
        `}
      </style>
    </div>
  );
}

// 💅 Styles
const wrapperStyle = {
  backgroundColor: '#0d0d0d',
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: "'Orbitron', sans-serif",
};

const formStyle = {
  padding: '2rem',
  maxWidth: '400px',
  width: '100%',
  borderRadius: '12px',
  border: '2px solid #0DCAF0',
  backgroundColor: '#000000',
  boxShadow: '0 0 20px #0DCAF066',
  textAlign: 'center',
  color: '#fff',
};

const logoStyle = {
  width: '60px',
  marginBottom: '1rem',
  animation: 'glowPulse 2s infinite ease-in-out',
};

const titleStyle = {
  color: '#0DCAF0',
  marginBottom: '2rem',
};

const inputStyle = {
  display: 'block',
  width: '100%',
  padding: '0.75rem',
  marginBottom: '1rem',
  borderRadius: '6px',
  border: '1px solid #ccc',
  fontSize: '1rem',
  outline: 'none',
};

const buttonStyle = {
  width: '100%',
  padding: '0.75rem',
  backgroundColor: '#0DCAF0',
  color: '#000',
  border: 'none',
  borderRadius: '6px',
  fontWeight: '600',
  fontSize: '1rem',
  cursor: 'pointer',
  marginBottom: '1rem',
};

const messageStyle = {
  marginTop: '1rem',
  fontSize: '0.95rem',
};

const bottomText = {
  fontSize: '0.85rem',
  color: '#aaa',
};

const linkStyle = {
  color: '#0DCAF0',
  textDecoration: 'none',
};

export default UserSignup;
