const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const FarmModel = require('../model/farmModel');

// Mock Firebase
jest.mock('../config/firebase', () => ({
  initializeFirebase: jest.fn()
}));

describe('Produce API', () => {
  let testFarm;

  // Create a test farm before each test
  beforeEach(async () => {
    testFarm = await FarmModel.create({
      name: 'Test Farm for Produce',
      address: '123 Produce St',
      user_id: 'test',
      produce: []
    });
  });

  afterEach(async () => {
    await FarmModel.deleteMany({ name: /test/i });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('GET /api/produce', () => {
    it('should return all produce from all farms', async () => {
      const res = await request(app).get('/api/produce');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('POST /api/produce', () => {
    it('should add produce to a farm', async () => {
      const newProduce = {
        farm_id: testFarm._id,
        name: 'Test Tomatoes',
        price: 5.99,
        unit: 'kg',
        description: 'Fresh test tomatoes'
      };

      const res = await request(app)
        .post('/api/produce')
        .send(newProduce);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.name).toBe('Test Tomatoes');
      expect(res.body).toHaveProperty('farm_id');
      expect(res.body).toHaveProperty('farm_name');
    });

    it('should return 404 for non-existent farm', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const newProduce = {
        farm_id: fakeId,
        name: 'Test Produce'
      };

      const res = await request(app)
        .post('/api/produce')
        .send(newProduce);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Farm not found');
    });
  });

  describe('GET /api/produce/:id', () => {
    it('should get a specific produce item', async () => {
      // Add produce to the test farm
      testFarm.produce.push({
        _id: 'test_produce_123',
        name: 'Test Carrots',
        price: 3.99
      });
      await testFarm.save();

      const res = await request(app).get('/api/produce/test_produce_123');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0].name).toBe('Test Carrots');
    });

    it('should return 404 for non-existent produce', async () => {
      const res = await request(app).get('/api/produce/nonexistent_id');

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Produce not found');
    });
  });

  describe('PATCH /api/produce/:id', () => {
    it('should update a produce item', async () => {
      testFarm.produce.push({
        _id: 'test_update_produce',
        name: 'Old Name',
        price: 5.00
      });
      await testFarm.save();

      const res = await request(app)
        .patch('/api/produce/test_update_produce')
        .send({ name: 'New Name', price: 6.00 });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0].name).toBe('New Name');
      expect(res.body[0].price).toBe(6.00);
    });
  });

  describe('DELETE /api/produce/:id', () => {
    it('should delete a produce item', async () => {
      testFarm.produce.push({
        _id: 'test_delete_produce',
        name: 'To Delete',
        price: 4.00
      });
      await testFarm.save();

      const res = await request(app).delete('/api/produce/test_delete_produce');

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Produce deleted successfully');
      expect(res.body).toHaveProperty('deletedProduce');

      // Verify produce is deleted
      const updatedFarm = await FarmModel.findById(testFarm._id);
      const foundProduce = updatedFarm.produce.find(p => p._id === 'test_delete_produce');
      expect(foundProduce).toBeUndefined();
    });
  });
});
