import * as authService from "../services/authService.js";
import type{ Request,Response } from "express";

//POST /api/auth/signup

const cookieOptions={
  
}

export const register=async(req:Request,res:Response)=>{
    const {email,passwordHash,fullname,phone,pinHash}=req.body;
    const result=await authService.register({email,passwordHash,fullname,phone,pinHash});
    res.cookie("token",result.tokens,{
        httpOnly: true,
        path: "/",
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })
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
        res.cookie("token",result.tokens,{
            httpOnly: true,
            path: "/",
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        })    
        res.status(200).json({
        success:true,
        message:"User Logged in successfully",
        data:result
    })
    }catch(err){
        res.status(401).json({
            success:false,
            message:err
        })
    }
    
}

export const logout=async(req:Request,res:Response)=>{
    res.cookie("token",null,{
        expires:new Date(Date.now()),
        httpOnly: true,
        path: "/",
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })
    res.status(200).json({
        success:true,
        message:"User logged out successfully"
    })
}