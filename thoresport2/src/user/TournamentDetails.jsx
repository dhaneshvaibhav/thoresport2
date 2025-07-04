import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { FaBullhorn, FaBook, FaChartBar, FaUsers, FaLayerGroup } from 'react-icons/fa';
import RegisterTeamModal from './RegisterTeamModal';

function TournamentDetails() {
  const { id } = useParams();
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('announcements');
  const [announcements, setAnnouncements] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
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
      marginTop: '50px',
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

            {activeTab === 'rules' && <div style={{ color: '#fff', fontSize: 16 }}><b style={{ color: blue }}>Rules:</b><br />No rules provided yet.</div>}
            {activeTab === 'points' && <div style={{ color: '#fff', fontSize: 16 }}><b style={{ color: blue }}>Points Table:</b><br />No points available.</div>}
            {activeTab === 'teams' && <div style={{ color: '#fff', fontSize: 16 }}><b style={{ color: blue }}>Teams:</b><br />No teams listed.</div>}
            {activeTab === 'groups' && <div style={{ color: '#fff', fontSize: 16 }}><b style={{ color: blue }}>Groups:</b><br />No groups assigned.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TournamentDetails;
