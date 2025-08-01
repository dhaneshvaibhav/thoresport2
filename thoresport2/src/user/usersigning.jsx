import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import logo from '../assets/logo.png';

function UserSigning() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMsg, setResetMsg] = useState('');
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

  const handleForgotPassword = async () => {
    if (!resetEmail) {
      setResetMsg('❌ Please enter your email address');
      return;
    }

    setResetMsg('🔄 Sending reset link...');
    
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setResetMsg(`❌ ${error.message}`);
    } else {
      setResetMsg('✅ Password reset link sent! Check your email.');
      setResetEmail('');
      setTimeout(() => {
        setShowForgotPassword(false);
        setResetMsg('');
      }, 3000);
    }
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

      <h2 style={headingStyle}>Log in</h2>

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

      <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
        <span 
          style={{ 
            color: '#0DCAF0', 
            cursor: 'pointer', 
            fontSize: '0.9rem',
            textDecoration: 'underline'
          }}
          onClick={() => setShowForgotPassword(true)}
        >
          Forgot Password?
        </span>
      </div>

            <button onClick={handleEmailLogin} style={buttonStyle}>
        Sign In with Email
      </button>

      {/* <button onClick={handleGoogleLogin} style={buttonStyle}>
        Sign In with Google
      </button> */}

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

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: '#000000',
            border: '2px solid #0DCAF0',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 0 25px #0DCAF080',
          }}>
            <h3 style={{ color: '#0DCAF0', textAlign: 'center', marginBottom: '1.5rem' }}>
              Reset Password
            </h3>
            
            <input
              type="email"
              placeholder="Enter your email address"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              style={inputStyle}
            />
            
            {resetMsg && (
              <p style={{
                color: resetMsg.startsWith('✅') ? '#0DCAF0' : 'red',
                textAlign: 'center',
                marginBottom: '1rem',
                fontSize: '0.9rem',
              }}>
                {resetMsg}
              </p>
            )}
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                onClick={handleForgotPassword}
                style={{
                  ...buttonStyle,
                  flex: 1,
                  backgroundColor: '#0DCAF0',
                }}
              >
                Send Reset Link
              </button>
              <button 
                onClick={() => {
                  setShowForgotPassword(false);
                  setResetEmail('');
                  setResetMsg('');
                }}
                style={{
                  ...buttonStyle,
                  flex: 1,
                  backgroundColor: 'transparent',
                  border: '1px solid #0DCAF0',
                  color: '#0DCAF0',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <p style={footerTextStyle}>
        Don't have an account?
        <span style={linkStyle} onClick={() => navigate('/signup')}>
          Sign Up
        </span>
      </p>
      <p style={footerTextStyle}>
        Are you A Admin?
        <span style={linkStyle} onClick={() => navigate('/admin/auth')}>
        Administrator 
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

// 🎨 Inline Styles
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
  color: '#0DCAF0',
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
  marginTop: '1.5rem',
};

const linkStyle = {
  color: '#0DCAF0',
  cursor: 'pointer',
  marginLeft: '0.3rem',
  fontWeight: '600',
};

export default UserSigning;
