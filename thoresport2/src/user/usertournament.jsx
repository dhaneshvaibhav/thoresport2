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
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.7rem', marginTop: 16 }}>
              <button
                onClick={() => {
                  setRegisterTournament(t);
                  setShowRegisterModal(true);
                }}
                style={{
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
                }}
                onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(90deg, #01E2E9 80%, #BABC19 100%)'}
                onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(90deg, #01E2E9 60%, #1976d2 100%)'}
              >
                Join
              </button>
              <button
                onClick={() => navigate(`/tournament/${t.id}`)}
                style={{
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
                }}
                onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(90deg, #01E2E9 80%, #BABC19 100%)'}
                onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(90deg, #01E2E9 60%, #1976d2 100%)'}
              >
                View More
              </button>
            </div>
          </div>
        ))}
      </div>
      {showRegisterModal && registerTournament && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <RegisterTeamModal
            tournament={registerTournament}
            onClose={() => setShowRegisterModal(false)}
          />
        </div>
      )}
    </div>
  );
}

export default UserTournament;
