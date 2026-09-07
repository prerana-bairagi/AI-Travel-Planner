import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Middleware to protect routes:
 * 1. Checks for Bearer token in the Authorization header and splits it
 * 2. Verifies the JWT signature
 * 3. Finds the user in the database
 * 4. Attaches the user object to `req.user`
 */
const authMiddleware = async (req, res, next) => {
    let token;
    const authHeader = req.headers.authorization;

    // 1. Check for 'Bearer <token>' in the Authorization header
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    }

    // 2. Reject if token does not exist
    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token provided' });
    }

    try {
        // 3. Verify the token using your secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 4. Find the user by ID stored in payload (password excluded by default in schema)
        const currentUser = await User.findById(decoded.userId);
        if (!currentUser) {
            return res.status(401).json({ message: 'User belonging to this token no longer exists' });
        }

        // 5. Attach user document to request object for downstream controllers
        req.user = currentUser;
        next();
    } 
    catch (error) {
        console.error('JWT Verification Error:', error.message);

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token has expired, please try again' });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token, please try again' });
        }

        return res.status(500).json({ message: 'Internal server error during authentication' });
    }
};

export default authMiddleware;