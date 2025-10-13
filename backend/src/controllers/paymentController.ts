import type { Request,Response } from "express";
import * as paymentService from "../services/paymentService.js"
import { start } from "repl";

// POST /api/payments

export const makePayment=async(req:Request,res:Response)=>{
    //@ts-ignore
    const {user}=req;
    const{vaultId,amount,description,recipientPhone,recipientUpi,recipientId}=req.body;
    const result=await paymentService.makePayment({
        userId:user.id,
        vaultId,
        amount,
        description,
        recipientPhone,
        recipientUpi,
        recipientId
    })
    res.status(201).json({
        success:true,
        message:result.transaction.status==='completed'?"Payment successful":'Payment failed',
        data:result
    })
}

//GET /api/payments/transactions

export const getTransactions=async(req:Request,res:Response)=>{
    //@ts-ignore
    const{user}=req;
    const{vaultId,status,startDate,endData,limit,offset}=req.query;
    const result=await paymentService.getTransactions({
        userId:user.id,
        vaultId:vaultId as string,
        status: status as string,
        startDate:new Date(startDate as string),
        endDate:new Date(endData as string),
        limit:parseInt(limit as string),
        offset:parseInt(offset as string)
    });
    res.status(200).json({
        success:true,
        data:result
    })
}
export const getTransactionById=async(req:Request,res:Response)=>{
    //@ts-ignore
    const {user}=req;
    const{transactionId}=req.params;
    const transaction=await paymentService.getTransactionById(transactionId as string,user.id);
    res.status(200).json({
        success:true,
        data:{transaction}
    })
}
export const getVaultAnalytics=async(req:Request,res:Response)=>{
    //@ts-ignore
    const{user}=req;
    const{vaultId}=req.params;
    const analytics=await paymentService.getVaultSpendingAnalytics(vaultId as string,user.id);
    res.status(200).json({
        success:true,
        data:analytics
    })
}
export const getUserSpendingSummary=async(req:Request,res:Response)=>{
    //@ts-ignore
    const {user}=req;
    const {vaultId}=req.params
    const summary=await paymentService.getUserSpendingSummary(user.id,vaultId as string);
    res.status(200).json({
        success:true,
        data:summary
    })
}
