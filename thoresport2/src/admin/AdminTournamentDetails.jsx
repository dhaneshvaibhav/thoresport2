import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

function AdminTournamentDetails() {
  const { id } = useParams();
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(null);
  const [message, setMessage] = useState('');
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
        setForm({
          name: data.name || '',
          logo_url: data.logo_url || '',
          prize_pool: data.prize_pool || '',
          num_lobbies: data.num_lobbies ? String(data.num_lobbies) : '',
          teams_per_lobby: data.teams_per_lobby ? String(data.teams_per_lobby) : '',
          game: data.game || '',
          mode: data.mode || '',
          start_date: data.start_date || '',
          end_date: data.end_date || '',
          lobby_urls: Array.from(data.lobby_urls || []),
        });
      } catch (err) {
        setError('Failed to fetch tournament details');
      } finally {
        setLoading(false);
      }
    };
    fetchTournament();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('lobby_url')) {
      const index = parseInt(name.replace('lobby_url', '')) - 1;
      const newLobbyUrls = [...form.lobby_urls];
      newLobbyUrls[index] = value;
      setForm({ ...form, lobby_urls: newLobbyUrls });
    } else if (name === 'num_lobbies') {
      const num = parseInt(value) || 0;
      setForm({
        ...form,
        num_lobbies: value,
        lobby_urls: Array(num).fill('').map((_, i) => form.lobby_urls[i] || ''),
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const { error } = await supabase
        .from('tournaments')
        .update({
          name: form.name,
          logo_url: form.logo_url,
          prize_pool: form.prize_pool,
          num_lobbies: parseInt(form.num_lobbies),
          teams_per_lobby: parseInt(form.teams_per_lobby),
          game: form.game,
          mode: form.mode,
          start_date: form.start_date,
          end_date: form.end_date,
          lobby_urls: form.lobby_urls,
        })
        .eq('id', id);
      if (error) throw error;
      setMessage('✅ Tournament updated!');
      setEditMode(false);
      setTournament({ ...tournament, ...form });
    } catch (err) {
      setMessage('❌ Error updating tournament: ' + (err.message || 'Unknown error'));
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this tournament?')) return;
    setMessage('');
    try {
      const { error } = await supabase
        .from('tournaments')
        .delete()
        .eq('id', id);
      if (error) throw error;
      setMessage('✅ Tournament deleted!');
      setTimeout(() => navigate('/admin/dashboard'), 1200);
    } catch (err) {
      setMessage('❌ Error deleting tournament: ' + (err.message || 'Unknown error'));
    }
  };

  if (loading) return <div className="text-white">Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!tournament) return <div className="text-white">Tournament not found</div>;

  return (
    <div className="bg-[#0f0f0f] min-h-screen text-white p-6 font-sans">
      <h1 className="text-3xl font-bold mb-6 text-center text-green-400">{tournament.name}</h1>
      {message && <div style={{ color: message.startsWith('✅') ? 'green' : 'red', marginBottom: 16 }}>{message}</div>}
      {tournament.logo_url && <img src={tournament.logo_url} alt={tournament.name} style={{ width: 400, height: 200, objectFit: 'cover', borderRadius: 8, margin: '0 auto 16px', display: 'block' }} />}
      <div style={{ maxWidth: 600, margin: '0 auto', background: '#fafbfc', color: '#222', borderRadius: 8, padding: 24, boxShadow: '0 2px 8px #0001' }}>
        {editMode ? (
          <form onSubmit={handleUpdate}>
            <div>
              <label>Tournament Name:</label>
              <input name="name" value={form.name} onChange={handleChange} required style={{ width: '100%' }} />
            </div>
            <div>
              <label>Logo URL:</label>
              <input name="logo_url" value={form.logo_url} onChange={handleChange} style={{ width: '100%' }} />
            </div>
            <div>
              <label>Prize Pool:</label>
              <input name="prize_pool" value={form.prize_pool} onChange={handleChange} required style={{ width: '100%' }} />
            </div>
            <div>
              <label>No of Lobbies:</label>
              <input name="num_lobbies" type="number" min="1" value={form.num_lobbies} onChange={handleChange} required style={{ width: '100%' }} />
            </div>
            <div>
              <label>No of Teams in a Single Lobby:</label>
              <input name="teams_per_lobby" type="number" min="1" value={form.teams_per_lobby} onChange={handleChange} required style={{ width: '100%' }} />
            </div>
            <div>
              <label>Game:</label>
              <select name="game" value={form.game} onChange={handleChange} required style={{ width: '100%' }} >
                <option value="">Select Game</option>
                <option value="free fire">free fire</option>
                <option value="bgmi">bgmi</option>
              </select>
            </div>
            <div>
              <label>Mode:</label>
              <select name="mode" value={form.mode} onChange={handleChange} required style={{ width: '100%' }}>
                <option value="">Select Mode</option>
                <option value="4vs4">4 vs 4</option>
                <option value="battleroyal">Battle Royale</option>
              </select>
            </div>
            <div>
              <label>Start Date:</label>
              <input type="date" name="start_date" value={form.start_date} onChange={handleChange} required style={{ width: '100%' }} />
            </div>
            <div>
              <label>End Date:</label>
              <input type="date" name="end_date" value={form.end_date} onChange={handleChange} required style={{ width: '100%' }} />
            </div>
            {Array.from({ length: parseInt(form.num_lobbies) || 0 }).map((_, idx) => (
              <div key={idx}>
                <label>{`Lobby URL ${idx + 1}:`}</label>
                <input
                  name={`lobby_url${idx + 1}`}
                  value={form.lobby_urls[idx] || ''}
                  onChange={handleChange}
                  placeholder={`Enter URL for Lobby ${idx + 1}`}
                  style={{ width: '100%' }}
                  required
                />
              </div>
            ))}
            <button type="submit" style={{ marginTop: 12 }}>Save</button>
            <button type="button" onClick={() => setEditMode(false)} style={{ marginLeft: 12, marginTop: 12 }}>Cancel</button>
          </form>
        ) : (
          <>
            <p><b>Prize Pool:</b> {tournament.prize_pool}</p>
            <p><b>Start Date:</b> {tournament.start_date}</p>
            <p><b>End Date:</b> {tournament.end_date}</p>
            <p><b>Game:</b> {tournament.game}</p>
            <p><b>Mode:</b> {tournament.mode}</p>
            <div style={{ marginTop: 24 }}>
              <button onClick={() => setEditMode(true)} style={{ marginRight: 12, background: '#2196f3', color: 'white', border: 'none', borderRadius: 4, padding: '8px 16px', cursor: 'pointer' }}>Update</button>
              <button onClick={handleDelete} style={{ background: '#f44336', color: 'white', border: 'none', borderRadius: 4, padding: '8px 16px', cursor: 'pointer' }}>Delete</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AdminTournamentDetails; 