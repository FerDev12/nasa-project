const { Router } = require('express');
const {
  httpGetAllLaunches,
  httpAddNewLaunch,
  httpAbortLaunch,
} = require('./launches.controller');

const launchesRouter = Router();

launchesRouter.route('/').get(httpGetAllLaunches).post(httpAddNewLaunch);

launchesRouter.delete('/:launchId', httpAbortLaunch);

module.exports = launchesRouter;
