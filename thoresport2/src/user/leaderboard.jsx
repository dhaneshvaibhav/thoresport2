import React from 'react';

const Leaderboard = () => {
  return (
    <>
      <style>{`
        @media (max-width: 600px) {
          .lb-container {
            padding: 1rem !important;
            max-width: 98vw !important;
            width: 98vw !important;
            margin: 2rem auto !important;
            border-radius: 8px !important;
            font-size: 0.95rem !important;
          }
          .lb-heading {
            font-size: 2rem !important;
          }
          .lb-content {
            padding: 1rem !important;
            border-radius: 6px !important;
            margin-top: 1rem !important;
          }
          .lb-subheading {
            font-size: 1.2rem !important;
          }
          .lb-text {
            font-size: 1rem !important;
          }
          .lb-description {
            font-size: 0.95rem !important;
          }
        }
      `}</style>
      <div style={containerStyle} className="lb-container">
        {/* Glowing Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={headingStyle} className="lb-heading">LEADERBOARD</h1>
        </div>

        <div style={contentStyle} className="lb-content">
          <h2 style={subHeadingStyle} className="lb-subheading">🚧 COMING SOON 🚧</h2>
          <p style={textStyle} className="lb-text">Wait for version 2.0</p>
          <p style={descriptionStyle} className="lb-description">
            We're working hard to bring you the most comprehensive leaderboard system.
            Stay tuned for exciting updates!
          </p>
        </div>

        {/* Orbitron Font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </div>
    </>
  );
};

// 🎨 Inline Styles
const containerStyle = {
  padding: '2rem',
  maxWidth: '800px',
  width: '90%',
  margin: '4rem auto',
  fontFamily: "'Orbitron', sans-serif",
  border: '2px solid #0DCAF0',
  borderRadius: '12px',
  boxShadow: '0 0 25px #0DCAF080',
  backgroundColor: '#000000',
  color: '#ffffff',
  textAlign: 'center',
  marginTop: '10rem',
};

const headingStyle = {
  fontSize: '3rem',
  color: '#0DCAF0',
  marginBottom: '1rem',
  textShadow: '0 0 10px #0DCAF0',
};

const contentStyle = {
  padding: '2rem',
  border: '1px solid #0DCAF0',
  borderRadius: '8px',
  backgroundColor: '#111111',
  marginTop: '2rem',
};

const subHeadingStyle = {
  fontSize: '2rem',
  color: '#ffa500',
  marginBottom: '1rem',
};

const textStyle = {
  fontSize: '1.2rem',
  color: '#0DCAF0',
  marginBottom: '1rem',
};

const descriptionStyle = {
  fontSize: '1rem',
  color: '#aaaaaa',
  lineHeight: '1.6',
};

export default Leaderboard;