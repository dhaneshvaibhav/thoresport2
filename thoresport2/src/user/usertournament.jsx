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

  return (
    <>
      <style>{`
        .tournament-page {
          background: linear-gradient(135deg, #000 60%, #011f2a 100%);
          min-height: 100vh;
          color: white;
          font-family: 'Orbitron', sans-serif;
          padding: 2rem 1rem;
          position: relative;
          overflow-x: hidden;
        }

        .page-title {
          color: white;
          font-family: 'Orbitron', sans-serif;
          text-align: center;
          font-size: 2.8rem;
          margin-bottom: 3rem;
          text-shadow: 0 0 25px rgba(1, 226, 233, 0.8);
          letter-spacing: 3px;
          font-weight: bold;
          text-transform: uppercase;
        }

        .tournaments-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        .tournaments-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
          width: 100%;
          justify-items: center;
        }

        .tournament-card {
          border: 2px solid #01E2E9;
          border-radius: 14px;
          padding: 1.25rem;
          width: 100%;
          max-width: 320px;
          background: rgba(26, 26, 26, 0.9);
          box-shadow: 0 8px 32px rgba(1, 226, 233, 0.3);
          display: flex;
          flex-direction: column;
          transition: all 0.4s ease;
          backdrop-filter: blur(12px);
          min-height: 380px;
          position: relative;
          overflow: hidden;
        }

        .tournament-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(1, 226, 233, 0.1), transparent);
          transition: left 0.6s;
        }

        .tournament-card:hover::before {
          left: 100%;
        }

        .tournament-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 15px 40px rgba(1, 226, 233, 0.5);
          border-color: #BABC19;
        }

        .tournament-image {
          width: 100%;
          height: 110px;
          object-fit: cover;
          border-radius: 8px;
          margin-bottom: 1rem;
          border: 2px solid rgba(1, 226, 233, 0.4);
          transition: all 0.3s ease;
        }

        .tournament-card:hover .tournament-image {
          border-color: #BABC19;
          box-shadow: 0 4px 15px rgba(186, 188, 25, 0.4);
        }

        .tournament-title {
          margin: 0.5rem 0 1rem 0;
          color: #01E2E9;
          font-family: 'Orbitron', sans-serif;
          font-size: 1.2rem;
          font-weight: bold;
          text-shadow: 0 0 12px rgba(1, 226, 233, 0.7);
          min-height: 2.5rem;
          display: flex;
          align-items: center;
          text-align: center;
          justify-content: center;
          line-height: 1.2;
        }

        .tournament-info {
          flex: 1;
          margin-bottom: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .tournament-info p {
          color: white;
          font-family: 'Orbitron', sans-serif;
          margin: 0;
          font-size: 0.9rem;
          line-height: 1.4;
          padding: 0.15rem 0;
        }

        .tournament-info b {
          color: #BABC19;
          font-weight: 700;
          text-shadow: 0 0 8px rgba(186, 188, 25, 0.6);
        }

        .tournament-buttons {
          margin-top: auto;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          width: 100%;
        }

        .tournament-btn {
          width: 100%;
          padding: 10px 16px;
          background: linear-gradient(90deg, #01E2E9 60%, #1976d2 100%);
          color: #fff;
          border: none;
          border-radius: 8px;
          font-weight: bold;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.4s ease;
          box-shadow: 0 4px 20px rgba(1, 226, 233, 0.4);
          font-family: 'Orbitron', sans-serif;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          position: relative;
          overflow: hidden;
          min-height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
        }

        .tournament-btn:hover {
          background: linear-gradient(90deg, #01E2E9 80%, #BABC19 100%);
          transform: translateY(-3px);
          box-shadow: 0 8px 30px rgba(1, 226, 233, 0.6);
        }

        .tournament-btn:active {
          transform: translateY(-1px);
        }

        .tournament-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s;
        }

        .tournament-btn:hover::before {
          left: 100%;
        }

        .loading-text {
          color: #01E2E9;
          font-family: 'Orbitron', sans-serif;
          text-align: center;
          font-size: 1.4rem;
          margin: 3rem 0;
          text-shadow: 0 0 15px rgba(1, 226, 233, 0.8);
        }

        .error-text {
          color: #ff4444;
          text-align: center;
          font-size: 1.2rem;
          margin: 3rem 0;
          font-family: 'Orbitron', sans-serif;
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
          backdrop-filter: blur(6px);
        }

        /* Particle Animation Background */
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
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: radial-gradient(circle, #01E2E9 60%, #BABC19 100%);
          opacity: 0.7;
          animation: float 10s linear infinite;
        }

        @keyframes float {
          0% {
            transform: translateY(100vh) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.7;
          }
          90% {
            opacity: 0.7;
          }
          100% {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
          }
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .tournaments-grid {
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 2rem;
          }
          
          .page-title {
            font-size: 2.4rem;
          }
        }

        @media (max-width: 768px) {
          .tournament-page {
            padding: 1.5rem 0.75rem;
          }
          
          .tournaments-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
            padding: 0;
          }
          
          .page-title {
            font-size: 2rem;
            margin-bottom: 2rem;
            letter-spacing: 2px;
          }
          
          .tournament-card {
            min-height: 450px;
            padding: 1.5rem;
            max-width: 100%;
          }
          
          .tournament-title {
            font-size: 1.3rem;
            min-height: 2.8rem;
          }
        }

        @media (max-width: 480px) {
          .tournament-page {
            padding: 1rem 0.5rem;
          }
          
          .page-title {
            font-size: 1.8rem;
            letter-spacing: 1px;
          }
          
          .tournament-card {
            min-height: 420px;
            padding: 1.25rem;
          }
          
          .tournament-image {
            height: 130px;
          }
          
          .tournament-title {
            font-size: 1.2rem;
            min-height: 2.5rem;
          }
          
          .tournament-info p {
            font-size: 0.95rem;
          }
          
          .tournament-btn {
            font-size: 1rem;
            padding: 12px 16px;
            min-height: 46px;
          }
        }

        @media (min-width: 1400px) {
          .tournaments-grid {
            grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
            gap: 3rem;
          }
          
          .tournament-card {
            max-width: 400px;
          }
        }
      `}</style>

      <div className="tournament-page">
        {/* Animated Particles Background */}
        <div className="particles">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 10}s`,
                animationDuration: `${8 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>

        <div className="tournaments-container">
          <h1 className="page-title">Available Tournaments</h1>

          {loading && (
            <p className="loading-text">⚡ Loading tournaments...</p>
          )}
          
          {error && (
            <p className="error-text">❌ {error}</p>
          )}

          <div className="tournaments-grid">
            {tournaments.map(tournament => (
              <div key={tournament.id} className="tournament-card">
                {tournament.logo_url && (
                  <img
                    src={tournament.logo_url}
                    alt={tournament.name}
                    className="tournament-image"
                  />
                )}
                
                <h2 className="tournament-title">{tournament.name}</h2>
                
                <div className="tournament-info">
                  <p><b>💰 Prize Pool:</b> {tournament.prize_pool}</p>
                  <p><b>🚀 Start:</b> {tournament.start_date}</p>
                  <p><b>🏁 End:</b> {tournament.end_date}</p>
                  <p><b>🎮 Game:</b> {tournament.game}</p>
                  <p><b>⚔️ Mode:</b> {tournament.mode}</p>
                </div>
                
                <div className="tournament-buttons">
                  <button
                    className="tournament-btn"
                    onClick={() => {
                      setRegisterTournament(tournament);
                      setShowRegisterModal(true);
                    }}
                  >
                    🎯 Join Tournament
                  </button>
                  <button
                    className="tournament-btn"
                    onClick={() => navigate(`/tournament/${tournament.id}`)}
                  >
                    📋 View Details
                  </button>
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