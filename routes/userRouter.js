import express from 'express';
import { changeUserPassword, login, sendUserPasswordResetEmail, userPasswordReset, userSignUp } from '../controller/userController.js';
import checkUserAuth from '../middleware/authMiddleware.js';

const router = express.Router();

// public routes
router.post('/signUp', userSignUp);
router.post('/login', login);
router.post('/sendresetemail', sendUserPasswordResetEmail);
router.post('/resetpassword/:id/:token', userPasswordReset);

// private routes
router.post('/changepassword', checkUserAuth, changeUserPassword);


export default router;