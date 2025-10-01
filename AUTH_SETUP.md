# Authentication Setup Guide

## Backend Setup

1. **Get Firebase Service Account Key**:
   - Go to Firebase Console → Project Settings → Service Accounts
   - Click "Generate new private key"
   - Download the JSON file

2. **Set Environment Variables**:
   - Copy `.env.example` to `.env`
   - From the downloaded JSON, copy:
     - `project_id` → `FIREBASE_PROJECT_ID`
     - `private_key` → `FIREBASE_PRIVATE_KEY`
     - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - Generate a random JWT_SECRET

3. **Protected Routes**:
   - `POST /api/farms` - Only farmers can create farms
   - `PATCH /api/farms/:id` - Any authenticated user can update
   - `DELETE /api/farms/:id` - Any authenticated user can delete
   - `GET` routes remain public

## Frontend Updates

1. **Use the new authenticated API**:
   ```javascript
   // Replace in your components:
   import { getFarms, postFarm } from '../utils/auth-api';
   ```

2. **The auth token is automatically added to requests**

## Testing

1. **Test without token**:
   ```bash
   curl -X POST https://farmly.onrender.com/api/farms \
     -H "Content-Type: application/json" \
     -d '{"name": "Test Farm"}'
   # Should return 401: No token provided
   ```

2. **Test with token** (from app console):
   ```javascript
   const token = await auth.currentUser.getIdToken();
   console.log(token);
   ```

## User Types

To implement farmer-only routes, you need to:
1. Set custom claims in Firebase
2. Or check user type from your database in the middleware