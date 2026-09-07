import User from '../models/User.js';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';



const signToken = (id) => {
    return jwt.sign({ userId: id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    })
}

/**
 * Utility function to sanitize the user object before sending it to the client.
 * Strips sensitive fields like passwords and selects only public/safe properties.
 */
const filterUserResponse = (user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    country: user.country,
    currency: user.currency,
    plan: user.plan || "free",
});

/**
 * Handles user registration:
 * 1. Validates incoming request data
 * 2. Checks for existing user accounts by email
 * 3. Creates and persists the new user document
 * 4. Returns a sanitized user object response
 */
const register = async (req, res) => {
    // 1. Check for express-validator middleware errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { name, email, password, country } = req.body;

        // 2. Prevent duplicate user registrations with the same email
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "This email is already in use" });
        }

        // 3. Create and save new user document in MongoDB
        const newUser = await User.create({ name, email, password, country });

        const token = signToken(newUser._id);

        // 4. Send a single success response with filtered user data
        return res.status(201).json({
            status: "success",
            message: "User registered successfully",
            token,
            data: filterUserResponse(newUser),
        });

    }
    catch (error) {
        // 5. Catch any unhandled database or server errors
        console.error("Registration Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


/**
 * Handles user login and credential verification.
 * - Checks express-validator errors
 * - Fetches user including hidden password field
 * - Compares bcrypt password hashes
 * - Returns JWT and user profile
 */
const login = async (req, res) => {
    // 1. Check for request validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { email, password } = req.body;

        // 2. Fetch user by email, explicitly including password (select: false in schema)
        const user = await User.findOne({ email }).select("+password");

        // 3. Verify user existence and compare password hash
        // Note the return statement to stop execution if invalid
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: "Invalid Credentials" });
        }

        // 4. Generate auth token
        const token = signToken(user._id);

        // 5. Return sanitized user data and token
        return res.json({
            status: "success",
            message: "Login successful",
            token,
            user: filterUserResponse(user),
        });
    }
    catch (error) {
        // Catch any unhandled database or server errors
        console.error("Login Error:", error);
        return res.status(500).json({ message: "Login Failed, please try again later" });
    }
};


/**
 * Retrieves the authenticated user's profile details.
 * - Expects an authentication middleware (e.g., verifyToken) to have decoded
 *   the JWT and attached the user document to `req.user`.
 * - Validates the presence of `req.user`.
 * - Returns the sanitized user profile data.
 */
const getMe = async (req, res) => {
    try {
        // 1. Ensure the user object was populated by the authentication middleware
        if (!req.user) {
            return res.status(404).json({ error: "User not found" });
        }

        // 2. Return the sanitized user profile
        return res.status(200).json({
            status: "success",
            user: filterUserResponse(req.user),
        });
    } catch (error) {
        // 3. Catch unexpected errors during serialization or execution
        console.error("Fetch Profile Error:", error);
        return res.status(500).json({ error: "Failed to fetch profile" });
    }
};


const logout = async (req, res) => {
    res.status(200).json({ message: "Logout successful" });
};

export default {
    register,
    login,
    getMe,
    logout,
};