import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { FaBullhorn, FaBook, FaChartBar, FaUsers, FaLayerGroup } from 'react-icons/fa';
import RegisterTeamModal from './RegisterTeamModal';

function TournamentDetails() {
  const [teamResponseStatus, setTeamResponseStatus] = useState(null);
  const [userTeamId, setUserTeamId] = useState(null);
  const { id } = useParams();
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('announcements');
  const [announcements, setAnnouncements] = useState([]);
  const [registeredTeams, setRegisteredTeams] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [userRegistered, setUserRegistered] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
  // Fetch the current user's team registration and response status for this tournament
  useEffect(() => {
    const fetchTeamResponseStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      // Find the user's active team for this tournament
      const { data: teamMemberships } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', user.id)
        .eq('status', 'active');
      if (!teamMemberships || teamMemberships.length === 0) return;
      // Find the user's team that is registered for this tournament
      const { data: reg } = await supabase
        .from('tournament_registrations')
        .select('id, team_id, status')
        .eq('tournament_id', id)
        .in('team_id', teamMemberships.map(m => m.team_id));
      if (!reg || reg.length === 0) return;
      const userTeam = reg[0];
      setUserTeamId(userTeam.team_id);
      // Get all members of this team
      const { data: members } = await supabase
        .from('team_members')
        .select('profiles ( username, email )')
        .eq('team_id', userTeam.team_id)
        .eq('status', 'active');
      // Get all responses for this registration
      const { data: responses } = await supabase
        .from('tournament_join_responses')
        .select('member_email, response')
        .eq('registration_id', userTeam.id);
      // Map responses by email
      const responseMap = {};
      (responses || []).forEach(r => {
        responseMap[r.member_email] = r.response;
      });
      // Build status list
      const statusList = (members || []).map(m => {
        const email = m.profiles?.email;
        return {
          email,
          username: m.profiles?.username,
          response: responseMap[email] || 'not_declared',
        };
      });
      setTeamResponseStatus(statusList);
    };
    fetchTeamResponseStatus();
  }, [id, registeredTeams]);
    const fetchTournament = async () => {
      setLoading(true);
      setError('');
      try {
        const { data, error } = await supabase
          .from('tournaments')
          .select('*')
          .eq('id', id)
          .single();
        if (error) throw error;
        setTournament(data);
      } catch (err) {
        setError('Failed to fetch tournament details');
      } finally {
        setLoading(false);
      }
    };
    fetchTournament();
  }, [id]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      if (!id) return;
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('tournament_id', id)
        .order('created_at', { ascending: false });
      if (!error && data) setAnnouncements(data);
    };
    fetchAnnouncements();
  }, [id]);

  useEffect(() => {
    const fetchRegisteredTeams = async () => {
      if (!id) return;
      const { data, error } = await supabase
        .from('tournament_registrations')
        .select('team_id, teams(*)')
        .eq('tournament_id', id);
      if (!error && data) {
        setRegisteredTeams(
          data
            .map(r => r.teams)
            .filter(team => team) // filter out nulls
        );
      }
    };
    fetchRegisteredTeams();
  }, [id]);

  useEffect(() => {
    const checkUserRegistered = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || registeredTeams.length === 0) {
        setUserRegistered(false);
        return;
      }
      // Check if user is a member of any registered team
      const { data: memberships } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', user.id)
        .eq('status', 'active');
      const registeredTeamIds = registeredTeams.map(t => t.id);
      const isRegistered = (memberships || []).some(m => registeredTeamIds.includes(m.team_id));
      setUserRegistered(isRegistered);
    };
    checkUserRegistered();
  }, [registeredTeams]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (loading) return <div className="text-white">Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!tournament) return <div className="text-white">Tournament not found</div>;

  const blue = '#00e6fb';
  const tabs = [
    { key: 'announcements', label: 'Announcements', icon: <FaBullhorn /> },
    { key: 'rules', label: 'Rules', icon: <FaBook /> },
    { key: 'points', label: 'Points', icon: <FaChartBar /> },
    { key: 'teams', label: 'Teams', icon: <FaUsers /> },
    { key: 'groups', label: 'Groups', icon: <FaLayerGroup /> }
  ];

  return (
    <div style={{
      background: "#000000",
      minHeight: '100vh',
      color: 'white',
      fontFamily: 'Montserrat, sans-serif',
      padding: '50px',
     
    }}>
      {showRegisterModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#000a', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <RegisterTeamModal tournamentId={tournament.id} onClose={() => setShowRegisterModal(false)} />
        </div>
      )}
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 32,
          alignItems: 'flex-start',
          justifyContent: 'center'
        }}>
          <div style={{
            flex: '1 1 400px',
            minWidth: 320,
            maxWidth: 480,
            display: 'flex',
            justifyContent: 'center'
          }}>
            {tournament.logo_url && (
              <img
                src={tournament.logo_url}
                alt={tournament.name}
                style={{
                  width: '100%',
                  maxWidth: '100%',
                  height: 'auto',
                  objectFit: 'contain',
                  borderRadius: 16,
                  boxShadow: `0 4px 24px #0DCAF0`,
                  backgroundColor: '#0DCAF0',
                  padding: '8px'
                }}
              />
            )}
          </div>

          <div style={{
            flex: '1 1 400px',
            minWidth: 320,
            background: "#202020",
            borderRadius: 16,
            padding: 32,
            boxShadow: `0 2px 16px #0DCAF022`
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 8
            }}>
              <span style={{
                background: blue,
                color: '#10131a',
                fontWeight: 700,
                borderRadius: 6,
                padding: '2px 12px',
                fontSize: 16,
                letterSpacing: 1
              }}>{tournament.game}</span>
            </div>
            <h1 style={{
              fontSize: 32,
              fontWeight: 900,
              marginBottom: 12,
              color: blue,
              textTransform: 'uppercase',
              letterSpacing: 1
            }}>{tournament.name}</h1>

            <div style={{
              background: '#181d24',
              borderRadius: 12,
              padding: 24,
              marginBottom: 24,
              boxShadow: `0 2px 8px ${blue}22`,
              color: '#fff',
              fontSize: 18,
              fontWeight: 600,
              display: 'flex',
              flexDirection: 'column',
              gap: 12
            }}>
              <div><span style={{ color: '#0DCAF0', fontWeight: 700 }}>Organized By:</span> {tournament.organization_id || 'N/A'}</div>
              <div><span style={{ color: '#0DCAF0', fontWeight: 700 }}>Game:</span> {tournament.game || 'N/A'}</div>
              <div><span style={{ color: '#0DCAF0', fontWeight: 700 }}>Mode:</span> {tournament.mode || 'N/A'}</div>
              <div><span style={{ color: '#0DCAF0', fontWeight: 700 }}>Prize Pool:</span> <span style={{
                color: '#000000',
                background: blue,
                borderRadius: 6,
                padding: '2px 12px',
                fontWeight: 900,
                fontSize: 22,
                marginLeft: 6
              }}>{tournament.prize_pool || 'N/A'}</span></div>
              <div><span style={{ color: '#0DCAF0', fontWeight: 700 }}>Start Date:</span> {tournament.start_date ? new Date(tournament.start_date).toLocaleDateString() : 'N/A'}</div>
              <div><span style={{ color: '#0DCAF0', fontWeight: 700 }}>End Date:</span> {tournament.end_date ? new Date(tournament.end_date).toLocaleDateString() : 'N/A'}</div>
              <div><span style={{ color: '#0DCAF0', fontWeight: 700 }}>No. of Lobbies:</span> {tournament.num_lobbies || 'N/A'}</div>
              <div><span style={{ color: '#0DCAF0', fontWeight: 700 }}>Teams per Lobby:</span> {tournament.teams_per_lobby || 'N/A'}</div>
              <div><span style={{ color: '#0DCAF0', fontWeight: 700 }}>Created At:</span> {tournament.created_at ? new Date(tournament.created_at).toLocaleString() : 'N/A'}</div>
            </div>

            <button style={{
              background: blue,
              color: '#10131a',
              fontWeight: 700,
              border: 'none',
              borderRadius: 6,
              padding: '12px 32px',
              fontSize: 18,
              cursor: 'pointer',
              marginTop: 8,
              boxShadow: `0 2px 8px ${blue}55`,
              letterSpacing: 1
            }}
            onClick={() => setShowRegisterModal(true)}
            >
              BOOK SLOT
            </button>
          </div>
        </div>

        <div style={{
          marginTop: 48,
          background: "#202020",
          borderRadius: 12,
          padding: 24,
          boxShadow: `0 2px 8px ${blue}22`,
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 16,
            borderBottom: `2px solid ${blue}22`,
            marginBottom: 24,
            justifyContent: 'center'
          }}>
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: activeTab === tab.key ? blue : '#b0c4d4',
                  fontWeight: activeTab === tab.key ? 800 : 600,
                  fontSize: 16,
                  borderBottom: activeTab === tab.key ? `3px solid ${blue}` : '3px solid transparent',
                  padding: '8px 0',
                  cursor: 'pointer',
                  transition: 'color 0.2s, border-bottom 0.2s',
                  outline: 'none',
                  letterSpacing: 1,
                  flex: '1 1 auto',
                  textAlign: 'center',
                  minWidth: 100
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  {tab.icon}
                  {!isMobile && <span>{tab.label}</span>}
                </div>
              </button>
            ))}
          </div>

          <div style={{ minHeight: 120 }}>
            {activeTab === 'announcements' && (
              <div style={{
                color: '#fff',
                fontSize: 16,
                maxHeight: '300px',
                overflowY: 'auto'
              }}>
                <b style={{ color: blue }}>Announcements:</b><br />
                {announcements.length === 0 ? (
                  <span>No announcements yet.</span>
                ) : (
                  <ul style={{
                    marginTop: 12,
                    paddingLeft: 0,
                    listStyle: 'none'
                  }}>
                    {announcements.map(a => (
                      <li key={a.id} style={{
                        background: '#181d24',
                        borderRadius: 8,
                        marginBottom: 12,
                        padding: 12,
                        boxShadow: `0 2px 8px ${blue}11`
                      }}>
                        <div style={{
                          color: blue,
                          fontWeight: 700,
                          fontSize: 14,
                          marginBottom: 4
                        }}>
                          {new Date(a.created_at).toLocaleString()}
                        </div>
                        <div style={{ fontSize: 15 }}>{a.content}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {activeTab === 'rules' && (
              <div style={{ color: '#fff', fontSize: 16 }}>
                <b style={{ color: blue }}>Rules:</b><br />
                {tournament.rules && tournament.rules.trim() !== '' ? (
                  <span style={{ whiteSpace: 'pre-line' }}>{tournament.rules}</span>
                ) : (
                  <span>No rules provided yet.</span>
                )}
              </div>
            )}

            {activeTab === 'points' && (
              <div style={{ color: '#fff', fontSize: 16 }}>
                <b style={{ color: blue }}>Points System:</b><br />
                {tournament.points_system && tournament.points_system.trim() !== '' ? (
                  <span style={{ whiteSpace: 'pre-line' }}>{tournament.points_system}</span>
                ) : (
                  <span>No points system provided yet.</span>
                )}
              </div>
            )}
            {activeTab === 'teams' && (
              <div style={{ color: '#fff', fontSize: 16 }}>
                <b style={{ color: blue }}>Teams:</b><br />
                {registeredTeams.length === 0 ? (
                  <span>No teams registered yet.</span>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, marginTop: 16 }}>
                    {registeredTeams.map(team => (
                      <div key={team.id} style={{
                        background: '#181d24',
                        borderRadius: 10,
                        padding: 16,
                        minWidth: 180,
                        maxWidth: 220,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        boxShadow: `0 2px 8px ${blue}22`
                      }}>
                        {team.team_logo_url && (
                          <img src={team.team_logo_url} alt={team.team_name} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, marginBottom: 8, background: '#222' }} />
                        )}
                        <span style={{ fontWeight: 700, color: blue, fontSize: 18, textAlign: 'center' }}>{team.team_name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {activeTab === 'groups' && (
              <div style={{ color: '#fff', fontSize: 16 }}>
                <b style={{ color: blue }}>Groups:</b><br />
                {!userRegistered ? (
                  <div style={{ color: blue, marginTop: 24, textAlign: 'center', fontWeight: 700, fontSize: 18 }}>
                    Groups unlock only when you are registered.
                  </div>
                ) : (
                  <>
                    {/* Show team response status for the user's team */}
                    {teamResponseStatus && teamResponseStatus.length > 0 && (
                      <div style={{
                        background: '#181d24',
                        borderRadius: 10,
                        padding: 16,
                        marginBottom: 24,
                        boxShadow: `0 2px 8px ${blue}22`,
                        color: '#fff',
                        fontSize: 15,
                        maxWidth: 400,
                        margin: '0 auto 24px auto',
                      }}>
                        <div style={{ fontWeight: 700, color: blue, fontSize: 17, marginBottom: 8 }}>Your Team Confirmation Status</div>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                          {teamResponseStatus.map(member => (
                            <li key={member.email} style={{ marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontWeight: 600 }}>{member.username || member.email}</span>
                              {member.response === 'accept' && <span style={{ color: 'limegreen', fontWeight: 700 }}>&#10003; Accepted</span>}
                              {member.response === 'decline' && <span style={{ color: '#ff0033', fontWeight: 700 }}>&#10007; Declined</span>}
                              {member.response === 'not_declared' && <span style={{ color: '#ffb300', fontWeight: 700 }}>Pending</span>}
                            </li>
                          ))}
                        </ul>
                        <div style={{ marginTop: 10, fontWeight: 600 }}>
                          Accepted: {teamResponseStatus.filter(m => m.response === 'accept').length} / {teamResponseStatus.length}
                        </div>
                        <div style={{ fontWeight: 600 }}>
                          Pending: {teamResponseStatus.filter(m => m.response === 'not_declared').length}
                        </div>
                        <div style={{ fontWeight: 600 }}>
                          Declined: {teamResponseStatus.filter(m => m.response === 'decline').length}
                        </div>
                      </div>
                    )}
                    {/* Existing group/lobby logic */}
                    {(!tournament.lobby_urls || tournament.lobby_urls.length === 0) ? (
                      <span>No lobbies assigned.</span>
                    ) : (
                      <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 32 }}>
                        {tournament.lobby_urls.map((url, lobbyIdx) => {
                          const startIdx = lobbyIdx * tournament.teams_per_lobby;
                          const endIdx = startIdx + tournament.teams_per_lobby;
                          const teamsInLobby = registeredTeams.slice(startIdx, endIdx);
                          return (
                            <div key={lobbyIdx} style={{
                              background: '#181d24',
                              borderRadius: 10,
                              padding: 18,
                              minWidth: 220,
                              maxWidth: 260,
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              boxShadow: `0 2px 8px ${blue}22`,
                              border: `2px solid ${blue}`,
                            }}>
                              <div style={{ fontWeight: 700, color: blue, fontSize: 17, marginBottom: 6 }}>Lobby {lobbyIdx + 1}</div>
                              <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: blue, fontWeight: 600, fontSize: 14, marginBottom: 10, wordBreak: 'break-all', textDecoration: 'underline' }}>{url}</a>
                              <div style={{ width: '100%', marginTop: 8 }}>
                                {teamsInLobby.length === 0 && <div style={{ color: '#888', textAlign: 'center' }}>No teams assigned.</div>}
                                {Array.from({ length: tournament.teams_per_lobby }).map((_, i) => {
                                  const team = teamsInLobby[i];
                                  return team ? (
                                    <div key={team.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, background: '#222', borderRadius: 6, padding: '6px 10px' }}>
                                      {team.team_logo_url && <img src={team.team_logo_url} alt={team.team_name} style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'cover', background: '#111' }} />}
                                      <span style={{ color: blue, fontWeight: 600, fontSize: 15 }}>{team.team_name}</span>
                                    </div>
                                  ) : (
                                    <div key={i} style={{ color: '#888', background: '#222', borderRadius: 6, padding: '6px 10px', marginBottom: 8, textAlign: 'center' }}>TBD</div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TournamentDetails;
