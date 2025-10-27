// Home page component
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="home-container">
      <section className="hero-section">
        <div className="hero-content">
          <h1>Welcome to Acting driver Platform</h1>
          <p>Book reliable rides with verified drivers at your convenience</p>
          <button className="cta-button" onClick={handleGetStarted}>
            Get Started
          </button>
        </div>
        <img
          src="/images/car-driver.png"
          alt="Animated car driving"
          className="animated-car"
        />
      </section>

      <section className="features-section">
        <h2>Why Choose Us?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🚗</div>
            <h3>Multiple Vehicle Options</h3>
            <p>Choose from cars, autos, or vans based on your needs</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">✅</div>
            <h3>Verified Drivers</h3>
            <p>All drivers are thoroughly verified and approved</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📍</div>
            <h3>Real-time Tracking</h3>
            <p>Track your ride in real-time with live updates</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💬</div>
            <h3>In-app Chat</h3>
            <p>Communicate with your driver directly through the app</p>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <h2>Ready to Ride?</h2>
        <div className="cta-buttons">
          {!user && (
            <>
              <Link to="/register" className="cta-button primary">
                Register as User
              </Link>
              <Link to="/driver-registration" className="cta-button secondary">
                Become a Driver
              </Link>
            </>
          )}
          {user && (
            <button className="cta-button primary" onClick={handleGetStarted}>
              Go to Dashboard
            </button>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
