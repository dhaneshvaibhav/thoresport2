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
        dir === 'left' ? (prev - 1 + videoList.length) % videoList.length : (prev + 1) % videoList.length
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

        // Tournaments
        const tournData = tournRes.data || [];
        setTournaments(tournData.sort((a, b) => parseFloat(b.prize_pool) - parseFloat(a.prize_pool)));

        // Invites
        setPendingInvites(inviteRes.data || []);

        // My Teams
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
    setPendingInvites((prev) => prev.filter(inv => inv.id !== inviteId));
  };

  const handleDecline = async (inviteId) => {
    await supabase.from('team_members').update({ status: 'declined' }).eq('id', inviteId);
    setPendingInvites((prev) => prev.filter(inv => inv.id !== inviteId));
  };

  return (
    <div style={{ backgroundColor: "#000", color: "#fff", fontFamily: "Orbitron, sans-serif" }}>
      {/* Video Hero Section */}
      <div style={styles.heroContainer}>
        <div
          style={{
            ...styles.slideWrapper,
            animation: slideDirection
              ? `${slideDirection === "right" ? "slideInRight" : "slideInLeft"} 0.3s ease`
              : "none",
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
              style={{
                ...styles.thumbnail,
                backgroundImage: `url(${thumbnailURL})`,
              }}
            >
              <div style={styles.overlay}></div>
              <div style={styles.playButton} onClick={handlePlay}>
                <div style={styles.playTriangle}></div>
              </div>
            </div>
          )}
        </div>
        <button style={{ ...styles.navArrow, left: "10px" }} onClick={() => slideTo("left")}>‹</button>
        <button style={{ ...styles.navArrow, right: "10px" }} onClick={() => slideTo("right")}>›</button>
      </div>

      <div style={{ padding: '5rem', maxWidth: 1200, margin: '0 auto' }}>
        <button
          onClick={() => setShowCreateTeam(true)}
          style={{ marginBottom: '1.5rem', padding: '0.5rem 1.5rem', background: '#1976d2', color: 'white', border: 'none', borderRadius: 4, fontWeight: 'bold', cursor: 'pointer' }}
        >
          Create Team
        </button>

        {/* My Teams */}
        {myTeams.length > 0 && (
          <div style={{ marginBottom: 24, padding: 16, background: '#1a1a1a', borderRadius: 8 }}>
            <h3 style={{ fontFamily: "Orbitron", color: "lightblue" }}>My Teams</h3>
            <ul>
              {myTeams.map(team => (
                <li key={team.id} style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {team.teams?.team_logo_url && (
                      <img src={team.teams.team_logo_url} alt="logo" style={{ width: 32, height: 32, borderRadius: 4, marginRight: 12 }} />
                    )}
                    <b style={{ color: "#01E2E9" }}>{team.teams?.team_name || 'Team'}</b>
                    {team.is_captain && <span style={{ marginLeft: 8, color: '#1976d2', fontWeight: 600 }}>(Captain)</span>}
                    {team.is_captain && (
                      <button
                        style={{ marginLeft: 16, padding: '4px 12px', background: '#ff9800', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}
                        onClick={() => { setEditTeamId(team.team_id); setShowEditModal(true); }}
                      >
                        Edit Team
                      </button>
                    )}
                  </div>
                  {teamMembers[team.team_id] && (
                    <ul style={{ marginTop: 6, marginLeft: 40 }}>
                      {teamMembers[team.team_id].map(member => (
                        <li key={member.id}>
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

        {/* Team Invitations */}
        {pendingInvites.length > 0 && (
          <div style={{ marginBottom: 24, padding: 16, background: '#1a1a1a', borderRadius: 8 }}>
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

        {/* Tournaments */}
        <div>
          <h3 style={{ marginBottom: '1rem' }}>Upcoming Tournaments</h3>
          {loading && <p>Loading tournaments...</p>}
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            {tournaments.map(t => (
              <div key={t.id} style={{ border: '1px solid #ccc', borderRadius: 8, padding: 16, width: 300, background: '#1a1a1a', boxShadow: '0 2px 8px #0001' }}>
                {t.logo_url && <img src={t.logo_url} alt={t.name} style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 4, marginBottom: 8 }} />}
                <h2 style={{ color: "#01E2E9", fontFamily: "Orbitron" }}>{t.name}</h2>
                <p><b style={{ color: "#BABC19" }}>Prize Pool:</b> {t.prize_pool}</p>
                <p><b style={{ color: "#BABC19" }}>Start:</b> {t.start_date}</p>
                <p><b style={{ color: "#BABC19" }}>End:</b> {t.end_date}</p>
                <p><b style={{ color: "#BABC19" }}>Game:</b> {t.game}</p>
                <p><b style={{ color: "#BABC19" }}>Mode:</b> {t.mode}</p>
                <button onClick={() => setRegisterTournament(t)} style={{ marginTop: 8, padding: '8px 16px', background: '#4caf50', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', marginRight: 8 }}>Join</button>
                <button onClick={() => navigate(`/tournament/${t.id}`)} style={{ marginTop: 8, padding: '8px 16px', background: '#2196f3', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>View More</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showCreateTeam && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <button onClick={() => setShowCreateTeam(false)} style={styles.closeButton}>&times;</button>
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
  );
}

const styles = {
  heroContainer: {
    position: 'relative',
    width: '100%',
    maxWidth: '960px',
    margin: '0 auto 3rem',
    aspectRatio: '16 / 9',
    overflow: 'hidden',
    marginTop: '4rem',
    borderRadius: '12px',
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
  }
};

export default UserDashboard;
