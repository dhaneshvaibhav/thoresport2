import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTournaments = async () => {
      setLoading(true);
      setError('');
      try {
        let { data, error } = await supabase.from('tournaments').select('*');
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
    <div style={styles.page}>
      <h1 style={styles.heading}>Admin Dashboard</h1>
      <h2 style={styles.subheading}>All Tournaments</h2>

      {loading && <p style={styles.loading}>Loading tournaments...</p>}
      {error && <p style={styles.error}>{error}</p>}

      <div style={styles.cardGrid}>
        {tournaments.map((t) => (
          <div key={t.id} style={styles.card}>
            {t.logo_url && (
              <img src={t.logo_url} alt={t.name} style={styles.logo} />
            )}
            <h2 style={styles.cardTitle}>{t.name}</h2>
            <p><b>💰 Prize:</b> {t.prize_pool}</p>
            <p><b>📅 Start:</b> {t.start_date}</p>
            <p><b>📅 End:</b> {t.end_date}</p>
            <p><b>🎮 Game:</b> {t.game}</p>
            <p><b>⚔️ Mode:</b> {t.mode}</p>
            <button
              onClick={() => navigate(`/admin/tournament/${t.id}`)}
              style={styles.neonButton}
            >
              View More
            </button>
          </div>
        ))}
      </div>

      {/* Responsive styles */}
      <style>
        {`
          @media (max-width: 600px) {
            h1 {
              font-size: 1.5rem !important;
            }

            h2 {
              font-size: 1.2rem !important;
            }

            .cardGrid {
              flex-direction: column !important;
              gap: 1rem !important;
              padding: 0 1rem;
            }

            .card {
              width: 100% !important;
            }
          }
        `}
      </style>
    </div>
  );
}

const styles = {
  page: {
    backgroundColor: '#0a0a0a',
    minHeight: '100vh',
    padding: '2rem 1rem',
    color: '#00f0ff',
    fontFamily: '"Orbitron", sans-serif',
  },
  heading: {
    textAlign: 'center',
    color: '#00f0ff',
    fontSize: '2rem',
    marginBottom: '1rem',
  },
  subheading: {
    textAlign: 'center',
    fontSize: '1.5rem',
    marginBottom: '2rem',
  },
  loading: {
    textAlign: 'center',
    color: '#ccc',
  },
  error: {
    textAlign: 'center',
    color: '#f33',
  },
  cardGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1.5rem',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#111',
    border: '1px solid #00f0ff88',
    borderRadius: '10px',
    padding: '1rem',
    width: '300px',
    color: '#00f0ff',
    boxShadow: '0 0 10px #00f0ff55',
  },
  cardTitle: {
    margin: '0.5rem 0',
    fontSize: '1.2rem',
  },
  logo: {
    width: '100%',
    height: '140px',
    objectFit: 'cover',
    borderRadius: '5px',
    marginBottom: '0.7rem',
  },
  neonButton: {
    marginTop: '1rem',
    backgroundColor: '#00f0ff',
    color: '#000',
    padding: '0.5rem 1rem',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
    boxShadow: '0 0 10px #00f0ff',
    width: '100%',
  },
};

export default AdminDashboard;
