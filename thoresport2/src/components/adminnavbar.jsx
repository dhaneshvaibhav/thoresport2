import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function AdminNavbar() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('orgToken');

  const handleLogout = () => {
    localStorage.removeItem('orgToken');
    navigate('/admin/auth');
  };

  return (
    <>
      <nav style={styles.nav} className="admin-navbar">
        <div style={styles.logo}>thor admin</div>
        <div style={styles.links}>
          {!isLoggedIn ? (
            <Link to="/admin/auth" style={styles.link}>Login</Link>
          ) : (
            <>
              <Link to="/admin/dashboard" style={styles.link}>Dashboard</Link>
              <Link to="/admin/tournament" style={styles.link}>Add Tournament</Link>
              <button
                onClick={handleLogout}
                style={styles.logoutBtn}
                onMouseOver={(e) => (e.target.style.transform = 'scale(1.05)')}
                onMouseOut={(e) => (e.target.style.transform = 'scale(1)')}
              >
                Logout
              </button>
            </>
          )}
        </div>
      </nav>

      <style>
        {`
          @media (max-width: 600px) {
            .admin-navbar {
              flex-direction: column;
              gap: 0.5rem;
              padding: 1rem;
              position: fixed;
              bottom: 0;
              left: 0;
              right: 0;
              z-index: 999;
              margin: 0;
              border-radius: 0;
              border-top-left-radius: 12px;
              border-top-right-radius: 12px;
              backdrop-filter: blur(6px);
              border: 2px solid #00ffe1;
              box-shadow: 0 -4px 12px #00ffe1;
            }

            .admin-navbar a,
            .admin-navbar button {
              display: block;
              width: 100%;
              text-align: center;
              margin: 0.3rem 0;
            }

            .admin-navbar div {
              width: 100%;
              text-align: center;
            }
          }
        `}
      </style>
    </>
  );
}

const styles = {
  nav: {
    background: '#0a0a0a',
    color: '#00ffe1',
    padding: '1rem 2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontFamily: 'monospace',
    border: '2px solid #00ffe1',
    borderRadius: '10px',
    margin: '1rem',
    boxShadow: '0 0 12px #00ffe1',
  },
  logo: {
    fontWeight: 'bold',
    fontSize: 24,
    letterSpacing: '1px',
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  link: {
    color: '#00ffe1',
    textDecoration: 'none',
    fontWeight: 'bold',
  },
  logoutBtn: {
    background: '#ff0055',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '8px 16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 0 10px #ff0055',
    transition: 'transform 0.2s',
  },
};

export default AdminNavbar;
