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

  // Format date and time functions from UserTournament
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

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
        let sortedTournaments = tournData.sort((a, b) => parseFloat(b.prize_pool) - parseFloat(a.prize_pool));
        // Show only first 6 tournaments in dashboard
        setTournaments(sortedTournaments.slice(0, 6));

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

        /* Hero Section Styles */
        .dashboard-hero {
          width: 100vw;
          max-width: 100vw;
          margin: 0 auto 3rem;
          padding: 0 0.5rem;
          background: linear-gradient(135deg, #011f2a 60%, #000 100%);
          border-bottom: 2px solid #01E2E9;
          box-shadow: 0 8px 32px #01E2E955;
        }
        .dashboard-hero-content {
          display: flex;
          gap: 4rem;
          align-items: center;
          min-height: 420px;
          justify-content: center;
        }
        .dashboard-hero-description {
          flex: 0.8;
          padding: 2.5rem 1.2rem;
          background: rgba(26, 26, 26, 0.92);
          border-radius: 18px;
          box-shadow: 0 0 24px #01E2E955;
          backdrop-filter: blur(10px);
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .dashboard-hero-title {
          font-size: 3.5rem;
          margin-bottom: 1.2rem;
          color: #01E2E9;
          font-family: 'Orbitron', sans-serif;
          font-weight: bold;
          text-shadow: 0 0 32px #01E2E9, 0 0 8px #BABC19;
          letter-spacing: 2px;
        }
        .dashboard-hero-subtitle {
          font-size: 1.7rem;
          margin-bottom: 1.7rem;
          color: #BABC19;
          font-family: 'Orbitron', sans-serif;
        }
        .dashboard-hero-description-text {
          margin-bottom: 2.2rem;
          fontSize: 1.15rem;
          line-height: 1.7;
          color: #fff;
        }
        .dashboard-hero-features {
          margin-bottom: 2.2rem;
        }
        .dashboard-hero-feature {
          display: flex;
          align-items: center;
          margin-bottom: 1.1rem;
          font-size: 1.1rem;
          color: #fff;
        }
        .dashboard-hero-feature-icon {
          margin-right: 1.1rem;
          font-size: 1.6rem;
        }
        .dashboard-hero-video {
          flex: 1.2;
          position: relative;
          aspect-ratio: 16 / 9;
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 0 32px #01E2E955;
          border: 1.5px solid #01E2E9;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 320px;
          background: #000;
        }

        @media (max-width: 900px) {
          .dashboard-hero-content {
            gap: 2rem;
          }
        }
        @media (max-width: 700px) {
          .dashboard-hero-content {
            flex-direction: column;
            gap: 2rem;
            min-height: 320px;
            padding: 0.5rem;
          }
          .dashboard-hero-description {
            padding: 1.2rem;
          }
          .dashboard-hero-title {
            font-size: 2.1rem;
            margin-bottom: 0.7rem;
          }
          .dashboard-hero-subtitle {
            font-size: 1.1rem;
            margin-bottom: 1rem;
          }
          .dashboard-hero-video {
            min-width: 0;
            width: 100%;
            aspect-ratio: 16 / 9;
            min-height: 180px;
          }
        }

        /* Tournament Styles from UserTournament component */
        .tournaments-container {
          max-width: 1600px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        .tournaments-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 2.5rem;
          width: 100%;
          justify-items: center;
        }

        .tournament-card {
          background: linear-gradient(135deg, rgba(26, 26, 46, 0.95) 0%, rgba(22, 33, 62, 0.95) 100%);
          border-radius: 20px;
          padding: 0;
          width: 100%;
          max-width: 450px;
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
          display: flex;
          flex-direction: column;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          backdrop-filter: blur(20px);
          position: relative;
          overflow: hidden;
          border: 2px solid transparent;
          background-clip: padding-box;
        }

        .tournament-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border-radius: 20px;
          padding: 2px;
          background: linear-gradient(135deg, #FFD700, #01E2E9, #FF6B35);
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask-composite: xor;
          -webkit-mask-composite: xor;
          opacity: 0;
          transition: opacity 0.4s ease;
        }

        .tournament-card:hover::before {
          opacity: 1;
        }

        .tournament-card:hover {
          transform: translateY(-10px) scale(1.02);
          box-shadow: 0 25px 60px rgba(255, 215, 0, 0.3);
        }

        .tournament-header {
          position: relative;
          height: 200px;
          border-radius: 18px 18px 0 0;
          overflow: hidden;
          background: linear-gradient(135deg, #FFD700 0%, #FF6B35 100%);
        }

        .tournament-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: all 0.4s ease;
        }

        .tournament-card:hover .tournament-image {
          transform: scale(1.1);
        }

        .tournament-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(1, 226, 233, 0.1) 100%);
        }

        .tournament-badge {
          position: absolute;
          top: 15px;
          right: 15px;
          background: linear-gradient(135deg, #FF6B35, #FFD700);
          color: #000;
          padding: 8px 16px;
          border-radius: 25px;
          font-size: 0.8rem;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 1px;
          box-shadow: 0 4px 15px rgba(255, 107, 53, 0.4);
        }

        .tournament-content {
          padding: 2rem;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .tournament-title {
          font-size: 1.5rem;
          font-weight: bold;
          color: #FFD700;
          margin-bottom: 1.5rem;
          text-align: center;
          text-shadow: 0 0 15px rgba(255, 215, 0, 0.6);
          line-height: 1.3;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .tournament-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 12px;
          padding: 1rem;
          text-align: center;
          border: 1px solid rgba(1, 226, 233, 0.3);
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          border-color: #01E2E9;
          box-shadow: 0 0 20px rgba(1, 226, 233, 0.3);
        }

        .stat-value {
          font-size: 1.4rem;
          font-weight: bold;
          color: #01E2E9;
          margin-bottom: 0.5rem;
          text-shadow: 0 0 10px rgba(1, 226, 233, 0.6);
        }

        .stat-label {
          font-size: 0.8rem;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .tournament-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          color: #ccc;
        }

        .detail-icon {
          font-size: 1.1rem;
        }

        .detail-label {
          color: #888;
          margin-right: 0.5rem;
        }

        .detail-value {
          color: #01E2E9;
          font-weight: 600;
        }

        .tournament-schedule {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          border: 1px solid rgba(255, 215, 0, 0.3);
        }

        .schedule-title {
          color: #FFD700;
          font-size: 1rem;
          font-weight: bold;
          margin-bottom: 1rem;
          text-align: center;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .schedule-info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          text-align: center;
        }

        .schedule-date {
          font-size: 1.1rem;
          color: #01E2E9;
          font-weight: bold;
          margin-bottom: 0.3rem;
        }

        .schedule-time {
          font-size: 1.2rem;
          color: #FFD700;
          font-weight: bold;
        }

        .schedule-label {
          font-size: 0.8rem;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 0.5rem;
        }

        .tournament-actions {
          display: flex;
          gap: 1rem;
          margin-top: auto;
        }

        .tournament-btn {
          flex: 1;
          padding: 14px 20px;
          border: none;
          border-radius: 12px;
          font-weight: bold;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          font-family: 'Orbitron', sans-serif;
          letter-spacing: 1px;
          text-transform: uppercase;
          position: relative;
          overflow: hidden;
        }

        .btn-primary {
          background: linear-gradient(135deg, #FFD700 0%, #FF6B35 100%);
          color: #000;
          box-shadow: 0 8px 25px rgba(255, 215, 0, 0.4);
        }

        .btn-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 35px rgba(255, 215, 0, 0.6);
        }

        .btn-secondary {
          background: linear-gradient(135deg, #01E2E9 0%, #1976d2 100%);
          color: #fff;
          box-shadow: 0 8px 25px rgba(1, 226, 233, 0.4);
        }

        .btn-secondary:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 35px rgba(1, 226, 233, 0.6);
        }

        .tournament-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.6s;
        }

        .tournament-btn:hover::before {
          left: 100%;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          gap: 2rem;
        }

        .loading-spinner {
          width: 60px;
          height: 60px;
          border: 4px solid rgba(1, 226, 233, 0.3);
          border-top: 4px solid #01E2E9;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .loading-text {
          color: #01E2E9;
          font-family: 'Orbitron', sans-serif;
          font-size: 1.4rem;
          text-shadow: 0 0 15px rgba(1, 226, 233, 0.8);
          letter-spacing: 2px;
        }

        .error-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          gap: 1rem;
        }

        .error-text {
          color: #ff4444;
          text-align: center;
          font-size: 1.2rem;
          font-family: 'Orbitron', sans-serif;
          text-shadow: 0 0 15px rgba(255, 68, 68, 0.6);
        }

        /* View All Tournaments Button */
        .view-all-tournaments-btn {
          display: block;
          margin: 3rem auto 0;
          padding: 16px 32px;
          background: linear-gradient(135deg, #FFD700 0%, #FF6B35 100%);
          color: #000;
          border: none;
          border-radius: 12px;
          font-weight: bold;
          font-size: 1.1rem;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          font-family: 'Orbitron', sans-serif;
          letter-spacing: 1px;
          text-transform: uppercase;
          position: relative;
          overflow: hidden;
          box-shadow: 0 8px 25px rgba(255, 215, 0, 0.4);
        }

        .view-all-tournaments-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 35px rgba(255, 215, 0, 0.6);
        }

        .view-all-tournaments-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.6s;
        }

        .view-all-tournaments-btn:hover::before {
          left: 100%;
        }

        /* Team section styles */
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

        /* Responsive Design */
        @media (max-width: 1024px) {
          .tournaments-grid {
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 2rem;
          }
        }

        @media (max-width: 768px) {
          .tournaments-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
          
          .tournament-card {
            max-width: 100%;
          }

          .tournament-actions {
            flex-direction: column;
          }

          .tournament-stats,
          .tournament-details,
          .schedule-info {
            grid-template-columns: 1fr;
          }

          /* Mobile styles for My Teams section */
          .myTeamsBox {
            padding: 1rem !important;
            margin-top: 12px !important;
            border-radius: 8px !important;
          }
          .myTeamsBox h3 {
            font-size: 1.1rem !important;
            margin-bottom: 8px !important;
          }
          .myTeamsBox ul {
            padding: 0 !important;
          }
          .myTeamsBox li {
            margin-bottom: 10px !important;
          }
          .myTeamsBox img {
            width: 24px !important;
            height: 24px !important;
          }
          .myTeamsBox b {
            font-size: 1rem !important;
          }
          .myTeamsBox button,
          .myTeamsBox .edit-team-btn {
            font-size: 0.85rem !important;
            padding: 7px 12px !important;
            border-radius: 5px !important;
            margin-left: 8px !important;
          }
          .myTeamsBox ul ul {
            font-size: 0.8rem !important;
            margin-top: 4px !important;
          }
        }

        @media (max-width: 480px) {
          .tournament-content {
            padding: 1.5rem;
          }
          
          .tournament-title {
            font-size: 1.2rem;
          }

          .tournament-btn {
            font-size: 0.9rem;
            padding: 12px 16px;
          }
        }
      `}</style>

      <div style={styles.dashboardBg}>
        {/* Video Hero Section */}
        <div className="dashboard-hero">
          <div className="dashboard-hero-content">
            <div className="dashboard-hero-description">
              <h1 className="dashboard-hero-title">THORESPORTS</h1>
              <h2 className="dashboard-hero-subtitle">The Ultimate Gaming Tournament Platform</h2>
              <p className="dashboard-hero-description-text">
                Welcome to Thoresports, the premier destination for competitive gaming tournaments. 
                Join thousands of players worldwide in epic battles across your favorite games.
              </p>
              <div className="dashboard-hero-features">
                {['🏆 Massive Prize Pools', '⚡ Real-time Competition', '🎮 Multiple Game Titles', '👥 Team & Solo Events'].map((f, i) => (
                  <div key={i} className="dashboard-hero-feature">
                    <span className="dashboard-hero-feature-icon">{f.split(' ')[0]}</span>
                    <span>{f.split(' ').slice(1).join(' ')}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="dashboard-hero-video">
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

        {/* Teams and Tournaments Section */}
        <div style={{ padding: '3rem 1rem', maxWidth: 1400, margin: '0 auto' }}>
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
                      <button 
                        style={{ 
                          marginLeft: 12, 
                          background: 'linear-gradient(90deg, #43ea5e 60%, #1976d2 100%)',
                          color: '#fff',
                          border: 'none',
                          padding: '8px 18px',
                          borderRadius: 6,
                          fontWeight: 'bold',
                          fontFamily: 'Orbitron, sans-serif',
                          boxShadow: '0 0 8px #43ea5e55',
                          cursor: 'pointer',
                          fontSize: '1rem',
                          letterSpacing: 1,
                          outline: 'none',
                          transition: 'background 0.2s, transform 0.2s, box-shadow 0.2s',
                        }} 
                        onClick={() => handleAccept(inv.id)}
                      >Accept</button>
                      <button 
                        style={{ 
                          marginLeft: 8, 
                          background: 'linear-gradient(90deg, #f44336 60%, #d32f2f 100%)',
                          color: '#fff',
                          border: 'none',
                          padding: '8px 18px',
                          borderRadius: 6,
                          fontWeight: 'bold',
                          fontFamily: 'Orbitron, sans-serif',
                          boxShadow: '0 0 8px #f4433655',
                          cursor: 'pointer',
                          fontSize: '1rem',
                          letterSpacing: 1,
                          outline: 'none',
                          transition: 'background 0.2s, transform 0.2s, box-shadow 0.2s',
                        }} 
                        onClick={() => handleDecline(inv.id)}
                      >Decline</button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {myTeams.length > 0 && (
              <div className="myTeamsBox" style={styles.myTeamsBox}>
                <h3 style={{ textAlign: 'center', fontFamily: 'Orbitron', color: 'lightblue', marginBottom: "12px"}}>My Teams</h3>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {myTeams.map(team => (
                    <li key={team.id} style={{ marginBottom: 16 }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        flexWrap: 'wrap',
                        justifyContent: 'flex-start',
                      }}>
                        {team.teams?.team_logo_url && (
                          <img
                            src={team.teams.team_logo_url}
                            alt="logo"
                            width={32}
                            height={32}
                            style={{ borderRadius: 4, marginRight: 8 }}
                          />
                        )}
                        <b style={{ color: '#01E2E9', fontFamily: 'Orbitron', marginRight: 8, fontSize: '0.8rem' }}>{team.teams?.team_name}</b>
                        {team.is_captain && (
                          <span style={{ marginLeft: 4, color: '#1976d2', fontWeight: 600, fontSize: '0.7rem' }}>(Captain)</span>
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
                            style={{ marginLeft: 12, backgroundColor: '#f44336', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 4 }}
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
                          fontSize: '0.65rem'
                        }}>
                          {teamMembers[team.team_id].map(m => (
                            <li key={m.id} style={{ marginBottom: '14px' }}>
                              {m.profiles?.username || m.profiles?.email || m.user_id}
                              {m.is_captain && (
                                <span style={{ marginLeft: 4, color: '#1976d2', fontSize: '0.75em' }}>(Captain)</span>
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

          {/* Enhanced Tournaments Section using UserTournament UI */}
          <div className="tournaments-container">
            <h3 style={styles.sectionHeading}>
              <span style={styles.sectionIcon}>🏆</span> FEATURED TOURNAMENTS
            </h3>
            
            {loading && (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p className="loading-text">Loading Tournaments...</p>
              </div>
            )}
            
            {error && (
              <div className="error-container">
                <p className="error-text">❌ {error}</p>
              </div>
            )}

            <div className="tournaments-grid">
              {tournaments.map(tournament => (
                <div key={tournament.id} className="tournament-card">
                  <div className="tournament-header">
                    {tournament.logo_url && (
                      <>
                        <img
                          src={tournament.logo_url}
                          alt={tournament.name}
                          className="tournament-image"
                        />
                        <div className="tournament-overlay"></div>
                      </>
                    )}
                    <div className="tournament-badge">Live</div>
                  </div>
                  
                  <div className="tournament-content">
                    <h2 className="tournament-title">{tournament.name}</h2>
                    
                    <div className="tournament-stats">
                      <div className="stat-card">
                        <div className="stat-value">₹{tournament.prize_pool}</div>
                        <div className="stat-label">Prize Pool</div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-value">48</div>
                        <div className="stat-label">Slots</div>
                      </div>
                    </div>

                    <div className="tournament-details">
                      <div className="detail-item">
                        <span className="detail-icon">🎮</span>
                        <span className="detail-label">Game:</span>
                        <span className="detail-value">{tournament.game}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-icon">⚔️</span>
                        <span className="detail-label">Mode:</span>
                        <span className="detail-value">{tournament.mode}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-icon">🎯</span>
                        <span className="detail-label">Type:</span>
                        <span className="detail-value">Paid Tournament</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-icon">🎪</span>
                        <span className="detail-label">Lobbies:</span>
                        <span className="detail-value">6</span>
                      </div>
                    </div>

                    <div className="tournament-schedule">
                      <div className="schedule-title">Tournament Schedule</div>
                      <div className="schedule-info">
                        <div>
                          <div className="schedule-label">Start Date</div>
                          <div className="schedule-date">{formatDate(tournament.start_date)}</div>
                        </div>
                        <div>
                          <div className="schedule-label">Start Time</div>
                          <div className="schedule-time">{formatTime(tournament.start_date)}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="tournament-actions">
                      <button
                        className="tournament-btn btn-primary"
                        onClick={() => {
                          setRegisterTournament(tournament);
                          setShowRegisterModal(true);
                        }}
                      >
                        Join Now
                      </button>
                      <button
                        className="tournament-btn btn-secondary"
                        onClick={() => navigate(`/tournament/${tournament.id}`)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* View All Tournaments Button */}
            <button
              className="view-all-tournaments-btn"
              onClick={() => navigate('/tournament')}
            >
              View All Tournaments
            </button>
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

// Styles object
const styles = { 
  dashboardBg: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #000 60%, #011f2a 100%)',
    animation: 'bgMove 10s linear infinite',
    color: '#fff',
    fontFamily: 'Orbitron, sans-serif',
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
  neonDivider: {
    width: '80%',
    height: 4,
    margin: '2.5rem auto 3.5rem',
    borderRadius: 8,
    background: 'linear-gradient(90deg, #01E2E9 0%, #BABC19 100%)',
    boxShadow: '0 0 24px 4px #01E2E9, 0 0 48px 8px #BABC19',
    animation: 'neonPulse 2s infinite alternate',
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
};

export default UserDashboard;
