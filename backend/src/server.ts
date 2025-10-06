dotenv.config();
import express from 'express';
import helmet from 'helmet';
import prisma from './config/database.js';
import authRoute from './routes/authRoute.js';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
const app=express();


const PORT=5000;

app.use(cookieParser())
app.use(helmet()); //security headers
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use('/api/auth',authRoute)

app.get("/health",(req,res)=>{
    res.status(200).json({
        success:true,
        message: 'vault payment api is running!',
        timestamp: new Date().toISOString()
    })
})
app.get("/api/test",(req,res)=>{
    res.status(200).json({
        success:true,
        message:"API is working fine",
        data:{
            version:'1.0.0',
            status:'healthy'
        }
    })
})
app.get("/api/db-test",async(req,res)=>{
    try{
        const user= await prisma.user.findFirst({
            include:{
                vaults:{
                    where:{isActive:true},
                    select:{
                        vaultName:true,
                        allocatedAmount:true,
                        spentAmount:true,
                        icon:true
                    }
                }
            }
        })
        res.status(200).json({
            success:true,
            message:"DB connection is working fine",
            data:user
        })
    }catch(err){
        res.status(500).json({error:err})
    }
})

app.use((req,res)=>{
    res.status(404).json({
        success:false,
        message:"route not found"
    })
})
app.listen(PORT, () => {
  console.log('🚀 Server is running!');
  console.log(`📡 Port: ${PORT}`);
  console.log(`⏰ Started at: ${new Date().toLocaleString()}`);
});