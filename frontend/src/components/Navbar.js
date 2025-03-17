import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import UserService from '../services/userService';
import Logo from './Logo';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  // eslint-disable-next-line no-unused-vars
  const navigate = useNavigate();

  // Use a ref to track if we've already checked auth on this page
  const authCheckedRef = React.useRef(false);

  // Skip auth check on login and signup pages
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    // Reset auth check when route changes to a non-auth page
    if (!isAuthPage && location.pathname !== '/') {
      authCheckedRef.current = false;
    }

    const fetchUser = async () => {
      // Skip auth check on login/signup pages or if already checked
      if (isAuthPage || authCheckedRef.current) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const isAuthenticated = await UserService.isAuthenticated();
        if (isAuthenticated) {
          const response = await UserService.getCurrentUser();
          setUser(response.data);
        } else {
          setUser(null);
        }
        authCheckedRef.current = true;
      } catch (error) {
        console.error('Error fetching user:', error);
        setUser(null);
        authCheckedRef.current = true;
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [location.pathname, isAuthPage]);

  const handleLogout = () => {
    // Set a flag in sessionStorage to indicate we just logged out
    sessionStorage.setItem('justLoggedOut', 'true');
    
    // Clear auth cache
    UserService.clearAuthCache();
    
    // Clear any cookies by setting them to expire in the past
    document.cookie.split(";").forEach(function(c) {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    
    // Reset user state
    setUser(null);
    authCheckedRef.current = false;
    
    // Redirect to home page
    window.location.href = '/';
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  // Check if user is an admin
  const isAdmin = user && user.isAdmin;

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <Logo size={40} />
          <h1>TasteTier</h1>
        </Link>

        <div className="navbar-links">
          <Link to="/tierlists" className={`navbar-link ${isActive('/tierlists')}`}>
            My Tier Lists
          </Link>
          <Link to="/community-tierlists" className={`navbar-link ${isActive('/community-tierlists')}`}>
            Community
          </Link>
          <Link to="/weekly-challenges" className={`navbar-link ${isActive('/weekly-challenges')}`}>
            Weekly Challenges
          </Link>
          {user && (
            <Link to="/chat-rooms" className={`navbar-link ${isActive('/chat-rooms')}`}>
              Chat Rooms
            </Link>
          )}
          {isAdmin && (
            <>
              <div className="admin-links">
                <Link to="/database" className={`navbar-link admin-link ${isActive('/database')}`}>
                  Database
                </Link>
                <Link to="/admin/categories" className={`navbar-link admin-link ${isActive('/admin/categories')}`}>
                  Manage Categories
                </Link>
                <Link to="/admin/challenges" className={`navbar-link admin-link ${isActive('/admin/challenges')}`}>
                  Manage Challenges
                </Link>
              </div>
            </>
          )}
        </div>

        <div className="navbar-user">
          {loading ? (
            <div className="loading-indicator">Loading...</div>
          ) : user ? (
            <>
              <div className="navbar-user-info">
                <span className="navbar-username">
                  {user.username || user.name || 'User'}
                  {isAdmin && <span className="admin-badge"> (Admin)</span>}
                </span>
                <div className="navbar-user-actions">
                  <Link to="/profile">Profile</Link> | <button onClick={handleLogout}>Logout</button>
                </div>
              </div>
              {(user.pictureUrl || user.picture) && (
                <img 
                  src={user.pictureUrl || user.picture} 
                  alt={user.username || user.name || 'User'} 
                  className="navbar-user-avatar" 
                  style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                />
              )}
            </>
          ) : (
            <div className="navbar-auth-links">
              <Link to="/login" className="navbar-link">Login</Link>
              <Link to="/signup" className="navbar-link">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 