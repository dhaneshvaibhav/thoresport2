import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';
import RegisterTeamModal from './RegisterTeamModal';

function UserTournament() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerTournament, setRegisterTournament] = useState(null);
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
    fetchTournaments();
  }, []);

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

  return (
    <>
      <style>{`
        .tournament-page {
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
          min-height: 100vh;
          color: white;
          font-family: 'Orbitron', sans-serif;
          padding: 2rem 1rem;
          position: relative;
          overflow-x: hidden;
        }

        .page-header {
          text-align: center;
          margin-bottom: 4rem;
          position: relative;
          z-index: 10;
        }

        .page-title {
          color: #FFD700;
          font-family: 'Orbitron', sans-serif;
          font-size: 3.5rem;
          margin-bottom: 1rem;
          text-shadow: 0 0 30px rgba(255, 215, 0, 0.8);
          letter-spacing: 4px;
          font-weight: 900;
          text-transform: uppercase;
          background: linear-gradient(45deg, #FFD700, #FFA500, #FF6B35);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .page-subtitle {
          color: #01E2E9;
          font-size: 1.2rem;
          margin-bottom: 2rem;
          opacity: 0.9;
          letter-spacing: 2px;
          text-shadow: 0 0 15px rgba(1, 226, 233, 0.6);
        }

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

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(10px);
        }

        /* Floating particles animation */
        .particles {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
        }

        .particle {
          position: absolute;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: radial-gradient(circle, #FFD700 0%, #01E2E9 100%);
          opacity: 0.8;
          animation: float 12s linear infinite;
        }

        @keyframes float {
          0% {
            transform: translateY(100vh) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.8;
          }
          90% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
          }
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .tournaments-grid {
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 2rem;
          }
          
          .page-title {
            font-size: 2.8rem;
          }
        }

        @media (max-width: 768px) {
          .tournament-page {
            padding: 1.5rem 0.75rem;
          }
          
          .tournaments-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
          
          .page-title {
            font-size: 2.2rem;
            letter-spacing: 2px;
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
        }

        @media (max-width: 480px) {
          .page-title {
            font-size: 1.8rem;
            letter-spacing: 1px;
          }
          
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

      <div className="tournament-page">
        {/* Animated Particles Background */}
        <div className="particles">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 12}s`,
                animationDuration: `${10 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>

        <div className="tournaments-container">
          <div className="page-header">
            <h1 className="page-title">Elite Tournaments</h1>
            <p className="page-subtitle">Compete with the Best • Win Big Prizes</p>
          </div>

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
        </div>

        {showRegisterModal && registerTournament && (
          <div className="modal-overlay">
            <RegisterTeamModal
              tournament={registerTournament}
              onClose={() => setShowRegisterModal(false)}
            />
          </div>
        )}
      </div>
    </>
  );
}

export default UserTournament;