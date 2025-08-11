import React from 'react';
import { FaDiscord, FaInstagram, FaWhatsapp, FaYoutube } from 'react-icons/fa';
import logo from '../assets/logo.png';

function Footer() {
  return (
    <footer style={footerStyle}>
      <style>{`
        /* --- Mobile-specific CSS for Footer (up to 768px) --- */
        @media (max-width: 768px) {
          .footerContainer {
            flex-direction: column; /* This stacks the logo and link sections */
            gap: 2rem;
            padding: 0 1.5rem;
            text-align: center;
          }

          .logoSection, .linkSection {
            min-width: unset;
            text-align: center;
            width: 100%;
            margin-bottom: 2rem; /* Add space between stacked sections */
          }
          
          .descStyle, .devCreditStyle {
            margin: 0 auto;
            max-width: 90%;
          }

          .linkSection {
            display: flex; /* Make the right section a flex container */
            flex-direction: column; /* Stack social icons and contact info */
            justify-content: center;
            align-items: center;
            gap: 2rem;
          }

          .iconRow {
            justify-content: center;
            margin-top: 1rem;
          }

          .column {
            min-width: unset;
            width: 100%;
            text-align: center; /* Center the contact column text */
          }
        }
      `}</style>
      <div style={footerContainer} className="footerContainer">
        {/* Left Section */}
        <div style={logoSection} className="logoSection">
          <img src={logo} alt="ThorEsports Logo" style={logoStyle} />
          <p style={descStyle} className="descStyle">
            ThorEsports — Your gateway to elite tournaments and top-tier gaming action.
          </p>
          {/* Developer credit */}
          <p style={devCreditStyle} className="devCreditStyle">
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
        <div style={linkSection} className="linkSection">
          <div style={column} className="column">
            {/* Social Icons */}
            <div style={iconRow} className="iconRow">
              <a href="https://discord.gg/Nmv9fNRpHU" target="_blank" rel="noopener noreferrer" style={iconLinkStyle}>
                <FaDiscord />
              </a>
              <a href="https://www.instagram.com/_thor_esports_?igsh=cTVrb2NsbjN2NzN2" target="_blank" rel="noopener noreferrer" style={iconLinkStyle}>
                <FaInstagram />
              </a>
              <a href="https://www.youtube.com/embed/$8" target="_blank" rel="noopener noreferrer" style={iconLinkStyle}>
                <FaYoutube />
              </a>
            </div>
          </div>

          <div style={column} className="column">
            <h4 style={columnTitle}>Contact</h4>
            <p style={linkStyle}>thoresportsofficial@gmail.com</p>
            <p style={linkStyle}>India</p>
            <p style={linkStyle}>For Any collabration , Contact to given Email</p>
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
  color: 'yellow',
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
