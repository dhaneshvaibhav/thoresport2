import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

function UserSigning() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  const handleEmailLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMsg(`❌ ${error.message}`);
    } else {
      setMsg('✅ Login successful!');
      setTimeout(() => {
        navigate('/'); // redirect after success
      }, 1000); // short delay to show success message
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });

    if (error) console.error(error.message);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '400px', margin: 'auto' }}>
      <h2>Admin Login</h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        style={{ display: 'block', marginBottom: '1rem', width: '100%' }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        style={{ display: 'block', marginBottom: '1rem', width: '100%' }}
      />

      <button onClick={handleEmailLogin} style={{ width: '100%', marginBottom: '1rem' }}>
        Sign In with Email
      </button>

      <button onClick={handleGoogleLogin} style={{ width: '100%' }}>
        Sign In with Google
      </button>

      {msg && <p style={{ color: msg.startsWith('✅') ? 'green' : 'red', marginTop: '1rem' }}>{msg}</p>}
    </div>
  );
}

export default UserSigning;
