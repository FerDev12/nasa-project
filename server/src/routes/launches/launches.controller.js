const {
  getAllLaunches,
  existsLaunchWithId,
  abortLaunchById,
  scheduleNewLaunch,
} = require('../../models/launches/launches.model');
const { getPagination } = require('../../services/query');

async function httpGetAllLaunches(req, res) {
  const pagination = getPagination(req.query);

  return res.status(200).json(await getAllLaunches(pagination));
}

async function httpAddNewLaunch(req, res) {
  const newLaunch = req.body;
  const { mission, rocket, launchDate, target } = newLaunch;

  if (!mission || !rocket || !launchDate || !target)
    return res.status(400).json({
      error: 'Missing required launch data',
    });

  newLaunch.launchDate = new Date(launchDate);

  if (
    newLaunch.launchDate.toString() === 'Invalid Date' ||
    isNaN(newLaunch.launchDate)
  )
    return res.status(400).json({ error: 'Invalid launch date' });

  const launch = await scheduleNewLaunch(newLaunch);

  launch['__v'] = undefined;

  return res.status(201).json(launch);
}

async function httpAbortLaunch(req, res) {
  const { launchId } = req.params;

  const existsLaunch = await existsLaunchWithId(+launchId);

  // if launch doesn´t exist
  if (!existsLaunch)
    return res.status(404).json({
      error: 'Launch not found!',
    });

  // if launch does exist
  const aborted = await abortLaunchById(+launchId);

  if (!aborted) {
    return res
      .status(400)
      .json({ error: 'There was an error aborting the mission' });
  }

  return res.status(200).json({
    message: 'Mission aborted',
    ok: true,
  });
}

module.exports = { httpGetAllLaunches, httpAddNewLaunch, httpAbortLaunch };
