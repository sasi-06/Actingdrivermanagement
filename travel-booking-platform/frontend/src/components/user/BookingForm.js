// Booking form component with Leaflet Maps integration - Fixed
import React, { useState, useEffect, useRef } from 'react';
import LeafletMap from '../common/LeafletMap';
import { bookingService } from '../../services/bookingService';
import { VEHICLE_TYPES } from '../../utils/constants';
import { toast } from 'react-toastify';
import './BookingForm.css';

const BookingForm = ({ onBookingCreated }) => {
  const [formData, setFormData] = useState({
    pickupLocation: null,
    dropLocation: null,
    vehicleType: 'sedan',
    scheduledTime: '',
    specialInstructions: ''
  });
  const [loading, setLoading] = useState(false);
  const [showVehicleGrid, setShowVehicleGrid] = useState(false);
  const vehicleDropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (vehicleDropdownRef.current && !vehicleDropdownRef.current.contains(event.target)) {
        setShowVehicleGrid(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.pickupLocation || !formData.dropLocation) {
      toast.error('Please select both pickup and drop locations');
      return;
    }

    if (!formData.scheduledTime) {
      toast.error('Please select scheduled time');
      return;
    }

    // Check if scheduled time is in the future
    const scheduledDate = new Date(formData.scheduledTime);
    const now = new Date();
    if (scheduledDate <= now) {
      toast.error('Scheduled time must be in the future');
      return;
    }

    setLoading(true);

    try {
      const bookingData = {
        pickupLocation: {
          address: formData.pickupLocation.address,
          lat: formData.pickupLocation.lat,
          lng: formData.pickupLocation.lng
        },
        dropLocation: {
          address: formData.dropLocation.address,
          lat: formData.dropLocation.lat,
          lng: formData.dropLocation.lng
        },
        vehicleType: formData.vehicleType.toLowerCase(),
        scheduledTime: formData.scheduledTime,
        specialInstructions: formData.specialInstructions || ''
      };

      console.log('Submitting booking:', bookingData);

      const response = await bookingService.createBooking(bookingData);
      onBookingCreated(response.booking);
      
      // Reset form
      setFormData({
        pickupLocation: null,
        dropLocation: null,
        vehicleType: 'sedan',
        scheduledTime: '',
        specialInstructions: ''
      });
      
      toast.success('Booking created successfully!');
    } catch (error) {
      console.error('Booking error:', error.response?.data);
      
      // Better error messages
      if (error.response?.data?.errors) {
        // Handle validation errors
        const errorMessages = error.response.data.errors.map(err => err.msg || err.message).join(', ');
        toast.error(errorMessages);
      } else {
        toast.error(error.response?.data?.message || 'Failed to create booking');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVehicleSelect = (vehicleType) => {
    setFormData({
      ...formData,
      vehicleType: vehicleType
    });
    setShowVehicleGrid(false);
  };

  const handleDateTimeChange = (e) => {
    setFormData({
      ...formData,
      scheduledTime: e.target.value
    });
  };

  const handlePickupSelect = (location) => {
    setFormData({
      ...formData,
      pickupLocation: location
    });
  };

  const handleDropSelect = (location) => {
    setFormData({
      ...formData,
      dropLocation: location
    });
  };

  // Set minimum datetime to current time + 30 minutes
  const now = new Date();
  now.setMinutes(now.getMinutes() + 30);
  const minDateTime = now.toISOString().slice(0, 16);

  const selectedVehicle = VEHICLE_TYPES.find(v => v.value === formData.vehicleType);

  return (
    <div className="booking-form-container">
      <form onSubmit={handleSubmit} className="booking-form">
        <div className="map-section">
          <LeafletMap
            pickupLocation={formData.pickupLocation}
            dropLocation={formData.dropLocation}
            onPickupSelect={handlePickupSelect}
            onDropSelect={handleDropSelect}
            showRoute={true}
            height="500px"
          />
        </div>

        <div className="form-section">
          <h3>Trip Details</h3>
          
          <div className="form-group" ref={vehicleDropdownRef}>
            <label>Vehicle Type</label>
            <div 
              className={`selected-vehicle ${showVehicleGrid ? 'open' : ''}`}
              onClick={() => setShowVehicleGrid(!showVehicleGrid)}
            >
              <span className="vehicle-icon">{selectedVehicle?.icon}</span>
              <span className="vehicle-name">{selectedVehicle?.label}</span>
              <span className="dropdown-icon">▼</span>
            </div>
            
            {showVehicleGrid && (
              <div className="vehicle-grid">
                {VEHICLE_TYPES.map(vehicle => (
                  <div
                    key={vehicle.value}
                    className={`vehicle-option ${formData.vehicleType === vehicle.value ? 'selected' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVehicleSelect(vehicle.value);
                    }}
                  >
                    <span className="vehicle-icon">{vehicle.icon}</span>
                    <span className="vehicle-label">{vehicle.label}</span>
                    <span className="vehicle-capacity">👤 {vehicle.capacity}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Scheduled Date & Time</label>
            <input
              type="datetime-local"
              value={formData.scheduledTime}
              onChange={handleDateTimeChange}
              min={minDateTime}
              className="datetime-input"
              required
            />
            <small style={{ color: '#666', fontSize: '12px' }}>
              Minimum booking time is 30 minutes from now
            </small>
          </div>

          <div className="form-group">
            <label>Special Instructions (Optional)</label>
            <textarea
              value={formData.specialInstructions}
              onChange={(e) => setFormData({...formData, specialInstructions: e.target.value})}
              placeholder="Any special requests or instructions..."
              rows="3"
              className="instructions-input"
            />
          </div>

          <div className="fare-estimate">
            <h4>Fare Estimate</h4>
            <p>Base Fare: ₹{selectedVehicle?.basePrice || 10}</p>
            <p>Final fare will be calculated based on actual distance</p>
          </div>

          <button
            type="submit"
            className="submit-button"
            disabled={loading || !formData.pickupLocation || !formData.dropLocation || !formData.scheduledTime}
          >
            {loading ? 'Creating Booking...' : 'Confirm Booking'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookingForm;
