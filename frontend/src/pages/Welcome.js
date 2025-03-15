import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import backgroundImage from '../assets/background.png';
import '../App.css';

const Welcome = () => {
  const navigate = useNavigate();
  const backgroundStyle = {
    background: `url(${backgroundImage}) no-repeat center center fixed`,
    backgroundSize: 'cover',
    minHeight: '100vh',
    width: '100%',
    position: 'relative'
  };

  return (
    <div className="auth-background" style={backgroundStyle}>
      <header>
        <div className="left-buttons">
          <button 
            className="auth-btn" 
            onClick={() => navigate('/database-test')}
          >
            Database Testing
          </button>
        </div>
        <div className="auth-buttons">
          <Link to="/login">
            <button className="auth-btn">Log In</button>
          </Link>
          <Link to="/tierlists">
            <button className="auth-btn">Tier Lists</button>
          </Link>
        </div>
      </header>
      <main>
        <h1 className="title">Welcome</h1>
        <h1 className="title">to</h1>
        <h1 className="title">Taste-Tiers</h1>
      </main>
    </div>
  );
};

export default Welcome; 