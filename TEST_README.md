# Backend Testing Guide

## Test Files

Created test files:
- **[__tests__/farms.test.js](__tests__/farms.test.js)** - Farm API tests
- **[__tests__/users.test.js](__tests__/users.test.js)** - User API tests
- **[__tests__/produce.test.js](__tests__/produce.test.js)** - Produce API tests

## Running Tests

### 1. Run all tests
```bash
npm test
```

### 2. Watch mode (auto-rerun on code changes)
```bash
npm run test:watch
```

### 3. Generate coverage report
```bash
npm run test:coverage
```

## Test Coverage

### Farms API
- ✅ GET /api/farms - Get all farms
- ✅ POST /api/farms - Create new farm (requires auth)
- ✅ GET /api/farms/:id - Get farm by ID
- ✅ PATCH /api/farms/:id - Update farm
- ✅ DELETE /api/farms/:id - Delete farm

### Users API
- ✅ GET /api/users - Get all users
- ✅ POST /api/users - Create new user
- ✅ PATCH /api/users/:id - Update user
- ✅ 404 error handling

### Produce API
- ✅ GET /api/produce - Get all produce
- ✅ POST /api/produce - Add produce to farm
- ✅ GET /api/produce/:id - Get specific produce
- ✅ PATCH /api/produce/:id - Update produce
- ✅ DELETE /api/produce/:id - Delete produce

## Important Notes

### 1. Authentication Tests
Some endpoints require JWT authentication (like POST /api/farms). Currently:
- Tests expect 401 status when auth is enabled
- To test with auth, provide a valid token:

```javascript
const token = 'your_test_jwt_token';
const res = await request(app)
  .post('/api/farms')
  .set('Authorization', `Bearer ${token}`)
  .send(data);
```

### 2. Test Database
- Use a separate test database (configured in `.env.test`)
- Tests automatically clean up created data
- Never run tests on production database!

### 3. Firebase Mock
- Firebase Admin SDK is mocked to avoid auth errors during tests
- For real Firebase testing, configure a test Firebase project

## CI/CD Integration

Use in GitHub Actions or other CI tools:

```yaml
- name: Run tests
  run: |
    cd backend
    npm install
    npm test
```

## Extending Tests

### Add new test file
Create `*.test.js` files in `__tests__/` directory:

```javascript
const request = require('supertest');
const app = require('../index');

describe('Your API', () => {
  it('should do something', async () => {
    const res = await request(app).get('/api/endpoint');
    expect(res.status).toBe(200);
  });
});
```

### Common assertions
```javascript
expect(res.status).toBe(200);
expect(res.body).toHaveProperty('_id');
expect(Array.isArray(res.body)).toBe(true);
expect(res.body.name).toBe('Expected Name');
```

## Next Steps

1. **Enhance tests** - Add more edge cases and error handling tests
2. **Integration tests** - Test complete user flows
3. **Performance tests** - Test API response times
4. **Security tests** - Test authentication and authorization logic
