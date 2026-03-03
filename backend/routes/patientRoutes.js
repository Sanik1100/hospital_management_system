import express from 'express';
import { getAllPatients, getPatientDashboardStats, getPatientProfile, updatePatientProfile } from '../controllers/patientController.js';
import {protect,restrictTo} from '../middleware/authMiddleware.js';

const router=express.Router();
// patient routes (protected)
router.get('/my/profile',protect,restrictTo('patient'),getPatientProfile);
router.put('/my/profile',protect,restrictTo('patient'),updatePatientProfile);
router.get('/my/dashboard',protect,restrictTo('patient'),getPatientDashboardStats);

// admin only
router.get('/', protect,restrictTo('admin'),getAllPatients);

export default router;