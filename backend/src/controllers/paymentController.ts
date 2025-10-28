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
    const summary=await paymentService.getUserSpendingSummary(user.id);
    res.status(200).json({
        success:true,
        data:summary
    })
}

export const getCategorySpending = async (req: Request, res: Response) => {
    //@ts-ignore
    const { user } = req;
    const { startDate, endDate } = req.query;

    try {
        const options = {
            userId: user.id,
            startDate: startDate ? new Date(startDate as string) : undefined,
            endDate: endDate ? new Date(endDate as string) : undefined,
        };
         // Validate dates
        if (options.startDate && isNaN(options.startDate.getTime())) {
            throw new Error("Invalid startDate parameter");
        }
        if (options.endDate && isNaN(options.endDate.getTime())) {
            throw new Error("Invalid endDate parameter");
        }
        //@ts-ignore
        const result = await paymentService.getSpendingByCategory(options);
        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error: any) {
        console.error("Get Category Spending Error:", error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch category spending data'
        });
    }
};

// GET /api/payments/analytics/time-series
export const getTimeSeriesSpending = async (req: Request, res: Response) => {
    //@ts-ignore
    const { user } = req;
    const { startDate, endDate, granularity } = req.query;

    try {
        const options = {
            userId: user.id,
            startDate: startDate ? new Date(startDate as string) : undefined,
            endDate: endDate ? new Date(endDate as string) : undefined,
            granularity: granularity as 'day' | 'week' | 'month' | undefined,
        };

        // Validate dates and granularity
         if (options.startDate && isNaN(options.startDate.getTime())) {
            throw new Error("Invalid startDate parameter");
        }
        if (options.endDate && isNaN(options.endDate.getTime())) {
            throw new Error("Invalid endDate parameter");
        }
        if (options.granularity && !['day', 'week', 'month'].includes(options.granularity)) {
             throw new Error("Invalid granularity parameter. Use 'day', 'week', or 'month'.");
        }

        //@ts-ignore
        const result = await paymentService.getSpendingOverTime(options);
        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error: any) {
        console.error("Get Time Series Spending Error:", error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch time series spending data'
        });
    }
};

// GET /api/payments/analytics/vault-breakdown
export const getVaultSpendingBreakdown = async (req: Request, res: Response) => {
    //@ts-ignore
    const { user } = req;
    const { startDate, endDate } = req.query;

    try {
        const options = {
            userId: user.id,
            startDate: startDate ? new Date(startDate as string) : undefined,
            endDate: endDate ? new Date(endDate as string) : undefined,
        };
         // Validate dates
        if (options.startDate && isNaN(options.startDate.getTime())) {
            throw new Error("Invalid startDate parameter");
        }
        if (options.endDate && isNaN(options.endDate.getTime())) {
            throw new Error("Invalid endDate parameter");
        }

        //@ts-ignore
        const result = await paymentService.getSpendingByVault(options);
        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error: any) {
        console.error("Get Vault Spending Breakdown Error:", error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch vault spending breakdown'
        });
    }
};