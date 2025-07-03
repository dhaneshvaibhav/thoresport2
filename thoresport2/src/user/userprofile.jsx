import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

function UserProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [teams, setTeams] = useState([]);
  const [tournaments, setTournaments] = useState([]);

  useEffect(() => {
    const fetchProfile = async () => {
      // 1. Get Auth User
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 2. Get Profile Info
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      setProfile(profileData);

      // 3. Get Teams
      const { data: teamsData } = await supabase
        .from('teams')
        .select('*')
        .eq('user_id', user.id);
      setTeams(teamsData);

      // 4. Get Tournaments
      const { data: tournamentsData } = await supabase
        .from('tournaments')
        .select('*')
        .eq('user_id', user.id);
      setTournaments(tournamentsData);
    };

    fetchProfile();
  }, []);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error.message);
    } else {
      navigate('/signin'); // Redirect to login page after sign out
    }
  };

  if (!profile) return <div>Loading...</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <h1>User Profile</h1>
      <p>Name: {profile.full_name}</p>
      <p>Email: {profile.email}</p>
      {/* List teams */}
      <h2>Teams</h2>
      <ul>
        {teams.map(team => <li key={team.id}>{team.name}</li>)}
      </ul>
      {/* List tournaments */}
      <h2>Tournaments</h2>
      <ul>
        {tournaments.map(tournament => <li key={tournament.id}>{tournament.name}</li>)}
      </ul>
      <button onClick={handleSignOut} style={{ marginTop: '1rem' }}>
        Sign Out
      </button>
    </div>
  );
}

export default UserProfile;
