const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;

/**
 * File Summary:
 * - MongoDB se connection establish karta hai
 * - app start hone se pehle DB connect hoti hai
 */
