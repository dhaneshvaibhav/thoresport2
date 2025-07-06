import React from 'react';

const Leaderboard = () => {
  return (
    <div style={containerStyle}>
      {/* Glowing Logo */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={headingStyle}>LEADERBOARD</h1>
      </div>

      <div style={contentStyle}>
        <h2 style={subHeadingStyle}>🚧 COMING SOON 🚧</h2>
        <p style={textStyle}>Wait for version 2.0</p>
        <p style={descriptionStyle}>
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