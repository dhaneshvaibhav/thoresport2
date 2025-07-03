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
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [announcementText, setAnnouncementText] = useState('');
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

  const handleAnnouncementSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!announcementText.trim()) return;
    try {
      const { error } = await supabase
        .from('announcements')
        .insert([{ tournament_id: id, content: announcementText.trim() }]);
      if (error) throw error;
      setMessage('✅ Announcement posted!');
      setAnnouncementText('');
      setShowAnnouncementForm(false);
    } catch (err) {
      setMessage('❌ Error posting announcement: ' + (err.message || 'Unknown error'));
    }
  };

  if (loading) return <div className="text-white">Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!tournament) return <div className="text-white">Tournament not found</div>;

  return (
    <div style={styles.page}>
      <h1 style={styles.heading}>{tournament.name}</h1>
      {message && <div style={{ color: message.startsWith('✅') ? '#0f0' : '#f33', marginBottom: 16 }}>{message}</div>}

      {tournament.logo_url && (
        <img
          src={tournament.logo_url}
          alt={tournament.name}
          style={styles.logo}
        />
      )}

      <div style={styles.card} className="details-card">
        {editMode ? (
          <form onSubmit={handleUpdate}>
            {["name", "logo_url", "prize_pool", "num_lobbies", "teams_per_lobby", "game", "mode", "start_date", "end_date"].map(field => (
              <div key={field}>
                <label style={styles.label}>{field.replace('_', ' ').toUpperCase()}:</label>
                {field === 'game' || field === 'mode' ? (
                  <select name={field} value={form[field]} onChange={handleChange} required style={styles.input}>
                    <option value="">Select {field}</option>
                    {field === 'game' ? (
                      ["free fire", "bgmi"].map(g => <option key={g} value={g}>{g}</option>)
                    ) : (
                      ["4vs4", "battleroyal"].map(m => <option key={m} value={m}>{m}</option>)
                    )}
                  </select>
                ) : (
                  <input
                    name={field}
                    value={form[field]}
                    onChange={handleChange}
                    required
                    style={styles.input}
                    type={field.includes('date') ? 'date' : 'text'}
                  />
                )}
              </div>
            ))}
            {Array.from({ length: parseInt(form.num_lobbies) || 0 }).map((_, idx) => (
              <div key={idx}>
                <label style={styles.label}>{`Lobby URL ${idx + 1}:`}</label>
                <input
                  name={`lobby_url${idx + 1}`}
                  value={form.lobby_urls[idx] || ''}
                  onChange={handleChange}
                  placeholder={`Enter URL for Lobby ${idx + 1}`}
                  style={styles.input}
                  required
                />
              </div>
            ))}
            <button type="submit" style={styles.neonButton} className="neon-btn">✅ Save</button>
            <button type="button" onClick={() => setEditMode(false)} style={{ ...styles.neonButton, backgroundColor: '#222' }} className="neon-btn">❌ Cancel</button>
          </form>
        ) : (
          <>
            <p><b>Prize Pool:</b> {tournament.prize_pool}</p>
            <p><b>Start Date:</b> {tournament.start_date}</p>
            <p><b>End Date:</b> {tournament.end_date}</p>
            <p><b>Game:</b> {tournament.game}</p>
            <p><b>Mode:</b> {tournament.mode}</p>
            <div style={{ marginTop: 24 }}>
              <button onClick={() => setEditMode(true)} style={styles.neonButton} className="neon-btn">🛠️ Update</button>
              <button onClick={handleDelete} style={{ ...styles.neonButton, backgroundColor: '#f33' }} className="neon-btn">🗑️ Delete</button>
              <button onClick={() => setShowAnnouncementForm((v) => !v)} style={styles.neonButton}>Add Announcement</button>
            </div>
            {showAnnouncementForm && (
              <form onSubmit={handleAnnouncementSubmit} style={{ marginTop: 16 }}>
                <textarea
                  value={announcementText}
                  onChange={e => setAnnouncementText(e.target.value)}
                  placeholder="Enter announcement..."
                  rows={3}
                  style={{ width: '100%', borderRadius: 6, padding: 8, fontSize: 16 }}
                  required
                />
                <button type="submit" style={{ marginTop: 8, background: '#00e6fb', color: '#10131a', border: 'none', borderRadius: 4, padding: '8px 16px', cursor: 'pointer', fontWeight: 700 }}>Post Announcement</button>
              </form>
            )}
          </>
        )}
      </div>

      {/* Mobile responsive styles */}
      <style>
        {`
          @media (max-width: 600px) {
            .details-card {
              width: 90% !important;
              padding: 1rem !important;
            }

            .neon-btn {
              width: 100% !important;
              margin-top: 0.75rem !important;
            }

            input, select {
              font-size: 1rem !important;
            }

            h1 {
              font-size: 1.5rem !important;
            }
          }
        `}
      </style>
    </div>
  );
}
const styles = {
  page: {
    background: '#0a0a0a',
    color: '#00f0ff',
    minHeight: '100vh',
    padding: '2rem',
    fontFamily: 'Orbitron, sans-serif',
  },
  heading: {
    textAlign: 'center',
    fontSize: '2rem',
    marginBottom: '1.5rem',
  },
  logo: {
    width: '100%',
    maxWidth: 400,
    height: 200,
    objectFit: 'cover',
    borderRadius: 8,
    margin: '0 auto 16px',
    display: 'block',
  },
  card: {
    maxWidth: 600,
    margin: '0 auto',
    background: '#111',
    color: '#00f0ff',
    borderRadius: 10,
    padding: 24,
    boxShadow: '0 0 12px #00f0ff',
    width: '100%',
  },
  label: {
    display: 'block',
    marginBottom: '4px',
    marginTop: '16px',
  },
  input: {
    width: '100%',
    padding: '0.6rem',
    backgroundColor: '#1a1a1a',
    color: '#00f0ff',
    border: '1px solid #00f0ff',
    borderRadius: '6px',
  },
  neonButton: {
    backgroundColor: '#00f0ff',
    color: '#000',
    padding: '0.6rem 1.2rem',
    border: 'none',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 0 10px #00f0ff',
    marginRight: '0.5rem',
    marginTop: '1rem',
  },
};

export default AdminTournamentDetails;
