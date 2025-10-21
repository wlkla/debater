import React from 'react';

function PlayerAvatar({ health, maxHealth = 30 }) {
  const fillHeight = (health / maxHealth) * 100;
  const fillColor = fillHeight > 50 ? '#52c41a' : fillHeight > 20 ? '#faad14' : '#f5222d';

  return (
    <div style={{ position: 'relative', width: '50px', height: '50px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #4096ff' }}>
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: `${fillHeight}%`,
        backgroundColor: fillColor,
        transition: 'height 0.3s ease-in-out',
      }} />
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: '24px',
        fontWeight: 'bold',
        color: 'white',
        zIndex: 1,
      }}>
        P
      </div>
    </div>
  );
}

export default PlayerAvatar;