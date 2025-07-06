import React, { useEffect, useState } from "react";
import { supabase } from "../supabase";
import logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [profileLetter, setProfileLetter] = useState('U');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const uname = user.user_metadata?.username;
        setProfileLetter((uname?.[0] || user.email?.[0] || 'U').toUpperCase());
      } else {
        setProfileLetter('U');
      }
      setLoading(false);
    };

    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        const uname = session.user.user_metadata?.username;
        setProfileLetter((uname?.[0] || session.user.email?.[0] || 'U').toUpperCase());
      } else {
        setProfileLetter('U');
      }
      setLoading(false);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (loading) return null;

  const handleSignIn = () => navigate("/signin");
  const handleSignUp = () => navigate("/signup");
  const handleProfile = () => navigate("/profile");
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/signin");
  };

  const avatarUrl =
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.profile_image ||
    "https://ui-avatars.com/api/?name=User&background=0DCAF0&color=000";

  return (
    <>
      <nav className="custom-navbar">
        {/* Logo and Brand - hidden on mobile */}
        <div className="navbar-left">
          <img src={logo} alt="ThorEsports" className="logo" />
          <span className="brand">ThorEsports</span>
        </div>

        {/* Navigation */}
        <div className="navbar-right">
          {user ? (
            // After Login Navigation
            <>
              <a href="/" style={linkStyle}>
                <i className="bi bi-house-fill nav-icon"></i>
                <span className="nav-label">HOME</span>
              </a>
              <a href="/tournament" style={linkStyle}>
                <i className="bi bi-trophy-fill nav-icon"></i>
                <span className="nav-label">TOURNAMENT</span>
              </a>
              <a href="/leaderboard" style={linkStyle}>
                <i className="bi bi-bar-chart-line-fill nav-icon"></i>
                <span className="nav-label">LEADERBOARD</span>
              </a>
             
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {user?.user_metadata?.avatar_url || user?.user_metadata?.profile_image ? (
                  <img
                    src={avatarUrl}
                    alt="Profile"
                    className="avatar"
                    onClick={handleProfile}
                    title="Go to Profile"
                  />
                ) : (
                  <div
                    className="avatar"
                    onClick={handleProfile}
                    title="Go to Profile"
                    style={{
                      background: '#0DCAF0',
                      color: '#000',
                      width: 42,
                      height: 42,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: 22,
                      cursor: 'pointer',
                      border: '2px solid #0DCAF0',
                      userSelect: 'none'
                    }}
                  >
                    {profileLetter}
                  </div>
                )}
              </div>
            </>
          ) : (
            // Before Login Navigation
            <>
              <a href="/" style={linkStyle}>
                <i className="bi bi-house-fill nav-icon"></i>
                <span className="nav-label">HOME</span>
              </a>
              <button style={buttonStyle} onClick={handleSignIn}>
                Sign In
              </button>
              <button 
                onClick={handleSignUp} 
                style={{
                  ...buttonStyle,
                  backgroundColor: 'transparent',
                  border: '1px solid #0DCAF0',
                  color: '#0DCAF0'
                }}
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </nav>

      {/* CSS */}
      <style>{`
        .custom-navbar {
          background-color: #0d0d0d;
          padding: 0.5rem 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          z-index: 1000;
        }

        .navbar-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .logo {
          width: 90px;
          height: 50px;
          object-fit: contain;
          filter: drop-shadow(0 0 8px #0DCAF0);
        }

        .brand {
          color: #C2F5FF;
          font-size: 28px;
          font-family: 'Orbitron', sans-serif;
          white-space: nowrap;
        }

        .navbar-right {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .avatar {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          border: 2px solid #0DCAF0;
          cursor: pointer;
          object-fit: cover;
          transition: transform 0.2s ease;
        }

        .avatar:hover {
          transform: scale(1.1);
        }

        .nav-icon {
          display: none;
        }

        /* Mobile styles */
        @media (max-width: 768px) {
          .custom-navbar {
            flex-direction: column;
            bottom: 0;
            top: auto;
            border-top: 2px solid #0DCAF0;
            padding: 0.6rem;
          }

          .navbar-left {
            display: none;
          }

          .navbar-right {
            justify-content: center;
            width: 100%;
            margin: 0.4rem 0;
            gap: 1rem;
          }

          .nav-icon {
            display: inline;
            font-size: 20px;
          }

          .nav-label {
            display: none;
          }
        }
      `}</style>
    </>
  );
};

const linkStyle = {
  color: "#ffffff",
  textDecoration: "none",
  fontWeight: "500",
  fontSize: "16px",
  padding: "0.5rem 0.75rem",
  fontFamily: "Orbitron, sans-serif",
  display: "flex",
  alignItems: "center",
  gap: "0.4rem",
};

const buttonStyle = {
  backgroundColor: "#0DCAF0",
  color: "#000",
  borderRadius: "6px",
  padding: "0.5rem 1rem",
  border: "none",
  fontWeight: "600",
  fontFamily: "Orbitron, sans-serif",
  cursor: "pointer",
};

export default Navbar;
