import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    logo_url: '',
    prize_pool: '',
    num_lobbies: '',
    teams_per_lobby: '',
    game: '',
    mode: '',
    start_date: '',
    end_date: '',
    lobby_urls: [],
  });
  const [message, setMessage] = useState('');
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
  }, [showForm, message]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('lobby_url')) {
      const index = parseInt(name.replace('lobby_url', '')) - 1;
      const newLobbyUrls = [...form.lobby_urls];
      newLobbyUrls[index] = value;
      setForm({ ...form, lobby_urls: newLobbyUrls });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleNumLobbiesChange = (e) => {
    const num = parseInt(e.target.value) || 0;
    setForm({
      ...form,
      num_lobbies: e.target.value,
      lobby_urls: Array(num).fill(''),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const token = localStorage.getItem('orgToken');
      if (!token) {
        setMessage('❌ Organization token not found. Please log in again.');
        return;
      }
      const payload = {
        ...form,
        num_lobbies: parseInt(form.num_lobbies),
        teams_per_lobby: parseInt(form.teams_per_lobby),
        lobby_urls: form.lobby_urls,
      };
      const response = await axios.post('http://localhost:4000/create-tournament', payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.data && response.data.success) {
        setMessage('✅ Tournament created!');
        setShowForm(false);
        setForm({ name: '', logo_url: '', prize_pool: '', num_lobbies: '', teams_per_lobby: '', game: '', mode: '', start_date: '', end_date: '', lobby_urls: [] });
      } else {
        setMessage('❌ Error creating tournament: ' + (response.data.error || 'Unknown error'));
      }
    } catch (err) {
      setMessage('❌ Error creating tournament: ' + (err.response?.data?.error || err.message || 'Unknown error'));
    }
  };

  return (
    <div>
      <h1>AdminDashboard</h1>
      <button onClick={() => setShowForm(true)} style={{ marginBottom: '1rem' }}>
        Add Tournament
      </button>
      {message && <p style={{ color: message.startsWith('✅') ? 'green' : 'red' }}>{message}</p>}
      {showForm && (
        <form onSubmit={handleSubmit} style={{ border: '1px solid #ccc', padding: '1rem', maxWidth: 400 }}>
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
            <input name="num_lobbies" type="number" min="1" value={form.num_lobbies} onChange={handleNumLobbiesChange} required style={{ width: '100%' }} />
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
          <button type="submit" style={{ marginTop: '1rem' }}>Create Tournament</button>
          <button type="button" onClick={() => setShowForm(false)} style={{ marginLeft: '1rem', marginTop: '1rem' }}>Cancel</button>
        </form>
      )}
      <h2 style={{ marginTop: '2rem' }}>All Tournaments</h2>
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
                       <button onClick={() => navigate(`/admin/tournament/${t.id}`)} style={{ marginTop: 8, padding: '8px 16px', background: '#2196f3', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>View More</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminDashboard;