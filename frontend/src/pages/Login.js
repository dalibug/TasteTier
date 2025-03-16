import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import backgroundImage from '../assets/background2.png';
import googleLogo from '../assets/google-logo.svg';

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
        <Link to="/" className="auth-link">
          <button className="form-btn">Home</button>
        </Link>
      </main>
    </div>
  );
};

export default Login; 