import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import UserService from './services/userService';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Signup from './pages/Signup';
import TierLists from './pages/TierLists';
import TierListDetail from './pages/TierListDetail';
import TierListEdit from './pages/TierListEdit';
import TierListForm from './pages/TierListForm';
import CommunityTierLists from './pages/CommunityTierLists';
import WeeklyChallenges from './pages/WeeklyChallenges';
import WeeklyChallengeDetail from './pages/WeeklyChallengeDetail';
import WeeklyChallengeForm from './pages/WeeklyChallengeForm';
import ChatRooms from './pages/ChatRooms';
import ChatRoomDetail from './pages/ChatRoomDetail';
import Profile from './pages/Profile';
import DatabaseTest from './pages/DatabaseTest';
import NotFound from './pages/NotFound';
import './App.css';
import background2 from './assets/background2.png';
import background3 from './assets/background3.png';

// Background Provider Component
const BackgroundProvider = ({ children }) => {
  const location = useLocation();
  const [background, setBackground] = useState(null);
  const [prevBackground, setPrevBackground] = useState(null);
  const [transitioning, setTransitioning] = useState(false);
  
  useEffect(() => {
    // Use background3 for login and signup pages, background2 for all others
    const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
    const newBackground = isAuthPage ? background3 : background2;
    
    // If we already have a background and it's changing
    if (background && background !== newBackground) {
      setPrevBackground(background);
      setTransitioning(true);
      
      // After a short delay, complete the transition
      const timer = setTimeout(() => {
        setBackground(newBackground);
        setTransitioning(false);
      }, 300);
      
      return () => clearTimeout(timer);
    } else {
      // First load or same background
      setBackground(newBackground);
    }
  }, [location.pathname, background]);
  
  const backgroundStyle = {
    background: `url(${background}) no-repeat center center fixed`,
    backgroundSize: 'cover',
    transition: 'opacity 0.5s ease-in-out',
    minHeight: '100vh',
    width: '100%',
    position: 'relative',
  };
  
  const prevBackgroundStyle = prevBackground ? {
    background: `url(${prevBackground}) no-repeat center center fixed`,
    backgroundSize: 'cover',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: transitioning ? 1 : 0,
    transition: 'opacity 0.5s ease-in-out',
    zIndex: 0,
  } : null;
  
  return (
    <div style={backgroundStyle}>
      {prevBackground && transitioning && <div style={prevBackgroundStyle} />}
      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
        {children}
      </div>
    </div>
  );
};

// Simple Admin Page Components
const AdminCategoriesPage = () => (
  <div className="admin-page">
    <h1>Admin: Manage Categories</h1>
    <p>This page allows administrators to manage food categories.</p>
    <div className="admin-placeholder">
      <h2>Coming Soon</h2>
      <p>This feature is currently under development.</p>
    </div>
  </div>
);

const AdminChallengesPage = () => (
  <div className="admin-page">
    <h1>Admin: Manage Challenges</h1>
    <p>This page allows administrators to create and manage weekly challenges.</p>
    <div className="admin-placeholder">
      <h2>Coming Soon</h2>
      <p>This feature is currently under development.</p>
    </div>
  </div>
);

// Protected Route Component
const ProtectedRouteWrapper = ({ children }) => {
  const ProtectedRoute = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [loading, setLoading] = useState(true);
    const authCheckedRef = useRef(false);
    const location = useLocation();

    useEffect(() => {
      // Only check authentication once
      if (authCheckedRef.current) {
        return;
      }

      const checkAuth = async () => {
        try {
          setLoading(true);
          
          // Check if user just logged out
          if (sessionStorage.getItem('justLoggedOut') === 'true') {
            console.log('User just logged out, skipping auth check in protected route');
            setIsAuthenticated(false);
          } else {
            const authStatus = await UserService.isAuthenticated();
            setIsAuthenticated(authStatus);
          }
        } catch (error) {
          console.error('Authentication check failed:', error);
          setIsAuthenticated(false);
        } finally {
          setLoading(false);
          authCheckedRef.current = true;
        }
      };

      checkAuth();
    }, []);

    if (loading) {
      return <div className="loading">Checking authentication...</div>;
    }

    return isAuthenticated ? children : <Navigate to="/login" state={{ from: location.pathname }} />;
  };

  return <ProtectedRoute />;
};

// Admin Route Component
const AdminRouteWrapper = ({ children }) => {
  const AdminRoute = () => {
    const [isAdmin, setIsAdmin] = useState(null);
    const [loading, setLoading] = useState(true);
    const adminCheckRef = useRef(false);
    const location = useLocation();

    useEffect(() => {
      // Only check admin status once
      if (adminCheckRef.current) {
        return;
      }

      const checkAdmin = async () => {
        try {
          setLoading(true);
          
          // Check if user just logged out
          if (sessionStorage.getItem('justLoggedOut') === 'true') {
            console.log('User just logged out, skipping admin check');
            setIsAdmin(false);
            return;
          }
          
          const isAuthenticated = await UserService.isAuthenticated();
          if (!isAuthenticated) {
            setIsAdmin(false);
            return;
          }
          
          const response = await UserService.getCurrentUser();
          setIsAdmin(response.data && response.data.isAdmin === true);
        } catch (error) {
          console.error('Admin check failed:', error);
          setIsAdmin(false);
        } finally {
          setLoading(false);
          adminCheckRef.current = true;
        }
      };

      checkAdmin();
    }, []);

    if (loading) {
      return <div className="loading">Checking admin privileges...</div>;
    }

    return isAdmin ? children : <Navigate to="/" state={{ from: location.pathname }} />;
  };

  return <AdminRoute />;
};

function App() {
  const location = useLocation();
  
  return (
    <BackgroundProvider>
      <TransitionGroup className="routes-container">
        <CSSTransition
          key={location.key}
          classNames="page"
          timeout={400}
        >
          <Routes location={location}>
            {/* Public Routes */}
            <Route path="/" element={<Welcome />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Protected Routes */}
            <Route path="/tierlists" element={
              <ProtectedRouteWrapper>
                <TierLists />
              </ProtectedRouteWrapper>
            } />
            <Route path="/tierlists/:id" element={
              <ProtectedRouteWrapper>
                <TierListDetail />
              </ProtectedRouteWrapper>
            } />
            <Route path="/tierlists/:id/edit" element={
              <ProtectedRouteWrapper>
                <TierListEdit />
              </ProtectedRouteWrapper>
            } />
            <Route path="/tierlists/new" element={
              <ProtectedRouteWrapper>
                <TierListForm />
              </ProtectedRouteWrapper>
            } />
            <Route path="/community-tierlists" element={
              <ProtectedRouteWrapper>
                <CommunityTierLists />
              </ProtectedRouteWrapper>
            } />
            <Route path="/weekly-challenges" element={
              <ProtectedRouteWrapper>
                <WeeklyChallenges />
              </ProtectedRouteWrapper>
            } />
            <Route path="/weekly-challenges/:id" element={
              <ProtectedRouteWrapper>
                <WeeklyChallengeDetail />
              </ProtectedRouteWrapper>
            } />
            <Route path="/weekly-challenges/new" element={
              <ProtectedRouteWrapper>
                <WeeklyChallengeForm />
              </ProtectedRouteWrapper>
            } />
            <Route path="/chat-rooms" element={
              <ProtectedRouteWrapper>
                <ChatRooms />
              </ProtectedRouteWrapper>
            } />
            <Route path="/chat-rooms/:id" element={
              <ProtectedRouteWrapper>
                <ChatRoomDetail />
              </ProtectedRouteWrapper>
            } />
            <Route path="/profile" element={
              <ProtectedRouteWrapper>
                <Profile />
              </ProtectedRouteWrapper>
            } />
            
            {/* Admin Routes */}
            <Route path="/database" element={
              <AdminRouteWrapper>
                <DatabaseTest />
              </AdminRouteWrapper>
            } />
            <Route path="/admin/categories" element={
              <AdminRouteWrapper>
                <AdminCategoriesPage />
              </AdminRouteWrapper>
            } />
            <Route path="/admin/challenges" element={
              <AdminRouteWrapper>
                <AdminChallengesPage />
              </AdminRouteWrapper>
            } />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </CSSTransition>
      </TransitionGroup>
    </BackgroundProvider>
  );
}

export default App;
