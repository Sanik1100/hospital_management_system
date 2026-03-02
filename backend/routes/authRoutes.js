import express from 'express';
import { forgotPassword, getMe, login, register, resetPassword } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router=express.Router();

// Public routes for authentication
router.post('/register',register);
router.post('/login',login);
router.post('/forgot-password',forgotPassword);
router.post('/reset-password',resetPassword);

// protected route for authorization
router.get('/me',protect,getMe);

export default router;



{/*

Request
   ↓
authRoutes
   ↓
protect middleware
   ↓
getMe controller
   ↓
response
    
    */}
