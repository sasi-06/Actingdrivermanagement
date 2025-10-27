// Pending drivers approval component
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import './PendingDrivers.css';

const PendingDrivers = ({ onUpdate }) => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadPendingDrivers();
  }, []);

  const loadPendingDrivers = async () => {
    try {
      const response = await api.get('/admin/drivers/pending');
      setDrivers(response.data.drivers);
    } catch (error) {
      console.error('Error loading pending drivers:', error);
      toast.error('Failed to load pending drivers');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (driverId) => {
    if (processing) return;

    setProcessing(true);
    try {
      await api.post(`/admin/drivers/${driverId}/approve`);
      toast.success('Driver approved successfully');
      setDrivers(drivers.filter(d => d._id !== driverId));
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error('Failed to approve driver');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (driverId) => {
    if (processing) return;

    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    setProcessing(true);
    try {
      await api.post(`/admin/drivers/${driverId}/reject`, { reason });
      toast.success('Driver application rejected');
      setDrivers(drivers.filter(d => d._id !== driverId));
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error('Failed to reject driver');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="loading">Loading pending drivers...</div>;

  return (
    <div className="pending-drivers">
      <h2>Pending Driver Applications</h2>
      
      {drivers.length === 0 ? (
        <p className="no-pending">No pending driver applications</p>
      ) : (
        <div className="drivers-grid">
          {drivers.map(driver => (
            <div key={driver._id} className="driver-card">
              <div className="driver-header">
                <h3>{driver.user.name}</h3>
                <span className="application-date">
                  Applied: {new Date(driver.createdAt).toLocaleDateString()}
                </span>
              </div>

                            <div className="driver-details">
                <div className="detail-row">
                  <span className="label">Email:</span>
                  <span>{driver.user.email}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Phone:</span>
                  <span>{driver.user.phone}</span>
                </div>
                <div className="detail-row">
                  <span className="label">License:</span>
                  <span>{driver.licenseNumber}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Vehicle Type:</span>
                  <span>{driver.vehicleType}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Vehicle Number:</span>
                  <span>{driver.vehicleNumber}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Vehicle Model:</span>
                  <span>{driver.vehicleModel}</span>
                </div>
              </div>

              <div className="driver-actions">
                <button
                  className="approve-button"
                  onClick={() => handleApprove(driver._id)}
                  disabled={processing}
                >
                  Approve
                </button>
                <button
                  className="reject-button"
                  onClick={() => handleReject(driver._id)}
                  disabled={processing}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingDrivers;
