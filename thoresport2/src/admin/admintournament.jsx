import React, { useState } from 'react';
import axios from 'axios';
import { supabase } from '../supabase';

function Admintournament() {
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
    rules: '',
    points_system: '',
  });
  const [logoFile, setLogoFile] = useState(null);
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    if (type === 'file') {
      setLogoFile(e.target.files[0]);
    } else if (name.startsWith('lobby_url')) {
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
    let logo_url = form.logo_url;
    if (logoFile) {
      const fileExt = logoFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('logobucket')
        .upload(fileName, logoFile);
      if (uploadError) {
        setMessage('❌ Error uploading logo: ' + uploadError.message);
        return;
      }
      const { data: publicUrlData } = supabase
        .storage
        .from('logobucket')
        .getPublicUrl(fileName);
      logo_url = publicUrlData.publicUrl;
    }
    try {
      const token = localStorage.getItem('orgToken');
      if (!token) {
        setMessage('❌ Organization token not found. Please log in again.');
        return;
      }
      const payload = {
        ...form,
        logo_url,
        num_lobbies: parseInt(form.num_lobbies),
        teams_per_lobby: parseInt(form.teams_per_lobby),
        lobby_urls: form.lobby_urls,
        rules: form.rules,
        points_system: form.points_system,
      };
      const response = await axios.post('http://localhost:4000/org/create-tournament', payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.data && response.data.success) {
        setMessage('✅ Tournament created!');
        setShowForm(false);
        setForm({ name: '', logo_url: '', prize_pool: '', num_lobbies: '', teams_per_lobby: '', game: '', mode: '', start_date: '', end_date: '', lobby_urls: [] });
        setLogoFile(null);
      } else {
        setMessage('❌ Error creating tournament: ' + (response.data.error || 'Unknown error'));
      }
    } catch (err) {
      setMessage('❌ Error creating tournament: ' + (err.response?.data?.error || err.message || 'Unknown error'));
    }
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.heading}>Admin Tournament</h1>
      {message && <p style={{ color: message.startsWith('✅') ? '#0f0' : '#f33' }}>{message}</p>}

      {!showForm && (
        <button onClick={() => setShowForm(true)} style={styles.neonButton} className="neonButton">➕ Add Tournament</button>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} style={styles.form} className="tournament-form">
          {[
            { label: 'Tournament Name', name: 'name' },
            { label: 'Prize Pool', name: 'prize_pool' },
          ].map(({ label, name }) => (
            <div key={name}>
              <label style={styles.label}>{label}:</label>
              <input name={name} value={form[name]} onChange={handleChange} required style={styles.input} />
            </div>
          ))}

          <div>
            <label style={styles.label}>Logo:</label>
            <input type="file" accept="image/*" onChange={handleChange} style={styles.input} />
            {logoFile && <span style={{ color: '#0f0', fontSize: '0.9em' }}>Selected: {logoFile.name}</span>}
            <div style={{ color: '#888', fontSize: '0.9em', marginTop: 2 }}>Or paste a URL below (file takes priority):</div>
            <input name="logo_url" value={form.logo_url} onChange={handleChange} style={styles.input} placeholder="https://..." />
          </div>

          <div>
            <label style={styles.label}>No of Lobbies:</label>
            <input name="num_lobbies" type="number" min="1" value={form.num_lobbies} onChange={handleNumLobbiesChange} required style={styles.input} />
          </div>

          <div>
            <label style={styles.label}>Teams per Lobby:</label>
            <input name="teams_per_lobby" type="number" min="1" value={form.teams_per_lobby} onChange={handleChange} required style={styles.input} />
          </div>

          <div>
            <label style={styles.label}>Game:</label>
            <select name="game" value={form.game} onChange={handleChange} required style={styles.input}>
              <option value="">Select Game</option>
              <option value="free fire">Free Fire</option>
              <option value="bgmi">BGMI</option>
            </select>
          </div>

          <div>
            <label style={styles.label}>Mode:</label>
            <select name="mode" value={form.mode} onChange={handleChange} required style={styles.input}>
              <option value="">Select Mode</option>
              <option value="4vs4">4 vs 4</option>
              <option value="battleroyal">Battle Royale</option>
            </select>
          </div>

          <div>
            <label style={styles.label}>Start Date:</label>
            <input type="date" name="start_date" value={form.start_date} onChange={handleChange} required style={styles.input} />
          </div>

          <div>
            <label style={styles.label}>End Date:</label>
            <input type="date" name="end_date" value={form.end_date} onChange={handleChange} required style={styles.input} />
          </div>

          {Array.from({ length: parseInt(form.num_lobbies) || 0 }).map((_, idx) => (
            <div key={idx}>
              <label style={styles.label}>{`Lobby URL ${idx + 1}:`}</label>
              <input
                name={`lobby_url${idx + 1}`}
                value={form.lobby_urls[idx] || ''}
                onChange={handleChange}
                placeholder={`Enter URL for Lobby ${idx + 1}`}
                required
                style={styles.input}
              />
            </div>
          ))}

          <div>
            <label style={styles.label}>Rules:</label>
            <textarea name="rules" value={form.rules} onChange={handleChange} style={styles.input} placeholder="Enter tournament rules..." rows={3} />
          </div>
          <div>
            <label style={styles.label}>Points System:</label>
            <textarea name="points_system" value={form.points_system} onChange={handleChange} style={styles.input} placeholder="Enter points system..." rows={3} />
          </div>

          <div style={{ marginTop: '1rem' }}>
            <button type="submit" style={styles.neonButton} className="neonButton">✅ Create</button>
            <button type="button" onClick={() => setShowForm(false)} style={{ ...styles.neonButton, backgroundColor: '#222' }} className="neonButton">❌ Cancel</button>
          </div>
        </form>
      )}

      {/* Responsive media query styles */}
      <style>
        {`
          @media (max-width: 600px) {
            .tournament-form {
              width: 90% !important;
              padding: 1rem !important;
            }

            input, select, button {
              font-size: 1rem !important;
            }

            h1 {
              font-size: 1.5rem !important;
            }

            .neonButton {
              width: 100% !important;
              margin-top: 0.75rem !important;
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
    color: '#00f0ff',
    minHeight: '100vh',
    padding: '2rem',
    fontFamily: '"Orbitron", sans-serif',
  },
  heading: {
    textAlign: 'center',
    fontSize: '2rem',
    marginBottom: '1.5rem',
  },
  form: {
    backgroundColor: '#111',
    border: '1px solid #00f0ff',
    borderRadius: '10px',
    padding: '1.5rem',
    width: '100%',
    maxWidth: '450px',
    margin: '0 auto',
    boxShadow: '0 0 12px #00f0ff',
  },
  label: {
    display: 'block',
    marginBottom: '0.3rem',
    marginTop: '1rem',
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
    width: 'fit-content',
  },
};

export default Admintournament;
