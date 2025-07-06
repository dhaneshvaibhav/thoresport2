import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

function UserProfile() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    avatar_url: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('Auth error:', authError);
        setLoading(false);
        return;
      }
      setUserId(user.id);

      const { data, error } = await supabase.rpc('get_user_profile_summary', {
        input_user_id: user.id,
      });

      if (error) {
        console.error('Error fetching profile summary:', error);
      } else {
        const profile = data[0];
        setProfileData(profile);
        setFormData({
          username: profile.username || '',
          bio: profile.bio || '',
          avatar_url: profile.avatar_url || '',
        });
      }

      setLoading(false);
    };

    fetchProfile();
  }, []);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) navigate('/signin');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    console.log("Updating profile for user_id:", userId);
  
    const { error } = await supabase
      .from('profiles')
      .update({
        username: formData.username,
        bio: formData.bio,
        avatar_url: formData.avatar_url,
      })
      .eq('user_id', userId);
  
    if (error) {
      console.error("Error updating profile:", error);
      alert('Failed to update profile: ' + error.message);
    } else {
      alert('Profile updated!');
      setProfileData(prev => ({ ...prev, ...formData }));
      setEditMode(false);
    }
  };
  

  if (loading) return <div style={{ color: '#fff', textAlign: 'center' }}>Loading profile...</div>;
  if (!profileData) return <div style={{ color: '#fff', textAlign: 'center' }}>Profile not found.</div>;

  const {
    email,
    team_name = 'No Team',
    tournaments_registered = 0,
    total_tournaments = 0,
  } = profileData;

  const displayAvatar = formData.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${userId}`;

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <div style={styles.topBar}>
          <img src={displayAvatar} alt="Avatar" style={styles.avatarStyle} />
          <div>
            {editMode ? (
              <input
                name="username"
                value={formData.username}
                onChange={handleChange}
                style={styles.input}
                placeholder="Enter username"
              />
            ) : (
              <h1 style={styles.username}>{formData.username || 'Player123'}</h1>
            )}
          </div>
          <button onClick={() => setEditMode(!editMode)} style={styles.editButton}>
            <i className="bi bi-pencil-square"></i> {editMode ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        <div style={styles.divider} />

        <div style={styles.infoRow}>
          <label style={styles.label}><i className="bi bi-envelope"></i> Email</label>
          <p style={styles.text}>{email}</p>
        </div>

        <div style={styles.divider} />
        <div style={styles.infoRow}>
          <label style={styles.label}><i className="bi bi-people-fill"></i> Team</label>
          <p style={styles.text}>{team_name}</p>
        </div>

        <div style={styles.divider} />
        <div style={styles.infoRow}>
          <label style={styles.label}><i className="bi bi-image"></i> Avatar URL</label>
          {editMode ? (
            <input
              name="avatar_url"
              value={formData.avatar_url}
              onChange={handleChange}
              style={styles.input}
              placeholder="Enter image URL"
            />
          ) : (
            <p style={styles.text}>{formData.avatar_url || 'Default Avatar'}</p>
          )}
        </div>

        <div style={styles.divider} />
        <div style={styles.infoRow}>
          <label style={styles.label}><i className="bi bi-controller"></i> Bio</label>
          {editMode ? (
            <input
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              style={styles.input}
              placeholder="Enter bio"
            />
          ) : (
            <p style={styles.text}>{formData.bio || 'N/A'}</p>
          )}
        </div>

        <div style={styles.divider} />
        <div style={styles.infoRow}>
          <label style={styles.label}><i className="bi bi-trophy-fill"></i> Team Tournaments</label>
          <p style={styles.text}>{tournaments_registered} Joined</p>
        </div>

        <div style={styles.divider} />
        <div style={styles.infoRow}>
          <label style={styles.label}><i className="bi bi-calendar-check"></i> Total Tournaments</label>
          <p style={styles.text}>{total_tournaments}</p>
        </div>

        <div style={styles.divider} />

        <div style={styles.buttonGroup}>
          {editMode ? (
            <button onClick={handleUpdate} style={styles.neonButton}>
              <i className="bi bi-check-circle"></i> Update
            </button>
          ) : null}
          <button onClick={handleSignOut} style={styles.neonButton}>
            <i className="bi bi-box-arrow-right"></i> Logout
          </button>
        </div>
      </div>
    </div>
  );
}

const blue = '#00E6FB';

const styles = {
  wrapper: {
    backgroundColor: '#0d0d0d',
    minHeight: '100vh',
    padding: '1rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: "'Orbitron', sans-serif",
  },
  card: {
    backgroundColor: '#000',
    border: `2px solid ${blue}`,
    borderRadius: '16px',
    padding: '2rem',
    maxWidth: '500px',
    width: '100%',
    color: '#fff',
    boxShadow: `0 0 20px ${blue}66`,
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
  },
  avatarStyle: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    border: `3px solid ${blue}`,
    objectFit: 'cover',
  },
  username: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: blue,
    margin: 0,
  },
  editButton: {
    marginLeft: 'auto',
    border: `1px solid ${blue}`,
    background: 'transparent',
    color: blue,
    padding: '8px 16px',
    borderRadius: '6px',
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  divider: {
    height: '1px',
    background: blue,
    opacity: 0.2,
    margin: '16px 0',
  },
  infoRow: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '0.5rem',
  },
  label: {
    color: blue,
    fontWeight: 700,
    marginBottom: '4px',
    fontSize: '0.85rem',
  },
  text: {
    fontSize: '1rem',
  },
  buttonGroup: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    marginTop: '1.5rem',
  },
  neonButton: {
    background: 'transparent',
    border: `1px solid ${blue}`,
    borderRadius: '8px',
    padding: '12px',
    fontWeight: 600,
    color: blue,
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'all 0.3s',
    textAlign: 'center',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '6px',
  },
  input: {
    background: 'transparent',
    border: `1px solid ${blue}`,
    padding: '8px',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '1rem',
    marginBottom: '0.5rem',
  },
};

export default UserProfile;
