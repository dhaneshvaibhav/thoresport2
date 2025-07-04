import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

function RegisterTeamModal({ tournamentId, onClose }) {
  const [registeredTeams, setRegisteredTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [teamDetails, setTeamDetails] = useState(null);
  const [selectedTeamId, setSelectedTeamId] = useState('');

  useEffect(() => {
    const fetchRegisteredTeams = async () => {
      setLoading(true);
      setError('');
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');
        // Get all teams the user is a member of (active)
        const { data: teams, error: teamError } = await supabase
          .from('team_members')
          .select('team_id, is_captain, teams ( team_name, team_logo_url ), profiles ( username, email )')
          .eq('user_id', user.id)
          .eq('status', 'active');
        if (teamError) throw teamError;
        setRegisteredTeams(teams || []);
      } catch (err) {
        setError(err.message || 'Failed to fetch teams');
      } finally {
        setLoading(false);
      }
    };
    fetchRegisteredTeams();
  }, []);

  // Fetch team member counts for each team
  useEffect(() => {
    if (!registeredTeams.length) return;
    const fetchCounts = async () => {
      const counts = {};
      for (const tm of registeredTeams) {
        const { count, error } = await supabase
          .from('team_members')
          .select('id', { count: 'exact', head: true })
          .eq('team_id', tm.team_id)
          .eq('status', 'active');
        counts[tm.team_id] = error ? 0 : count;
      }
      setTeamDetails(counts);
    };
    fetchCounts();
  }, [registeredTeams]);

  return (
    <div style={{ background: 'white', padding: 32, borderRadius: 12, minWidth: 350, maxWidth: 500, boxShadow: '0 4px 24px #0003', position: 'relative' }}>
      <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 12, background: 'transparent', border: 'none', fontSize: 22, cursor: 'pointer' }}>&times;</button>
      <h2>Your Teams</h2>
      {loading ? <p>Loading...</p> : (
        <form onSubmit={async (e) => {
          e.preventDefault();
          setError('');
          setSuccess('');
          if (!selectedTeamId) {
            setError('Please select a team to register.');
            return;
          }
          // Check member count before registering
          if ((teamDetails?.[selectedTeamId] || 0) < 4) {
            setError('Team must have at least 4 active members to register.');
            return;
          }
          setLoading(true);
          setError('');
          setSuccess('');
          // Check if already registered
          const { data: alreadyRegistered, error: checkError } = await supabase
            .from('tournament_registrations')
            .select('id')
            .eq('tournament_id', tournamentId)
            .eq('team_id', selectedTeamId)
            .maybeSingle();
          if (checkError) {
            setError('Error checking registration.');
            setLoading(false);
            return;
          }
          if (alreadyRegistered) {
            setError('This team is already registered for this tournament.');
            setLoading(false);
            return;
          }
          // Register team
          const { error: regError } = await supabase
            .from('tournament_registrations')
            .insert({
              tournament_id: tournamentId,
              team_id: selectedTeamId,
              status: 'registered'
            });
          if (regError) {
            setError(regError.message || 'Registration failed.');
          } else {
            setSuccess('Team registered successfully!');
          }
          setLoading(false);
        }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {registeredTeams.length === 0 ? (
            <div style={{ color: '#888' }}>You are not a member of any team.</div>
          ) : (
            registeredTeams.map(tm => {
              const memberCount = teamDetails?.[tm.team_id] || 0;
              const disabled = memberCount < 4;
              return (
                <button
                  key={tm.team_id}
                  type="button"
                  onClick={() => !disabled && setSelectedTeamId(tm.team_id)}
                  disabled={disabled}
                  style={{
                    background: selectedTeamId === tm.team_id ? '#1976d2' : '#f5f5f5',
                    color: disabled ? '#aaa' : (selectedTeamId === tm.team_id ? 'white' : '#222'),
                    border: selectedTeamId === tm.team_id ? '2px solid #1976d2' : '1px solid #ccc',
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 8,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    fontWeight: 600,
                    fontSize: 16,
                    outline: selectedTeamId === tm.team_id ? '2px solid #1976d2' : 'none',
                    boxShadow: selectedTeamId === tm.team_id ? '0 2px 8px #1976d233' : 'none',
                    opacity: disabled ? 0.5 : 1,
                    transition: 'all 0.15s',
                  }}
                >
                  {tm.teams?.team_logo_url && <img src={tm.teams.team_logo_url} alt="Logo" style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover' }} />}
                  <span>{tm.teams?.team_name || tm.team_id}</span>
                  <span style={{ marginLeft: 8, fontSize: 14, color: '#555' }}>({memberCount} members)</span>
                  {tm.is_captain && <span style={{ color: selectedTeamId === tm.team_id ? '#fff' : '#1976d2', fontWeight: 600, marginLeft: 8 }}>(Captain)</span>}
                  {disabled && <span style={{ color: 'red', marginLeft: 8, fontSize: 13 }}>(Min 4 required)</span>}
                </button>
              );
            })
          )}
          <button
            type="submit"
            disabled={loading || !selectedTeamId}
            style={{
              background: '#1976d2',
              color: 'white',
              padding: '10px 0',
              borderRadius: 8,
              border: 'none',
              fontWeight: 700,
              fontSize: 18,
              marginTop: 8,
              cursor: loading || !selectedTeamId ? 'not-allowed' : 'pointer',
              opacity: loading || !selectedTeamId ? 0.7 : 1
            }}
          >
            Confirm Slot
          </button>
          {error && <div style={{ color: 'red' }}>{error}</div>}
          {success && <div style={{ color: 'green' }}>{success}</div>}
        </form>
      )}
    </div>
  );
}

export default RegisterTeamModal;
