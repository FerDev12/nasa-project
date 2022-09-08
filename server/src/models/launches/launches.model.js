const axios = require('axios');
const launchesMongo = require('./launches.mongo');
const planetsMongo = require('../planets/planets.mongo');

const DEFAULT_FLIGHT_NUMBER = 100;

const getLatestSpaceXLaunch = async () => {
  try {
    const res = await axios.get(
      'https://api.spacexdata.com/v4/launches/latest'
    );

    if (res.status !== 200) {
      // Do something...
      console.error('Could not verify latest flight');
      throw new Error('Error veryfying existing launch data');
    }

    const latestLaunch = res.data;

    return latestLaunch;
  } catch (err) {
    console.error(err);
  }
};

const findLaunch = async (filter) => {
  const launch = await launchesMongo.findOne(filter);
  return launch;
};

const existsLaunchWithId = async (launchId) => {
  const launch = await findLaunch({ flightNumber: launchId });
  return launch ? true : false;
};

const getLatestFlightNumber = async () => {
  const latestFlightNumber = (await launchesMongo.countDocuments()) + 99;

  if (latestFlightNumber < 100) return DEFAULT_FLIGHT_NUMBER;

  console.log(latestFlightNumber);

  return latestFlightNumber;
};

const populateLaunches = async () => {
  console.log('Downloading launch data!');
  try {
    const res = await axios.post(
      'https://api.spacexdata.com/v4/launches/query',
      {
        query: {},
        options: {
          pagination: false,
          populate: [
            {
              path: 'rocket',
              select: { name: 1 },
            },
            {
              path: 'payloads',
              select: { customers: 1 },
            },
          ],
        },
      }
    );

    if (res.status !== 200) {
      console.log('Problem downloading launch data');
      throw new Error('Launch data download failed!');
    }

    const launchesDocs = res.data.docs;

    for (const launchDoc of launchesDocs) {
      const customers = launchDoc.payloads.flatMap(
        (payload) => payload.customers
      );
      const success = launchDoc.success === null ? true : launchDoc.success;

      const launch = {
        flightNumber: launchDoc.flight_number,
        mission: launchDoc.name,
        rocket: launchDoc.rocket.name,
        launchDate: new Date(launchDoc.date_local),
        customers,
        upcoming: launchDoc.upcoming,
        success,
      };

      console.log(`${launch.flightNumber} ${launch.mission}`);
      await saveLaunch(launch);
    }
  } catch (err) {
    console.error(err);
  }
};

async function loadLaunchesData() {
  try {
    const latestLaunch = await getLatestSpaceXLaunch();

    if (await existsLaunchWithId(latestLaunch.flight_number)) {
      console.log('Launch data already loaded');
      return;
    }

    await populateLaunches();
  } catch (err) {
    console.log(err);
  }
}

async function getAllLaunches({ limit, skip }) {
  const launches = await launchesMongo
    .find({}, { _id: 0, __v: 0 })
    .sort({ flightNumber: -1 })
    .skip(skip)
    .limit(limit);

  return launches;
}

async function saveLaunch(launch) {
  const existingLaunch = await launchesMongo.findOne({
    flightNumber: launch.flightNumber,
  });

  if (!existingLaunch) {
    const createdLaunch = await launchesMongo.create(launch);
    return createdLaunch;
  }

  return existingLaunch;
}

async function scheduleNewLaunch(launch) {
  const planet = await planetsMongo.findOne({ keplerName: launch.target });

  // As a best practice, always use the built-in Error() object constructor
  if (!planet) throw new Error('No matching target planet was found!');

  const newFlightNumber = (await getLatestFlightNumber()) + 1;

  const newLaunch = {
    ...launch,
    flightNumber: newFlightNumber,
    customers: ['SpaceX', 'NASA'],
    upcoming: true,
    success: true,
  };

  const savedLaunch = await saveLaunch(newLaunch);

  return savedLaunch;
}

async function abortLaunchById(launchId) {
  const abortedLaunch = await launchesMongo.updateOne(
    { flightNumber: launchId },
    { upcoming: false, success: false }
  );

  return (
    abortedLaunch.acknowledged === true && abortedLaunch.modifiedCount === 1
  );
}

module.exports = {
  loadLaunchesData,
  existsLaunchWithId,
  getAllLaunches,
  scheduleNewLaunch,
  abortLaunchById,
};
