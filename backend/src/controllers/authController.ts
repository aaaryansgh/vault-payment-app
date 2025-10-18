import * as authService from "../services/authService.js";
import type{ Request,Response } from "express";

//POST /api/auth/signup

export const register=async(req:Request,res:Response)=>{
    const {email,passwordHash,fullname,phone,pinHash}=req.body;
    const result=await authService.register({email,passwordHash,fullname,phone,pinHash});
    res.status(201).json({
        success:true,
        message:"User registered successfully",
        data:result
    })
}
//POST /api/auth/signin
export const login=async(req:Request,res:Response)=>{
    const {email,passwordHash}=req.body;
    try{
        const result=await authService.Login({email,passwordHash});
        res.cookie("token",result.tokens)    
        res.status(200).json({
        success:true,
        message:"User Logged in successfully",
        data:result
    })
    }catch(err){
        res.status(401).json({
            success:false,
            message:"Invalid email/password"
        })
    }
    
}

export const logout=async(req:Request,res:Response)=>{
    res.cookie("token",null,{expires:new Date(Date.now())})
    res.status(200).json({
        success:true,
        message:"User logged out successfully"
    })
}