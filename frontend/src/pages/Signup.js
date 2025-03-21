import React from 'react';
import { Link } from 'react-router-dom';
import backgroundImage from '../assets/background2.png';
import googleLogo from '../assets/google-logo.svg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';

const Signup = () => {
  const backgroundStyle = {
    background: `url(${backgroundImage}) no-repeat center center fixed`,
    backgroundSize: 'cover',
  };

  const handleGoogleSignup = () => {
    // Clear any existing session data before signup
    localStorage.clear();
    sessionStorage.clear();
    
    // Add prompt=select_account to force Google account selection and redirect_uri parameter
    window.location.href = 'http://localhost:8083/oauth2/authorization/google?prompt=select_account&redirect_uri=http://localhost:3000/tierlists';
  };

  return (
    <div className="auth-background" style={backgroundStyle}>
      <main className="auth-container">
        <h1 className="title2">Sign Up</h1>
        <button onClick={handleGoogleSignup} className="oauth-btn">
          <img src={googleLogo} alt="Google logo" />
          Sign up with Google
        </button>
        <Link to="/login" className="auth-link signup-link">
          Already have an account? Log in
        </Link>
        <div className="home-button-container" style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
          <Link to="/" style={{ width: '100%', textDecoration: 'none' }}>
            <button className="form-btn">
              <FontAwesomeIcon icon={faHome} style={{ marginRight: '8px' }} />
              Home
            </button>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Signup; 