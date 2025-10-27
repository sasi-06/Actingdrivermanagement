import React, { useState, useEffect } from 'react';
import { bookingService } from '../../services/bookingService';
import Chat from '../common/Chat';
import { toast } from 'react-toastify';
import './AcceptedBookings.css';
import MiniMap from '../common/MiniMap';
const AcceptedBookings = () => {
const [bookings, setBookings] = useState([]);
const [loading, setLoading] = useState(true);
const [selectedBooking, setSelectedBooking] = useState(null);
useEffect(() => {
loadAcceptedBookings();
}, []);
const loadAcceptedBookings = async () => {
try {
const response = await bookingService.getAcceptedBookings();
setBookings(response.bookings);
// NEW: Automatically select the first booking if none is selected
if (response.bookings.length > 0 && !selectedBooking) {
setSelectedBooking(response.bookings[0]);
}
} catch (error) {
console.error('Error loading accepted bookings:', error);
} finally {
setLoading(false);
}
};
const handleStartTrip = async (bookingId) => {
try {
await bookingService.startTrip(bookingId);
toast.success('Trip started!');
loadAcceptedBookings();
} catch (error) {
toast.error('Failed to start trip');
}
};
const handleCompleteTrip = async (bookingId) => {
try {
await bookingService.completeTrip(bookingId);
toast.success('Trip completed successfully!');
loadAcceptedBookings();
} catch (error) {
toast.error('Failed to complete trip');
}
};
if (loading) {
return <div className="loading">Loading bookings...</div>;
}
if (bookings.length === 0) {
return (
<div className="no-bookings">
<p>No accepted bookings</p>
<p>Check new requests to accept bookings</p>
</div>
);
}
return (
<div className="accepted-bookings">
<h2>Active Bookings</h2>
<div className="bookings-container">
<div className="bookings-list">
{bookings.map(booking => (
<div
key={booking._id}
className={`booking-card ${selectedBooking?._id === booking._id ? 'selected' : ''}`}
onClick={() => setSelectedBooking(booking)}
>
<div className="booking-header">
<h4>{booking.user.name}</h4>
<span className={`status-badge ${booking.status.toLowerCase()}`}>
{booking.status}
</span>
</div>
<div className="booking-map">
<MiniMap
pickupLocation={booking.pickupLocation}
dropLocation={booking.dropLocation}
height="150px"
interactive={false}
/>
</div>
<div className="booking-info">
<p><strong>Phone:</strong> {booking.user.phone}</p><p><strong>Pickup:</strong> {booking.pickupLocation.address}</p>
<p><strong>Drop:</strong> {booking.dropLocation.address}</p>
</div>
<div className="booking-actions">
{booking.status === 'ACCEPTED' && (
<button
className="action-button start"
onClick={(e) => {
e.stopPropagation();
handleStartTrip(booking._id);
}}
>
Start Trip
</button>
)}
{booking.status === 'IN_PROGRESS' && (
<button
className="action-button complete"
onClick={(e) => {
e.stopPropagation();
handleCompleteTrip(booking._id);
}}
>
Complete Trip
</button>
)}
</div>
</div>
))}
</div>
{selectedBooking && (
<div className="booking-detail">
<h3>Chat with {selectedBooking.user.name}</h3>
<Chat
bookingId={selectedBooking._id}
recipientId={selectedBooking.user._id}
recipientName={selectedBooking.user.name}
/>
</div>
)}
</div>
</div>
);
};
export default AcceptedBookings;
