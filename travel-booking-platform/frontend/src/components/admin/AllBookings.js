import React, { useState, useEffect, useMemo } from 'react';
import { bookingService } from '../../services/bookingService';
import { formatDate, getStatusBadgeClass } from '../../utils/helpers';
import { toast } from 'react-toastify';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './AllBookings.css';
const AllBookings = () => {
const [bookings, setBookings] = useState([]);
const [loading, setLoading] = useState(true);
const [filter, setFilter] = useState('all');
const [viewMode, setViewMode] = useState('table');
useEffect(() => {
loadBookings();
}, []);
const loadBookings = async () => {
setLoading(true);
try {
const response = await bookingService.getAllBookings();
setBookings(response.bookings);
} catch (error) {
console.error('Error loading bookings:', error);
toast.error('Failed to load bookings');
} finally {
setLoading(false);
}
};
const handleCancelBooking = async (bookingId) => {
const reason = prompt('Reason for cancellation:');
if (!reason) return;
try {
await bookingService.adminCancelBooking(bookingId, reason);
toast.success('Booking cancelled successfully');
loadBookings();
} catch (error) {
toast.error('Failed to cancel booking');
}
};
const filteredBookings = filter === 'all'
? bookings
: bookings.filter(booking => booking.status === filter);
const chartData = useMemo(() => {
const statusCounts = bookings.reduce((acc, booking) => {
const status = booking.status || 'Unknown';
acc[status] = (acc[status] || 0) + 1;
return acc;
}, {});
return Object.keys(statusCounts).map(statusName => ({
name: statusName,
value: statusCounts[statusName],
}));
}, [bookings]);
const COLORS = {
REQUESTED: '#f39c12',
ACCEPTED: '#2ecc71',
IN_PROGRESS: '#3498db',
COMPLETED: '#1abc9c',
CANCELLED: '#e74c3c',
Unknown: '#95a5a6',
};
if (loading) return <div className="loading">Loading bookings...</div>;
return (
<div className="all-bookings">
<div className="bookings-header">
<h2>All Bookings</h2>
<div className="filter-controls">
<select
value={filter}
onChange={(e) => setFilter(e.target.value)}
className="filter-select"
>
<option value="all">All Status</option>
<option value="REQUESTED">Requested</option>
<option value="ACCEPTED">Accepted</option>
<option value="IN_PROGRESS">In Progress</option>
<option value="COMPLETED">Completed</option>
<option value="CANCELLED">Cancelled</option>
</select>
<button
className="view-toggle-btn"
onClick={() => setViewMode(viewMode === 'table' ? 'chart' : 'table')}
>
{viewMode === 'table' ? '📊 Show Chart' : '📋 Show Table'}
</button>
</div>
</div>
{viewMode === 'table' ? (
<div className="bookings-table-container">
<table className="bookings-table">
<thead>
<tr>
<th>Booking ID</th>
<th>User</th>
<th>Driver</th>
<th>Pickup</th>
<th>Drop</th>
<th>Status</th>
<th>Created At</th>
<th>Actions</th>
</tr>
</thead>
<tbody>
{filteredBookings.map(booking => (
<tr key={booking._id}>
<td>{booking._id.slice(-6)}</td>
<td>{booking.user.name}</td>
<td>{booking.driver ? booking.driver.user.name : 'Not Assigned'}</td>
<td className="address-cell">{booking.pickupLocation.address}</td>
<td className="address-cell">{booking.dropLocation.address}</td>
<td>
<span className={`status-badge ${getStatusBadgeClass(booking.status)}`}>
{booking.status}
</span>
</td>
<td>{formatDate(booking.createdAt)}</td>
<td>
{['REQUESTED', 'ACCEPTED', 'IN_PROGRESS'].includes(booking.status) && (
<button
className="cancel-booking-btn"
onClick={() => handleCancelBooking(booking._id)}
>
Cancel
</button>
)}
</td>
</tr>
))}
</tbody>
</table>
</div>
) : (
<div className="chart-view-container">
<h3>Bookings by Status</h3>
<ResponsiveContainer width="100%" height={400}>
<PieChart>
<Pie
data={chartData}
cx="50%"
cy="50%"
labelLine={false}
outerRadius={150}
fill="#8884d8"
dataKey="value"
label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
>
{chartData.map((entry, index) => (
<Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#bdc3c7'} />
))}
</Pie>
<Tooltip />
<Legend />
</PieChart>
</ResponsiveContainer>
</div>
)}
</div>
);
};
export default AllBookings;
