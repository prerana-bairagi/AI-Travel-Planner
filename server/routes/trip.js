import express from 'express';
import tripController from '../controllers/tripController.js';


const router = express.Router();

router.post('/generate', tripController.generateTrip);


export default router;