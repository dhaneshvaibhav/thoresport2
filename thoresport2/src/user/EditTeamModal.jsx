import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

const neon = '#00f6ff';
const MAX_TEAM_SIZE = 5;

// --- Subcomponents ---
function TeamMembersList({ members, onRemove }) {
  return (
    <ul style={styles.list}>
      {members.map((member) => (
        <li key={member.id} style={styles.listItem}>
          <span>{member.profiles?.username || member.profiles?.email || member.user_id}</span>
          {member.is_captain && <span style={styles.captain}>(Captain)</span>}
          {!member.is_captain && (
            <button type="button" style={styles.removeBtn} onClick={() => onRemove(member.id)}>
              Remove
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}

function PendingInvitesList({ pendingMembers, onResend, onCancel }) {
  return (
    <ul style={styles.list}>
      {pendingMembers.map((member) => (
        <li key={member.id} style={styles.listItem}>
          <span>{member.profiles?.email || member.user_id}</span>
          <button type="button" style={styles.resendBtn} onClick={() => onResend(member.id)}>
            Resend
          </button>
          <button type="button" style={styles.removeBtn} onClick={() => onCancel(member.id)}>
            Cancel
          </button>
        </li>
      ))}
    </ul>
  );
}

function TeamForm({
  teamName,
  setTeamName,
  logo,
  setLogo,
  logoPreview,
  setLogoPreview,
  members,
  pendingMembers,
  loading,
  error,
  success,
  inviteEmail,
  setInviteEmail,
  onSave,
  onRemoveMember,
  onResendInvite,
  onCancelInvite,
  onAddMember,
}) {
  // File input handler
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    setLogo(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <form onSubmit={onSave} style={styles.form}>
      <div style={styles.section}>
        <label style={styles.label}>
          <span style={styles.labelText}>Team Name*</span>
          <input type="text" value={teamName} onChange={e => setTeamName(e.target.value)} required style={styles.input} />
        </label>
      </div>
      <div style={styles.section}>
        <label style={styles.label}>
          <span style={styles.labelText}>Team Logo</span>
          <input type="file" accept="image/*" onChange={handleLogoChange} style={styles.input} />
          {logoPreview && <img src={logoPreview} alt="Logo Preview" style={styles.logoImg} />}
        </label>
      </div>
      <div style={styles.section}>
        <div style={styles.labelText}>Team Members:</div>
        <TeamMembersList members={members} onRemove={onRemoveMember} />
        {pendingMembers.length > 0 && (
          <>
            <div style={styles.labelText}>Pending Invites:</div>
            <PendingInvitesList
              pendingMembers={pendingMembers}
              onResend={onResendInvite}
              onCancel={onCancelInvite}
            />
          </>
        )}
      </div>
      <div style={{ ...styles.section, ...styles.inviteRow }}>
        <div style={styles.labelText}>Add Team Member (by email):</div>
        <div style={styles.inviteInputRow}>
          <input
            type="email"
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            placeholder="Enter email"
            style={styles.input}
          />
          <button
            type="button"
            onClick={onAddMember}
            style={styles.inviteBtn}
            disabled={!inviteEmail.trim() || pendingMembers.some(m => m.profiles?.email === inviteEmail.trim().toLowerCase()) || members.some(m => m.profiles?.email === inviteEmail.trim().toLowerCase()) || (members.length + pendingMembers.length) >= MAX_TEAM_SIZE}
          >
            Invite
          </button>
        </div>
      </div>
      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}
      <button type="submit" disabled={loading} style={styles.saveBtn}>{loading ? 'Saving...' : 'Save Changes'}</button>
    </form>
  );
}

// --- Main Component ---
function EditTeamModal({ teamId, onClose }) {
  // State
  const [teamName, setTeamName] = useState('');
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [members, setMembers] = useState([]);
  const [pendingMembers, setPendingMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [deleting, setDeleting] = useState(false);

  // Fetch team data on mount or teamId change
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

  // Save team changes
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

  // Delete team handler
  const handleDeleteTeam = async () => {
    if (!window.confirm('Are you sure you want to delete this team? This action cannot be undone.')) return;
    setDeleting(true);
    setError('');
    try {
      const { error: deleteError } = await supabase.from('teams').delete().eq('id', teamId);
      if (deleteError) throw deleteError;
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to delete team');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={styles.modal}>
      <button onClick={onClose} style={styles.closeBtn}>&times;</button>
      <h2 style={styles.title}>Edit Team</h2>
      {loading ? <p style={styles.loading}>Loading...</p> : (
        <>
          <TeamForm
            teamName={teamName}
            setTeamName={setTeamName}
            logo={logo}
            setLogo={setLogo}
            logoPreview={logoPreview}
            setLogoPreview={setLogoPreview}
            members={members}
            pendingMembers={pendingMembers}
            loading={loading}
            error={error}
            success={success}
            inviteEmail={inviteEmail}
            setInviteEmail={setInviteEmail}
            onSave={handleSave}
            onRemoveMember={handleRemoveMember}
            onResendInvite={handleResendInvite}
            onCancelInvite={handleCancelInvite}
            onAddMember={handleAddMember}
          />
          <button
            type="button"
            style={styles.deleteBtn}
            onClick={handleDeleteTeam}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete Team'}
          </button>
        </>
      )}
    </div>
  );
}

// --- Styles ---
const styles = {
  modal: {
    background: '#000',
    color: neon,
    fontFamily: 'Orbitron, sans-serif',
    padding: 16,
    borderRadius: 16,
    minWidth: 280,
    maxWidth: 350,
    width: '95vw',
    boxSizing: 'border-box',
    boxShadow: `0 4px 24px ${neon}99`,
    position: 'relative',
    margin: '40px auto',
    border: `2px solid ${neon}`,
    maxHeight: '90vh',
    overflowY: 'auto',
  },
  closeBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    background: 'transparent',
    border: 'none',
    fontSize: 22,
    color: neon,
    cursor: 'pointer',
    transition: 'color 0.2s',
  },
  title: {
    textAlign: 'center',
    fontSize: 26,
    marginBottom: 20,
    color: neon,
    fontWeight: 700,
    letterSpacing: 1,
  },
  loading: {
    color: neon,
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  section: {
    marginBottom: 6,
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    fontSize: 15,
    color: neon,
    fontWeight: 500,
    marginBottom: 2,
    gap: 6,
  },
  labelText: {
    fontSize: 13,
    color: neon,
    fontWeight: 600,
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  input: {
    padding: '6px',
    backgroundColor: '#111',
    border: `1.5px solid ${neon}`,
    borderRadius: '6px',
    color: neon,
    marginTop: '2px',
    fontSize: '12px',
    fontFamily: 'Orbitron, sans-serif',
    fontWeight: 500,
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  },
  logoImg: {
    width: 50,
    height: 50,
    objectFit: 'cover',
    borderRadius: 8,
    marginTop: 4,
    border: `1px solid ${neon}`,
    boxShadow: `0 0 10px ${neon}66`,
    alignSelf: 'flex-start',
  },
  list: {
    paddingLeft: 24,
    marginTop: 6,
    marginBottom: 6,
  },
  listItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
    color: neon,
    fontSize: 11,
    fontWeight: 500,
  },
  captain: {
    color: '#1976d2',
    fontWeight: 700,
    marginLeft: 4,
    fontSize: 13,
  },
  removeBtn: {
    background: 'transparent',
    color: 'red',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 10,
    transition: 'color 0.2s',
  },
  resendBtn: {
    background: 'transparent',
    color: neon,
    border: 'none',
    cursor: 'pointer',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 10,
    transition: 'color 0.2s',
  },
  inviteRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    marginTop: 8,
    marginBottom: 8,
  },
  inviteInputRow: {
    display: 'flex',
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    width: '100%',
  },
  inviteBtn: {
    backgroundColor: neon,
    color: '#000',
    border: 'none',
    borderRadius: '6px',
    padding: '6px 10px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: 11,
    marginLeft: 0,
    transition: 'background 0.2s',
    minWidth: 60,
  },
  error: {
    color: 'red',
    marginTop: 4,
    textAlign: 'center',
    fontWeight: 600,
    fontSize: 15,
  },
  success: {
    color: 'limegreen',
    marginTop: 4,
    textAlign: 'center',
    fontWeight: 600,
    fontSize: 15,
  },
  saveBtn: {
    marginTop: 18,
    padding: '10px',
    backgroundColor: neon,
    color: '#000',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: 14,
    transition: 'background 0.2s',
    width: '100%',
    letterSpacing: 1,
  },
  deleteBtn: {
    marginTop: 16,
    padding: '8px',
    backgroundColor: '#ff0033',
    color: '#fff',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: 13,
    width: '100%',
    letterSpacing: 1,
    transition: 'background 0.2s',
    boxShadow: '0 0 10px #ff003399',
  },
};

export default EditTeamModal;
