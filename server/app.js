import express from 'express';
import morgan from 'morgan';
import authRoutes from './routes/auth.js'
import tripRoutes from './routes/trip.js'


const app = express();

// Parse JSON request bodies
app.use(express.json());

// Get api url on console
if(process.env.NODE_ENV === "developement"){
    app.use(morgan("dev"));
}

// Auth Routes
app.use("/api/auth", authRoutes);
// Trip Routes
app.use("/api/trip", tripRoutes);

export default app;