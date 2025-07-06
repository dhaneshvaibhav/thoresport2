import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';

function UserTournament() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
    <div className="bg-[#0f0f0f] min-h-screen text-white p-6 font-sans" style={{ padding: '2rem', maxWidth: 1200, margin: '0 auto' }}>.
      <h1 className="text-3xl font-bold mb-6 text-center text-green-400 " style={{color: "white", padding:"10px"}}>Available Tournaments</h1>

      {loading && <p className="text-center text-lg" style={{color:"#01E2E9", fontFamily: "Orbitron"}}>Loading tournaments...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', }}>
        {tournaments.map(t => (
          <div key={t.id} style={{ border: '1px solid #01E2E9', borderRadius: 8, padding: 16, width: 300, background: '#1a1a1a', boxShadow: '0 2px 8px #01E2E9' }}>
            {t.logo_url && <img src={t.logo_url} alt={t.name} style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 4, marginBottom: 8 }} />}
            <h2 style={{ margin: '8px 0', color:"#01E2E9",fontFamily: "Orbitron" }}>{t.name}</h2>
            <p style={{color:'white', fontFamily:"Orbitron"}}><b style={{ color: "#BABC19" }}>Prize Pool:</b> {t.prize_pool}</p>
            <p style={{color:'white', fontFamily:"Orbitron"}}><b style={{ color: "#BABC19" }}>Start:</b> {t.start_date}</p>
            <p style={{color:'white', fontFamily:"Orbitron"}}><b style={{ color: "#BABC19" }}>End:</b> {t.end_date}</p>
            <p style={{color:'white', fontFamily:"Orbitron"}}><b style={{ color: "#BABC19" }}>Game:</b> {t.game}</p>
            <p style={{color:'white', fontFamily:"Orbitron"}}><b style={{ color: "#BABC19" }}>Mode:</b> {t.mode}</p>
            <button onClick={() => alert(`Join ${t.name}`)} style={{ marginTop: 8, padding: '8px 16px', background: '#4caf50', color: 'black', border: 'none', borderRadius: 4, cursor: 'pointer', marginRight: 8,fontFamily:"Orbitron" }}>Join</button>
            <button onClick={() => navigate(`/tournament/${t.id}`)} style={{ marginTop: 8, padding: '8px 16px', background: '#2196f3', color: 'black', border: 'none', borderRadius: 4, cursor: 'pointer',fontFamily:"Orbitron" }}>View More</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UserTournament;
