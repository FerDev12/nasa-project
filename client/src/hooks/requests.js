const API_URL = 'http://localhost:8000/v1';

async function httpGetPlanets() {
  // TODO: Once API is ready.
  // Load planets and return as JSON.
  try {
    const res = await fetch(`${API_URL}/planets`);

    if (!res.ok) throw new Error('Failed to fetch planets');

    const planets = await res.json();

    return planets;
  } catch (err) {
    console.error(err);
  }
}

async function httpGetLaunches() {
  // TODO: Once API is ready.
  // Load launches, sort by flight number, and return as JSON.
  try {
    const res = await fetch(`${API_URL}/launches`);

    if (!res.ok) throw new Error('Failed to fetch planets');

    const launches = await res.json();

    return launches.sort((a, b) => a.flightNumber - b.flightNumber);
  } catch (err) {
    console.error(err);
  }
}

async function httpSubmitLaunch(launch) {
  // TODO: Once API is ready.
  // Submit given launch data to launch system.
  try {
    const res = await fetch(`${API_URL}/launches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(launch),
    });

    return { ok: res.ok };
  } catch (err) {
    return { ok: false };
  }
}

async function httpAbortLaunch(id) {
  // TODO: Once API is ready.
  // Delete launch with given ID.
  try {
    const res = await fetch(`${API_URL}/launches/${id}`, {
      method: 'DELETE',
    });

    return { ok: res.ok };
  } catch (err) {
    console.log(err);
    return { ok: false };
  }
}

export { httpGetPlanets, httpGetLaunches, httpSubmitLaunch, httpAbortLaunch };
