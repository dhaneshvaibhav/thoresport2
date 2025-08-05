import { useState } from 'react'; 
import { supabase } from '../supabase';
import logo from '../assets/logo.png'; // replace with your logo path

function UserSignup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSignup = async () => {
    // Validate inputs
    if (!email || !password) {
      setMsg('❌ Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setMsg('❌ Password must be at least 6 characters long');
      return;
    }

    if (!acceptedTerms) {
      setMsg('❌ Please accept the terms and conditions');
      return;
    }

    setMsg('🔄 Checking if user exists...');

    try {
      // Let Supabase handle user existence check during signup
      // Supabase will automatically return an error if user already exists

      // If user doesn't exist, proceed with signup
      setMsg('🔄 Creating account...');
      
      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase(),
        password,
      });

      if (error) {
        setMsg(`❌ ${error.message}`);
      } else {
        setMsg('✅ Signup successful! Check your email to confirm.');
        console.log('Signup data:', data);
        
        // Clear form after successful signup
        setEmail('');
        setPassword('');
        setAcceptedTerms(false);
      }
    } catch (error) {
      console.error('Signup error:', error);
      setMsg('❌ An unexpected error occurred. Please try again.');
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

        <div style={checkboxContainerStyle}>
          <input
            type="checkbox"
            id="terms"
            checked={acceptedTerms}
            onChange={e => setAcceptedTerms(e.target.checked)}
            style={checkboxStyle}
          />
          <label htmlFor="terms" style={checkboxLabelStyle}>
            I accept the{' '}
            <a href="/terms" style={linkStyle} target="_blank" rel="noopener noreferrer">
              Terms and Conditions
            </a>
          </label>
        </div>

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
          <a href="/signin" style={linkStyle}>Login</a>
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
  fontFamily: "'Orbitron', sans-serif",
};

const inputStyle = {
  display: 'block',
  width: '100%',
  padding: '0.75rem',
  marginBottom: '1rem',
  borderRadius: '6px',
  fontSize: '1rem',
  outline: 'none',
  backgroundColor: '#111111',
  border: '1px solid #0DCAF0',
  fontFamily: "'Orbitron', sans-serif",
  color: '#0DCAF0',
};

const checkboxContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  marginBottom: '1rem',
  textAlign: 'left',
  fontSize: '0.85rem',
};

const checkboxStyle = {
  marginRight: '0.5rem',
  accentColor: '#0DCAF0',
};

const checkboxLabelStyle = {
  color: '#aaa',
  fontFamily: "'Orbitron', sans-serif",
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
  fontFamily: "'Orbitron', sans-serif",
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