import express from 'express';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import { createInvoice, getAllInvoicesAdmin, getDoctorEarnings, getInvoiceById, getPatientInvoices, getPaymentHistory, issueRefund, payInvoice } from '../controllers/invoiceController.js';



const router=express.Router();

// Patient routes

// all my invoices + summary
router.get('/my/invoices',protect,restrictTo('patient'), getPatientInvoices);

//Payment history
router.get('/my/payment-history',protect,restrictTo('patient'), getPaymentHistory);

// Pay as invoice
router.put('/:id/pay',protect,restrictTo('patient'),payInvoice);

// doctor routes

// Earnings + chart data for doctor dashboard
router.get('/my/earnings',protect,restrictTo('doctor'),getDoctorEarnings);

// admin routes
// All invoices with summary
router.get('/',protect,restrictTo('admin'),getAllInvoicesAdmin);

// manually create invoice
router.post('/',protect,restrictTo('admin'),createInvoice);

// issue refund
router.put('/:id/refund',protect,restrictTo('admin'),issueRefund);

// shared (patient + doctor + admin)
// Single invoice - invoice receipt page
router.get('/:id',protect,getInvoiceById);

export default router;