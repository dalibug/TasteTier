import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import UserService from '../services/userService';

const Login = () => {
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const authCheckPerformed = useRef(false);


  useEffect(() => {
    // Only check authentication once
    if (authCheckPerformed.current) {
      return;
    }

    const checkAuth = async () => {
      try {
        authCheckPerformed.current = true;
        const isAuthenticated = await UserService.isAuthenticated();
        if (isAuthenticated) {
          // Redirect to the page the user was trying to access, or to tierlists if none
          const redirectTo = location.state?.from || '/tierlists';
          navigate(redirectTo);
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
      }
    };

    checkAuth();
  }, [navigate, location]);

  const handleGoogleLogin = () => {
    setLoading(true);
    window.location.href = 'http://localhost:8083/oauth2/authorization/google';
  };

  // Handle return to home without triggering authentication checks
  const handleReturnHome = (e) => {
    e.preventDefault();
    // Clear the authentication cache to prevent immediate redirects
    UserService.clearAuthCache();
    // Navigate to home
    window.location.href = '/';
  };

  return (
    <div className="auth-background" >
      <div className="auth-container">
        <h1>Welcome Back</h1>
        <p>Sign in to continue to TasteTier</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <button 
          onClick={handleGoogleLogin} 
          className="oauth-btn"
          disabled={loading}
        >
          <span className="google-icon">G</span>
          {loading ? 'Redirecting to Google...' : 'Sign in with Google'}
        </button>
        
        <div className="auth-links">
          <p>
            Don't have an account?{' '}
            <Link to="/signup" className="auth-link">
              Sign up
            </Link>
          </p>
          <a href="/" onClick={handleReturnHome} className="auth-link">
            Return to Home
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login; 