import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

function UserProfile() {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error.message);
    } else {
      navigate('/signin'); // Redirect to login page after sign out
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>User Profile</h1>
      <button onClick={handleSignOut} style={{ marginTop: '1rem' }}>
        Sign Out
      </button>
    </div>
  );
}

export default UserProfile;
