// Driver registration component - Fixed
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { VEHICLE_TYPES } from '../../utils/constants';
import { toast } from 'react-toastify';
import './DriverRegistration.css';

const DriverRegistration = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    licenseNumber: '',
    vehicleTypes: [],
    primaryVehicle: '',
    vehicleNumber: '',
    vehicleModel: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const toggleVehicleType = (vehicleType) => {
    const newVehicleTypes = formData.vehicleTypes.includes(vehicleType)
      ? formData.vehicleTypes.filter(v => v !== vehicleType)
      : [...formData.vehicleTypes, vehicleType];

    setFormData({
      ...formData,
      vehicleTypes: newVehicleTypes,
      primaryVehicle: newVehicleTypes.length === 1 ? newVehicleTypes[0] : formData.primaryVehicle
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    } else if (!/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = 'Phone must be 10 digits';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.licenseNumber.trim()) {
      newErrors.licenseNumber = 'License number is required';
    }

    if (!formData.vehicleNumber.trim()) {
      newErrors.vehicleNumber = 'Vehicle number is required';
    }

    if (!formData.vehicleModel.trim()) {
      newErrors.vehicleModel = 'Vehicle model is required';
    }

    if (formData.vehicleTypes.length === 0) {
      newErrors.vehicleTypes = 'Please select at least one vehicle type';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix all errors before submitting');
      return;
    }

    setLoading(true);

    try {
      // Prepare data for submission
      const submitData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        phone: formData.phone.trim(),
        licenseNumber: formData.licenseNumber.trim().toUpperCase(),
        vehicleNumber: formData.vehicleNumber.trim().toUpperCase(),
        vehicleModel: formData.vehicleModel.trim(),
        vehicleTypes: formData.vehicleTypes,
        vehicleType: formData.primaryVehicle || formData.vehicleTypes[0], // Backward compatibility
        primaryVehicle: formData.primaryVehicle || formData.vehicleTypes[0]
      };

      console.log('Submitting driver registration:', submitData);

      const result = await register(submitData, true);
      
      if (result.success) {
        toast.success('Registration submitted! Please wait for admin approval.');
        navigate('/login');
      } else {
        // Handle validation errors from backend
        if (result.errors) {
          const errorMessages = result.errors.map(err => err.msg || err.message).join('\n');
          toast.error(errorMessages);
        } else {
          toast.error(result.error || 'Registration failed');
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="driver-registration-container">
      <div className="registration-card">
        <h2>Become a Driver Partner</h2>
        <p>Join our platform and start earning today</p>

        <form onSubmit={handleSubmit} className="driver-registration-form">
          <div className="form-section">
            <h3>Personal Information</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={errors.name ? 'error' : ''}
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10 digit number"
                  className={errors.phone ? 'error' : ''}
                />
                {errors.phone && <span className="error-message">{errors.phone}</span>}
              </div>
            </div>

            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'error' : ''}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Password *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? 'error' : ''}
                />
                {errors.password && <span className="error-message">{errors.password}</span>}
              </div>

              <div className="form-group">
                <label>Confirm Password *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={errors.confirmPassword ? 'error' : ''}
                />
                {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Vehicle Information</h3>

            <div className="form-row">
              <div className="form-group">
                <label>License Number *</label>
                <input
                  type="text"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  placeholder="e.g., DL01AB1234"
                  className={errors.licenseNumber ? 'error' : ''}
                />
                {errors.licenseNumber && <span className="error-message">{errors.licenseNumber}</span>}
              </div>

              <div className="form-group">
                <label>Vehicle Number *</label>
                <input
                  type="text"
                  name="vehicleNumber"
                  value={formData.vehicleNumber}
                  onChange={handleChange}
                  placeholder="e.g., DL01AB1234"
                  className={errors.vehicleNumber ? 'error' : ''}
                />
                {errors.vehicleNumber && <span className="error-message">{errors.vehicleNumber}</span>}
              </div>
            </div>

            <div className="form-group">
              <label>Vehicle Model *</label>
              <input
                type="text"
                name="vehicleModel"
                value={formData.vehicleModel}
                onChange={handleChange}
                placeholder="e.g., Toyota Camry 2020"
                className={errors.vehicleModel ? 'error' : ''}
              />
              {errors.vehicleModel && <span className="error-message">{errors.vehicleModel}</span>}
            </div>

            <div className="form-group">
              <label>Vehicle Types * (Select all that apply)</label>
              {errors.vehicleTypes && <span className="error-message">{errors.vehicleTypes}</span>}
              <div className="vehicle-types-grid">
                {VEHICLE_TYPES.map(vehicle => (
                  <div
                    key={vehicle.value}
                    className={`vehicle-type-option ${
                      formData.vehicleTypes.includes(vehicle.value) ? 'selected' : ''
                    }`}
                    onClick={() => toggleVehicleType(vehicle.value)}
                  >
                    <span className="vehicle-icon">{vehicle.icon}</span>
                    <span className="vehicle-label">{vehicle.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {formData.vehicleTypes.length > 1 && (
              <div className="form-group">
                <label>Primary Vehicle Type</label>
                <select
                  name="primaryVehicle"
                  value={formData.primaryVehicle}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select primary vehicle type</option>
                  {formData.vehicleTypes.map(type => {
                    const vehicle = VEHICLE_TYPES.find(v => v.value === type);
                    return (
                      <option key={type} value={type}>
                        {vehicle?.label || type}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}
          </div>

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>

        <div className="info-note">
          <p>* Required fields</p>
          <p>Note: Your application will be reviewed by our admin team. 
          You'll receive an email notification once approved.</p>
        </div>
      </div>
    </div>
  );
};

export default DriverRegistration;
