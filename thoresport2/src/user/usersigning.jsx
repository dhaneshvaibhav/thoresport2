import { useState } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';

function UserSigning() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleEmailLogin = async () => {
    const { error } = await SupabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) setErrorMsg(error.message);
    else setErrorMsg('');
  };

  const handleGoogleLogin = async () => {
    const { error } = await SupabaseClient.auth.signInWithOAuth({
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

      {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}
    </div>
  );
}

export default UserSigning;
