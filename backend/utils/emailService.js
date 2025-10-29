// Email service utility (simplified version without actual email sending)
const nodemailer = require('nodemailer');

// For now, just log the emails instead of sending them
exports.notifyAdminNewDriver = async (driverDetails) => {
  try {
    console.log('Email notification (not sent in dev):', {
      to: 'admin@travelbooking.com',
      subject: 'New Driver Registration',
      driverDetails
    });
    return true;
  } catch (error) {
    console.error('Email error:', error);
    return false;
  }
};

exports.notifyDriverApproval = async (driverDetails) => {
  try {
    console.log('Email notification (not sent in dev):', {
      to: driverDetails.driverEmail,
      subject: 'Driver Application Approved',
      driverDetails
    });
    return true;
  } catch (error) {
    console.error('Email error:', error);
    return false;
  }
};
