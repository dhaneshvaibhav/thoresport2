import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

const neon = '#00f6ff';

function RegisterTeamModal({ tournament, onClose }) {
  const [registeredTeams, setRegisteredTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [teamDetails, setTeamDetails] = useState(null);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [teamMembers, setTeamMembers] = useState({});

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
        // Fetch members for each team
        const membersObj = {};
        for (const tm of teams || []) {
          const { data: members } = await supabase
            .from('team_members')
            .select('id, user_id, is_captain, profiles ( username, email )')
            .eq('team_id', tm.team_id)
            .eq('status', 'active');
          membersObj[tm.team_id] = members || [];
        }
        setTeamMembers(membersObj);
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
    <div style={styles.modal}>
      <button onClick={onClose} style={styles.closeBtn}>&times;</button>
      <h2 style={styles.title}>Register for {tournament?.name || 'Tournament'}</h2>
      {loading ? <p style={styles.loading}>Loading...</p> : (
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
            .eq('tournament_id', tournament?.id)
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
              tournament_id: tournament?.id,
              team_id: selectedTeamId,
              status: 'registered'
            });
          if (regError) {
            setError(regError.message || 'Registration failed.');
          } else {
            setSuccess('Team registered successfully!');
          }
          setLoading(false);
        }} style={styles.form}>
          {registeredTeams.length === 0 ? (
            <div style={styles.noTeams}>You are not a member of any team.</div>
          ) : (
            <div style={styles.teamsGrid}>
              {registeredTeams.map(tm => {
                const memberCount = teamDetails?.[tm.team_id] || 0;
                const disabled = memberCount < 4;
                const selected = selectedTeamId === tm.team_id;
                const members = teamMembers[tm.team_id] || [];
                return (
                  <div
                    key={tm.team_id}
                    style={{
                      ...styles.teamCard,
                      ...(selected ? styles.teamCardSelected : {}),
                      ...(disabled ? styles.teamCardDisabled : {}),
                    }}
                    onClick={() => !disabled && setSelectedTeamId(tm.team_id)}
                  >
                    <div style={styles.teamHeader}>
                      {tm.teams?.team_logo_url && <img src={tm.teams.team_logo_url} alt="Logo" style={styles.logoImgLarge} />}
                      <div>
                        <div style={styles.teamName}>{tm.teams?.team_name || tm.team_id}</div>
                        <div style={styles.memberCount}>{memberCount} member{memberCount !== 1 ? 's' : ''}</div>
                        {tm.is_captain && <span style={styles.captainBadge}>Captain</span>}
                        {disabled && <span style={styles.minRequired}>Min 4 required</span>}
                      </div>
                    </div>
                    <div style={styles.membersList}>
                      {members.map(m => (
                        <div key={m.id} style={styles.memberRow}>
                          <span style={styles.avatar}>{(m.profiles?.username || m.profiles?.email || '?')[0]?.toUpperCase()}</span>
                          <span style={styles.memberName}>{m.profiles?.username || m.profiles?.email || m.user_id}</span>
                          {m.is_captain && <span style={styles.captainSmall}>(C)</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <button
            type="submit"
            disabled={
              loading ||
              !selectedTeamId ||
              (selectedTeamId && (teamDetails?.[selectedTeamId] || 0) < 4)
            }
            style={{
              ...styles.confirmBtn,
              ...(
                loading ||
                !selectedTeamId ||
                (selectedTeamId && (teamDetails?.[selectedTeamId] || 0) < 4)
                  ? styles.confirmBtnDisabled
                  : {}
              ),
            }}
          >
            Confirm Slot
          </button>
          {error && <div style={styles.error}>{error}</div>}
          {success && <div style={styles.success}>{success}</div>}
        </form>
      )}
    </div>
  );
}

const styles = {
  modal: {
    background: '#000',
    color: neon,
    fontFamily: 'Orbitron, sans-serif',
    padding: 24,
    borderRadius: 16,
    minWidth: 280,
    maxWidth: 350,
    width: '95vw',
    boxSizing: 'border-box',
    boxShadow: `0 4px 24px ${neon}99`,
    position: 'relative',
    margin: '40px auto',
    border: `2px solid ${neon}`,
    maxHeight: '90vh',
    overflowY: 'auto',
  },
  closeBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    background: 'transparent',
    border: 'none',
    fontSize: 22,
    color: neon,
    cursor: 'pointer',
    transition: 'color 0.2s',
  },
  title: {
    textAlign: 'center',
    fontSize: 20,
    marginBottom: 18,
    color: neon,
    fontWeight: 700,
    letterSpacing: 1,
  },
  loading: {
    color: neon,
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  noTeams: {
    color: '#888',
    textAlign: 'center',
    fontSize: 14,
    margin: '16px 0',
  },
  teamsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    marginBottom: 10,
  },
  teamCard: {
    background: '#111',
    border: `1.5px solid ${neon}`,
    borderRadius: 10,
    padding: 12,
    cursor: 'pointer',
    transition: 'box-shadow 0.2s, border 0.2s',
    boxShadow: '0 2px 8px #00f6ff22',
    marginBottom: 2,
    opacity: 1,
  },
  teamCardSelected: {
    border: `2.5px solid ${neon}`,
    boxShadow: `0 0 16px ${neon}99`,
    background: '#01131a',
  },
  teamCardDisabled: {
    border: '1.5px solid #ff0033',
    opacity: 0.6,
    cursor: 'not-allowed',
    background: '#1a0000',
  },
  teamHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    marginBottom: 6,
  },
  logoImgLarge: {
    width: 40,
    height: 40,
    borderRadius: 8,
    objectFit: 'cover',
    background: '#222',
    border: `1.5px solid ${neon}`,
    boxShadow: `0 0 8px ${neon}44`,
  },
  teamName: {
    fontWeight: 700,
    fontSize: 15,
    color: neon,
    marginBottom: 2,
  },
  memberCount: {
    fontSize: 12,
    color: neon,
    fontWeight: 500,
    marginBottom: 2,
  },
  captainBadge: {
    background: neon,
    color: '#000',
    fontWeight: 700,
    fontSize: 11,
    borderRadius: 4,
    padding: '2px 6px',
    marginLeft: 6,
    marginRight: 2,
    letterSpacing: 0.5,
  },
  minRequired: {
    background: '#ff0033',
    color: '#fff',
    fontWeight: 600,
    fontSize: 11,
    borderRadius: 4,
    padding: '2px 6px',
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  membersList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
    marginLeft: 4,
  },
  memberRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    background: '#222',
    borderRadius: 6,
    padding: '2px 8px',
    fontSize: 12,
    color: neon,
    fontWeight: 500,
  },
  avatar: {
    width: 18,
    height: 18,
    borderRadius: '50%',
    background: neon,
    color: '#000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: 12,
    marginRight: 2,
  },
  memberName: {
    fontWeight: 500,
    fontSize: 12,
    color: neon,
  },
  captainSmall: {
    color: '#1976d2',
    fontWeight: 700,
    fontSize: 11,
    marginLeft: 2,
  },
  confirmBtn: {
    marginTop: 10,
    padding: '10px',
    backgroundColor: neon,
    color: '#000',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: 15,
    transition: 'background 0.2s',
    width: '100%',
    letterSpacing: 1,
  },
  confirmBtnDisabled: {
    backgroundColor: '#222',
    color: '#888',
    cursor: 'not-allowed',
    opacity: 0.7,
  },
  error: {
    color: 'red',
    marginTop: 4,
    textAlign: 'center',
    fontWeight: 600,
    fontSize: 13,
  },
  success: {
    color: 'limegreen',
    marginTop: 4,
    textAlign: 'center',
    fontWeight: 600,
    fontSize: 13,
  },
};

export default RegisterTeamModal;