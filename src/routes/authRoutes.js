import express from 'express';
import {
    showLogin,
    showRegister,
    registerUser,
    loginUser,
    logoutUser,
    userPage,
    adminPage
} from '../controllers/authController.js';

const router = express.Router();

// Rutas públicas
router.get('/login', showLogin);
router.post('/login', loginUser);
router.get('/register', showRegister);
router.post('/register', registerUser);

// Rutas protegidas
router.get('/user', userPage);
router.get('/admin', adminPage);
router.get('/logout', logoutUser);

export default router;