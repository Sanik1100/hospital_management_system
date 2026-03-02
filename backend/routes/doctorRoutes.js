import { addDoctor, getAllDoctors, getDoctorById, getDoctorDashboardStats, getMyDoctorProfile, getSpecialities, updateDoctorProfile } from "../controllers/doctorController.js";
import express from 'express';
import { protect,restrictTo } from "../middleware/authMiddleware.js";


const router=express.Router();

// public routes
router.get('/',getAllDoctors);  // find doctor page
router.get('/specialities',getSpecialities);  // filter dropdown
router.get('/:id',getDoctorById);  // doctor profile

// doctor only routes
router.get('/my/profile',protect,restrictTo('doctor'), getMyDoctorProfile);
router.put('/my/profile',protect,restrictTo('doctor'),updateDoctorProfile);
router.get('/my/dashboard',protect,restrictTo('doctor'),getDoctorDashboardStats);

// admin only routes
router.post('/add',protect,restrictTo('admin'),addDoctor);
 export default router;