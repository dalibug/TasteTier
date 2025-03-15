import React from 'react';
import { Link } from 'react-router-dom';
import backgroundImage from '../assets/background2.png';
import googleLogo from '../assets/google-logo.svg';

const Login = () => {
  const backgroundStyle = {
    background: `url(${backgroundImage}) no-repeat center center fixed`,
    backgroundSize: 'cover',
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:8083/oauth2/authorization/google';
  };

  return (
    <div className="auth-background" style={backgroundStyle}>
      <header>
        <div className="auth-buttons">
          <Link to="/">
            <button className="auth-btn">⬅</button>
          </Link>
        </div>
      </header>
      <main className="auth-container">
        <h1 className="title2">Login</h1>
        <button onClick={handleGoogleLogin} className="google-login-button">
          <img src={googleLogo} alt="Google logo" />
          Sign in with Google
        </button>
        <Link to="/signup" className="auth-link">
          Don't have an account? Sign up
        </Link>
      </main>
    </div>
  );
};

export default Login; 