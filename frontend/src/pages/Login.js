import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import backgroundImage from '../assets/background2.png';
import googleLogo from '../assets/google-logo.svg';

const Login = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminCredentials, setAdminCredentials] = useState({ username: '', password: '' });
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

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await fetch('http://localhost:8083/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(adminCredentials),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('isAdmin', 'true');
        setShowAdminModal(false);
        navigate('/');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Failed to connect to server');
    }
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
        <div className="auth-link">
          <button onClick={() => setShowAdminModal(true)} className="form-btn">
            Admin Login
          </button>
        </div>

        {showAdminModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Admin Login</h2>
              <form onSubmit={handleAdminLogin}>
                <input
                  type="text"
                  placeholder="Username"
                  value={adminCredentials.username}
                  onChange={(e) => setAdminCredentials({...adminCredentials, username: e.target.value})}
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={adminCredentials.password}
                  onChange={(e) => setAdminCredentials({...adminCredentials, password: e.target.value})}
                />
                {error && <div className="error-message">{error}</div>}
                <div className="modal-buttons">
                  <button type="submit" className="form-btn">Login</button>
                  <button type="button" className="form-btn" onClick={() => setShowAdminModal(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Login; 