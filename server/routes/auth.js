import express from 'express';
import authController from '../controllers/authController.js';
import authMiddleware from '../middleware/authMw.js';
import { body, validationResult } from 'express-validator';


const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ status: 'Error', errors: errors.array() });
    };
    next();
}

const registerValidation = [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please use a valid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('country').notEmpty().withMessage('Country is required'),
];

const loginValidation = [
    body('email').isEmail().withMessage('Please use a valid email address'),
    body('password').notEmpty().withMessage('Password is required'),
];



const router = express.Router();

router.post('/register', registerValidation, validate, authController.register);
router.post('/login', loginValidation, validate, authController.login);
// User must be login(auto login using cookie)
router.get('/me', authMiddleware, authController.getMe);
router.post('/logout', authController.logout);




export default router;