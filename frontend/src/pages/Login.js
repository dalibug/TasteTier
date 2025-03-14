import React from 'react';
import { Link } from 'react-router-dom';
import backgroundImage from '../assets/background2.png';

const Login = () => {
  const backgroundStyle = {
    background: `url(${backgroundImage}) no-repeat center center fixed`,
    backgroundSize: 'cover',
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add login logic here
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
        <form className="auth-form" onSubmit={handleSubmit}>
          <input type="email" placeholder="Email" required />
          <input type="password" placeholder="Password" required />
          <button type="submit" className="form-btn">Log In</button>
        </form>
        <Link to="/signup" className="auth-link">
          Don't have an account? Sign up
        </Link>
      </main>
    </div>
  );
};

export default Login; 