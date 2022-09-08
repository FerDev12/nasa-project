const mongoose = require('mongoose');

const { Schema, ObjectId } = mongoose;

const launchesSchema = new Schema({
  flightNumber: {
    type: Number,
    required: true,
    unique: true,
  },
  mission: {
    type: String,
    required: true,
  },
  rocket: {
    type: String,
    required: true,
  },
  launchDate: {
    type: Date,
    required: true,
  },
  target: {
    type: String,
  },
  customers: {
    type: [String],
  },
  upcoming: {
    type: Boolean,
    required: true,
  },
  success: {
    type: Boolean,
    required: true,
    default: true,
  },
});

// Connects launchesSchema with the "launches" collection in mongoDB
module.exports = mongoose.model('Launch', launchesSchema);
