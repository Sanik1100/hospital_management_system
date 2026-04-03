import express from 'express';
import {protect, restrictTo} from '../middleware/authMiddleware.js'
import { deleteUser, exportRevenueReport, getAdminStats, getAllDoctorsAdmin, getAllPatientsAdmin, getHospitalOverview, getRevenueAnalysis } from '../controllers/adminController.js';

const router=express.Router();

// All admin routes are protected + admin only
router.use(protect);
router.use(restrictTo('admin'));

// Hospital Overview page
router.get('/overview', getHospitalOverview );

// revenue analysis page
// GET /api/admin/revenue?period=7D|1M|3M|1Y
router.get('/revenue', getRevenueAnalysis);

// Quick stats (for top stats cards)
router.get('/stats', getAdminStats);

// manage Doctors
router.get('/doctors', getAllDoctorsAdmin);

// Manage Patients
// GET /api/admin/patients?search=john
router.get('/patients', getAllPatientsAdmin);

// delete user
router.delete('/users/:id', deleteUser);

// Export revenue PDF report
// GET /api/admin/export-revenue?period=1M
router.get('/export-revenue', exportRevenueReport);

export default router;
