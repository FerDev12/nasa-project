const mongoose = require('mongoose');

const { Schema } = mongoose;

const planetSchmea = new Schema({
  keplerName: {
    type: String,
    required: true,
  },
});

// Connects schema with the mongodb collection
module.exports = mongoose.model('Planet', planetSchmea);
