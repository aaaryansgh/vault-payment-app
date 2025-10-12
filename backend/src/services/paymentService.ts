import prisma from "../config/database.js";

interface MakePaymentData{
    userId:string;
    vaultId:string;
    amount:number;
    description:string;
    recipientPhone:string;
    recipientUpi:string;
    recipientId:string;
}

interface GetTransactionsOption{
    userId:string;
    vaultId:string;
    status?:string;
    startDate?:Date;
    endData?:Date;
    limit?:number;
    offset?:number;
}

// Moke payment gateway- simulate payment processing
// In production,,this would call actual payment gateway APIs

const mockPaymentGateway=async(amount:number):Promise<{success:boolean;gatewayTransactionId:string;status:string}>=>{
    await new Promise(resolve=>setTimeout(resolve,Math.random()*1500+500));
    // 95% success rate for simulation
    const success=Math.random()>0.05;
    return{
        success,
        gatewayTransactionId:`GW-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        status:success?'completed':'failed'
    }
}

// Make a payment from vault

export const makePayment=async(data:MakePaymentData)=>{
    const{ userId,
    vaultId,
    amount,
    description,
    recipientPhone,
    recipientUpi,
    recipientId}=data;
    if(amount<=0)throw new Error("Amount must be greater than 0");
    if(amount>100000)throw new Error("Payment amount cannot exceed Rs-1,00,000");
    return await prisma.$transaction(async(txn)=>{
        const vault=await txn.vault.findFirst({
            where:{id:vaultId,userId,isActive:true},
            include:{bankAccount:true}
        })
        if(!vault)throw new Error("Vault not found");
        const allocated=Number(vault.allocatedAmount);
        const spent=Number(vault.spentAmount);
        const rem=allocated-spent;
        if(amount>rem)throw new Error("Insufficient vault balance");
        //process payment through mock gateway
        const gatewayResponse=await mockPaymentGateway(amount);
        // Update vault spent amount
        await txn.vault.update({
            where:{id:vaultId},
            data:{
                spentAmount:{
                    increment:amount
                }
            }
        });
        const transaction=await txn.transactions.create({
            data:{
                transactionRef:`PAY-${Date.now()}-${userId.substring(0,8)}`,
                userId,
                vaultId,
                bankAccountId:vault.bankAccountId,
                transactionType:'debit',
                category:'p2p',
                amount,
                description,
                recipientPhone,
                recipientUpi,
                recipientId,
                status:gatewayResponse.status,
                paymentMethod:'vault',
                gatewayTransactionId:gatewayResponse.gatewayTransactionId||null,
                gatewayResponse:gatewayResponse||null
            },
            include:{
                vault:{
                    select:{
                        vaultName:true,
                        icon:true
                    }
                }
            }
        })
        // Create vault transaction entry
        await txn.vaultTransaction.create({
            data:{
                vaultId,
                transactionId:transaction.id,
                amount,
                transactionType:'spending'
            }
        });
        return{
            transaction,
            vault:{
                id:vault.id,
                name:vault.vaultName,
                previousbalance:rem,
                newBalance:rem-amount,
                usagePercentage:((spent+amount)/allocated)*100
            }
        }
    })
}

export const getTransactions=async(options:GetTransactionsOption)=>{
    const{userId,vaultId,status,startDate,endData,limit=50,offset=0}=options;
     const where: any = { userId };

  if (vaultId) {
    where.vaultId = vaultId;
  }

  if (status) {
    where.status = status;
  }

  if (startDate || endData) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = startDate;
    if (endData) where.createdAt.lte = endData;
  }
  const [transactions, total] = await Promise.all([
    prisma.transactions.findMany({
      where,
      include: {
        vault: {
          select: {
            vaultName: true,
            icon: true,
          }
        },
        recipient: {
          select: {
            fullname: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset
    }),
    prisma.transactions.count({ where })
  ]);
  return{
    transactions,
    pagination:{
        total,limit,offset,hasMore:offset+limit<total
    }
  }
}

export const getTransactionById=async(transactionId:string,userId:string)=>{
    const transaction=await prisma.transactions.findFirst({
        where:{id:transactionId,userId},
        include:{
            vault:{
                select:{
                    vaultName:true,
                    vaultType:true,
                    icon:true,
                }
            },
            bankAccount:{
                select:{
                    accountNumber:true,
                    bankName:true
                }
            },
            recipient:{
                select:{
                    fullname:true,
                    email:true,
                    phone:true
                }
            }
        }
    })
    if(!transaction)throw new Error("Transaction not found");
    return transaction;
}

export const getVaultSpendingAnalytics = async (vaultId: string, userId: string) => {
  // Verify vault belongs to user
  const vault = await prisma.vault.findFirst({
    where: {
      id: vaultId,
      userId,
      isActive: true
    }
  });

  if (!vault) {
    throw new Error('Vault not found');
  }

  // Get all transactions for this vault
  const transactions = await prisma.transactions.findMany({
    where: {
      vaultId,
      userId,
      status: 'completed'
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  // Calculate analytics
  const totalSpent = transactions.reduce((sum, txn) => sum + Number(txn.amount), 0);
  const avgTransaction = transactions.length > 0 ? totalSpent / transactions.length : 0;
  
  // Group by date for trend analysis
  const spendingByDate: { [key: string]: number } = {};
  transactions.forEach(txn => {
    const date = txn.createdAt.toISOString().split('T')[0];
    //@ts-ignore
    spendingByDate[date] = (spendingByDate[date] || 0) + Number(txn.amount);
  });

  return {
    vault: {
      id: vault.id,
      name: vault.vaultName,
      icon: vault.icon,
      allocated: Number(vault.allocatedAmount),
      spent: Number(vault.spentAmount)
    },
    analytics: {
      totalTransactions: transactions.length,
      totalSpent,
      averageTransaction: Math.round(avgTransaction * 100) / 100,
      remainingBudget: Number(vault.allocatedAmount) - Number(vault.spentAmount),
      usagePercentage: Number(vault.allocatedAmount) > 0 
        ? (Number(vault.spentAmount) / Number(vault.allocatedAmount)) * 100 
        : 0
    },
    spendingTrend: Object.entries(spendingByDate).map(([date, amount]) => ({
      date,
      amount
    }))
  };
};

export const getUserSpendingSummary = async (userId: string) => {
  // Get all active vaults
  const vaults = await prisma.vault.findMany({
    where: {
      userId,
      isActive: true
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

  // Get all completed transactions
  const transactions = await prisma.transactions.findMany({
    where: {
      userId,
      status: 'completed',
      category: { not: 'vault_allocation' } // Exclude vault allocation transactions
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  // Calculate totals
  const totalAllocated = vaults.reduce(
    (sum, vault) => sum + Number(vault.allocatedAmount),
    0
  );
  
  const totalSpent = vaults.reduce(
    (sum, vault) => sum + Number(vault.spentAmount),
    0
  );

  // Group spending by vault type
  const spendingByCategory: { [key: string]: number } = {};
  vaults.forEach(vault => {
    const spent = Number(vault.spentAmount);
    if (spent > 0) {
      spendingByCategory[vault.vaultType] = 
        (spendingByCategory[vault.vaultType] || 0) + spent;
    }
  });

  return {
    summary: {
      totalVaults: vaults.length,
      totalAllocated,
      totalSpent,
      totalRemaining: totalAllocated - totalSpent,
      overallUsage: totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0,
      totalTransactions: transactions.length
    },
    spendingByCategory: Object.entries(spendingByCategory)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalSpent > 0 ? (amount / totalSpent) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount),
    recentTransactions: transactions.slice(0, 10)
  };
};