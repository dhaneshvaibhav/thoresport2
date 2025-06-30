import { useState } from 'react';
import { supabase } from '../supabase'; // ✅ This is the correct import

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
    <div style={{ padding: '2rem', maxWidth: '400px', margin: 'auto' }}>
      <h2>Create an Account</h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ display: 'block', marginBottom: '1rem', width: '100%' }}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ display: 'block', marginBottom: '1rem', width: '100%' }}
      />

      <button onClick={handleSignup} style={{ width: '100%' }}>
        Sign Up
      </button>

      {msg && <p style={{ marginTop: '1rem', color: msg.startsWith('✅') ? 'green' : 'red' }}>{msg}</p>}
    </div>
  );
}

export default UserSignup;
