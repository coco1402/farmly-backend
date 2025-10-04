const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const UserModel = require('../model/userModel');

// Mock Firebase
jest.mock('../config/firebase', () => ({
  initializeFirebase: jest.fn()
}));

describe('Users API', () => {
  afterEach(async () => {
    await UserModel.deleteMany({ email: /test@/i });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('GET /api/users', () => {
    it('should return all users', async () => {
      const res = await request(app).get('/api/users');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('POST /api/users', () => {
    it('should create a new user', async () => {
      const newUser = {
        user_id: 'test_user_123',
        username: 'testuser',
        email: 'test@example.com',
        password: 'testpass123',
        postcode: '12345',
        user_type: 'farmer'
      };

      const res = await request(app)
        .post('/api/users')
        .send(newUser);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.username).toBe('testuser');
      expect(res.body.email).toBe('test@example.com');
    });

    it('should return error for invalid user data', async () => {
      const invalidUser = {
        username: 'testuser'
        // missing required fields
      };

      const res = await request(app)
        .post('/api/users')
        .send(invalidUser);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('PATCH /api/users/:id', () => {
    it('should update a user', async () => {
      const testUser = await UserModel.create({
        user_id: 'test_update_123',
        username: 'updatetest',
        email: 'test_update@example.com',
        password: 'pass123'
      });

      const res = await request(app)
        .patch(`/api/users/${testUser.user_id}`)
        .send({ username: 'updated_username' });

      expect(res.status).toBe(200);
      expect(res.body.username).toBe('updated_username');
    });

    it('should return 404 for non-existent user', async () => {
      const res = await request(app)
        .patch('/api/users/nonexistent_id')
        .send({ username: 'test' });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('User not found');
    });
  });
});
