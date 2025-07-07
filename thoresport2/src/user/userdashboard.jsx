import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import RegisterTournamentModal from './RegisterTournamentModal';

const styles = {
  container: {
    padding: '2rem',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#1a1a1a',
    minHeight: '100vh',
    color: '#fff',
  },
  header: {
    fontSize: '2rem',
    marginBottom: '1rem',
    color: '#01E2E9',
    fontFamily: 'Orbitron',
  },
  tournamentListWrapper: {
    display: 'flex',
    justifyContent: 'center',
  },
  tournamentList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1rem',
    maxWidth: '1200px',
  },
  tournamentCard: {
    backgroundColor: '#333',
    border: '1px solid #444',
    borderRadius: '8px',
    padding: '1rem',
    width: '280px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.5)',
  },
  tournamentButtonGroup: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '1rem',
  },
  tournamentButton: {
    backgroundColor: '#01E2E9',
    border: 'none',
    color: '#000',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
};

function UserDashboard() {
  const [tournaments, setTournaments] = useState([]);
  const [registerTournament, setRegisterTournament] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/tournaments`);
        setTournaments(res.data);
      } catch (error) {
        console.error('Failed to fetch tournaments:', error);
      }
    };

    fetchTournaments();
  }, []);

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Available Tournaments</h1>
      <div style={styles.tournamentListWrapper}>
        <div style={styles.tournamentList}>
          {tournaments.map(t => (
            <div key={t.id} style={styles.tournamentCard}>
              {t.logo_url && (
                <img
                  src={t.logo_url}
                  alt={t.name}
                  style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 4, marginBottom: 8 }}
                />
              )}
              <h2 style={{ color: "#01E2E9", fontFamily: "Orbitron" }}>{t.name}</h2>
              <p><b style={{ color: "#BABC19" }}>Prize Pool:</b> {t.prize_pool}</p>
              <p><b style={{ color: "#BABC19" }}>Start:</b> {t.start_date}</p>
              <p><b style={{ color: "#BABC19" }}>End:</b> {t.end_date}</p>
              <p><b style={{ color: "#BABC19" }}>Game:</b> {t.game}</p>
              <p><b style={{ color: "#BABC19" }}>Mode:</b> {t.mode}</p>
              <div style={styles.tournamentButtonGroup}>
                <button onClick={() => setRegisterTournament(t)} style={styles.tournamentButton}>Join</button>
                <button onClick={() => navigate(`/tournament/${t.id}`)} style={styles.tournamentButton}>View More</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {registerTournament && (
        <RegisterTournamentModal
          tournament={registerTournament}
          onClose={() => setRegisterTournament(null)}
        />
      )}
    </div>
  );
}

export default UserDashboard;
