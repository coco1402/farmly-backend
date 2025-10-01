const { admin } = require('../config/firebase');

// Middleware to verify Firebase Authentication tokens
const verifyToken = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'No token provided. Authorization header must be: Bearer <token>' 
      });
    }

    // Extract token from "Bearer <token>"
    const token = authHeader.split('Bearer ')[1];

    // Verify token with Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Add user info to request object
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
      customClaims: decodedToken
    };

    // Continue to the next middleware/route handler
    next();
  } catch (error) {
    // Token verification failed

    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ error: 'Token expired' });
    } else if (error.code === 'auth/id-token-revoked') {
      return res.status(401).json({ error: 'Token revoked' });
    } else if (error.code === 'auth/argument-error') {
      return res.status(400).json({ error: 'Invalid token format' });
    }
    
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Middleware to check if user is a farmer
const requireFarmer = async (req, res, next) => {
  try {
    // This assumes you store user type in Firebase custom claims
    // or you need to look it up from your database
    if (req.user.customClaims.userType !== 'farmer') {
      return res.status(403).json({ 
        error: 'Access denied. Farmer account required.' 
      });
    }
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Access denied' });
  }
};

module.exports = {
  verifyToken,
  requireFarmer
};