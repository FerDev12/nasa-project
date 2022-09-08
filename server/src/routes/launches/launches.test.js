const request = require('supertest');
const app = require('../../app');

const { mongoConnect, mongoDisconnect } = require('../../services/mongo');

describe('Test Launches API', () => {
  beforeAll(async () => await mongoConnect());

  afterAll(async () => await mongoDisconnect());

  describe('Test GET /v1/launches', () => {
    test('It should respond with 200 success', async () => {
      const res = await request(app)
        .get('/v1/launches')
        .expect('Content-Type', /json/)
        .expect(200);
    });
  });

  describe('Test POST /v1/launches', () => {
    const completeLaunchData = {
      mission: 'USS Enterprise',
      rocket: 'NCC 1701-D',
      target: 'Kepler-442 b',
      launchDate: 'January 4, 2028',
    };
    const noDateLaunchData = {
      ...completeLaunchData,
      launchDate: undefined,
    };
    const invalidDateLaunchData = {
      ...completeLaunchData,
      launchDate: 'This is not a date',
    };

    test('It should respond with 201 created', async () => {
      // Supertest
      const res = await request(app)
        .post('/v1/launches')
        .send(completeLaunchData)
        .expect('Content-Type', /json/)
        .expect(201);

      const reqDate = new Date(completeLaunchData.launchDate);

      // Jest
      expect(res.body).toMatchObject({
        ...completeLaunchData,
        launchDate: reqDate.toISOString(),
      });
    });

    test('It should catch missing required properties', async () => {
      const res = await request(app)
        .post('/v1/launches')
        .send(noDateLaunchData)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(res.body).toStrictEqual({
        error: 'Missing required launch data',
      });
    });

    test('It should catch invalid dates', async () => {
      const res = await request(app)
        .post('/v1/launches')
        .send(invalidDateLaunchData)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(res.body).toStrictEqual({
        error: 'Invalid launch date',
      });
    });
  });
});
