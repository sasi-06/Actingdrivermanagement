import React, { useState } from 'react';
import { bookingService } from '../../services/bookingService';
import Chat from '../common/Chat';
import { formatDate } from '../../utils/helpers';
import { toast } from 'react-toastify';
import './ActiveBookings.css';
const ActiveBookings = ({ bookings, onRefresh }) => {
const [selectedBooking, setSelectedBooking] = useState(null);
const [loading, setLoading] = useState(false);
const handleCancelBooking = async (bookingId) => {
const reason = prompt('Please provide a reason for cancellation:');
if (!reason) return;
setLoading(true);
try {
await bookingService.cancelBooking(bookingId, reason);
toast.success('Booking cancelled successfully');
onRefresh();
} catch (error) {
toast.error('Failed to cancel booking');
} finally {
setLoading(false);
}
};
const getStatusColor = (status) => {
const colors = {
'REQUESTED': '#FFA500',
'BROADCASTED': '#4169E1',
'ACCEPTED': '#32CD32',
'IN_PROGRESS': '#1E90FF',
'COMPLETED': '#008000'
};
return colors[status] || '#666';
};
if (bookings.length === 0) {
return (
<div className="no-active-bookings">
<h2>No Active Bookings</h2>
<p>You don't have any active bookings at the moment.</p>
<button onClick={onRefresh} className="refresh-btn">
Refresh
</button>
</div>
);
}
return (
<div className="active-bookings-container">
<div className="bookings-header">
<h2>Active Bookings ({bookings.length})</h2>
<button onClick={onRefresh} className="refresh-btn">
🔄 Refresh
</button>
</div>
<div className="bookings-layout">
<div className="bookings-grid">
{bookings.map((booking) => (
<div
key={booking._id}
className={`booking-card ${selectedBooking?._id === booking._id ? 'selected' : ''}`}
onClick={() => setSelectedBooking(booking)}
>
<div className="booking-card-header">
<span
className="booking-status"
style={{ backgroundColor: getStatusColor(booking.status) }}
>
{booking.status}
</span>
<span className="booking-time">
{formatDate(booking.scheduledTime)}
</span>
</div>
<div className="booking-card-body">
<div className="location-info">
<div className="location-item">
<span className="location-icon pickup">📍</span>
<div className="location-text">
<strong>From:</strong>
<p>{booking.pickupLocation.address}</p>
</div>
</div>
<div className="location-item">
<span className="location-icon drop">📍</span>
<div className="location-text">
<strong>To:</strong>
<p>{booking.dropLocation.address}</p>
</div>
</div>
</div>
<div className="booking-meta">
<span className="vehicle-type">
🚗 {booking.vehicleType.toUpperCase()}
</span>
{booking.driver && (
<span className="driver-name">
👤 {booking.driver.user.name}
</span>
)}
</div>
{booking.status !== 'COMPLETED' &&
booking.status !== 'IN_PROGRESS' && (
<button
className="cancel-booking-btn"
onClick={(e) => {
e.stopPropagation();
handleCancelBooking(booking._id);
}}
disabled={loading}
>
Cancel Booking
</button>
)}
</div>
</div>
))}
</div>
{selectedBooking && (
<div className="booking-details-panel">
<h3>Booking Details</h3>
<div className="details-section">
<h4>Trip Information</h4>
<p><strong>Booking ID:</strong> {selectedBooking._id.slice(-8)}</p>
<p><strong>Status:</strong> {selectedBooking.status}</p>
<p><strong>Scheduled Time:</strong> {formatDate(selectedBooking.scheduledTime)}</p>
<p><strong>Vehicle Type:</strong> {selectedBooking.vehicleType.toUpperCase()}</p>
</div>
{selectedBooking.driver && (
<>
<div className="details-section">
<h4>Driver Information</h4>
<p><strong>Name:</strong> {selectedBooking.driver.user.name}</p>
<p><strong>Phone:</strong> {selectedBooking.driver.user.phone}</p>
<p><strong>Vehicle:</strong> {selectedBooking.driver.vehicleNumber}</p>
<p><strong>Rating:</strong> ⭐ {selectedBooking.driver.rating.toFixed(1)}</p>
</div>
{['ACCEPTED', 'IN_PROGRESS'].includes(selectedBooking.status) && (
<div className="chat-section">
<h4>Chat with Driver</h4>
<Chat
bookingId={selectedBooking._id}
recipientId={selectedBooking.driver.user._id}
recipientName={selectedBooking.driver.user.name}
/>
</div>
)}
</>
)}
</div>
)}
</div>
</div>
);
};
export default ActiveBookings;

