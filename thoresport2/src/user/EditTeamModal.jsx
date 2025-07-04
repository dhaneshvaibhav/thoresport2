import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

function EditTeamModal({ teamId, onClose }) {
  const [teamName, setTeamName] = useState('');
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [members, setMembers] = useState([]);
  const [pendingMembers, setPendingMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');

  const MAX_TEAM_SIZE = 5;

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
      // Fetch active members
      const { data: teamMembers } = await supabase
        .from('team_members')
        .select('id, user_id, is_captain, status, profiles ( email, username )')
        .eq('team_id', teamId)
        .eq('status', 'active');
      setMembers(teamMembers || []);
      // Fetch pending invites
      const { data: pending } = await supabase
        .from('team_members')
        .select('id, user_id, profiles ( email, username )')
        .eq('team_id', teamId)
        .eq('status', 'pending');
      setPendingMembers(pending || []);
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

  // Remove a member (not captain)
  const handleRemoveMember = async (memberId) => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const { error } = await supabase.from('team_members').delete().eq('id', memberId);
      if (error) throw error;
      setMembers(members.filter(m => m.id !== memberId));
      setSuccess('Member removed');
    } catch (err) {
      setError(err.message || 'Failed to remove member');
    } finally {
      setLoading(false);
    }
  };
  // Cancel invite
  const handleCancelInvite = async (inviteId) => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const { error } = await supabase.from('team_members').delete().eq('id', inviteId);
      if (error) throw error;
      setPendingMembers(pendingMembers.filter(m => m.id !== inviteId));
      setSuccess('Invite cancelled');
    } catch (err) {
      setError(err.message || 'Failed to cancel invite');
    } finally {
      setLoading(false);
    }
  };
  // Resend invite (dummy, just feedback)
  const handleResendInvite = async (inviteId) => {
    setSuccess('Invite resent! (Not implemented: send email)');
  };
  // Add member by email (invite)
  const handleAddMember = async () => {
    setError('');
    setSuccess('');
    if (members.length + pendingMembers.length >= MAX_TEAM_SIZE) {
      setError('Team is full. Maximum 5 members allowed.');
      return;
    }
    const email = inviteEmail.trim().toLowerCase();
    if (!email) return;
    if (pendingMembers.some(m => m.profiles?.email === email) || members.some(m => m.profiles?.email === email)) {
      setError('User already invited or in team.');
      return;
    }
    // Check if user exists in profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('email', email)
      .maybeSingle();
    if (!profile) {
      setError('User with this email does not exist.');
      return;
    }
    // Check if user is already in a team
    const { data: memberTeam } = await supabase
      .from('team_members')
      .select('id')
      .eq('user_id', profile.user_id)
      .eq('status', 'active')
      .maybeSingle();
    if (memberTeam) {
      setError('This user is already in a team.');
      return;
    }
    // Add invite
    const { data, error: inviteError } = await supabase.from('team_members').insert({
      team_id: teamId,
      user_id: profile.user_id,
      is_captain: false,
      status: 'pending',
    }).select().single();
    if (inviteError) {
      setError(inviteError.message);
      return;
    }
    setPendingMembers([...pendingMembers, { ...data, profiles: { email } }]);
    setInviteEmail('');
    setSuccess('Invite sent!');
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
                  {!member.is_captain && (
                    <button type="button" style={{ marginLeft: 8, color: 'red' }} onClick={() => handleRemoveMember(member.id)}>
                      Remove
                    </button>
                  )}
                </li>
              ))}
            </ul>
            {pendingMembers.length > 0 && (
              <>
                <label>Pending Invites:</label>
                <ul>
                  {pendingMembers.map((member) => (
                    <li key={member.id}>
                      {member.profiles?.email || member.user_id}
                      <button type="button" style={{ marginLeft: 8, color: 'orange' }} onClick={() => handleResendInvite(member.id)}>
                        Resend
                      </button>
                      <button type="button" style={{ marginLeft: 8, color: 'red' }} onClick={() => handleCancelInvite(member.id)}>
                        Cancel
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
          <div>
            <label>Add Team Member (by email):</label>
            <input
              type="email"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              placeholder="Enter email"
            />
            <button
              type="button"
              onClick={handleAddMember}
              style={{ marginLeft: 8 }}
              disabled={!inviteEmail.trim() || pendingMembers.some(m => m.profiles?.email === inviteEmail.trim().toLowerCase()) || members.some(m => m.profiles?.email === inviteEmail.trim().toLowerCase()) || (members.length + pendingMembers.length) >= MAX_TEAM_SIZE}
            >
              Invite
            </button>
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
