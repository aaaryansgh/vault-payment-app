dotenv.config();
import express from 'express';
import helmet from 'helmet';
import prisma, { testConnection } from './config/database.js';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRoute from './routes/authRoute.js';
import accountsRoute from './routes/accountsRoute.js'
import vaultRoute from "./routes/vaultRoute.js";
import paymentRoute from "./routes/paymentRoute.js";
import insightRoute from "./routes/insightRoute.js"



const app=express();

const PORT=5000;


app.use(cors({
  origin:'http://localhost:5173',
  credentials: true
}));
app.use(cookieParser())
app.use(helmet()); //security headers
app.use(express.json());
app.use(express.urlencoded({extended:true}));

//Routes
app.use('/api/auth',authRoute)
app.use('/api/bank-accounts',accountsRoute)
app.use('/api/vaults',vaultRoute)
app.use("/api/payments",paymentRoute)
app.use("/api/insights",insightRoute);
app.use((req,res)=>{
    res.status(404).json({
        success:false,
        message:"route not found"
    })
})

app.listen(PORT, async () => {
  console.log(`🚀 Server is running on Port:${PORT}`);
  console.log(`⏰ Started at: ${new Date().toLocaleString()}`);
  console.log('🔌 Testing database connection...');
  await testConnection();
});