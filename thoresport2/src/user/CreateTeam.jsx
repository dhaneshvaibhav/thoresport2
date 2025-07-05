import React, { useState, useRef } from 'react';
import { supabase } from '../supabase';

function CreateTeam() {
 const [teamName, setTeamName] = useState('');
 const [logo, setLogo] = useState(null);
 const [inviteEmail, setInviteEmail] = useState('');
 const [invitedMembers, setInvitedMembers] = useState([]);
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState('');
 const [success, setSuccess] = useState('');
 const fileInputRef = useRef(null);

 const handleLogoChange = (e) => setLogo(e.target.files[0]);

 const handleRemoveMember = (idx) => {
 setInvitedMembers(invitedMembers.filter((_, i) => i !== idx));
 };

 const teamFull = invitedMembers.length + 1 >= 5; // 1 for captain

 const handleAddMember = async () => {
 setError('');
 if (teamFull) {
 setError('Team is full. Maximum 5 members allowed.');
 return;
 }
 const email = inviteEmail.trim().toLowerCase();
 if (!email || invitedMembers.includes(email)) return;

 const { data: profile } = await supabase
     .from('profiles')
     .select('user_id')
     .eq('email', email)
 .maybeSingle();

 if (!profile) {
 setError('User with this email does not exist.');
return;
}

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

    setInvitedMembers([...invitedMembers, email]);
    setInviteEmail('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (invitedMembers.length + 1 > 5) {
      setError('Team is full. Maximum 5 members allowed.');
      setLoading(false);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Check for team name uniqueness
      const { data: existingTeam, error: teamNameError } = await supabase
        .from('teams')
        .select('id')
        .eq('team_name', teamName)
        .maybeSingle();
      if (teamNameError) throw new Error('Error checking team name. Please try again.');
      if (existingTeam) {
        setError('A team with this name already exists. Please choose another name.');
        setLoading(false);
        return;
      }

      let logoUrl = null;
      if (logo) {
        const fileExt = logo.name.split('.').pop();
        const fileName = `${teamName.replace(/\s+/g, '_')}_${Date.now()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage.from('team-logos').upload(fileName, logo);
        if (uploadError) throw new Error('Failed to upload logo. Please try again.');
        const { data: publicUrlData } = supabase.storage.from('team-logos').getPublicUrl(fileName);
        logoUrl = publicUrlData?.publicUrl || null;
      }

      const { data: teamData } = await supabase
        .from('teams')
        .insert([{ team_name: teamName, created_by: user.id, team_logo_url: logoUrl }])
        .select()
        .single();

      await supabase.from('team_members').insert({
        team_id: teamData.id,
        user_id: user.id,
        is_captain: true,
        status: 'active',
      });

      // Invite members in parallel
      await Promise.all(invitedMembers.map(async (email) => {
        const { data: memberProfile } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('email', email)
          .maybeSingle();

        if (memberProfile?.user_id) {
          await supabase.from('team_members').insert({
            team_id: teamData.id,
            user_id: memberProfile.user_id,
            is_captain: false,
            status: 'pending',
          });
        }
      }));

 setSuccess('Team created successfully!');
 setTeamName('');
 setLogo(null);
 setInvitedMembers([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
 } catch (err) {
 setError(err.message || 'Failed to create team');
 } finally {
 setLoading(false);
  }
 };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h2 style={styles.title}>Create a New Team</h2>
      <label style={styles.label}>
        Team Name*
        <input type="text" value={teamName} onChange={e => setTeamName(e.target.value)} required style={styles.input} />
      </label>
      <label style={styles.label}>
        Team Logo
        <input type="file" accept="image/*" onChange={handleLogoChange} style={styles.input} ref={fileInputRef} />
      </label>
      <label style={styles.label}>
        Add Team Member (by email):
        <div style={styles.inputRow}>
          <input
            type="email"
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            placeholder="Enter email"
            style={styles.input}
            disabled={loading || teamFull}
          />
          <button
            type="button"
            onClick={handleAddMember}
            style={styles.button}
            disabled={loading || !inviteEmail.trim() || invitedMembers.includes(inviteEmail.trim().toLowerCase()) || teamFull}
          >
            Add
          </button>
        </div>
      </label>
      {invitedMembers.length > 0 && (
        <div>
          <label style={styles.label}>Invited Members:</label>
          <ul style={styles.list}>
            {invitedMembers.map((email, idx) => (
              <li key={idx} style={styles.listItem}>
                <span>{email}</span>
                <button type="button" onClick={() => handleRemoveMember(idx)} style={styles.removeBtn}>Remove</button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}
      <button type="submit" disabled={loading} style={styles.submit}>
        {loading ? 'Creating...' : 'Submit'}
      </button>
    </form>
  );
}

const neon = '#00f6ff';
const styles = {
  form: {
    background: '#000',
    color: neon,
    fontFamily: 'Orbitron, sans-serif',
    padding: '20px',
    borderRadius: '12px',
    border: `2px solid ${neon}`,
    boxShadow: `0 0 20px ${neon}`,
    maxWidth: '400px',
    margin: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  title: {
    textAlign: 'center',
    fontSize: '20px',
    marginBottom: '10px',
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    fontSize: '14px',
  },
  input: {
    padding: '8px',
    backgroundColor: '#111',
    border: `1px solid ${neon}`,
    borderRadius: '6px',
    color: neon,
    marginTop: '4px',
    fontSize: '13px',
  },
  inputRow: {
    display: 'flex',
    gap: '8px',
    marginTop: '4px',
  },
  button: {
    backgroundColor: neon,
    color: '#000',
    border: 'none',
    borderRadius: '6px',
    padding: '8px 12px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  removeBtn: {
    background: 'transparent',
    color: 'red',
    border: 'none',
    cursor: 'pointer',
  },
  list: {
    paddingLeft: '16px',
    marginTop: '6px',
  },
  listItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '4px',
  },
  error: {
    color: 'red',
  },
  success: {
    color: 'limegreen',
  },
  submit: {
    marginTop: '10px',
    padding: '10px',
    backgroundColor: neon,
    color: '#000',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
};

export default CreateTeam;
