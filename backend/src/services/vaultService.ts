import { userInfo } from "os";
import prisma from "../config/database.js";

interface CreateVaultData{
    userId:string;
    bankAccountId:string;
    vaultName:string;
    vaultType:string;
    allocatedAmount:number;
    icon?:string;
    budgetPeriod?:string;
    autoRefill?:boolean;
}
interface UpdateVaultData{
    vaultId:string;
    userId:string;
    vaultName?:string;
    allocatedAmount?:number;
    icon?:number;
    budgetPeriod?:string;
    autoRefill?:boolean;
}

//create a new vault

export const createVault=async(data:CreateVaultData)=>{
    const{userId,bankAccountId,vaultName,vaultType,allocatedAmount,icon='💰',budgetPeriod='monthly',autoRefill=false}=data;
    return await prisma.$transaction(async(txn)=>{
        const bankAccount=await txn.bankAccount.findFirst({
            where:{id:bankAccountId,userId}
        })
        if(!bankAccount)throw new Error("Bank account not found!");
        //calculate already allocated amount
        const vaults=await txn.vault.findMany({
            where:{userId,bankAccountId,isActive:true},
            select:{allocatedAmount:true}
        })
        const totalAllocated=vaults.reduce((sum,vault)=>sum+Number(vault.allocatedAmount),0);
        const availableBalance=Number(bankAccount.balance);
        const unallocatedAmount=availableBalance-totalAllocated;
        if(allocatedAmount<=0)throw new Error("Allocation must be greated than 0");
        if(allocatedAmount>unallocatedAmount)throw new Error("Insufficient unallocated balance");
        //create vault
        const vault=await txn.vault.create({
            data:{
                userId,
                bankAccountId,
                vaultName,
                vaultType,
                allocatedAmount,
                spentAmount:0,
                icon,
                budgetPeriod,
                autoRefill,
                isActive:true
            },
            select:{id:true,vaultName:true,vaultType:true,allocatedAmount:true,
                spentAmount:true,icon:true,budgetPeriod:true,autoRefill:true,isActive:true,createdAt:true,
                bankAccount:{select:{accountNumber:true,bankName:true}}
            }
        });
        // Record allocated transaction
        await txn.transactions.create({
            data:{
                transactionRef:`ALLOC-${Date.now()}-${userId.substring(0,8)}`,
                userId,
                vaultId:vault.id,
                bankAccountId,
                transactionType:'debit',
                category:'vault-allocation',
                amount:allocatedAmount,
                description:`Allocated  ₹${allocatedAmount} to ${vaultName} vault`,
                status:'completed',
                paymentMethod:'vault'
            }
        })
        return vault;  
    });
}

//get all vaults for a user

export const getUserVaults=async(userId:string)=>{
    const vaults=await prisma.vault.findMany({
        where:{userId,isActive:true},
        select:{
            id:true,
            vaultName:true,
            vaultType:true,
            allocatedAmount:true,
            spentAmount:true,
            icon:true,
            budgetPeriod:true,
            autoRefill:true,
            createdAt:true,
            updatedAt:true,
            bankAccount:{
                select:{
                    accountNumber:true,
                    bankName:true
                }
            }
        },
        orderBy:{createdAt:'desc'}
    })
    //calculate remanining amount and usage percentage for each vault
    return vaults.map(vault=>{
        const allocated=Number(vault.allocatedAmount);
        const spent=Number(vault.spentAmount);
        const remanining=allocated-spent;
        const usagePercentage=allocated>0?(spent/allocated)*100:0;
        return{
            ...vault,
            allocatedAmount:allocated,
            spentAmount:spent,
            remainingAmount:remanining,
            usagePercentage:Math.round(usagePercentage*100)/100
        };
    })
}

export const getVaultId=async(userId:string,vaultId:string)=>{
    const vault=await prisma.vault.findFirst({
        where:{id:vaultId,userId,isActive:true},
        include:{
            bankAccount:{
                select:{
                    accountNumber:true,
                    bankName:true,
                    balance:true
                }
            },
            transactions:{
                orderBy:{createdAt:'desc'},
                take:10,
                select:{
                    id:true,
                    transactionRef:true,
                    amount:true,
                    description:true,
                    status:true,
                    createdAt:true
                }
            }
        }
    });
    if(!vault)throw new Error('Vault not found');
    const allocated=Number(vault.allocatedAmount);
    const spent=Number(vault.spentAmount);
    const remanining=allocated-spent;
    const usagePercentage=allocated>0?(spent/allocated)*100:0;
    return{
        ...vault,
        allocatedAmount:allocated,
        spentAmount:spent,
        remaningAmount:remanining,
        usagePercentage:Math.round(usagePercentage*100)/100
    }
}

export const updateVault = async (data: UpdateVaultData) => {
  const { vaultId, userId, allocatedAmount, ...otherUpdates } = data;

  return await prisma.$transaction(async (tx) => {
    // Get current vault
    const currentVault = await tx.vault.findFirst({
      where: {
        id: vaultId,
        userId,
        isActive: true
      },
      include: {
        bankAccount: true
      }
    });

    if (!currentVault) {
      throw new Error('Vault not found');
    }

    const currentAllocated = Number(currentVault.allocatedAmount);
    const spentAmount = Number(currentVault.spentAmount);

    // If updating allocation amount
    if (allocatedAmount !== undefined) {
      // Can't allocate less than already spent
      if (allocatedAmount < spentAmount) {
        throw new Error(
          `Cannot allocate less than spent amount (₹${spentAmount})`
        );
      }

      const difference = allocatedAmount - currentAllocated;

      // If increasing allocation, check available balance
      if (difference > 0) {
        // Calculate total allocated in other vaults
        const otherVaults = await tx.vault.findMany({
          where: {
            userId,
            bankAccountId: currentVault.bankAccountId,
            isActive: true,
            id: { not: vaultId }
          }
        });

        const totalOtherAllocated = otherVaults.reduce(
          (sum, vault) => sum + Number(vault.allocatedAmount),
          0
        );

        const availableBalance = Number(currentVault.bankAccount.balance);
        const unallocated = availableBalance - totalOtherAllocated - currentAllocated;

        if (difference > unallocated) {
          throw new Error(
            `Insufficient unallocated balance. Available: ₹${unallocated.toFixed(2)}`
          );
        }
      }
    }

    // Update vault
    const updatedVault = await tx.vault.update({
      where: { id: vaultId },
      //@ts-ignore
      data: {
        ...(allocatedAmount !== undefined && { allocatedAmount }),
        ...otherUpdates,
      },
      include: {
        bankAccount: {
          select: {
            accountNumber: true,
            bankName: true
          }
        }
      }
    });

    return updatedVault;
  });
};

export const deleteVault=async(userId:string,vaultId:string)=>{
    return await prisma.$transaction(async(txn)=>{
        const vault=await txn.vault.findFirst({
            where:{id:vaultId,userId}
        })
        if(!vault)throw new Error("Vault not found");
        const spentAmount=Number(vault.spentAmount);
        if(spentAmount>0){
            //soft delete
            await txn.vault.update({
                where:{id:vaultId},
                data:{isActive:false}
            })
            return{
                message:"Vault archived!",
                deletedPermanently:false
            }
        }else{
            await txn.vault.delete({
                where:{id:vaultId}
            })
            return {
                message:"Vault deleted successfully",
                deletedPermanently:true
            }
        }
    })
}
export const getVaultSummary = async (userId: string, bankAccountId: string) => {
  const bankAccount = await prisma.bankAccount.findFirst({
    where: {
      id: bankAccountId,
      userId
    },
    include: {
      vaults: {
        where: { isActive: true }
      }
    }
  });

  if (!bankAccount) {
    throw new Error('Bank account not found');
  }

  const totalBalance = Number(bankAccount.balance);
  const totalAllocated = bankAccount.vaults.reduce(
    (sum, vault) => sum + Number(vault.allocatedAmount),
    0
  );
  const totalSpent = bankAccount.vaults.reduce(
    (sum, vault) => sum + Number(vault.spentAmount),
    0
  );
  const unallocatedBalance = totalBalance - totalAllocated;

  return {
    bankAccount: {
      id: bankAccount.id,
      accountNumber: bankAccount.accountNumber,
      bankName: bankAccount.bankName
    },
    summary: {
      totalBalance,
      totalAllocated,
      totalSpent,
      unallocatedBalance,
      totalVaults: bankAccount.vaults.length,
      allocationPercentage: totalBalance > 0 ? (totalAllocated / totalBalance) * 100 : 0
    }
  };
};