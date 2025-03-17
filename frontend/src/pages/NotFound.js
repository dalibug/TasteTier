import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const NotFound = () => {

  return (
    <div className="not-found-page" >
      <Navbar />
      <div className="content-wrapper">
        <div className="not-found-container">
          <h1 className="not-found-title">404</h1>
          <h2 className="not-found-subtitle">Page Not Found</h2>
          <p className="not-found-message">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="not-found-actions">
            <Link to="/" className="home-btn">
              Go to Home
            </Link>
            <Link to="/tierlists" className="tierlists-btn">
              My Tier Lists
            </Link>
            <Link to="/weekly-challenges" className="challenges-btn">
              Weekly Challenges
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound; 