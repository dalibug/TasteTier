import React from 'react';

const Logo = ({ size = 50 }) => {
  const logoStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: `${size}px`,
    height: `${size}px`,
    backgroundColor: '#4285F4',
    borderRadius: '50%',
    color: 'white',
    fontFamily: 'Lora, serif',
    fontWeight: 'bold',
    fontSize: `${size * 0.5}px`,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
    margin: '0 auto',
    position: 'relative',
  };

  const innerCircleStyle = {
    position: 'absolute',
    width: `${size * 0.7}px`,
    height: `${size * 0.7}px`,
    borderRadius: '50%',
    border: '2px solid white',
  };

  const letterStyle = {
    zIndex: 1,
  };

  return (
    <div style={logoStyle}>
      <div style={innerCircleStyle}></div>
      <span style={letterStyle}>TT</span>
    </div>
  );
};

export default Logo; 