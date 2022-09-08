const mongoose = require('mongoose');

require('dotenv').config();

const MONGO_URL = process.env.MONGO_URL.replace(
  '<user>',
  process.env.MONGO_USER
).replace('<password>', process.env.MONGO_PASS);

mongoose.connection.once('open', () => {
  console.log('MongoDB connection ready!');
});

mongoose.connection.on('error', (err) => {
  // Log any database connection errors
  console.error(err);
});

const mongoConnect = async () => {
  // Connect to database
  await mongoose.connect(MONGO_URL);
};

const mongoDisconnect = async () => {
  // Disconnect from database
  await mongoose.disconnect();
};

module.exports = { mongoConnect, mongoDisconnect };
