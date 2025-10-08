import prisma from "../config/database.js";

interface LinkBankAccountData{
    userId:string;
    accountNumber:string;
    ifscCode:string;
    bankName:string;
    accountHolderName:string;
    initialBalance?:number;
}
interface UpdateBalanceData{
    accountId:string;
    userId:string;
    amount:number;
}

// Link a new bank account
// In production it will integrate with bank APIs for verfication

export const linkBankAccount=async(data:LinkBankAccountData)=>{
    const {userId,accountNumber,ifscCode,bankName,accountHolderName,initialBalance=0}=data;
    //check if user exists;
    const user=await prisma.user.findUnique({
        where:{id:userId}
    });
    if(!user){
        throw new Error("user not found")
    }
    // check if this is user first account
    const userAccounts=await prisma.bankAccount.count({
        where:{userId}
    })
    const isPrimary=userAccounts===0;
    //create bank account
    const bankAccount=await prisma.bankAccount.create({
        data:{
            userId,
            accountNumber,
            ifscCode:ifscCode.toUpperCase(),
            bankName,
            accountHolderName,
            balance:initialBalance,
            isPrimary,
            isVerified:true
        },
        select:{
            id:true,
            accountNumber:true,
            ifscCode:true,
            accountHolderName:true,
            balance:true,
            isPrimary:true,
            isVerified:true,
            createdAt:true
        }
    })
    return bankAccount;
}

// Get all accounts linked to a user

export const getUserBankAccounts=async(userId:string)=>{
    const accounts=await prisma.bankAccount.findMany({
        where:{userId},
        select:{
            id:true,
            accountNumber:true,
            ifscCode:true,
            accountHolderName:true,
            balance:true,
            isPrimary:true,
            isVerified:true,
            createdAt:true,

        },
        orderBy:[{isPrimary:'desc'},{createdAt:'desc'}]
    })
    return accounts;
}

// Get a specific bank account

export const getBankAccountById=async(accountId:string,userId:string)=>{
    const account=await prisma.bankAccount.findFirst({
        where:{id:accountId,userId},
        select:{
            id:true,
            accountNumber:true,
            ifscCode:true,
            accountHolderName:true,
            balance:true,
            isPrimary:true,
            isVerified:true,
            createdAt:true,
        }
    })
    if(!account){throw new Error("Account not found")};
    return account;
}

//Get primary account

export const getPrimaryAccount=async(userId:string)=>{
    const primaryAccount=await prisma.bankAccount.findFirst({
        where:{userId,isPrimary:true},
    })
    if(!primaryAccount){throw new Error("Primary account not found")};
    return primaryAccount;
}

// set an primary account
export const setPrismaryAccount=async(accountId:string,userId:string)=>{
    const account=await prisma.bankAccount.findFirst({
        where:{id:accountId,userId}
    })
    if(!account){throw new Error("Account not found")};
    // Use transaction to ensure data integrity
    await prisma.$transaction([
        // set all account to non primary
        prisma.bankAccount.updateMany({
            where:{userId},
            data:{isPrimary:false}
        }),
        // set selected account as primary
        prisma.bankAccount.update({
            where:{id:accountId},
            data:{isPrimary:true}
        })
    ])
    return await getBankAccountById(accountId,userId);
}

// Update account Balance;
// In production this will be done via bank APIs and webhooks

export const updateaccountBalance=async(data:UpdateBalanceData)=>{
    const {accountId,userId,amount}=data;
    const account=await prisma.bankAccount.findFirst({
        where:{id:accountId,userId}
    })
    if(!account){throw new Error("Account not found")};
    const newBalance=Number(account.balance)+amount;
    if(newBalance<0){throw new Error("Insufficient balance")};
    const updatedAccount=await prisma.bankAccount.update({
        where:{id:accountId},
        data:{
            balance:newBalance
        },
        select:{
            id:true,
            balance:true,
            accountNumber:true,
            bankName:true
        }
    })
    return updatedAccount;
}

// delete a bank account

export const deleteBankAccount=async(accountId:string,userId:string)=>{
    const account=await prisma.bankAccount.findFirst({
        where:{id:accountId,userId}
    })
    if(!account){throw new Error("Account not found")};
    const vaultcount=await prisma.vault.count({
        where:{id:accountId,isActive:true}
    })
    if(vaultcount>0){throw new Error("Cannot delete account linked to active vaults")};
    if(account.isPrimary){
        const otherAccount=await prisma.bankAccount.findFirst({
            where:{userId,id:{not:accountId}}
        })
        if(otherAccount){
            await prisma.bankAccount.update({
                where:{id:otherAccount.id},
                data:{isPrimary:true}
            })
        }
    }
    await prisma.bankAccount.delete({
        where:{id:accountId}
    })
    return {message:"Account deleted successfully"};
}

// get account summary 

export const getAccountSummary=async(accountId:string,userId:string)=>{
    const account=await prisma.bankAccount.findFirst({
        where:{id:accountId,userId},
        include:{
            vaults:{
                where:{isActive:true},
                select:{
                    id:true,
                    vaultName:true,
                    allocatedAmount:true,
                    spentAmount:true,
                    icon:true,
                }
            }
        }
    })
    if(!account){throw new Error("Account not found")};
    const totalAllocated=account.vaults.reduce((sum,vault)=>sum+Number(vault.allocatedAmount),0)
    const spentAmount=account.vaults.reduce((sum,vault)=>sum+Number(vault.spentAmount),0)
    const unAllocatedBalance=Number(account.balance)-Number(totalAllocated);
    return{
        account:{
            id:account.id,
            accountNumber:account.accountNumber,
            bankName:account.bankName,
            balance:account.balance,
            isPrimary:account.isPrimary,
        },
        summary:{
            totalBalance:account.balance,
            totalAllocated,
            spentAmount,
            unAllocatedBalance,
            activeVaults:account.vaults.length

        },
        vaults:account.vaults
    }
}