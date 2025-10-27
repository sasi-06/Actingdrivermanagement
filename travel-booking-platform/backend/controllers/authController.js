// // Import required modules at the top
// const User = require('../models/User');
// const Driver = require('../models/Driver');
// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcryptjs');
// const { validationResult } = require('express-validator');
// const emailService = require('../utils/emailService');

// // Generate JWT token
// const generateToken = (userId, role) => {
//   return jwt.sign(
//     { userId, role },
//     process.env.JWT_SECRET,
//     { expiresIn: '7d' }
//   );
// };

// // User registration
// exports.registerDriver = async (req, res) => {
//   try {
//     // Log the incoming request
//     console.log('Driver registration request body:', req.body);
    
//     // Check validation errors
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       console.log('Validation errors:', errors.array());
//       return res.status(400).json({ 
//         message: 'Validation failed',
//         errors: errors.array() 
//       });
//     }

//     const { 
//       name, 
//       email, 
//       password, 
//       phone, 
//       licenseNumber, 
//       vehicleType,
//       vehicleTypes,
//       primaryVehicle,
//       vehicleNumber, 
//       vehicleModel 
//     } = req.body;

//     // Check if user already exists
//     const existingUser = await User.findOne({ email: email.toLowerCase() });
//     if (existingUser) {
//       return res.status(400).json({ message: 'Email already registered' });
//     }

//     // Check if driver license already exists
//     const existingDriver = await Driver.findOne({ 
//       licenseNumber: licenseNumber.toUpperCase() 
//     });
//     if (existingDriver) {
//       return res.status(400).json({ message: 'License number already registered' });
//     }

//     // Check if vehicle number already exists
//     const existingVehicle = await Driver.findOne({ 
//       vehicleNumber: vehicleNumber.toUpperCase() 
//     });
//     if (existingVehicle) {
//       return res.status(400).json({ message: 'Vehicle number already registered' });
//     }

//     // Create user account
//     const user = new User({
//       name,
//       email: email.toLowerCase(),
//       password,
//       phone,
//       role: 'driver',
//       isActive: true
//     });

//     await user.save();
//     console.log('User created:', user._id);

//     // Determine vehicle type
//     let finalVehicleType = vehicleType;
//     if (!finalVehicleType && vehicleTypes && vehicleTypes.length > 0) {
//       finalVehicleType = primaryVehicle || vehicleTypes[0];
//     }
//     if (!finalVehicleType) {
//       finalVehicleType = 'car'; // default
//     }

//     // Create driver profile
//     const driverData = {
//       user: user._id,
//       licenseNumber: licenseNumber.toUpperCase(),
//       vehicleType: finalVehicleType.toLowerCase(),
//       vehicleNumber: vehicleNumber.toUpperCase(),
//       vehicleModel,
//       isApproved: false,
//       isAvailable: false,
//       rating: 0,
//       totalRatings: 0,
//       totalTrips: 0
//     };

//     // Add optional fields
//     if (vehicleTypes && vehicleTypes.length > 0) {
//       driverData.vehicleTypes = vehicleTypes.map(v => v.toLowerCase());
//     }
//     if (primaryVehicle) {
//       driverData.primaryVehicle = primaryVehicle.toLowerCase();
//     }

//     console.log('Creating driver with data:', driverData);

//     const driver = new Driver(driverData);
//     await driver.save();
//     console.log('Driver created:', driver._id);

//     // Try to send email but don't fail if it doesn't work
//     try {
//       await emailService.notifyAdminNewDriver({
//         driverName: name,
//         email,
//         licenseNumber: licenseNumber.toUpperCase(),
//         vehicleType: finalVehicleType
//       });
//     } catch (emailError) {
//       console.log('Email notification failed (non-critical):', emailError.message);
//     }

//     res.status(201).json({
//       success: true,
//       message: 'Driver registration submitted for approval',
//       driverId: driver._id
//     });

//   } catch (error) {
//     console.error('Driver registration error:', error);
    
//     // If user was created but driver creation failed, try to clean up
//     if (req.body.email) {
//       try {
//         await User.findOneAndDelete({ email: req.body.email.toLowerCase() });
//         console.log('Cleaned up orphaned user account');
//       } catch (cleanupError) {
//         console.error('Cleanup failed:', cleanupError);
//       }
//     }
    
//     res.status(500).json({ 
//       message: 'Registration failed. Please try again.', 
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // Login
// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Find user
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(401).json({ message: 'Invalid credentials' });
//     }

//     // Check password
//     const isMatch = await user.comparePassword(password);
//     if (!isMatch) {
//       return res.status(401).json({ message: 'Invalid credentials' });
//     }

//     // Check driver approval status
//     if (user.role === 'driver') {
//       const driver = await Driver.findOne({ user: user._id });
//       if (!driver || !driver.isApproved) {
//         return res.status(403).json({ message: 'Driver account pending approval' });
//       }
//     }

//     // Generate token
//     const token = generateToken(user._id, user.role);

//     res.json({
//       message: 'Login successful',
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role
//       }
//     });
//   } catch (error) {
//     console.error('Login error:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // Admin login with fixed credentials
// exports.adminLogin = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Check fixed admin credentials
//     if (email === 'admin' && password === 'admin@123') {
//       // Check if admin user exists in database
//       let adminUser = await User.findOne({ email: 'admin@admin.com', role: 'admin' });
      
//       if (!adminUser) {
//         // Create admin user if doesn't exist
//         adminUser = new User({
//           name: 'Administrator',
//           email: 'admin@admin.com',
//           password: 'admin@123',
//           phone: '0000000000',
//           role: 'admin',
//           isActive: true
//         });
//         await adminUser.save();
//       }

//       const token = generateToken(adminUser._id, 'admin');

//       return res.json({
//         message: 'Admin login successful',
//         token,
//         user: {
//           id: adminUser._id,
//           name: adminUser.name,
//           email: adminUser.email,
//           role: 'admin'
//         }
//       });
//     }

//     res.status(401).json({ message: 'Invalid admin credentials' });
//   } catch (error) {
//     console.error('Admin login error:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // Get current user info
// exports.getCurrentUser = async (req, res) => {
//   try {
//     const user = await User.findById(req.userId).select('-password');
    
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     res.json({
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         phone: user.phone,
//         role: user.role,
//         isActive: user.isActive
//       }
//     });
//   } catch (error) {
//     console.error('Get current user error:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

const User = require('../models/User');
const Driver = require('../models/Driver');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const emailService = require('../utils/emailService');

// Generate JWT token
const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// User registration
exports.registerUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const { name, email, password, phone } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) return res.status(400).json({ message: 'Email already registered' });

    const user = new User({
      name,
      email: email.toLowerCase(),
      password,
      phone,
      role: 'user',
      isActive: true
    });

    await user.save();

    const token = generateToken(user._id, 'user');

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (error) {
    console.error('User registration error:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

// Driver registration
exports.registerDriver = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: 'Validation failed', errors: errors.array() });

    const { name, email, password, phone, licenseNumber, vehicleNumber, vehicleModel, vehicleType, vehicleTypes, primaryVehicle } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) return res.status(400).json({ message: 'Email already registered' });

    const existingDriverLicense = await Driver.findOne({ licenseNumber: licenseNumber.toUpperCase() });
    if (existingDriverLicense) return res.status(400).json({ message: 'License number already registered' });

    const existingVehicleNumber = await Driver.findOne({ vehicleNumber: vehicleNumber.toUpperCase() });
    if (existingVehicleNumber) return res.status(400).json({ message: 'Vehicle number already registered' });

    // Create user account
    const user = new User({ name, email: email.toLowerCase(), password, phone, role: 'driver', isActive: true });
    await user.save();

    // Determine vehicle type
    let finalVehicleType = vehicleType || (vehicleTypes && vehicleTypes.length ? primaryVehicle || vehicleTypes[0] : 'car');

    const driverData = {
      user: user._id,
      licenseNumber: licenseNumber.toUpperCase(),
      vehicleNumber: vehicleNumber.toUpperCase(),
      vehicleModel,
      vehicleType: finalVehicleType.toLowerCase(),
      isApproved: false,
      isAvailable: false,
      rating: 0,
      totalRatings: 0,
      totalTrips: 0
    };

    if (vehicleTypes && vehicleTypes.length) driverData.vehicleTypes = vehicleTypes.map(v => v.toLowerCase());
    if (primaryVehicle) driverData.primaryVehicle = primaryVehicle.toLowerCase();

    const driver = new Driver(driverData);
    await driver.save();

    // Notify admin (optional)
    try {
      await emailService.notifyAdminNewDriver({ driverName: name, email, licenseNumber: licenseNumber.toUpperCase(), vehicleType: finalVehicleType });
    } catch (err) {
      console.log('Email notification failed:', err.message);
    }

    res.status(201).json({ success: true, message: 'Driver registration submitted for approval', driverId: driver._id });
  } catch (error) {
    console.error('Driver registration error:', error);
    // Cleanup user if driver creation failed
    if (req.body.email) await User.findOneAndDelete({ email: req.body.email.toLowerCase() });
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    if (user.role === 'driver') {
      const driver = await Driver.findOne({ user: user._id });
      if (!driver || !driver.isApproved) return res.status(403).json({ message: 'Driver account pending approval' });
    }

    const token = generateToken(user._id, user.role);

    res.json({ message: 'Login successful', token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin login
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (email === 'admin' && password === 'admin@123') {
      let adminUser = await User.findOne({ email: 'admin@admin.com', role: 'admin' });
      if (!adminUser) {
        adminUser = new User({ name: 'Administrator', email: 'admin@admin.com', password: 'admin@123', phone: '0000000000', role: 'admin', isActive: true });
        await adminUser.save();
      }
      const token = generateToken(adminUser._id, 'admin');
      return res.json({ message: 'Admin login successful', token, user: { id: adminUser._id, name: adminUser.name, email: adminUser.email, role: 'admin' } });
    }

    res.status(401).json({ message: 'Invalid admin credentials' });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, isActive: user.isActive } });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
