// Login page component
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(
        formData.email,
        formData.password,
        isAdminLogin
      );

      if (result.success) {
        toast.success('Login successful!');
        navigate('/dashboard');
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Welcome Back!</h2>
        <p>Login to your account</p>

        <div className="login-type-toggle">
          <button
            className={!isAdminLogin ? 'active' : ''}
            onClick={() => setIsAdminLogin(false)}
          >
            User/Driver Login
          </button>
          <button
            className={isAdminLogin ? 'active' : ''}
            onClick={() => setIsAdminLogin(true)}
          >
            Admin Login
          </button>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Email</label>
            <input
              type={isAdminLogin ? 'text' : 'email'}
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={isAdminLogin ? 'Enter admin username' : 'Enter your email'}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="password-input">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {!isAdminLogin && (
          <div className="login-footer">
            <p>
              Don't have an account?{' '}
              <Link to="/register">Register as User</Link>
            </p>
            <p>
              Want to become a driver?{' '}
              <Link to="/driver-registration">Register as Driver</Link>
            </p>
          </div>
        )}

        {isAdminLogin && (
          <div className="admin-credentials">
            <p>Admin Credentials:</p>
            <p>Username: admin</p>
            <p>Password: admin@123</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
