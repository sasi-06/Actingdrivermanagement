import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import BookingForm from './BookingForm';
import UserHistory from './UserHistory';
import ActiveBookings from './ActiveBookings';
import RatingModal from './RatingModal';
import Notification from '../common/Notification';
import { bookingService } from '../../services/bookingService';
import { toast } from 'react-toastify';
import './UserDashboard.css';
const UserDashboard = () => {
const [activeBookings, setActiveBookings] = useState([]);
const [showRatingModal, setShowRatingModal] = useState(false);
const [ratingBookingId, setRatingBookingId] = useState(null);
const [loading, setLoading] = useState(true);
const { user } = useAuth();
const location = useLocation();
useEffect(() => {
loadDashboardData();
const interval = setInterval(loadDashboardData, 30000);
return () => clearInterval(interval);
}, []);
const loadDashboardData = async () => {
try {
setLoading(true);
const [activeBookingsRes] = await Promise.all([
bookingService.getActiveBookings(),
]);
setActiveBookings(activeBookingsRes.bookings || []);
const completedBooking = activeBookingsRes.bookings?.find(
booking => booking.status === 'COMPLETED' && !booking.rating
);
if (completedBooking) {
setRatingBookingId(completedBooking._id);
setShowRatingModal(true);
}
} catch (error) {
console.error('Error loading dashboard data:', error);
setActiveBookings([]);
} finally {
setLoading(false);
}
};
const handleBookingCreated = (booking) => {
toast.success('Booking created successfully!');
loadDashboardData();
};
const handleRatingSubmit = async (rating, feedback) => {
try {
await bookingService.rateBooking(ratingBookingId, rating, feedback);
setShowRatingModal(false);
setRatingBookingId(null);
toast.success('Thank you for your feedback!');
loadDashboardData();
} catch (error) {
toast.error('Failed to submit rating');
}
};
return (
<div className="user-dashboard">
<Notification userId={user.id} userRole="user" />
<div className="dashboard-sidebar">
<div className="sidebar-header">
<h3>User Menu</h3>
<div className="user-info">
<p className="user-name">{user.name}</p>
<p className="user-email">{user.email}</p>
</div>
</div>
<nav className="dashboard-nav">
<Link
to="/user"
className={location.pathname === '/user' ? 'active' : ''}
>
<span className="nav-icon">➕</span>
New Booking
</Link>
<Link
to="/user/active"
className={location.pathname === '/user/active' ? 'active' : ''}
>
<span className="nav-icon">📋</span>
Active Bookings
{activeBookings.length > 0 && (
<span className="badge">{activeBookings.length}</span>
)}
</Link>
<Link
to="/user/history"
className={location.pathname === '/user/history' ? 'active' : ''}
>
<span className="nav-icon">📜</span>
Booking History
</Link>
</nav>
<div className="sidebar-stats">
<h4>Quick Stats</h4>
<div className="stat-item">
<span className="stat-label">Active Bookings:</span>
<span className="stat-value">{activeBookings.length}</span>
</div>
<div className="stat-item">
<span className="stat-label">Completed Today:</span>
<span className="stat-value">
{activeBookings.filter(b =>
b.status === 'COMPLETED' &&
new Date(b.endTime).toDateString() === new Date().toDateString()
).length}
</span>
</div>
</div>
</div>
<div className="dashboard-content">
<Routes>
<Route
path="/"
element={
<div className="new-booking-page">
<div className="page-header">
<h2>Book a New Ride</h2>
<p className="info-text">
<span className="info-icon">ℹ️</span>
You can create multiple bookings. Each booking will be handled separately by different drivers.
</p>
</div>
{activeBookings.length > 0 && (
<div className="active-bookings-notice">
<div className="notice-content">
<span className="notice-icon">🚗</span>
<div>
<p>You have {activeBookings.length} active booking{activeBookings.length > 1 ? 's' : ''}.</p>
<Link to="/user/active" className="view-active-link">
View Active Bookings →
</Link>
</div>
</div>
</div>
)}
<BookingForm onBookingCreated={handleBookingCreated} />
</div>
}
/>
<Route
path="/active"
element={
<ActiveBookings
bookings={activeBookings}
onRefresh={loadDashboardData}
loading={loading}
/>
}
/>
<Route path="/history" element={<UserHistory />} />
</Routes>
</div>
{showRatingModal && (
<RatingModal
bookingId={ratingBookingId}
onSubmit={handleRatingSubmit}
onClose={() => {
setShowRatingModal(false);
setRatingBookingId(null);
}}
/>
)}
</div>
);
};
export default UserDashboard;

