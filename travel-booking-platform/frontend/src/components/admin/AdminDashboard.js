import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import PendingDrivers from './PendingDrivers';
import AllBookings from './AllBookings';
import api from '../../services/api';
import './AdminDashboard.css';
const AdminDashboard = () => {
const [stats, setStats] = useState(null);
const location = useLocation();
const [driverModalOpen, setDriverModalOpen] = useState(false);
const [driverModalStats, setDriverModalStats] = useState(null);
const [driverModalName, setDriverModalName] = useState('');
const [driverModalLoading, setDriverModalLoading] = useState(false);
const [userModalOpen, setUserModalOpen] = useState(false);
const [userModalStats, setUserModalStats] = useState(null);
const [userModalName, setUserModalName] = useState('');
const [userModalLoading, setUserModalLoading] = useState(false);
useEffect(() => {
loadStats();
}, []);
const loadStats = async () => {
try {
const response = await api.get('/admin/stats');
setStats(response.data.stats);
} catch (error) {
console.error('Error loading stats:', error);
}
};
const handleViewDriverDetails = async (driverId, driverName) => {
setDriverModalName(driverName);
setDriverModalOpen(true);
setDriverModalLoading(true);
try {
const response = await api.get(`/admin/driver-stats/${driverId}`);
setDriverModalStats(response.data.stats);
} catch (error) {
console.error('Error loading driver stats:', error);
} finally {
setDriverModalLoading(false);
}
};
const handleCloseDriverModal = () => {
setDriverModalOpen(false);
setDriverModalStats(null);
setDriverModalName('');
};
const handleViewUserDetails = async (userId, userName) => {
setUserModalName(userName);
setUserModalOpen(true);
setUserModalLoading(true);
try {
const response = await api.get(`/admin/user-stats/${userId}`);
setUserModalStats(response.data.stats);
} catch (error) {
console.error('Error loading user stats:', error);
} finally {
setUserModalLoading(false);
}
};
const handleCloseUserModal = () => {
setUserModalOpen(false);
setUserModalStats(null);
setUserModalName('');
};
return (
<div className="admin-dashboard">
<div className="dashboard-sidebar">
<h3>Admin Menu</h3>
<nav className="dashboard-nav">
<Link
to="/admin"
className={location.pathname === '/admin' ? 'active' : ''}
>
Dashboard
</Link>
<Link
to="/admin/pending-drivers"
className={location.pathname === '/admin/pending-drivers' ? 'active' : ''}
>
Pending Drivers
</Link>
<Link
to="/admin/all-bookings"
className={location.pathname === '/admin/all-bookings' ? 'active' : ''}
>
All Bookings
</Link>
<Link
to="/admin/users"
className={location.pathname === '/admin/users' ? 'active' : ''}
>
Users
</Link>
<Link
to="/admin/drivers"
className={location.pathname === '/admin/drivers' ? 'active' : ''}
>
Drivers
</Link>
</nav>
</div>
<div className="dashboard-content">
<Routes>
<Route path="/" element={<AdminOverview stats={stats} />} />
<Route path="/pending-drivers" element={<PendingDrivers onUpdate={loadStats} />} />
<Route path="/all-bookings" element={<AllBookings />} />
<Route path="/users" element={<UsersList onViewDetails={handleViewUserDetails} />} />
<Route path="/drivers" element={<DriversList onViewDetails={handleViewDriverDetails} />} />
</Routes>
</div>
<DriverStatsModal
show={driverModalOpen}
onClose={handleCloseDriverModal}
driverStats={driverModalStats}
driverName={driverModalName}
loading={driverModalLoading}
/>
<UserStatsModal
show={userModalOpen}
onClose={handleCloseUserModal}
userStats={userModalStats}
userName={userModalName}
loading={userModalLoading}
/>
</div>
);
};
const AdminOverview = ({ stats }) => {
if (!stats) return <div className="loading">Loading...</div>;
const userDriverData = [
{ name: 'Users', count: stats.totalUsers },
{ name: 'Drivers', count: stats.totalDrivers },
];
const bookingData = [
{ name: 'Active', value: stats.activeBookings },
{ name: 'Completed', value: stats.completedBookings },
];
const bookingColors = ['#FF8042', '#0088FE'];
return (
<div className="admin-overview">
<h2>Dashboard Overview</h2>
<div className="stats-grid">
<div className="stat-card">
<h3>Total Users</h3>
<p className="stat-number">{stats.totalUsers}</p>
</div>
<div className="stat-card">
<h3>Total Drivers</h3>
<p className="stat-number">{stats.totalDrivers}</p>
</div>
<div className="stat-card">
<h3>Pending Drivers</h3>
<p className="stat-number pending">{stats.pendingDrivers}</p>
</div>
<div className="stat-card">
<h3>Active Bookings</h3>
<p className="stat-number">{stats.activeBookings}</p>
</div>
<div className="stat-card">
<h3>Completed Bookings</h3>
<p className="stat-number">{stats.completedBookings}</p>
</div>
</div>
<div className="charts-container">
<div className="chart-wrapper">
<h3>User vs Driver Ratio</h3>
<ResponsiveContainer width="100%" height={300}>
<BarChart data={userDriverData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
<CartesianGrid strokeDasharray="3 3" />
<XAxis dataKey="name" />
<YAxis />
<Tooltip />
<Legend />
<Bar dataKey="count" fill="#8884d8" />
</BarChart>
</ResponsiveContainer>
</div>
<div className="chart-wrapper">
<h3>Booking Status</h3>
<ResponsiveContainer width="100%" height={300}>
<PieChart>
<Pie
data={bookingData}
cx="50%"
cy="50%"
labelLine={false}
outerRadius={100}
fill="#8884d8"
dataKey="value"
label={(entry) => `${entry.name}: ${entry.value}`}
>
{bookingData.map((entry, index) => (
<Cell key={`cell-${index}`} fill={bookingColors[index % bookingColors.length]} />
))}
</Pie>
<Tooltip />
<Legend />
</PieChart>
</ResponsiveContainer>
</div>
</div>
</div>
);
};
const UsersList = ({ onViewDetails }) => {
const [users, setUsers] = useState([]);
const [loading, setLoading] = useState(true);
useEffect(() => {
loadUsers();
}, []);
const loadUsers = async () => {
try {
const response = await api.get('/admin/users');
setUsers(response.data.users);
} catch (error) {
console.error('Error loading users:', error);
} finally {
setLoading(false);
}
};
if (loading) return <div className="loading">Loading users...</div>;
return (
<div className="users-list">
<h2>Registered Users</h2>
<table className="data-table">
<thead>
<tr>
<th>Name</th>
<th>Email</th>
<th>Phone</th>
<th>Registered On</th>
<th>Status</th>
<th>Actions</th>
</tr>
</thead>
<tbody>
{users.map(user => (
<tr key={user._id}>
<td>{user.name}</td>
<td>{user.email}</td>
<td>{user.phone}</td>
<td>{new Date(user.createdAt).toLocaleDateString()}</td>
<td>
<span className={`status ${user.isActive ? 'active' : 'inactive'}`}>
{user.isActive ? 'Active' : 'Inactive'}
</span>
</td>
<td>
<button
className="details-btn"
onClick={() => onViewDetails(user._id, user.name)}
>
Details
</button>
</td>
</tr>
))}
</tbody>
</table>
</div>
);
};
const DriversList = ({ onViewDetails }) => {
const [drivers, setDrivers] = useState([]);
const [loading, setLoading] = useState(true);
useEffect(() => {
loadDrivers();
}, []);
const loadDrivers = async () => {
try {
const response = await api.get('/admin/drivers/approved');
setDrivers(response.data.drivers);
} catch (error) {
console.error('Error loading drivers:', error);
} finally {
setLoading(false);
}
};
if (loading) return <div className="loading">Loading drivers...</div>;
return (
<div className="drivers-list">
<h2>Approved Drivers</h2>
<table className="data-table">
<thead>
<tr>
<th>Name</th>
<th>Email</th>
<th>License</th>
<th>Vehicle Type</th>
<th>Vehicle Number</th>
<th>Rating</th>
<th>Total Trips</th>
<th>Actions</th>
</tr>
</thead>
<tbody>
{drivers.map(driver => (
<tr key={driver._id}>
<td>{driver.user.name}</td>
<td>{driver.user.email}</td>
<td>{driver.licenseNumber}</td>
<td>{driver.vehicleType}</td>
<td>{driver.vehicleNumber}</td>
<td>⭐ {driver.rating.toFixed(1)}</td>
<td>{driver.totalTrips}</td>
<td>
<button
className="details-btn"
onClick={() => onViewDetails(driver._id, driver.user.name)}
>
Details
</button>
</td>
</tr>
))}
</tbody>
</table>
</div>
);
};
const DriverStatsModal = ({ show, onClose, driverStats, driverName, loading }) => {
if (!show) return null;
const chartData = driverStats ? [
{ name: 'Accepted', value: driverStats.accepted || 0 },
{ name: 'Rejected', value: driverStats.rejected || 0 },
{ name: 'Completed', value: driverStats.completed || 0 },
{ name: 'Cancelled', value: driverStats.cancelled || 0 },
].filter(item => item.value > 0) : [];
const COLORS = ['#0088FE', '#FF8042', '#4CAF50', '#F44336'];
return (
<div className="modal-overlay" onClick={onClose}>
<div className="modal-content" onClick={(e) => e.stopPropagation()}>
<button className="modal-close-btn" onClick={onClose}>&times;</button>
<h3>Driver Stats: {driverName}</h3>
{loading && <div className="loading">Loading stats...</div>}
{!loading && driverStats && (
<>
<div className="driver-chart-container">
{chartData.length > 0 ? (
<ResponsiveContainer width="100%" height={250}>
<PieChart>
<Pie
data={chartData}
cx="50%"
cy="50%"
labelLine={false}
outerRadius={80}
fill="#8884d8"
dataKey="value"
label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
>
{chartData.map((entry, index) => (
<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
))}
</Pie>
<Tooltip />
<Legend />
</PieChart>
</ResponsiveContainer>
) : (
<p>No booking data found for this driver.</p>
)}
</div>
<div className="driver-stats-grid">
<div className="driver-stat-item">
<span>Total Accepted:</span>
<strong>{driverStats.accepted}</strong>
</div>
<div className="driver-stat-item">
<span>Total Rejected:</span>
<strong>{driverStats.rejected}</strong>
</div>
<div className="driver-stat-item">
<span>Total Completed:</span>
<strong>{driverStats.completed}</strong>
</div>
<div className="driver-stat-item">
<span>Total Cancelled:</span>
<strong>{driverStats.cancelled}</strong>
</div>
<div className="driver-stat-item">
<span>Joined On:</span>
<strong>{new Date(driverStats.joinedOn).toLocaleString()}</strong>
</div>
</div>
</>
)}
</div>
</div>
);
};
const UserStatsModal = ({ show, onClose, userStats, userName, loading }) => {
if (!show) return null;
const chartData = userStats ? [
{ name: 'Completed', value: userStats.completed || 0 },
{ name: 'Cancelled', value: userStats.cancelled || 0 },
].filter(item => item.value > 0) : [];
const COLORS = ['#4CAF50', '#F44336'];
return (
<div className="modal-overlay" onClick={onClose}>
<div className="modal-content" onClick={(e) => e.stopPropagation()}>
<button className="modal-close-btn" onClick={onClose}>&times;</button>
<h3>User Stats: {userName}</h3>
{loading && <div className="loading">Loading stats...</div>}
{!loading && userStats && (
<>
<div className="driver-chart-container">
{chartData.length > 0 ? (
<ResponsiveContainer width="100%" height={250}>
<PieChart>
<Pie
data={chartData}
cx="50%"
cy="50%"
labelLine={false}
outerRadius={80}
fill="#8884d8"
dataKey="value"
label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
>
{chartData.map((entry, index) => (
<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
))}
</Pie>
<Tooltip />
<Legend />
</PieChart>
</ResponsiveContainer>
) : (
<p>This user hasn't made any bookings yet.</p>
)}
</div>
<div className="driver-stats-grid">
<div className="driver-stat-item">
<span>Total Bookings:</span>
<strong>{userStats.totalBookings}</strong>
</div>
<div className="driver-stat-item">
<span>Completed Bookings:</span>
<strong>{userStats.completed}</strong>
</div>
<div className="driver-stat-item">
<span>Cancelled Bookings:</span>
<strong>{userStats.cancelled}</strong>
</div>
<div className="driver-stat-item">
<span>Registered On:</span>
<strong>{new Date(userStats.registeredOn).toLocaleString()}</strong>
</div>
</div>
</>
)}
</div>
</div>
);
};
export default AdminDashboard;

