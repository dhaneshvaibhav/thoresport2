import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

function EditTeamModal({ teamId, onClose }) {
  const [teamName, setTeamName] = useState('');
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchTeam = async () => {
      setLoading(true);
      setError('');
      // Fetch team info
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .select('team_name, team_logo_url')
        .eq('id', teamId)
        .single();
      if (teamError) {
        setError('Failed to load team');
        setLoading(false);
        return;
      }
      setTeamName(team.team_name);
      setLogoPreview(team.team_logo_url || '');
      // Fetch members
      const { data: teamMembers } = await supabase
        .from('team_members')
        .select('id, user_id, is_captain, status, profiles ( email, username )')
        .eq('team_id', teamId)
        .eq('status', 'active');
      setMembers(teamMembers || []);
      setLoading(false);
    };
    fetchTeam();
  }, [teamId]);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    setLogo(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      let logoUrl = logoPreview;
      if (logo) {
        const fileExt = logo.name.split('.').pop();
        const fileName = `${teamName.replace(/\s+/g, '_')}_${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('team-logos').upload(fileName, logo);
        if (uploadError) throw uploadError;
        const { data: publicUrlData } = supabase.storage.from('team-logos').getPublicUrl(fileName);
        logoUrl = publicUrlData.publicUrl;
      }
      const { error: updateError } = await supabase
        .from('teams')
        .update({ team_name: teamName, team_logo_url: logoUrl })
        .eq('id', teamId);
      if (updateError) throw updateError;
      setSuccess('Team updated!');
    } catch (err) {
      setError(err.message || 'Failed to update team');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: 'white', padding: 32, borderRadius: 12, minWidth: 350, maxWidth: 500, boxShadow: '0 4px 24px #0003', position: 'relative' }}>
      <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 12, background: 'transparent', border: 'none', fontSize: 22, cursor: 'pointer' }}>&times;</button>
      <h2>Edit Team</h2>
      {loading ? <p>Loading...</p> : (
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <label>
            Team Name*
            <input type="text" value={teamName} onChange={e => setTeamName(e.target.value)} required />
          </label>
          <label>
            Team Logo
            <input type="file" accept="image/*" onChange={handleLogoChange} />
            {logoPreview && <img src={logoPreview} alt="Logo Preview" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, marginTop: 8 }} />}
          </label>
          <div>
            <label>Team Members:</label>
            <ul>
              {members.map((member) => (
                <li key={member.id}>
                  {member.profiles?.username || member.profiles?.email || member.user_id}
                  {member.is_captain && <span style={{ color: '#1976d2', fontWeight: 600, marginLeft: 4 }}>(Captain)</span>}
                </li>
              ))}
            </ul>
          </div>
          {error && <div style={{ color: 'red' }}>{error}</div>}
          {success && <div style={{ color: 'green' }}>{success}</div>}
          <button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
        </form>
      )}
    </div>
  );
}

export default EditTeamModal;
