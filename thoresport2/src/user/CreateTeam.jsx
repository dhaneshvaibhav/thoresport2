import React, { useState } from 'react';

const CreateTeam = () => {
  const [show, setShow] = useState(true);
  if (!show) return null;

  return (
    <div
      style={{
        backgroundColor: '#000',
        color: '#00ffff',
        fontFamily: 'Orbitron, sans-serif',
        padding: '25px',
        width: '320px',
        borderRadius: '15px',
        border: '2px solid #00ffff', // Only one glowing border
        position: 'relative',
      }}
    >
      {/* Close Button */}
      <button
        onClick={() => setShow(false)}
        style={{
          position: 'absolute',
          top: '10px',
          right: '12px',
          background: 'transparent',
          border: 'none',
          color: '#00ffff',
          fontSize: '18px',
          cursor: 'pointer',
        }}
      >
        &times;
      </button>

      <h2
        style={{
          textAlign: 'center',
          fontSize: '20px',
          marginBottom: '20px',
        }}
      >
        Create a New Team
      </h2>

      <label style={{ fontSize: '13px' }}>Team Name*</label>
      <input
        type="text"
        style={{
          width: '100%',
          padding: '8px',
          marginTop: '6px',
          marginBottom: '15px',
          borderRadius: '6px',
          border: '1px solid #00ffff',
          backgroundColor: '#000',
          color: '#00ffff',
          outline: 'none',
        }}
      />

      <label style={{ fontSize: '13px' }}>Team Logo</label>
      <input
        type="file"
        style={{
          width: '100%',
          padding: '6px',
          marginTop: '6px',
          marginBottom: '15px',
          borderRadius: '6px',
          border: '1px solid #00ffff',
          backgroundColor: '#000',
          color: '#00ffff',
          outline: 'none',
        }}
      />

      <label style={{ fontSize: '13px' }}>Add Team Member (by email)</label>
      <div style={{ display: 'flex', marginTop: '6px', marginBottom: '20px' }}>
        <input
          type="email"
          placeholder="Enter email"
          style={{
            flex: 1,
            padding: '8px',
            backgroundColor: '#000',
            color: '#00ffff',
            border: '1px solid #00ffff',
            borderRadius: '6px 0 0 6px',
            outline: 'none',
            fontSize: '13px',
          }}
        />
        <button
          style={{
            padding: '8px 14px',
            backgroundColor: '#00ffff',
            color: '#000',
            border: 'none',
            borderRadius: '0 6px 6px 0',
            fontWeight: 'bold',
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          Add
        </button>
      </div>

      <button
        style={{
          width: '100%',
          padding: '10px',
          backgroundColor: '#00ffff',
          color: '#000',
          fontWeight: 'bold',
          fontSize: '14px',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
        }}
      >
        Create Team
      </button>
    </div>
  );
};

export default CreateTeam;
