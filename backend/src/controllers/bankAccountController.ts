import type { Request,Response } from "express";
import * as bankAccountService from "../services/bankAccountService.js"

//post /api/bank-accounts

export const linkBankAccount=async(req:Request,res:Response)=>{
    //@ts-ignore
    const {user}=req;
    const {accountNumber,ifscCode,bankName,accountHolderName,initialBalance}=req.body;
    try{
        const account= await bankAccountService.linkBankAccount({
        userId:user.id,
        accountNumber,
        ifscCode,
        bankName,
        accountHolderName,
        initialBalance
    });
    res.status(200).json({
        success:true,
        message:"Bank account linked successfully",
        data:{account}
    })

    }catch(err){
        res.status(500).json({message:err})
    }
    
}

// get /api/bank-accounts

export const getUserBankAccounts=async(req:Request,res:Response)=>{
    //@ts-ignore
    const {user}=req;
    const accounts=await bankAccountService.getUserBankAccounts(user.id);
    res.status(200).json({
        success:true,
        data:{
            accounts
        }
    })
}

//get a specific bank account

export const getBankAccountById=async(req:Request,res:Response)=>{
    const {id}=req.params;
    //@ts-ignore
    const {user}=req;
    //@ts-ignore
    const account=await bankAccountService.getBankAccountById(id,user.id)
    res.status(200).json({
        success:true,
        data:{account}
    })
}
export const getPrimaryAccount=async(req:Request,res:Response)=>{
    //@ts-ignore
    const{user}=req;
    const account=await bankAccountService.getPrimaryAccount(user.id);
    res.status(200).json({
        success:true,
        data:{account}
    })
}

export const setPrismaryAccount=async(req:Request,res:Response)=>{
    //@ts-ignore
    const {user}=req;
    const {id}=req.params;
    //@ts-ignore
    const account=await bankAccountService.setPrismaryAccount(id,user.id)
    res.status(200).json({
        success:true,
        message:'primary account updated successfully',
        data:{account}
    })
}

export const updateBalance=async(req:Request,res:Response)=>{
    //@ts-ignore
    const {user}=req;
    const {id}=req.params;
    const {amount}=req.body;
    //@ts-ignore
    const account=await bankAccountService.updateaccountBalance({accountId:id,userId:user.id,amount})
    res.status(200).json({
        success:true,
        message:"Balance updated successfully",
        data:{account}
    })
}

export const unlinkBankAccount = async (req: Request, res: Response) => {
    //@ts-ignore
  const {user}=req;
  const { id } = req.params;
  //@ts-ignore
  const result = await bankAccountService.deleteBankAccount(id,user.id);
  res.status(200).json({
    success: true,
    message: result.message
  });
};
export const getAccountSummary = async (req: Request, res: Response) => {
    //@ts-ignore
  const {user}=req;
  const { id } = req.params;
  //@ts-ignore
  const summary = await bankAccountService.getAccountSummary(id, user.id);
  res.status(200).json({
    success: true,
    data: summary
  });
};

export const updateBankAccount = async (req: Request, res: Response) => {
    //@ts-ignore
  const {user}=req;
  const { id } = req.params;
  const {accountHolderName, bankName} = req.body;
  //@ts-ignore
  const account = await bankAccountService.updateBankAccount(id, user.id, {accountHolderName, bankName});
  res.status(200).json({
    success: true,
    message: "Account updated successfully",
    data: {account}
  });
};