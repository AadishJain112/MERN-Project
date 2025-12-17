// backend/scripts/migrate-add-teacher-role.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const User = require('../models/User');

const migrate = async () => {
  try {
    // Connect to database
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/cdstar';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Update all users to have permissions field (default empty array)
    const result = await User.updateMany(
      { permissions: { $exists: false } },
      { $set: { permissions: [] } }
    );
    console.log(`Updated ${result.modifiedCount} users with permissions field`);

    // Ensure rollNumber field exists (add index if needed)
    // Note: The index is already added in the User model schema
    console.log('Migration completed successfully');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrate();

