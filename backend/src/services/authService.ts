import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/database.js";

interface RegisterData{
    email:string,
    phone:string,
    passwordHash:string,
    fullname:string,
    pinHash:string
}
interface LoginData{
    email:string,
    passwordHash:string
}
interface TokenPayload{
    userId:string,
    email:string
}

export const register=async(data:RegisterData)=>{
    const {email,phone,passwordHash,fullname,pinHash}=data;
    console.log(passwordHash,pinHash);
    
    const hashedPassword=await bcrypt.hash(passwordHash,10);
    const hashedPin=await bcrypt.hash(pinHash,10);
    const user=await prisma.user.create({
        data:{
            email,
            phone,
            passwordHash:hashedPassword,
            fullname,
            isActive:true,
            pinHash:hashedPin
        },
        select:{
            id:true,
            email:true,
            phone:true,
            fullname:true,
            createdAt:true
        }
    })
    const tokens=generateTokens({userId:user.id,email:user.email})
    return {user,tokens};
}
export const Login=async(data:LoginData)=>{
    const {email,passwordHash}=data;
    const user=await prisma.user.findUnique({
        where:{email:email},
        select:{
            id:true,
            email:true,
            phone:true,
            fullname:true,
            passwordHash:true,
            isActive:true
        }
    })
    if(!user)throw new Error("Invalid credentials");
    const isPasswordValid=await bcrypt.compare(passwordHash,user.passwordHash);
    if(!isPasswordValid)throw new Error("Invalid credentials");
    if(!user.isActive)throw new Error("User is not active");
    const tokens=generateTokens({userId:user.id,email:user.email})
    return {user,tokens}
}
export const generateTokens=(payload:TokenPayload)=>{
    const genToken=jwt.sign(payload,process.env.JWT_SECRET!,{expiresIn:'7d'});
    return genToken;
}

export const getUserById=async(userId:string)=>{
    const user=await prisma.user.findUnique({
        where:{id:userId},
        select:{
            id:true,
            email:true,
            phone:true,
            fullname:true,
            createdAt:true,
            isActive:true
        }
    })
    if(!user) throw new Error("User not found");
    return user;
}
