import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';

function UserDashboard() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
    <div>
      <h1>User Dashboard</h1>
      {loading && <p>Loading tournaments...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        {tournaments.map(t => (
          <div key={t.id} style={{ border: '1px solid #ccc', borderRadius: 8, padding: 16, width: 300, background: '#fafbfc', boxShadow: '0 2px 8px #0001' }}>
            {t.logo_url && <img src={t.logo_url} alt={t.name} style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 4, marginBottom: 8 }} />}
            <h2 style={{ margin: '8px 0' }}>{t.name}</h2>
            <p><b>Prize Pool:</b> {t.prize_pool}</p>
            <p><b>Start:</b> {t.start_date}</p>
            <p><b>End:</b> {t.end_date}</p>
            <p><b>Game:</b> {t.game}</p>
            <p><b>Mode:</b> {t.mode}</p>
            <button onClick={() => alert(`Join ${t.name}`)} style={{ marginTop: 8, padding: '8px 16px', background: '#4caf50', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Join</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UserDashboard;   