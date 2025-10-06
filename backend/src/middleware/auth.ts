import type { NextFunction, Request,Response } from "express";
import * as authService from "../services/authService.js"
import  jwt  from "jsonwebtoken";
export const UserAuth=async(req:Request,res:Response,next:NextFunction)=>{
    const cookie=req.cookies;
    const token=cookie.token;
    console.log("token is:",token);
    
    if(!token){
        return res.status(401).json({
            success:false,
            message:"Unauthorized"
        })
    }
    const validtoken=await jwt.verify(token,process.env.JWT_SECRET as string); 
    console.log(validtoken);
    //@ts-ignore
    const {userId}=validtoken;
    const user=await authService.getUserById(userId);
    if(!user){
        return res.status(401).json({
            success:false,
            message:"Unauthorized, please Login"
        })
    }else{
        //@ts-ignore
        req.user=user;
        next();
    }
}