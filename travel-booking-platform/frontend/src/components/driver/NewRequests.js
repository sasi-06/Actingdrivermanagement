// New booking requests component for drivers with maps
import React, { useState, useEffect } from 'react';
import { bookingService } from '../../services/bookingService';
import { formatDate } from '../../utils/helpers';
import { toast } from 'react-toastify';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import MiniMap from '../common/MiniMap';
import api from '../../services/api';
import './NewRequests.css';

const NewRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [driverAvailable, setDriverAvailable] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const { socket, connected, on, off } = useSocket();
  const { user } = useAuth();

  useEffect(() => {
    console.log('NewRequests component mounted');
    checkAvailability();
    loadRequests();

    // Listen for new booking requests
    const handleNewRequest = (data) => {
      console.log('New booking request received in component:', data);
      toast.info('New booking request available!');
      loadRequests();
    };

    // Listen for window event (from socket context)
    const handleWindowEvent = () => {
      console.log('New booking event from window');
      loadRequests();
    };

    if (socket && connected) {
      socket.on('new_booking_request', handleNewRequest);
      socket.on(`new_booking_for_driver_${user?.id}`, handleNewRequest);
    }
    
    window.addEventListener('new_booking_available', handleWindowEvent);

    // Auto-refresh every 10 seconds
    const interval = setInterval(() => {
      console.log('Auto-refreshing requests...');
      loadRequests();
    }, 10000);

    return () => {
      if (socket) {
        socket.off('new_booking_request', handleNewRequest);
        socket.off(`new_booking_for_driver_${user?.id}`, handleNewRequest);
      }
      window.removeEventListener('new_booking_available', handleWindowEvent);
      clearInterval(interval);
    };
  }, [socket, connected, user]);

  const checkAvailability = async () => {
    try {
      const response = await api.get('/drivers/profile');
      console.log('Driver profile:', response.data.driver);
      setDriverAvailable(response.data.driver.isAvailable);
    } catch (error) {
      console.error('Error checking availability:', error);
    }
  };

  const loadRequests = async () => {
    try {
      console.log('Loading new requests...');
      const response = await bookingService.getNewRequests();
      console.log('Loaded requests:', response);
      
      if (response.bookings) {
        setRequests(response.bookings);
      } else {
        setRequests([]);
      }
      
      if (response.message) {
        console.log('Message from server:', response.message);
      }
    } catch (error) {
      console.error('Error loading requests:', error);
      
      if (error.response?.status === 500) {
        toast.error('Server error. Please try again later.');
      } else if (error.response?.status === 404) {
        toast.error('Driver profile not found. Please contact support.');
      } else {
        toast.error('Failed to load booking requests.');
      }
      
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    loadRequests();
  };

  const handleAccept = async (bookingId) => {
    if (accepting) return;

    setAccepting(true);
    try {
      await bookingService.acceptBooking(bookingId);
      toast.success('Booking accepted successfully!');
      setRequests(requests.filter(req => req._id !== bookingId));
      setSelectedRequest(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to accept booking');
    } finally {
      setAccepting(false);
    }
  };

  if (loading && requests.length === 0) {
    return <div className="loading">Loading requests...</div>;
  }

  if (!driverAvailable) {
    return (
      <div className="availability-warning">
        <h2>You're Currently Offline</h2>
        <p>Toggle your availability to "Available" to see new booking requests</p>
        <button onClick={() => window.location.reload()} className="refresh-page-btn">
          Refresh Page
        </button>
      </div>
    );
  }

  return (
    <div className="new-requests">
      <div className="requests-header">
        <h2>New Booking Requests</h2>
        <div className="header-actions">
          <button 
            className="refresh-button" 
            onClick={handleRefresh}
            disabled={loading}
          >
            🔄 Refresh
          </button>
          <span className={`connection-status ${connected ? 'connected' : 'disconnected'}`}>
            {connected ? '🟢 Connected' : '🔴 Disconnected'}
          </span>
        </div>
      </div>
      
      {requests.length === 0 ? (
        <div className="no-requests">
          <p>No new requests available</p>
          <p>New requests will appear here automatically</p>
          <button onClick={handleRefresh} className="check-again-btn">
            Check Again
          </button>
        </div>
      ) : (
        <div className="requests-container">
          <div className="requests-list">
            {requests.map(request => (
              <div 
                key={request._id} 
                className={`request-card ${selectedRequest?._id === request._id ? 'selected' : ''}`}
                onClick={() => setSelectedRequest(request)}
              >
                <div className="request-header">
                  <span className="customer-name">{request.user.name}</span>
                  <span className="scheduled-time">
                    {formatDate(request.scheduledTime)}
                  </span>
                </div>

                <div className="request-map">
                  <MiniMap 
                    pickupLocation={request.pickupLocation}
                    dropLocation={request.dropLocation}
                    height="180px"
                    interactive={false}
                  />
                </div>

                <div className="request-footer">
                  <span className="vehicle-type">
                    🚗 {request.vehicleType.toUpperCase()}
                  </span>
                  <button
                    className="accept-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAccept(request._id);
                    }}
                    disabled={accepting}
                  >
                    {accepting ? 'Accepting...' : 'Accept'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {selectedRequest && (
            <div className="request-details-panel">
              <h3>Booking Details</h3>
              
              <div className="detail-section">
                <h4>Customer Information</h4>
                <p><strong>Name:</strong> {selectedRequest.user.name}</p>
                <p><strong>Phone:</strong> {selectedRequest.user.phone}</p>
                <p><strong>Email:</strong> {selectedRequest.user.email}</p>
              </div>

              <div className="detail-section">
                <h4>Trip Route</h4>
                <MiniMap 
                  pickupLocation={selectedRequest.pickupLocation}
                  dropLocation={selectedRequest.dropLocation}
                  height="300px"
                  interactive={true}
                />
              </div>

              <div className="detail-section">
                <h4>Location Details</h4>
                <div className="location-detail">
                  <span className="location-label pickup">Pickup:</span>
                  <span className="location-address">{selectedRequest.pickupLocation.address}</span>
                </div>
                <div className="location-detail">
                  <span className="location-label drop">Drop:</span>
                  <span className="location-address">{selectedRequest.dropLocation.address}</span>
                </div>
              </div>

              <div className="detail-section">
                <h4>Trip Information</h4>
                <p><strong>Scheduled:</strong> {formatDate(selectedRequest.scheduledTime)}</p>
                <p><strong>Vehicle Type:</strong> {selectedRequest.vehicleType.toUpperCase()}</p>
              </div>

              <button
                className="accept-button-large"
                onClick={() => handleAccept(selectedRequest._id)}
                disabled={accepting}
              >
                {accepting ? 'Accepting...' : 'Accept This Booking'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default NewRequests;