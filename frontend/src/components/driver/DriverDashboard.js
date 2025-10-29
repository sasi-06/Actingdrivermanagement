// Driver dashboard main component
import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NewRequests from './NewRequests';
import AcceptedBookings from './AcceptedBookings';
import Notification from '../common/Notification';
import api from '../../services/api';
import { toast } from 'react-toastify';
import './DriverDashboard.css';

const DriverDashboard = () => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [driverProfile, setDriverProfile] = useState(null);
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    loadDriverProfile();
  }, []);

  const loadDriverProfile = async () => {
    try {
      const response = await api.get('/drivers/profile');
      setDriverProfile(response.data.driver);
      setIsAvailable(response.data.driver.isAvailable);
    } catch (error) {
      console.error('Error loading driver profile:', error);
    }
  };

  const toggleAvailability = async () => {
    try {
      const newStatus = !isAvailable;
      await api.put('/drivers/availability', { isAvailable: newStatus });
      setIsAvailable(newStatus);
      toast.success(`You are now ${newStatus ? 'available' : 'offline'}`);
    } catch (error) {
      toast.error('Failed to update availability');
    }
  };

  return (
    <div className="driver-dashboard">
      <Notification userId={user.id} userRole="driver" />
      
      <div className="dashboard-sidebar">
        <h3>Driver Menu</h3>
        
        // In the DriverDashboard component, update the availability toggle section:

<div className={`availability-toggle ${isAvailable ? 'online' : ''}`}>
  <label className="switch">
    <input
      type="checkbox"
      checked={isAvailable}
      onChange={toggleAvailability}
    />
    <span className="slider"></span>
  </label>
  <span>{isAvailable ? '🟢 Available for rides' : '🔴 Offline'}</span>
</div>


        <nav className="dashboard-nav">
          <Link 
            to="/driver" 
            className={location.pathname === '/driver' ? 'active' : ''}
          >
            New Requests
          </Link>
          <Link 
            to="/driver/accepted" 
            className={location.pathname === '/driver/accepted' ? 'active' : ''}
          >
            Accepted Bookings
          </Link>
          <Link 
            to="/driver/history" 
            className={location.pathname === '/driver/history' ? 'active' : ''}
          >
            Trip History
          </Link>
        </nav>

        {driverProfile && (
          <div className="driver-stats">
            <h4>Your Stats</h4>
            <p>Rating: ⭐ {driverProfile.rating.toFixed(1)}</p>
            <p>Total Trips: {driverProfile.totalTrips}</p>
          </div>
        )}
      </div>

      <div className="dashboard-content">
        <Routes>
          <Route path="/" element={<NewRequests />} />
          <Route path="/accepted" element={<AcceptedBookings />} />
          <Route path="/history" element={<DriverHistory />} />
        </Routes>
      </div>
    </div>
  );
};

// Driver History Component
const DriverHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const response = await api.get('/drivers/history');
      setBookings(response.data.bookings);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="driver-history">
      <h2>Trip History</h2>
      {bookings.length === 0 ? (
        <p>No trips completed yet</p>
      ) : (
        <div className="history-list">
          {bookings.map(booking => (
            <div key={booking._id} className="history-item">
              <div className="booking-info">
                <p><strong>Customer:</strong> {booking.user.name}</p>
                <p><strong>From:</strong> {booking.pickupLocation.address}</p>
                <p><strong>To:</strong> {booking.dropLocation.address}</p>
                <p><strong>Fare:</strong> ₹{booking.fare}</p>
                {booking.rating && (
                  <p><strong>Rating:</strong> {'⭐'.repeat(booking.rating.score)}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DriverDashboard;
