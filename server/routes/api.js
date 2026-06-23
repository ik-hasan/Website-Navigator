import express from 'express';
import { executeTest } from '../controllers/testController.js';
import { getReport, getAllReports } from '../controllers/reportController.js';

const router = express.Router();

// Test execution endpoint
router.post('/execute', executeTest);

// Report endpoints
router.get('/report/:id', getReport);
router.get('/reports', getAllReports);

export default router;
