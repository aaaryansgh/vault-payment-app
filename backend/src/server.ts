import express from 'express';
import helmet from 'helmet';

const app=express();

app.use(helmet()); //security headers
const PORT=5000;

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