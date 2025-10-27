import React, { useState, useEffect } from 'react';
import { bookingService } from '../../services/bookingService';
import { formatDate, getStatusBadgeClass } from '../../utils/helpers';
import './UserHistory.css';
const BookingStatusChart = ({ data }) => {
  const maxCount = Math.max(data.Cancelled, data.Completed, 1);
  const cancelledHeight = (data.Cancelled / maxCount) * 100;
  const completedHeight = (data.Completed / maxCount) * 100;
  return (
    <div className="booking-chart">
      <h3>Booking Status Summary</h3>
      <div className="chart-bars-wrapper">
        <div className="bar-column">
          <div className="bar cancelled-bar" style={{ height: `${cancelledHeight}%` }}></div>
          <span className="bar-value">{data.Cancelled}</span>
          <span className="bar-label">Cancelled</span>
        </div>
        <div className="bar-column">
          <div className="bar completed-bar" style={{ height: `${completedHeight}%` }}></div>
          <span className="bar-value">{data.Completed}</span>
          <span className="bar-label">Completed</span>
        </div>
      </div>
    </div>
  );
};
const UserHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    loadHistory();
  }, []);
  const loadHistory = async () => {
    try {
      const response = await bookingService.getUserHistory();
      setBookings(response.bookings);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return <div className="loading">Loading history...</div>;
  }
  if (bookings.length === 0) {
    return <div className="no-data">No booking history found</div>;
  }
  const chartData = bookings.reduce((acc, booking) => {
    if (booking.status === 'Cancelled' || booking.status === 'Completed') {
      acc[booking.status] = (acc[booking.status] || 0) + 1;
    }
    return acc;
  }, { Cancelled: 0, Completed: 0 });
  return (
    <div className="user-history">
      <h2>Booking History</h2>
      <div className="history-list">
        {bookings.map(booking => (
          <div key={booking._id} className="history-item">
            <div className="history-header">
              <span className={getStatusBadgeClass(booking.status)}>
                {booking.status}
              </span>
              <span className="booking-date">
                {formatDate(booking.createdAt)}
              </span>
            </div>
            <div className="history-details">
              <div className="location-info">
                <div className="location-point">
                  <span className="label">From:</span>
                  <span>{booking.pickupLocation.address}</span>
                </div>
                <div className="location-point">
                  <span className="label">To:</span>
                  <span>{booking.dropLocation.address}</span>
                </div>
              </div>
              {booking.driver && (
                <div className="driver-info">
                  <span className="label">Driver:</span>
                  <span>{booking.driver.user.name}</span>
                  <span className="label">Vehicle:</span>
                  <span>{booking.driver.vehicleNumber}</span>
                </div>
              )}
              {booking.fare > 0 && (
                <div className="fare-info">
                  <span className="label">Fare:</span>
                  <span className="fare-amount">₹{booking.fare}</span>
                </div>
              )}
              {booking.rating && (
                <div className="rating-info">
                  <span className="label">Rating:</span>
                  <span className="rating-stars">
                    {'⭐'.repeat(booking.rating.score)}
                  </span>
                  {booking.rating.feedback && (
                    <p className="feedback">{booking.rating.feedback}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {(chartData.Cancelled > 0 || chartData.Completed > 0) && (
        <BookingStatusChart data={chartData} />
      )}
    </div>
  );
};
export default UserHistory;