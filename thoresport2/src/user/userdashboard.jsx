import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';
import CreateTeam from './CreateTeam';
import EditTeamModal from './EditTeamModal';
import RegisterTeamModal from './RegisterTeamModal';

function UserDashboard() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingInvites, setPendingInvites] = useState([]);
  const [myTeams, setMyTeams] = useState([]);
  const [teamMembers, setTeamMembers] = useState({});
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTeamId, setEditTeamId] = useState(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerTournament, setRegisterTournament] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [slideDirection, setSlideDirection] = useState('');
  const navigate = useNavigate();

  const videoList = [
    { id: "dQw4w9WgXcQ", title: "Video 1" },
    { id: "3JZ_D3ELwOQ", title: "Video 2" },
    { id: "kJQP7kiw5Fk", title: "Video 3" },
  ];

  const currentVideo = videoList[currentVideoIndex];
  const thumbnailURL = `https://img.youtube.com/vi/${currentVideo.id}/maxresdefault.jpg`;

  const slideTo = (dir) => {
    setSlideDirection(dir);
    setTimeout(() => {
      setCurrentVideoIndex((prev) =>
        dir === 'left'
          ? (prev - 1 + videoList.length) % videoList.length
          : (prev + 1) % videoList.length
      );
      setIsPlaying(false);
    }, 300);
  };

  const handlePlay = () => setIsPlaying(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        setError('');

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setCurrentUserId(user.id);

        const [tournRes, inviteRes, teamsRes] = await Promise.all([
          supabase.from('tournaments').select('*'),
          supabase
            .from('team_members')
            .select('id, team_id, status, teams ( team_name )')
            .eq('user_id', user.id)
            .eq('status', 'pending'),
          supabase
            .from('team_members')
            .select('id, team_id, is_captain, status, teams ( team_name, team_logo_url )')
            .eq('user_id', user.id)
            .eq('status', 'active'),
        ]);

        const tournData = tournRes.data || [];
        setTournaments(
          tournData.sort((a, b) => parseFloat(b.prize_pool) - parseFloat(a.prize_pool))
        );

        setPendingInvites(inviteRes.data || []);

        const teamsData = teamsRes.data || [];
        setMyTeams(teamsData);
        for (const tm of teamsData) {
          const { data: members } = await supabase
            .from('team_members')
            .select('id, user_id, is_captain, status, profiles ( email, username )')
            .eq('team_id', tm.team_id)
            .eq('status', 'active');
          setTeamMembers(prev => ({ ...prev, [tm.team_id]: members || [] }));
        }
      } catch (err) {
        setError('Failed to fetch dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const handleAccept = async (inviteId) => {
    await supabase.from('team_members').update({ status: 'active' }).eq('id', inviteId);
    setPendingInvites(prev => prev.filter(inv => inv.id !== inviteId));
  };

  const handleDecline = async (inviteId) => {
    await supabase.from('team_members').update({ status: 'declined' }).eq('id', inviteId);
    setPendingInvites(prev => prev.filter(inv => inv.id !== inviteId));
  };

  const leaveTeam = async (team) => {
    if (!window.confirm(`Are you sure you want to leave the team "${team.teams?.team_name || 'this team'}"?`))
      return;
    try {
      await supabase.from('team_members').delete().eq('id', team.id);
      setMyTeams(prev => prev.filter(t => t.id !== team.id));
      setTeamMembers(prev => {
        const updated = { ...prev };
        delete updated[team.team_id];
        return updated;
      });
    } catch (err) {
      alert('Failed to leave the team. Please try again.');
    }
  };

  return (
    <>
     <style>{`
        @keyframes neonPulse {
          0% {
            box-shadow: 0 0 24px 4px #01E2E9, 0 0 48px 8px #BABC19;
            opacity: 1;
          }
          50% {
            box-shadow: 0 0 12px 2px #01E2E9, 0 0 24px 4px #BABC19;
            opacity: 0.6;
          }
          100% {
            box-shadow: 0 0 36px 8px #01E2E9, 0 0 64px 16px #BABC19;
            opacity: 1;
          }
        }

        @keyframes bgMove {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }

        @keyframes particleMove {
          0% { transform: translateY(0); }
          100% { transform: translateY(-60vh); }
        }

        .edit-team-btn {
          background: linear-gradient(90deg, #BABC19 0%, #01E2E9 100%);
          color: #000;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: bold;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 0 12px rgba(186, 188, 25, 0.3);
          font-family: 'Orbitron', sans-serif;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          position: relative;
          overflow: hidden;
        }

        .edit-team-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 20px rgba(186, 188, 25, 0.6), 0 0 40px rgba(1, 226, 233, 0.3);
          background: linear-gradient(90deg, #BABC19 20%, #01E2E9 80%);
        }

        .edit-team-btn:active {
          transform: translateY(0);
          box-shadow: 0 0 15px rgba(186, 188, 25, 0.4);
        }

        .edit-team-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s;
        }

        .edit-team-btn:hover::before {
          left: 100%;
        }
      `}</style>
    <div style={styles.dashboardBg}>
      {/* Video Hero Section */}
      <div style={styles.heroContainer}>
        <div style={styles.heroContent}>
          <div style={styles.descriptionSection}>
            <h1 style={styles.mainTitle}>THORESPORT</h1>
            <h2 style={styles.subtitle}>The Ultimate Gaming Tournament Platform</h2>
            <p style={styles.description}>
              Welcome to Thoresport, the premier destination for competitive gaming tournaments. 
              Join thousands of players worldwide in epic battles across your favorite games.
            </p>
            <div style={styles.features}>
              {['🏆 Massive Prize Pools', '⚡ Real-time Competition', '🎮 Multiple Game Titles', '👥 Team & Solo Events'].map((f, i) => (
                <div key={i} style={styles.feature}>
                  <span style={styles.featureIcon}>{f.split(' ')[0]}</span>
                  <span>{f.split(' ').slice(1).join(' ')}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.videoSection}>
            <div
              style={{
                ...styles.slideWrapper,
                animation: slideDirection
                  ? `${slideDirection === 'right' ? 'slideInRight' : 'slideInLeft'} 0.3s ease`
                  : 'none',
              }}
            >
              {isPlaying ? (
                <iframe
                  src={`https://www.youtube.com/embed/${currentVideo.id}?autoplay=1&mute=1`}
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  title={currentVideo.title}
                  frameBorder="0"
                  style={styles.video}
                />
              ) : (
                <div
                  style={{ ...styles.thumbnail, backgroundImage: `url(${thumbnailURL})` }}
                  onDoubleClick={handlePlay}
                >
                  <div style={styles.overlay} />
                </div>
              )}
            </div>
            <button style={{ ...styles.navArrow, left: '10px' }} onClick={() => slideTo('left')}>‹</button>
            <button style={{ ...styles.navArrow, right: '10px' }} onClick={() => slideTo('right')}>›</button>
          </div>
        </div>
      </div>

      <div style={styles.neonDivider} />
{ /* Teams and Tournaments Section */}
     <div style={{ padding: '5rem', maxWidth: 1200, margin: '0 auto' }}>
  <div style={styles.createTeamSection}>
    <h2 style={styles.sectionHeading}>
      <span style={styles.sectionIcon}>👥</span> My Teams & Invitations
    </h2>

    {myTeams.length === 0 && (
      <button style={styles.createTeamButton} onClick={() => setShowCreateTeam(true)}>
        Create Team
      </button>
    )}

    {pendingInvites.length > 0 && (
      <div style={{ marginBottom: 24, padding: 16, background: '#1a1a1a', borderRadius: 8 }}>
        <h3 style={{ textAlign: 'center' }}>Team Invitations</h3>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {pendingInvites.map(inv => (
            <li key={inv.id} style={{ marginBottom: 8, textAlign: 'center' }}>
              <b>{inv.teams?.team_name || 'Team'}</b>
              <button style={{ marginLeft: 12 }} onClick={() => handleAccept(inv.id)}>Accept</button>
              <button style={{ marginLeft: 8 }} onClick={() => handleDecline(inv.id)}>Decline</button>
            </li>
          ))}
        </ul>
      </div>
    )}

    {myTeams.length > 0 && (
      <div style={styles.myTeamsBox}>
        <h3 style={{ textAlign: 'center', fontFamily: 'Orbitron', color: 'lightblue', marginBottom: "12px"}}>My Teams</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {myTeams.map(team => (
            <li key={team.id} style={{ marginBottom: 16 }}>
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 12,
                flexWrap: 'wrap'
              }}>
                {team.teams?.team_logo_url && (
                  <img
                    src={team.teams.team_logo_url}
                    alt="logo"
                    width={32}
                    height={32}
                    style={{ borderRadius: 4 }}
                  />
                )}
                <b style={{ color: '#01E2E9', fontFamily: 'Orbitron' }}>{team.teams?.team_name}</b>
                {team.is_captain && (
                  <span style={{ marginLeft: 8, color: '#1976d2', fontWeight: 600 }}>(Captain)</span>
                )}
                {team.is_captain ? (
                  <button
                    className="edit-team-btn"
                    onClick={() => {
                      setEditTeamId(team.team_id);
                      setShowEditModal(true);
                    }}
                  >
                     Edit Team
                  </button>
                ) : (
                  <button
                    style={{ marginLeft: 16, backgroundColor: '#f44336', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 4 }}
                    onClick={() => leaveTeam(team)}
                  >
                    Leave Team
                  </button>
                )}
              </div>

              {teamMembers[team.team_id]?.length > 0 && (
                <ul style={{
                  listStyle: 'none',
                  padding: 0,
                  textAlign: 'center',
                  marginTop: 6,
                  fontFamily: 'Orbitron',
                  fontSize: '0.9rem'
                }}>
                  {teamMembers[team.team_id].map(m => (
                    <li key={m.id} style={{ marginBottom: '16px' }}>
                      {m.profiles?.username || m.profiles?.email || m.user_id}
                      {m.is_captain && (
                        <span style={{ marginLeft: 4, color: '#1976d2' }}>(Captain)</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>

{/* Tournaments Section */}
        <div>
          <h3 style={styles.sectionHeading}><span style={styles.sectionIcon}>🏆</span> Upcoming Tournaments</h3>
          {loading && <p>Loading tournaments...</p>}
          {error && <p style={{ color: 'red' }}>{error}</p>}

          <div style={styles.tournamentListWrapper}>
            <div style={styles.tournamentList}>
              {tournaments.map(t => (
                <div key={t.id} style={styles.tournamentCard}>
                  {t.logo_url && <img src={t.logo_url} alt={t.name} style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 4 }} />}
                  <h2 style={{ color: '#01E2E9', fontFamily: 'Orbitron' }}>{t.name}</h2>
                  <p><b>Prize Pool:</b> {t.prize_pool}</p>
                  <p><b>Start:</b> {t.start_date}</p>
                  <p><b>End:</b> {t.end_date}</p>
                  <p><b>Game:</b> {t.game}</p>
                  <p><b>Mode:</b> {t.mode}</p>
                  <div style={styles.tournamentButtonGroup}>
                    <button onClick={() => { setRegisterTournament(t); setShowRegisterModal(true); }} style={styles.tournamentButton}>Join</button>

                    <button onClick={() => navigate(`/tournament/${t.id}`)} style={styles.tournamentButton}>View More</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={styles.particleBg}>
        {[...Array(18)].map((_, i) => (
          <div key={i} style={{
            ...styles.particle,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 8}s`
          }} />
        ))}
      </div>

      {showCreateTeam && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <button style={styles.closeButton} onClick={() => setShowCreateTeam(false)}>&times;</button>
            <CreateTeam onClose={() => setShowCreateTeam(false)} />
          </div>
        </div>
      )}

      {showEditModal && editTeamId && (
        <div style={styles.modalOverlay}>
          <div style={styles.closeButton}>
          <EditTeamModal teamId={editTeamId} onClose={() => setShowEditModal(false)} />
            </div>
        </div>
      )}

      {showRegisterModal && registerTournament && (
        <div style={styles.modalOverlay}>
          <RegisterTeamModal tournament={registerTournament} onClose={() => setShowRegisterModal(false)} />
        </div>
      )}
    </div>
    </>
  );
}

// Make sure this `styles` object exactly mirrors the one you already defined (no changes needed)
const styles = { 
  dashboardBg: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #000 60%, #011f2a 100%)',
    animation: 'bgMove 10s linear infinite',
    color: '#fff',
    fontFamily: 'Orbitron, sans-serif',
  },
  '@keyframes bgMove': {
    '50%': { backgroundPosition: '100% 50%' },
    '100%': { backgroundPosition: '100% 50%' },
  },
  heroContainer: {
    width: '100%',
    maxWidth: '100%',
    margin: '0 auto 3rem',
    padding: '0 2rem',
  },
  heroContent: {
    display: 'flex',
    gap: '5rem',
    alignItems: 'center',
    minHeight: '500px',
    
  },
  descriptionSection: {
    flex: '0.8',
    padding: '2.5rem',
    background: 'rgba(26, 26, 26, 0.92)',
    borderRadius: '18px',
    boxShadow: '0 0 24px #01E2E955',
    border: '1.5px solid #01E2E9',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  mainTitle: {
    fontSize: '3.2rem',
    marginBottom: '1.2rem',
    color: '#01E2E9',
    fontFamily: 'Orbitron, sans-serif',
    fontWeight: 'bold',
    textShadow: '0 0 24px #01E2E9',
  },
  subtitle: {
    fontSize: '1.7rem',
    marginBottom: '1.7rem',
    color: '#BABC19',
    fontFamily: 'Orbitron, sans-serif',
  },
  description: {
    marginBottom: '2.2rem',
    fontSize: '1.15rem',
    lineHeight: '1.7',
    color: '#fff',
  },
  features: {
    marginBottom: '2.2rem',
  },
  feature: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '1.1rem',
    fontSize: '1.1rem',
    color: '#fff',
  },
  featureIcon: {
    marginRight: '1.1rem',
    fontSize: '1.6rem',
  },
  ctaButton: {
    padding: '1rem 2rem',
    background: 'linear-gradient(45deg, #1976d2, #01E2E9)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '1.1rem',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(25, 118, 210, 0.3)',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 20px rgba(25, 118, 210, 0.4)',
    },
  },
  videoSection: {
    flex: '1.2',
    position: 'relative',
    aspectRatio: '16 / 9',
    borderRadius: '18px',
    overflow: 'hidden',
    boxShadow: '0 0 32px #01E2E955',
    border: '1.5px solid #01E2E9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'box-shadow 0.3s',
  },
  slideWrapper: {
    width: '100%',
    height: '100%',
  },
  video: {
    width: '100%',
    height: '100%',
    border: 'none',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'relative',
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0)',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    background: 'rgb(59, 226, 255)',
    borderRadius: '50%',
    width: 64,
    height: 64,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
  },
  playTriangle: {
    width: 0,
    height: 0,
    borderLeft: '16px solid #000',
    borderTop: '10px solid transparent',
    borderBottom: '10px solid transparent',
  },
  navArrow: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'rgba(0, 0, 0, 0)',
    color: '#fff',
    fontSize: '5rem',
    border: 'none',
    cursor: 'pointer',
    padding: '0 12px',
    zIndex: 10,
  },
  modalOverlay: {
    position: 'fixed',
    top: 0, left: 0, width: '100vw', height: '100vh',
    background: 'rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modalContent: {
    padding: 32,
    borderRadius: 12,
    minWidth: 350,
    maxWidth: 500,
    boxShadow: '0 4px 24px #0003',
    position: 'relative',
    backgroundColor: '#121212',
    color: '#fff'
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    background: 'transparent',
    border: 'none',
    fontSize: 22,
    cursor: 'pointer',
    color: '#fff',
  },
  createTeamSection: {
    background: 'rgba(24,24,24,0.75)',
    borderRadius: 16,
    padding: '2.5rem',
    marginBottom: 40,
    boxShadow: '0 0 18px #01E2E955',
    border: '1.5px solid #01E2E9',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: '1200px',
    margin: '0 auto 2rem',
    backdropFilter: 'blur(8px)',
  },
  createTeamButton: {
    display: 'block',
    margin: '0 auto 2rem',
    padding: '0.9rem 2.2rem',
    background: 'linear-gradient(90deg, #01E2E9 60%, #1976d2 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontWeight: 'bold',
    fontSize: '1.2rem',
    cursor: 'pointer',
    boxShadow: '0 0 12px #01E2E955',
    letterSpacing: 1,
    transition: 'transform 0.2s, box-shadow 0.2s',
    fontFamily: 'Orbitron, sans-serif',
  },
  myTeamsBox: {
    width: '100%',
    background: 'rgba(34,34,34,0.7)',
    borderRadius: 12,
    padding: '1.7rem',
    marginTop: 18,
    boxShadow: '0 0 12px #01E2E955',
    border: '1.5px solid #01E2E9',
    backdropFilter: 'blur(6px)',
  },
  tournamentListWrapper: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
  },
  tournamentList: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: '1.7rem',
    flexWrap: 'wrap',
    width: '100%',
    maxWidth: 900,
  },
  tournamentCard: {
    border: '1.5px solid #01E2E9',
    borderRadius: 14,
    padding: 20,
    width: 300,
    background: 'rgba(26,26,26,0.7)',
    boxShadow: '0 0 18px #01E2E955',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    transition: 'transform 0.2s, box-shadow 0.2s',
    backdropFilter: 'blur(6px)',
  },
  tournamentButtonGroup: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.7rem',
    marginTop: 16,
  },
  tournamentButton: {
    width: '100%',
    padding: '12px 0',
    background: 'linear-gradient(90deg, #01E2E9 60%, #1976d2 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    fontWeight: 'bold',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'background 0.2s, transform 0.2s, box-shadow 0.2s',
    boxShadow: '0 0 8px #01E2E955',
    fontFamily: 'Orbitron, sans-serif',
    letterSpacing: 1,
    outline: 'none',
    marginBottom: 0,
    ':hover': {
      transform: 'scale(1.04)',
      boxShadow: '0 0 24px #01E2E9',
      background: 'linear-gradient(90deg, #01E2E9 80%, #BABC19 100%)',
    },
  },
  neonDivider: {
    width: '80%',
    height: 4,
    margin: '2.5rem auto 3.5rem',
    borderRadius: 8,
    background: 'linear-gradient(90deg, #01E2E9 0%, #BABC19 100%)',
    boxShadow: '0 0 24px 4px #01E2E9, 0 0 48px 8px #BABC19',
    animation: 'neonPulse 2s infinite alternate',
  },
  '@keyframes neonPulse': {
    '0%': { boxShadow: '0 0 24px 4px #01E2E9, 0 0 48px 8px #BABC19' },
    '100%': { boxShadow: '0 0 36px 8px #01E2E9, 0 0 64px 16px #BABC19' },
  },
  sectionHeading: {
    color: '#01E2E9',
    fontFamily: 'Orbitron, sans-serif',
    fontWeight: 700,
    fontSize: '2rem',
    marginBottom: '2rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.7rem',
    textShadow: '0 0 12px #01E2E9',
    letterSpacing: 1,
    justifyContent: 'center',
  },
  sectionIcon: {
    fontSize: '2.2rem',
    filter: 'drop-shadow(0 0 8px #01E2E9)',
  },
  particleBg: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    pointerEvents: 'none',
    zIndex: 0,
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: 'radial-gradient(circle, #01E2E9 60%, #BABC19 100%)',
    opacity: 0.18,
    animation: 'particleMove 8s linear infinite',
  },
  '@keyframes particleMove': {
    '0%': { transform: 'translateY(0)' },
    '100%': { transform: 'translateY(-60vh)' },
  },
 };
export default UserDashboard;