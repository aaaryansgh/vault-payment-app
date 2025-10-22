import type{ Request,Response } from "express";
import * as vaultService from "../services/vaultService.js"

export const createVault=async(req:Request,res:Response)=>{
    //@ts-ignore
    const {user}=req;
    const{
        bankAccountId,
        vaultName,
        vaultType,
        allocatedAmount,
        icon,
        budgetPeriod,
        autoRefill
    }=req.body;
    const vault=await vaultService.createVault({
        userId:user.id,
        bankAccountId,
        vaultName,
        vaultType,
        allocatedAmount,
        icon,
        budgetPeriod,
        autoRefill
    })
    res.status(201).json({
        message:"Vault created successfully",
        data:{vault}
    })
}

//GET all vaults

export const getUserVaults=async(req:Request,res:Response)=>{
    //@ts-ignore
    const {user}=req;
    const vaults=await vaultService.getUserVaults(user.id);
    res.status(200).json({success:true,data:{vaults}})
}

// GET specific vault

export const getVaultById=async(req:Request,res:Response)=>{
    //@ts-ignore
    const {user}=req;
    const{id}=req.params;
    const vault=await vaultService.getVaultId(user.id,id as string)
    res.status(200).json({success:true,data:{vault}})
}
 // update vault

export const updateVault=async(req:Request,res:Response)=>{
    //@ts-ignore
    const{user}=req;
    const {id}=req.params;
    const updates=req.body;
    const vault=await vaultService.updateVault({vaultId:id,userId:user.id,...updates});
    res.status(200).json({
        success:true,
        message:"Vault updated successfully",
        data:{vault}
    })
}

export const deleteVault=async(req:Request,res:Response)=>{
    //@ts-ignore
    const {user}=req;
    const {id}=req.params;
    const result=await vaultService.deleteVault(user.id,id as string);
    res.status(200).json({
        success:true,
        message:result.message,
        data:{
            deletedPermanently:result.deletedPermanently
        }
    })
}

export const getVaultSummary = async (req: Request, res: Response) => {
    //@ts-ignore
  const {user}=req;
  const { bankAccountId } = req.params;
  const summary = await vaultService.getVaultSummary(user.id, bankAccountId as string);

  res.status(200).json({
    success: true,
    data: summary
  });
};
