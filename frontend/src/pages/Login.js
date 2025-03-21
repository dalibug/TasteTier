import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import backgroundImage from '../assets/background2.png';
import googleLogo from '../assets/google-logo.svg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';

const Login = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const backgroundStyle = {
    background: `url(${backgroundImage}) no-repeat center center fixed`,
    backgroundSize: 'cover',
  };

  useEffect(() => {
    // Check if we're returning from a logout
    const params = new URLSearchParams(location.search);
    if (params.get('logout') === 'true') {
      // Clear any remaining session data
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear Google OAuth session
      const googleLogoutUrl = 'https://accounts.google.com/logout';
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = googleLogoutUrl;
      document.body.appendChild(iframe);
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }
  }, [location]);

  const handleGoogleLogin = () => {
    // Clear any existing session data before login
    localStorage.clear();
    sessionStorage.clear();
    
    // Add prompt=select_account to force Google account selection and redirect_uri parameter
    window.location.href = 'http://localhost:8083/oauth2/authorization/google?prompt=select_account&redirect_uri=http://localhost:3000/tierlists';
  };

  return (
    <div className="auth-background" style={backgroundStyle}>
      <main className="auth-container">
        <h1 className="title2">Login</h1>
        <button onClick={handleGoogleLogin} className="oauth-btn">
          <img src={googleLogo} alt="Google logo" />
          Sign in with Google
        </button>
        <Link to="/signup" className="auth-link signup-link">
          Don't have an account? Sign up
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

export default Login; 