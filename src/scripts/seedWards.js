const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Ward = require('../models/Ward.model.js');
const db = require('../config/db.js');

const wardsPath = path.join(__dirname, '..', 'data', 'wards.json');
const wards = JSON.parse(fs.readFileSync(wardsPath, 'utf-8'));

const seedWards = async () => {
  try {
    await db.connectDB();
    await Ward.default.deleteMany({});
    console.log('Wards collection cleared');

    await Ward.default.insertMany(wards);
    console.log('Wards have been added to the database');
  } catch (error) {
    console.error('Error seeding wards:', error);
  } finally {
    mongoose.disconnect();
    console.log('Disconnected from database');
  }
};

seedWards();
