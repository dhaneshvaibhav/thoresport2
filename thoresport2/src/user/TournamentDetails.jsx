import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

function TournamentDetails() {
  const { id } = useParams();
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('announcements');
  const [announcements, setAnnouncements] = useState([]);
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

  if (loading) return <div className="text-white">Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!tournament) return <div className="text-white">Tournament not found</div>;

  // Blue color from logo
  const blue = '#00e6fb';
  const darkBlue = '#0a1a2f';
  const black = '#10131a';

  return (
    <div style={{ background: black, minHeight: '100vh', color: 'white', fontFamily: 'Montserrat, sans-serif', padding: 0 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 16px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, alignItems: 'flex-start', justifyContent: 'center' }}>
          {/* Left: Tournament Image */}
          <div style={{ flex: '1 1 400px', minWidth: 320, maxWidth: 480, display: 'flex', justifyContent: 'center' }}>
            {tournament.logo_url && (
              <img
                src={tournament.logo_url}
                alt={tournament.name}
                style={{ width: '100%', maxWidth: 420, height: 260, objectFit: 'cover', borderRadius: 16, boxShadow: `0 4px 24px ${blue}33` }}
              />
            )}
          </div>
          {/* Right: Tournament Details */}
          <div style={{ flex: '1 1 400px', minWidth: 320, background: darkBlue, borderRadius: 16, padding: 32, boxShadow: `0 2px 16px ${blue}22` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <span style={{ background: blue, color: black, fontWeight: 700, borderRadius: 6, padding: '2px 12px', fontSize: 16, letterSpacing: 1 }}>{tournament.game}</span>
            </div>
            <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 12, color: blue, textTransform: 'uppercase', letterSpacing: 1 }}>{tournament.name}</h1>
            <ol style={{ background: '#181d24', borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: `0 2px 8px ${blue}22`, listStyle: 'decimal inside', color: '#fff', fontSize: 18, fontWeight: 600 }}>
              <li style={{ marginBottom: 12 }}><span style={{ color: '#b0c4d4', fontWeight: 700 }}>Organized By:</span> <span style={{ color: blue }}>{tournament.organization_id || 'N/A'}</span></li>
              <li style={{ marginBottom: 12 }}><span style={{ color: '#b0c4d4', fontWeight: 700 }}>Game:</span> <span style={{ color: blue }}>{tournament.game || 'N/A'}</span></li>
              <li style={{ marginBottom: 12 }}><span style={{ color: '#b0c4d4', fontWeight: 700 }}>Mode:</span> <span style={{ color: blue }}>{tournament.mode || 'N/A'}</span></li>
              <li style={{ marginBottom: 12 }}><span style={{ color: '#b0c4d4', fontWeight: 700 }}>Prize Pool:</span> <span style={{ color: '#fff', background: blue, borderRadius: 6, padding: '2px 12px', fontWeight: 900, fontSize: 22, marginLeft: 6 }}>{tournament.prize_pool || 'N/A'}</span></li>
              <li style={{ marginBottom: 12 }}><span style={{ color: '#b0c4d4', fontWeight: 700 }}>Start Date:</span> <span style={{ color: blue }}>{tournament.start_date ? new Date(tournament.start_date).toLocaleDateString() : 'N/A'}</span></li>
              <li style={{ marginBottom: 12 }}><span style={{ color: '#b0c4d4', fontWeight: 700 }}>End Date:</span> <span style={{ color: blue }}>{tournament.end_date ? new Date(tournament.end_date).toLocaleDateString() : 'N/A'}</span></li>
              <li style={{ marginBottom: 12 }}><span style={{ color: '#b0c4d4', fontWeight: 700 }}>No. of Lobbies:</span> <span style={{ color: blue }}>{tournament.num_lobbies || 'N/A'}</span></li>
              <li style={{ marginBottom: 12 }}><span style={{ color: '#b0c4d4', fontWeight: 700 }}>Teams per Lobby:</span> <span style={{ color: blue }}>{tournament.teams_per_lobby || 'N/A'}</span></li>
              <li style={{ marginBottom: 12 }}><span style={{ color: '#b0c4d4', fontWeight: 700 }}>Created At:</span> <span style={{ color: blue }}>{tournament.created_at ? new Date(tournament.created_at).toLocaleString() : 'N/A'}</span></li>
            </ol>
            <button
              style={{
                background: blue,
                color: black,
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
            >
              LOGIN TO BOOK SLOT
            </button>
          </div>
        </div>
        {/* Section: Tournament Details Tabs */}
        <div style={{ marginTop: 48, background: darkBlue, borderRadius: 12, padding: 24, boxShadow: `0 2px 8px ${blue}22` }}>
          <div style={{ display: 'flex', gap: 32, borderBottom: `2px solid ${blue}22`, marginBottom: 24 }}>
            { [
              { key: 'announcements', label: 'Announcements' },
              { key: 'rules', label: 'Rules' },
              { key: 'points', label: 'Points' },
              { key: 'teams', label: 'Teams' },
              { key: 'groups', label: 'Groups' }
            ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: activeTab === tab.key ? blue : '#b0c4d4',
                    fontWeight: activeTab === tab.key ? 800 : 600,
                    fontSize: 18,
                    borderBottom: activeTab === tab.key ? `3px solid ${blue}` : '3px solid transparent',
                    padding: '8px 0',
                    cursor: 'pointer',
                    transition: 'color 0.2s, border-bottom 0.2s',
                    outline: 'none',
                    letterSpacing: 1
                  }}
                >
                  {tab.label}
                </button>
              ))}
          </div>
          <div style={{ minHeight: 120 }}>
            {activeTab === 'announcements' && (
              <div style={{ color: '#fff', fontSize: 18 }}>
                <b style={{ color: blue }}>Announcements:</b> <br />
                {announcements.length === 0 ? (
                  <span>No announcements yet.</span>
                ) : (
                  <ul style={{ marginTop: 12, paddingLeft: 0, listStyle: 'none' }}>
                    {announcements.map(a => (
                      <li key={a.id} style={{ background: '#181d24', borderRadius: 8, marginBottom: 12, padding: 12, boxShadow: `0 2px 8px ${blue}11` }}>
                        <div style={{ color: blue, fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
                          {new Date(a.created_at).toLocaleString()}
                        </div>
                        <div style={{ color: '#fff', fontSize: 17 }}>{a.content}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            {activeTab === 'rules' && (
              <div style={{ color: '#fff', fontSize: 18 }}>
                <b style={{ color: blue }}>Rules:</b> <br />
                <span>No rules provided yet.</span>
              </div>
            )}
            {activeTab === 'points' && (
              <div style={{ color: '#fff', fontSize: 18 }}>
                <b style={{ color: blue }}>Points Table:</b> <br />
                <span>No points table available yet.</span>
              </div>
            )}
            {activeTab === 'teams' && (
              <div style={{ color: '#fff', fontSize: 18 }}>
                <b style={{ color: blue }}>Teams:</b> <br />
                <span>No teams listed yet.</span>
              </div>
            )}
            {activeTab === 'groups' && (
              <div style={{ color: '#fff', fontSize: 18 }}>
                <b style={{ color: blue }}>Groups:</b> <br />
                <span>No groups assigned yet.</span>
              </div>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
}

export default TournamentDetails;