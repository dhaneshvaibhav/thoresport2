import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

function CreateTeam({ onClose }) {
  const [teamName, setTeamName] = useState('');
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitedMembers, setInvitedMembers] = useState([]);
  const [userAlreadyInTeam, setUserAlreadyInTeam] = useState(false);
  const [checkingTeam, setCheckingTeam] = useState(true);
  const navigate = useNavigate();

  React.useEffect(() => {
    const checkUserTeam = async () => {
      setCheckingTeam(true);
      setError("");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setCheckingTeam(false);
        return;
      }
      const { data, error } = await supabase
        .from('team_members')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();
      if (data) setUserAlreadyInTeam(true);
      else setUserAlreadyInTeam(false);
      setCheckingTeam(false);
    };
    checkUserTeam();
  }, []);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    setLogo(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setLogoPreview('');
    }
  };

  const handleAddMember = async () => {
    if (!inviteEmail) return;
    if (invitedMembers.includes(inviteEmail)) return;
    // Check if this email is already in a team
    const { data: memberProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', inviteEmail)
      .maybeSingle();
    if (!memberProfile) {
      setError('User with this email does not exist.');
      return;
    }
    const { data: memberTeam } = await supabase
      .from('team_members')
      .select('id')
      .eq('user_id', memberProfile.id)
      .eq('status', 'active')
      .maybeSingle();
    if (memberTeam) {
      setError('This user is already in a team.');
      return;
    }
    setInvitedMembers([...invitedMembers, inviteEmail]);
    setInviteEmail('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!teamName) {
      setError('Please fill all required fields.');
      return;
    }
    if (userAlreadyInTeam) {
      setError('You are already in a team. You cannot create another team.');
      return;
    }
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
        const { data: uploadData, error: uploadError } = await supabase.storage.from('team-logos').upload(fileName, logo);
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

      // 5. Invite members (status: pending)
      for (const email of invitedMembers) {
        // Find user by email
        const { data: memberUser, error: memberError } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', email)
          .single();
        if (memberUser && memberUser.id) {
          await supabase.from('team_members').insert({
            team_id: teamData.id,
            user_id: memberUser.id,
            is_captain: false,
            status: 'pending',
          });
        }
        // else: skip or handle user-not-found (optional)
      }

      setLoading(false);
      if (onClose) onClose();
    } catch (err) {
      setError(err.message || 'Failed to create team');
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Create Team</h2>
        {onClose && (
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: 22, cursor: 'pointer' }}>&times;</button>
        )}
      </div>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Team Name*</label>
          <input type="text" value={teamName} onChange={e => setTeamName(e.target.value)} />
        </div>
        <div>
          <label>Team Logo</label>
          <input type="file" accept="image/*" onChange={handleLogoChange} />
          {logoPreview && <img src={logoPreview} alt="Logo Preview" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, marginTop: 8 }} />}
        </div>
        <div>
          <label>Add Team Member (by email):</label>
          <input
            type="email"
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            placeholder="Enter email"
          />
          <button type="button" onClick={handleAddMember} style={{ marginLeft: 8 }}>
            Add
          </button>
        </div>
        {invitedMembers.length > 0 && (
          <div>
            <label>Invited Members:</label>
            <ul>
              {invitedMembers.map((email, idx) => (
                <li key={idx}>{email}</li>
              ))}
            </ul>
          </div>
        )}
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Team'}
        </button>
      </form>
    </div>
  );
}

export default CreateTeam;
