import React from 'react';
import { FaDiscord, FaInstagram, FaWhatsapp, FaYoutube } from 'react-icons/fa';
import logo from '../assets/logo.png';

function Footer() {
  return (
    <footer style={footerStyle}>
      <div style={footerContainer}>
        {/* Left Section */}
        <div style={logoSection}>
          <img src={logo} alt="ThorEsports Logo" style={logoStyle} />
          <p style={descStyle}>
            ThorEsports — Your gateway to elite tournaments and top-tier gaming action.
          </p>
          {/* Developer credit */}
            <p style={devCreditStyle}>
              Developed by{' '}
              <a
                href="https://Adjunct.in"
                target="_blank"
                rel="noopener noreferrer"
                style={adjunctLinkStyle}
              >
                Adjunct
              </a>
            </p>
        </div>

        {/* Right Section */}
        <div style={linkSection}>
          <div style={column}>
            <h4 style={columnTitle}>Quick Links</h4>
            <a href="/" style={linkStyle}>Home</a>
            <a href="/tournament" style={linkStyle}>Tournaments</a>
            <a href="/leaderboard" style={linkStyle}>Leaderboard</a>
            <a href="/signup" style={linkStyle}>Sign Up</a>

            

            {/* Social Icons */}
            <div style={iconRow}>
              <a href="https://discord.com" target="_blank" rel="noopener noreferrer" style={iconLinkStyle}>
                <FaDiscord />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={iconLinkStyle}>
                <FaInstagram />
              </a>
              <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" style={iconLinkStyle}>
                <FaWhatsapp />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" style={iconLinkStyle}>
                <FaYoutube />
              </a>
            </div>
          </div>

          <div style={column}>
            <h4 style={columnTitle}>Contact</h4>
            <p style={linkStyle}>support@thoresports.gg</p>
            <p style={linkStyle}>+91 98765 43210</p>
            <p style={linkStyle}>India</p>
          </div>
        </div>
      </div>

      <div style={bottomBar}>
        <p style={{ fontSize: '0.9rem' }}>© 2025 ThorEsports. All rights reserved.</p>
      </div>
    </footer>
  );
}

// 🎨 Styling
const footerStyle = {
  backgroundColor: '#000000',
  color: '#ffffff',
  paddingTop: '3rem',
  paddingBottom: '1rem',
  borderTop: '2px solid #0DCAF0',
  fontFamily: "'Orbitron', sans-serif",
};

const footerContainer = {
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '0 2rem',
};

const logoSection = {
  flex: '1',
  minWidth: '250px',
};

const logoStyle = {
  width: '60px',
  marginBottom: '1rem',
};

const descStyle = {
  fontSize: '0.95rem',
  color: '#aaa',
  lineHeight: '1.5',
};

const devCreditStyle = {
  fontSize: '0.85rem',
  color: '#aaa',
  marginTop: '1rem',
};

const adjunctLinkStyle = {
  color: '#0DCAF0',
  textDecoration: 'none',
  fontWeight: '600',
};

const iconRow = {
  display: 'flex',
  gap: '12px',
  marginTop: '0.5rem',
  fontSize: '1.4rem',
};

const iconLinkStyle = {
  color: '#ffffff',
  transition: 'all 0.3s ease',
  textDecoration: 'none',
};

const linkSection = {
  display: 'flex',
  gap: '4rem',
  flex: '2',
  justifyContent: 'flex-end',
  flexWrap: 'wrap',
};

const column = {
  minWidth: '150px',
};

const columnTitle = {
  fontSize: '1.1rem',
  marginBottom: '0.75rem',
  color: '#0DCAF0',
};

const linkStyle = {
  color: '#ffffff',
  textDecoration: 'none',
  display: 'block',
  marginBottom: '0.5rem',
  fontSize: '0.95rem',
};

const bottomBar = {
  textAlign: 'center',
  borderTop: '1px solid #222',
  marginTop: '2rem',
  paddingTop: '1rem',
  color: '#999',
};

export default Footer;
