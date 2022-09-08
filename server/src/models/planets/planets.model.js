const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse');
const planetsMongo = require('./planets.mongo');

const isHabitablePlanet = (planet) => {
  return (
    planet['koi_disposition'] === 'CONFIRMED' &&
    planet['koi_insol'] > 0.36 &&
    planet['koi_insol'] < 1.11 &&
    planet['koi_prad'] < 1.6
  );
};

const parser = parse({ comment: '#', columns: true });

const loadPlanetsData = () => {
  return new Promise((resolve, reject) => {
    const keplerData = path.join(
      __dirname,
      '..',
      '..',
      '..',
      'data',
      'kepler_data.csv'
    );

    fs.createReadStream(keplerData)
      .pipe(parser)
      .on('data', async (planetData) => {
        isHabitablePlanet(planetData) && (await savePlanet(planetData));
      })
      .on('error', (err) => {
        console.log(err);
        reject(err);
      })
      .on('end', async () => {
        const countPlanetsFound = (await getAllPlanets()).length;
        console.log(`${countPlanetsFound} HABITABLE PLANETS FOUND!`);
        resolve();
      });
  });
};

async function getAllPlanets() {
  const planets = await planetsMongo.find({}, { __v: 0, _id: 0 }); // filter out __v and _id
  return planets;
}

async function savePlanet(planetData) {
  const planet = { keplerName: planetData.kepler_name };

  // TODO: Replace with upsert (insert + update) operation
  // upsert adds a document only if it doesn't already exist in the DB
  // the updateOne function serves as an upsert operation
  // The first argument checks if the document already exists
  // The second argument creates the document if not existent,
  // The third argument is a configuration object where we set upsert to true

  try {
    await planetsMongo.updateOne(planet, planet, { upsert: true });
  } catch (err) {
    console.error(`Could not save planet ${err}`);
  }
}

module.exports = {
  loadPlanetsData,
  getAllPlanets,
};
