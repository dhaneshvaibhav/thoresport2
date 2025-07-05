import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import logo from '../assets/logo.png';

function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [session, setSession] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get the current session to check if user is authenticated
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      
      if (!session) {
        setMessage('❌ Invalid or expired reset link. Please request a new password reset.');
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setMessage('❌ Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setMessage('❌ Password must be at least 6 characters long');
      return;
    }

    if (!session) {
      setMessage('❌ Invalid or expired reset link. Please request a new password reset.');
      return;
    }

    setLoading(true);
    setMessage('🔄 Updating password...');

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        setMessage(`❌ ${error.message}`);
      } else {
        setMessage('✅ Password updated successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/signin');
        }, 2000);
      }
    } catch (error) {
      setMessage(`❌ An error occurred: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestNewReset = () => {
    navigate('/signin');
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

      <h2 style={headingStyle}>Reset Password</h2>

      {!session ? (
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#ff6b6b', marginBottom: '1.5rem' }}>
            Invalid or expired reset link. Please request a new password reset.
          </p>
          <button onClick={handleRequestNewReset} style={buttonStyle}>
            Go to Sign In
          </button>
        </div>
      ) : (
        <form onSubmit={handlePasswordReset}>
          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            required
            minLength={6}
          />
          
          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={inputStyle}
            required
            minLength={6}
          />

          <button 
            type="submit" 
            disabled={loading} 
            style={{
              ...buttonStyle,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Updating Password...' : 'Update Password'}
          </button>
        </form>
      )}

      {message && (
        <p
          style={{
            color: message.startsWith('✅') ? '#0DCAF0' : message.startsWith('🔄') ? '#ffa500' : '#ff6b6b',
            textAlign: 'center',
            marginTop: '1rem',
            fontSize: '0.9rem',
          }}
        >
          {message}
        </p>
      )}

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

export default ResetPassword; 