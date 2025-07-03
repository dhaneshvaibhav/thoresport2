import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';

function UserDashboard() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingInvites, setPendingInvites] = useState([]);
  const [myTeams, setMyTeams] = useState([]);
  const [teamMembers, setTeamMembers] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTournaments = async () => {
      setLoading(true);
      setError('');
      try {
        let { data, error } = await supabase
          .from('tournaments')
          .select('*');
        if (error) throw error;
        data = (data || []).sort((a, b) => parseFloat(b.prize_pool) - parseFloat(a.prize_pool));
        setTournaments(data);
      } catch (err) {
        setError('Failed to fetch tournaments');
      } finally {
        setLoading(false);
      }
    };
    
    const fetchInvites = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from('team_members')
        .select('id, team_id, status, teams ( team_name )')
        .eq('user_id', user.id)
        .eq('status', 'pending');
      if (!error && data) setPendingInvites(data);
    };

    const fetchTeams = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from('team_members')
        .select('id, team_id, is_captain, status, teams ( team_name, team_logo_url )')
        .eq('user_id', user.id)
        .eq('status', 'active');
      if (!error && data) {
        setMyTeams(data);
        // Fetch members for each team
        for (const tm of data) {
          // Fetch team members with correct join to profiles
          const { data: members } = await supabase
            .from('team_members')
            .select('id, user_id, is_captain, status, profiles ( email, username )')
            .eq('team_id', tm.team_id)
            .eq('status', 'active');
          setTeamMembers(prev => ({ ...prev, [tm.team_id]: members || [] }));
        }
      }
    };

    fetchTournaments();
    fetchInvites();
    fetchTeams();
  }, []);

  const handleAccept = async (inviteId) => {
    await supabase.from('team_members').update({ status: 'active' }).eq('id', inviteId);
    setPendingInvites(pendingInvites.filter(inv => inv.id !== inviteId));
  };

  const handleDecline = async (inviteId) => {
    await supabase.from('team_members').update({ status: 'declined' }).eq('id', inviteId);
    setPendingInvites(pendingInvites.filter(inv => inv.id !== inviteId));
  };

  return (
    <div style={{ padding: '5rem', maxWidth: 1200, margin: '0 auto' }}>
      {myTeams.length > 0 && (
        <div style={{ marginBottom: 24, padding: 16, background: '#e3f2fd', borderRadius: 8 }}>
          <h3>My Teams</h3>
          <ul>
            {myTeams.map(team => (
              <li key={team.id} style={{ marginBottom: 16, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {team.teams?.team_logo_url && (
                    <img src={team.teams.team_logo_url} alt="logo" style={{ width: 32, height: 32, borderRadius: 4, marginRight: 12 }} />
                  )}
                  <b>{team.teams?.team_name || 'Team'}</b>
                  {team.is_captain && <span style={{ marginLeft: 8, color: '#1976d2', fontWeight: 600 }}>(Captain)</span>}
                </div>
                {teamMembers[team.team_id] && (
                  <ul style={{ marginTop: 6, marginLeft: 40 }}>
                    {teamMembers[team.team_id].map(member => (
                      <li key={member.id} style={{ fontSize: 15 }}>
                        {member.profiles?.username || member.profiles?.email || member.user_id}
                        {member.is_captain && <span style={{ color: '#1976d2', fontWeight: 600, marginLeft: 4 }}>(Captain)</span>}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      {pendingInvites.length > 0 && (
        <div style={{ marginBottom: 24, padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
          <h3>Team Invitations</h3>
          <ul>
            {pendingInvites.map(invite => (
              <li key={invite.id} style={{ marginBottom: 8 }}>
                <b>{invite.teams?.team_name || 'Team'}</b>
                <button onClick={() => handleAccept(invite.id)} style={{ marginLeft: 12, background: '#4caf50', color: 'white', border: 'none', borderRadius: 4, padding: '4px 12px', cursor: 'pointer' }}>Accept</button>
                <button onClick={() => handleDecline(invite.id)} style={{ marginLeft: 8, background: '#f44336', color: 'white', border: 'none', borderRadius: 4, padding: '4px 12px', cursor: 'pointer' }}>Decline</button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <button
        onClick={() => navigate('/create-team')}
        style={{ marginBottom: '1.5rem', padding: '0.5rem 1.5rem', background: '#1976d2', color: 'white', border: 'none', borderRadius: 4, fontWeight: 'bold', cursor: 'pointer' }}
      >
        Create Team
      </button>
      {loading && <p>Loading tournaments...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        {tournaments.map(t => (
          <div key={t.id} style={{ border: '1px solid #ccc', borderRadius: 8, padding: 16, width: 300, background: '#fafbfc', boxShadow: '0 2px 8px #0001' }}>
            {t.logo_url && <img src={t.logo_url} alt={t.name} style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 4, marginBottom: 8 }} />}
            <h2 style={{ margin: '8px 0' }}>{t.name}</h2>
            <p><b>Prize Pool:</b> {t.prize_pool}</p>
            <p><b>Start:</b> {t.start_date}</p>
            <p><b>End:</b> {t.end_date}</p>
            <p><b>Game:</b> {t.game}</p>
            <p><b>Mode:</b> {t.mode}</p>
            <button onClick={() => alert(`Join ${t.name}`)} style={{ marginTop: 8, padding: '8px 16px', background: '#4caf50', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', marginRight: 8 }}>Join</button>
            <button onClick={() => navigate(`/tournament/${t.id}`)} style={{ marginTop: 8, padding: '8px 16px', background: '#2196f3', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>View More</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UserDashboard;