import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

function TournamentDetails() {
  const { id } = useParams();
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTournament = async () => {
      setLoading(true);
      setError('');
      try {
        const { data, error } = await supabase
          .from('tournaments')
          .select('*')
          .eq('id', id)
          .single();
        if (error) throw error;
        setTournament(data);
      } catch (err) {
        setError('Failed to fetch tournament details');
      } finally {
        setLoading(false);
      }
    };
    fetchTournament();
  }, [id]);

  if (loading) return <div className="text-white">Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!tournament) return <div className="text-white">Tournament not found</div>;

  return (
    <div className="bg-[#0f0f0f] min-h-screen text-white p-6 font-sans">
      <h1 className="text-3xl font-bold mb-6 text-center text-green-400">{tournament.name}</h1>
      {tournament.logo_url && <img src={tournament.logo_url} alt={tournament.name} style={{ width: 400, height: 200, objectFit: 'cover', borderRadius: 8, margin: '0 auto 16px', display: 'block' }} />}
      <div style={{ maxWidth: 600, margin: '0 auto', background: '#fafbfc', color: '#222', borderRadius: 8, padding: 24, boxShadow: '0 2px 8px #0001' }}>
        <p><b>Prize Pool:</b> {tournament.prize_pool}</p>
        <p><b>Start Date:</b> {tournament.start_date}</p>
        <p><b>End Date:</b> {tournament.end_date}</p>
        <p><b>Game:</b> {tournament.game}</p>
        <p><b>Mode:</b> {tournament.mode}</p>
        <p><b>Description:</b> {tournament.description || 'No description available.'}</p>
        <div style={{ marginTop: 24 }}>
          <button style={{ background: '#4caf50', color: 'white', border: 'none', borderRadius: 4, padding: '8px 16px', cursor: 'pointer' }}>Join Now</button>
        </div>
      </div>
    </div>
  );
}

export default TournamentDetails; 