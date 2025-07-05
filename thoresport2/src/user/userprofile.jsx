import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

function UserProfile() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('Auth error:', authError);
        setLoading(false);
        return;
      }
      console.log(user.id);
      setUserId(user.id);

      const { data, error } = await supabase.rpc('get_user_profile_summary', {
        input_user_id: user.id,
      });
      console.log(data);
      if (error) {
        console.error('Error fetching profile summary:', error);
      } else {
        setProfileData(data[0]); // data is an array with one row
      }

      setLoading(false);
    };

    fetchProfile();
  }, []);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) navigate('/signin');
  };

  if (loading) return <div style={{ color: '#fff', textAlign: 'center' }}>Loading profile...</div>;
  if (!profileData) return <div style={{ color: '#fff', textAlign: 'center' }}>Profile not found.</div>;

  const {
    email,
    username = 'Player123',
    avatar_url,
    bio,
    team_name = 'No Team',
    tournaments_registered = 0,
    total_tournaments = 0,
  } = profileData;

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <div style={styles.topBar}>
          <img src={avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${userId}`} alt="Avatar" style={styles.avatarStyle} />
          <div>
            <h1 style={styles.username}>{username}</h1>
          </div>
          <button style={styles.editButton}>
            <i className="bi bi-pencil-square"></i> Edit Profile
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
          <label style={styles.label}><i className="bi bi-controller"></i> Bio</label>
          <p style={styles.text}>{bio || 'N/A'}</p>
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
          <button style={styles.neonButton}><i className="bi bi-journal-text"></i> History</button>
          <button style={styles.neonButton}><i className="bi bi-award-fill"></i> Achievements</button>
          <button style={styles.neonButton}><i className="bi bi-gear-fill"></i> Settings</button>
          <button onClick={handleSignOut} style={styles.neonButton}><i className="bi bi-box-arrow-right"></i> Logout</button>
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
    marginTop: '4rem',
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
};

export default UserProfile;
