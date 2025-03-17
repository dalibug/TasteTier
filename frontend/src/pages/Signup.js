import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import UserService from '../services/userService';

const Signup = () => {
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

  const handleGoogleSignup = () => {
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
        <h1>Join TasteTier</h1>
        <p>Create an account to start making tier lists</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <button 
          onClick={handleGoogleSignup} 
          className="oauth-btn"
          disabled={loading}
        >
          <span className="google-icon">G</span>
          {loading ? 'Redirecting to Google...' : 'Sign up with Google'}
        </button>
        
        <div className="auth-links">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Sign in
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

export default Signup; 