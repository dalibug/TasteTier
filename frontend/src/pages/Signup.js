import React from 'react';
import { Link } from 'react-router-dom';
import backgroundImage from '../assets/background2.png';

const Signup = () => {
  const backgroundStyle = {
    background: `url(${backgroundImage}) no-repeat center center fixed`,
    backgroundSize: 'cover',
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add signup logic here
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
        <h1 className="title2">Sign Up</h1>
        <form className="auth-form" onSubmit={handleSubmit}>
          <input type="text" placeholder="Full Name" required />
          <input type="email" placeholder="Email" required />
          <input type="password" placeholder="Password" required />
          <button type="submit" className="form-btn">Sign Up</button>
        </form>
        <Link to="/login" className="auth-link">
          Already have an account? Log in
        </Link>
      </main>
    </div>
  );
};

export default Signup; 