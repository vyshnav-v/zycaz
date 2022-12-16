const mongoose = require('mongoose');
const User = require('./userModel');

const AddressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
  },
  name: {
    type: String,
    required: true,
  },
  house: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  landmark: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  pin: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  mobileno: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('Address', AddressSchema);
