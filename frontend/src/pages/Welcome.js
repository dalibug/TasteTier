import React from 'react';
import { Link } from 'react-router-dom';
import backgroundImage from '../assets/background.png';
import '../styles/Welcome.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignInAlt } from '@fortawesome/free-solid-svg-icons';

const Welcome = () => {
  const backgroundStyle = {
    background: `url(${backgroundImage}) no-repeat center center fixed`,
    backgroundSize: 'cover',
  };

  return (
    <div className="welcome-container" style={backgroundStyle}>
      <header className="welcome-header">
        <div className="welcome-left-buttons">
          {/* Settings button removed */}
        </div>
        <div className="welcome-auth-buttons">
          <Link to="/login">
            <button className="welcome-btn welcome-btn-login">
              <FontAwesomeIcon icon={faSignInAlt} />
            </button>
          </Link>
        </div>
      </header>
      <main className="welcome-main">
        <h1 className="welcome-title welcome-title-main">Welcome</h1>
        <h1 className="welcome-title welcome-title-sub">to</h1>
        <h1 className="welcome-title welcome-title-main">Taste-Tiers</h1>
      </main>
    </div>
  );
};

export default Welcome; 