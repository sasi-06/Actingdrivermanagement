// Notification component for real-time updates
import React, { useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import { toast } from 'react-toastify';
import './Notification.css';

const Notification = ({ userId, userRole }) => {
  const { on, off } = useSocket();

  useEffect(() => {
    // Define notification handlers based on user role
    const handlers = {};

    if (userRole === 'user') {
      handlers[`booking_accepted_${userId}`] = (data) => {
        toast.success('Your booking has been accepted!', {
          position: 'top-center',
          autoClose: 5000
        });
      };

      handlers[`trip_started_${userId}`] = (data) => {
        toast.info('Your trip has started!', {
          position: 'top-center',
          autoClose: 3000
        });
      };

      handlers[`trip_completed_${userId}`] = (data) => {
        toast.success('Your trip has been completed! Please rate your experience.', {
          position: 'top-center',
          autoClose: 5000
        });
      };
    } else if (userRole === 'driver') {
      handlers['new_booking_request'] = (data) => {
        toast.info('New booking request available!', {
          position: 'top-center',
          autoClose: 5000
        });
      };
    }

    // Common handlers
    handlers[`booking_cancelled_${userId}`] = (data) => {
      toast.warning(`Booking cancelled by ${data.cancelledBy}`, {
        position: 'top-center',
        autoClose: 5000
      });
    };

    // Register all handlers
    Object.entries(handlers).forEach(([event, handler]) => {
      on(event, handler);
    });

    // Cleanup
    return () => {
      Object.entries(handlers).forEach(([event, handler]) => {
        off(event, handler);
      });
    };
  }, [userId, userRole, on, off]);

  return null; // This component doesn't render anything visible
};

export default Notification;
