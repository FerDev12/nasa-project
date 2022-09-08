const http = require('http');
const app = require('./app');
require('dotenv').config();

const { mongoConnect } = require('./services/mongo');
// Make planets data available to any request
const { loadPlanetsData } = require('./models/planets/planets.model');
const { loadLaunchesData } = require('./models/launches/launches.model');

const PORT = process.env.PORT || 8000;

const server = http.createServer(app);

const startServer = async () => {
  // Connect to database
  await mongoConnect();
  // Load planets from database
  await loadPlanetsData();
  // Load SpaceX launch data from database
  await loadLaunchesData();

  // Start listening for events on server
  server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}...`);
  });
};

startServer();
