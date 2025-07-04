import React, { useState } from 'react';
import { supabase } from '../supabase';

function CreateTeam() {
  const [teamName, setTeamName] = useState('');
  const [logo, setLogo] = useState(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitedMembers, setInvitedMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogoChange = (e) => {
    setLogo(e.target.files[0]);
  };

  // Remove invited member by index
  const handleRemoveMember = (idx) => {
    setInvitedMembers(invitedMembers.filter((_, i) => i !== idx));
  };

  const handleAddMember = async () => {
    setError('');
    const email = inviteEmail.trim().toLowerCase();
    if (!email) return;
    if (invitedMembers.includes(email)) return;
    // Check if user exists in profiles
    const { data: profile, error: profileError } = await supabase
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
    setInvitedMembers([...invitedMembers, email]);
    setInviteEmail('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      // 1. Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      // 2. Upload logo if provided
      let logoUrl = null;
      if (logo) {
        const fileExt = logo.name.split('.').pop();
        const fileName = `${teamName.replace(/\s+/g, '_')}_${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('team-logos').upload(fileName, logo);
        if (uploadError) throw uploadError;
        const { data: publicUrlData } = supabase.storage.from('team-logos').getPublicUrl(fileName);
        logoUrl = publicUrlData.publicUrl;
      }

      // 3. Insert team
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .insert([{ team_name: teamName, created_by: user.id, team_logo_url: logoUrl }])
        .select()
        .single();
      if (teamError) throw teamError;

      // 4. Add creator as captain
      await supabase.from('team_members').insert({
        team_id: teamData.id,
        user_id: user.id,
        is_captain: true,
        status: 'active',
      });

      // 5. Add invited members as pending
      console.log('Invited members at submit:', invitedMembers);
      for (const email of invitedMembers) {
        // Find user by email
        const { data: memberProfile } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('email', email)
          .maybeSingle();
        if (memberProfile && memberProfile.user_id) {
          const { error: inviteError } = await supabase.from('team_members').insert({
            team_id: teamData.id,
            user_id: memberProfile.user_id,
            is_captain: false,
            status: 'pending',
          });
          if (inviteError) {
            console.error(`Failed to invite ${email}:`, inviteError.message);
          } else {
            console.log(`Invite row created for ${email}`);
          }
        } else {
          console.error(`No profile found for invited email: ${email}`);
        }
      }

      setSuccess('Team created successfully!');
      setTeamName('');
      setLogo(null);
      setInvitedMembers([]);
    } catch (err) {
      setError(err.message || 'Failed to create team');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 300 }}>
      <label>
        Team Name*
        <input type="text" value={teamName} onChange={e => setTeamName(e.target.value)} required />
      </label>
      <label>
        Team Logo
        <input type="file" accept="image/*" onChange={handleLogoChange} />
      </label>
      <label>
        Add Team Member (by email):
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
          disabled={!inviteEmail.trim() || invitedMembers.includes(inviteEmail.trim().toLowerCase())}
        >
          Add
        </button>
      </label>
      {invitedMembers.length > 0 && (
        <div>
          <label>Invited Members:</label>
          <ul style={{ paddingLeft: 16 }}>
            {invitedMembers.map((email, idx) => (
              <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>{email}</span>
                <button type="button" onClick={() => handleRemoveMember(idx)} style={{ color: 'red' }}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {success && <div style={{ color: 'green' }}>{success}</div>}
      <button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Submit'}</button>
    </form>
  );
}

export default CreateTeam;
