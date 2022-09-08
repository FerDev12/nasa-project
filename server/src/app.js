const express = require('express');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const apiRouter = require('./routes/api.js');

const app = express();

// MIDDLEWARE
// CORS
app.use(
  cors({
    // Allow requests from this origin
    origin: 'http://localhost:3000',
  })
);
// logs ouptu format
app.use(morgan('combined'));
// parse json responses
app.use(express.json());
// server static files from...
app.use(express.static(path.join(__dirname, '..', 'public')));

// Routes
app.use('/v1', apiRouter); // Version 1
// app.use('/v2', apiRouterV2); // If we had a second api version

app.get('/*', (_, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

module.exports = app;
