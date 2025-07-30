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

        @media (max-width: 600px) {
          .ts-team-section {
            padding: 1.2rem 0.5rem !important;
            max-width: 100vw !important;
            margin: 0 !important;
          }
          .ts-create-team-section {
            padding: 1.2rem 0.5rem !important;
            margin-bottom: 1.5rem !important;
            border-radius: 10px !important;
            width: 98vw !important;
            min-width: 0 !important;
            max-width: 100vw !important;
          }
          .ts-create-team-btn {
            font-size: 1rem !important;
            padding: 0.7rem 1.2rem !important;
            margin-bottom: 1.2rem !important;
          }
          .ts-my-teams-box {
            padding: 1rem !important;
            border-radius: 8px !important;
            margin-top: 10px !important;
          }
          .ts-my-teams-box h3 {
            font-size: 1.1rem !important;
            margin-bottom: 8px !important;
          }
          .ts-my-teams-box b {
            font-size: 1rem !important;
            max-width: 90vw !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            white-space: nowrap !important;
            display: inline-block !important;
          }
          .ts-my-teams-box ul {
            font-size: 0.95rem !important;
          }
          .ts-my-teams-box img {
            width: 28px !important;
            height: 28px !important;
          }
          .ts-my-teams-box button {
            font-size: 0.95rem !important;
            padding: 6px 10px !important;
            margin-left: 8px !important;
          }
          .ts-team-invites {
            padding: 10px !important;
            font-size: 0.95rem !important;
            border-radius: 8px !important;
          }
          .ts-team-invites h3 {
            font-size: 1rem !important;
          }
          .ts-team-invites button {
            font-size: 0.95rem !important;
            padding: 6px 10px !important;
            margin-left: 6px !important;
          }
          .ts-hero-content {
            flex-direction: column !important;
            gap: 1.2rem !important;
            min-height: 0 !important;
            padding: 0 !important;
          }
          .ts-video-section {
            min-width: 0 !important;
            min-height: 100px !important;
            height: 140px !important;
            width: 90vw !important;
            max-width: 90vw !important;
            border-radius: 8px !important;
            margin: 0 auto 1.5rem auto !important;
          }
          .ts-video {
            min-width: 0 !important;
            min-height: 100px !important;
            height: 140px !important;
            width: 90vw !important;
            max-width: 90vw !important;
            border-radius: 8px !important;
          }
          .ts-tournament-list {
            flex-direction: column !important;
            gap: 1.2rem !important;
            align-items: flex-start !important;
            width: 100vw !important;
            justify-content: flex-start !important;
            padding-left: 2vw !important;
            padding-right: 2vw !important;
          }
          .ts-tournament-card {
            width: 92vw !important;
            max-width: 340px !important;
            min-height: 260px !important;
            max-height: 260px !important;
            height: 260px !important;
            padding: 10px !important;
            margin: 0 0 2rem 0 !important;
            box-sizing: border-box !important;
            border-radius: 10px !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: flex-start !important;
            overflow: hidden !important;
            position: relative !important;
            background: rgba(26,26,26,0.7) !important;
          }
          .ts-tournament-card h2 {
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            white-space: nowrap !important;
            width: 100% !important;
            margin: 0 0 0.3rem 0 !important;
            font-size: 1.1rem !important;
            font-family: Orbitron, sans-serif !important;
          }
          .ts-tournament-card p {
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            white-space: nowrap !important;
            width: 100% !important;
            margin: 0 0 0.3rem 0 !important;
            font-size: 0.98rem !important;
          }
          .ts-tournament-card img {
            width: 100% !important;
            height: 90px !important;
            object-fit: cover !important;
            border-radius: 6px !important;
            margin-bottom: 0.5rem !important;
            flex-shrink: 0 !important;
          }
          .ts-tournament-card .tournamentButtonGroup {
            margin-top: auto !important;
            width: 100% !important;
          }
          .ts-tournament-card img {
            width: 100% !important;
            height: 90px !important;
            object-fit: cover !important;
            border-radius: 6px !important;
            margin-bottom: 0.5rem !important;
          }
          .ts-tournament-card h2 {
            font-size: 1.1rem !important;
            word-break: break-word !important;
            overflow-wrap: break-word !important;
            white-space: normal !important;
            text-overflow: ellipsis !important;
            max-width: 100% !important;
            overflow: hidden !important;
          }
          .ts-tournament-card p {
            font-size: 0.98rem !important;
            margin-bottom: 0.3rem !important;
          }
          .ts-tournament-list-wrapper {
            width: 100vw !important;
            display: flex !important;
            justify-content: flex-start !important;
            align-items: flex-start !important;
            padding-left: 0 !important;
            padding-right: 0 !important;
          }
        }
      `}</style>
    <div style={styles.dashboardBg}>
      {/* Video Hero Section */}
      <div style={styles.heroContainer}>
        <div style={styles.heroContent} className="ts-hero-content">
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

          <div style={styles.videoSection} className="ts-video-section">
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
                  className="ts-video"
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
     <div className="ts-team-section" style={{ padding: '5rem', maxWidth: 1200, margin: '0 auto' }}>
  <div className="ts-create-team-section" style={styles.createTeamSection}>
    <h2 style={styles.sectionHeading}>
      <span style={styles.sectionIcon}>👥</span> My Teams & Invitations
    </h2>

    {myTeams.length === 0 && (
      <button className="ts-create-team-btn" style={styles.createTeamButton} onClick={() => setShowCreateTeam(true)}>
        Create Team
      </button>
    )}

    {pendingInvites.length > 0 && (
      <div className="ts-team-invites" style={{ marginBottom: 24, padding: 16, background: '#1a1a1a', borderRadius: 8 }}>
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
      <div className="ts-my-teams-box" style={styles.myTeamsBox}>
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
                    style={{ marginLeft: 16 }}
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

          <div style={styles.tournamentListWrapper} className="ts-tournament-list-wrapper">
            <div style={styles.tournamentList} className="ts-tournament-list">
              {tournaments.map(t => (
                <div key={t.id} style={styles.tournamentCard} className="ts-tournament-card">
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
          <EditTeamModal teamId={editTeamId} onClose={() => setShowEditModal(false)} />
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
    width: '100vw',
    background: 'linear-gradient(135deg, #000 60%, #011f2a 100%)',
    animation: 'bgMove 10s linear infinite',
    color: '#fff',
    fontFamily: 'Orbitron, sans-serif',
    padding: '4rem 0',
    boxSizing: 'border-box',
    overflowX: 'hidden',
  },
  '@keyframes bgMove': {
    '50%': { backgroundPosition: '100% 50%' },
    '100%': { backgroundPosition: '100% 50%' },
  },
  heroContainer: {
    width: '100%',
    maxWidth: '100%',
    margin: '0 auto 5rem',
    padding: '0 1rem',
  },
  heroContent: {
    display: 'flex',
    gap: '3rem',
    alignItems: 'center',
    minHeight: '350px',
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
    fontSize: '2.2rem',
    marginBottom: '0.8rem',
    color: '#01E2E9',
    fontFamily: 'Orbitron, sans-serif',
    fontWeight: 'bold',
    textShadow: '0 0 18px #01E2E9',
  },
  subtitle: {
    fontSize: '1.1rem',
    marginBottom: '1.1rem',
    color: '#BABC19',
    fontFamily: 'Orbitron, sans-serif',
  },
  description: {
    marginBottom: '1.2rem',
    fontSize: '0.95rem',
    lineHeight: '1.5',
    color: '#fff',
  },
  features: {
    marginBottom: '1.2rem',
  },
  feature: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '0.7rem',
    fontSize: '0.95rem',
    color: '#fff',
  },
  featureIcon: {
    marginRight: '0.7rem',
    fontSize: '1.2rem',
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
    minWidth: 220,
    minHeight: 120,
    width: '80%',
    maxWidth: 420,
  },
  slideWrapper: {
    width: '100%',
    height: '100%',
  },
  video: {
    width: '100%',
    height: '100%',
    minWidth: 220,
    minHeight: 120,
    aspectRatio: '16 / 9',
    border: 'none',
    display: 'block',
    objectFit: 'cover',
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
    marginLeft: 'auto',
    marginRight: 'auto',
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
    padding: 12,
    width: 240,
    minWidth: 220,
    maxWidth: 340,
    minHeight: 400,
    maxHeight: 400,
    height: 400,
    background: 'rgba(26,26,26,0.7)',
    boxShadow: '0 0 18px #01E2E955',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    transition: 'transform 0.2s, box-shadow 0.2s',
    backdropFilter: 'blur(6px)',
    overflow: 'hidden',
    position: 'relative',
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
    padding: '7px 0',
    background: 'linear-gradient(90deg, #01E2E9 60%, #1976d2 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    fontWeight: 'bold',
    fontSize: '0.85rem',
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
