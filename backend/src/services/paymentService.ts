import prisma from "../config/database.js";
import { Prisma } from "../../src/generated/prisma/index.js"; // Import Prisma for types

interface MakePaymentData {
  userId: string;
  vaultId: string;
  amount: number;
  description: string;
  recipientPhone?: string; // Made optional as per schema
  recipientUpi?: string; // Made optional as per schema
  recipientId?: string; // Made optional as per schema
}

interface GetTransactionsOption {
  userId: string;
  vaultId?: string; // Changed to optional to allow filtering across all vaults
  status?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

// --- Analytics Interfaces ---
interface AnalyticsOptions {
    userId: string;
    startDate?: Date;
    endDate?: Date;
}

interface TimeSeriesOptions extends AnalyticsOptions {
    granularity?: 'day' | 'week' | 'month'; // Currently only 'day' is implemented simply
}


// Moke payment gateway- simulate payment processing
// In production,,this would call actual payment gateway APIs

const mockPaymentGateway = async (
  amount: number
): Promise<{ success: boolean; gatewayTransactionId: string; status: string }> => {
  await new Promise((resolve) =>
    setTimeout(resolve, Math.random() * 2000 + 500)
  );
  // 95% success rate for simulation
  const success = Math.random() > 0.05;

  return {
    success,
    gatewayTransactionId: `GW-${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}`,
    status: success ? "completed" : "failed",
  };
};

// Make a payment from vault

export const makePayment = async (data: MakePaymentData) => {
  const {
    userId,
    vaultId,
    amount,
    description,
    recipientPhone,
    recipientUpi,
    recipientId,
  } = data;
  if (amount <= 0) throw new Error("Amount must be greater than 0");
  if (amount > 100000)
    throw new Error("Payment amount cannot exceed Rs-1,00,000");

  // First, verify vault and balance BEFORE starting transaction
  const vaultCheck = await prisma.vault.findFirst({
    where: { id: vaultId, userId, isActive: true },
    include: { bankAccount: true },
  });

  if (!vaultCheck) throw new Error("Vault not found");
  const allocated = Number(vaultCheck.allocatedAmount);
  const spent = Number(vaultCheck.spentAmount);
  const rem = allocated - spent;
  if (amount > rem) throw new Error("Insufficient vault balance");

  // Process payment through mock gateway OUTSIDE transaction
  const gatewayResponse = await mockPaymentGateway(amount);

  // Now perform database updates in transaction with increased timeout
  return await prisma.$transaction(
    async (txn) => {
      // Re-fetch vault inside transaction to ensure consistency
      const vault = await txn.vault.findFirst({
        where: { id: vaultId, userId, isActive: true },
        include: { bankAccount: true },
      });
      if (!vault) throw new Error("Vault not found");

      // Double-check balance hasn't changed
      const currentRem = Number(vault.allocatedAmount) - Number(vault.spentAmount);
      if (amount > currentRem) throw new Error("Insufficient vault balance");

      // Update vault spent amount *only if payment succeeded*
      if (gatewayResponse.success) {
        await txn.vault.update({
          where: { id: vaultId },
          data: {
            spentAmount: {
              increment: amount,
            },
          },
        });
      }

      const transaction = await txn.transactions.create({
        data: {
          transactionRef: `PAY-${Date.now()}-${userId.substring(0, 8)}`,
          userId,
          vaultId,
          bankAccountId: vault.bankAccountId,
          transactionType: "debit",
          category: "p2p", // Assuming default, might need adjustment
          amount,
          description,
          recipientPhone: recipientPhone || null, // Ensure null if undefined
          recipientUpi: recipientUpi || null,   // Ensure null if undefined
          recipientId: recipientId || null,     // Ensure null if undefined
          status: gatewayResponse.status,
          paymentMethod: "vault",
          gatewayTransactionId: gatewayResponse.gatewayTransactionId || null,
          gatewayResponse: gatewayResponse as any, // Cast if Prisma expects specific JSON type
        },
        include: {
          vault: {
            select: {
              vaultName: true,
              icon: true,
            },
          },
        },
      });

      // Create vault transaction entry *only if payment succeeded*
      if (gatewayResponse.success) {
          await txn.vaultTransaction.create({
            data: {
              vaultId,
              transactionId: transaction.id,
              amount,
              transactionType: "spending", // spending from vault
            },
          });
      }

      // Return structure needs adjustment if payment failed
      if (!gatewayResponse.success) {
          return {
              transaction, // Return the failed transaction record
              vault: null // Indicate vault state wasn't changed
          }
      }

      return {
        transaction,
        vault: {
          id: vault.id,
          name: vault.vaultName,
          previousbalance: rem,
          newBalance: rem - amount,
          usagePercentage: ((spent + amount) / allocated) * 100,
        },
      };
    },
    {
      maxWait: 10000, // Maximum time to wait for a transaction slot (10s)
      timeout: 10000, // Maximum time the transaction can run (10s)
    }
  );
};

export const getTransactions = async (options: GetTransactionsOption) => {
  const { userId, vaultId, status, startDate, endDate, limit = 50, offset = 0 } =
    options;
  const where: any = { userId }; // Use Prisma.TransactionsWhereInput for better type safety if needed

  if (vaultId) {
    where.vaultId = vaultId;
  }

  if (status) {
    where.status = status;
  }

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate && !isNaN(startDate.getTime())) {
      where.createdAt.gte = startDate;
    }

    if (endDate && !isNaN(endDate.getTime())) {
      // Adjust end date to include the entire day
       const endOfDay = new Date(endDate);
       endOfDay.setHours(23, 59, 59, 999);
      where.createdAt.lte = endOfDay;
    }
  }
  const [transactions, total] = await Promise.all([
    prisma.transactions.findMany({
      where,
      include: {
        vault: {
          select: {
            vaultName: true,
            icon: true,
            vaultType: true, // Include vaultType
          },
        },
        recipient: {
          select: {
            fullname: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      skip: offset,
    }),
    prisma.transactions.count({ where }),
  ]);
  return {
    transactions,
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    },
  };
};

export const getTransactionById = async (
  transactionId: string,
  userId: string
) => {
  const transaction = await prisma.transactions.findFirst({
    where: { id: transactionId, userId },
    include: {
      vault: {
        select: {
          vaultName: true,
          vaultType: true,
          icon: true,
        },
      },
      bankAccount: {
        select: {
          accountNumber: true,
          bankName: true,
        },
      },
      recipient: {
        select: {
          fullname: true,
          email: true,
          phone: true,
        },
      },
    },
  });
  if (!transaction) throw new Error("Transaction not found");
  return transaction;
};

// Note: getVaultSpendingAnalytics and getUserSpendingSummary were already present
// in the file content provided in the prompt. I'm keeping them.

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
      status: 'completed', // Only consider completed transactions for analytics
      transactionType: 'debit', // Only consider spending
      category: { not: 'vault_allocation' } // Exclude allocations
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
      spent: Number(vault.spentAmount) // Use the direct spentAmount from vault
    },
    analytics: {
      totalTransactions: transactions.length,
      totalSpent, // Calculated from relevant transactions
      averageTransaction: Math.round(avgTransaction * 100) / 100,
      remainingBudget: Number(vault.allocatedAmount) - Number(vault.spentAmount),
      usagePercentage: Number(vault.allocatedAmount) > 0
        ? (Number(vault.spentAmount) / Number(vault.allocatedAmount)) * 100
        : 0
    },
    spendingTrend: Object.entries(spendingByDate).map(([date, amount]) => ({
      date,
      amount
    })).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()) // Sort chronologically
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

  // Get all completed debit transactions (excluding allocations)
  const transactions = await prisma.transactions.findMany({
    where: {
      userId,
      status: 'completed',
      transactionType: 'debit',
      category: { not: 'vault_allocation' } // Exclude vault allocation transactions
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  // Calculate totals directly from vaults for consistency
  const totalAllocated = vaults.reduce(
    (sum, vault) => sum + Number(vault.allocatedAmount),
    0
  );

  const totalSpent = vaults.reduce(
    (sum, vault) => sum + Number(vault.spentAmount),
    0
  );

  // Group spending by vault type based on vault data
  const spendingByCategory: { [key: string]: number } = {};
  vaults.forEach(vault => {
    const spent = Number(vault.spentAmount);
    if (spent > 0) {
      // Use vault.vaultType which should always exist
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
      totalTransactions: transactions.length // Count of relevant spending transactions
    },
    spendingByCategory: Object.entries(spendingByCategory)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalSpent > 0 ? (amount / totalSpent) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount),
    recentTransactions: transactions.slice(0, 10).map(t => ({ // Map to simpler structure if needed
        id: t.id,
        description: t.description,
        amount: Number(t.amount),
        date: t.createdAt,
        vaultName: vaults.find(v => v.id === t.vaultId)?.vaultName || 'N/A'
    }))
  };
};


// --- NEW ANALYTICS FUNCTIONS ---

/**
 * Calculates total spending grouped by vault type (category) for a user within a date range.
 */
export const getSpendingByCategory = async (options: AnalyticsOptions) => {
    const { userId, startDate, endDate } = options;

    const where: Prisma.TransactionsWhereInput = {
        userId,
        status: 'completed',
        transactionType: 'debit',
        category: { not: 'vault_allocation' }, // Exclude allocations
        vaultId: { not: null }, // Ensure it's linked to a vault
    };

    if (startDate || endDate) {
        where.createdAt = {};
        if (startDate && !isNaN(startDate.getTime())) {
            where.createdAt.gte = startDate;
        }
        if (endDate && !isNaN(endDate.getTime())) {
             const endOfDay = new Date(endDate);
             endOfDay.setHours(23, 59, 59, 999);
            where.createdAt.lte = endOfDay;
        }
    }

    const spending = await prisma.transactions.groupBy({
        by: ['vaultId'], // Group by vault first to easily get vaultType
        where,
        _sum: {
            amount: true,
        },
    });

    // Fetch vault details to map vaultId to vaultType
    const vaultIds = spending.map(s => s.vaultId as string);
    const vaults = await prisma.vault.findMany({
        where: { id: { in: vaultIds } },
        select: { id: true, vaultType: true },
    });
    const vaultTypeMap = new Map(vaults.map(v => [v.id, v.vaultType]));

    // Aggregate results by vaultType
    const result: { [key: string]: number } = {};
    let totalSpending = 0;
    spending.forEach(group => {
        const vaultType = vaultTypeMap.get(group.vaultId as string) || 'uncategorized'; // Fallback
        const amount = Number(group._sum.amount) || 0;
        result[vaultType] = (result[vaultType] || 0) + amount;
        totalSpending += amount;
    });

    // Format output
    return Object.entries(result)
        .map(([category, amount]) => ({
            category,
            amount,
            percentage: totalSpending > 0 ? (amount / totalSpending) * 100 : 0,
        }))
        .sort((a, b) => b.amount - a.amount);
};

/**
 * Calculates total spending over time (grouped by day, week, or month) for a user.
 * Note: Weekly/Monthly aggregation requires more complex date handling.
 * This implementation provides a basic daily grouping.
 */
export const getSpendingOverTime = async (options: TimeSeriesOptions) => {
    const { userId, startDate, endDate, granularity = 'day' } = options;

    const where: Prisma.TransactionsWhereInput = {
        userId,
        status: 'completed',
        transactionType: 'debit',
        category: { not: 'vault_allocation' },
    };

    if (startDate || endDate) {
        where.createdAt = {};
        if (startDate && !isNaN(startDate.getTime())) {
            where.createdAt.gte = startDate;
        }
        if (endDate && !isNaN(endDate.getTime())) {
             const endOfDay = new Date(endDate);
             endOfDay.setHours(23, 59, 59, 999);
            where.createdAt.lte = endOfDay;
        }
    }

    // Prisma doesn't directly support date truncation for groupBy.
    // Fetching raw data and processing in JS for simplicity here.
    // For large datasets, a raw SQL query with date_trunc would be more efficient.
    const transactions = await prisma.transactions.findMany({
        where,
        select: {
            amount: true,
            createdAt: true,
        },
        orderBy: {
            createdAt: 'asc',
        },
    });

    const result: { [key: string]: number } = {};

    transactions.forEach(txn => {
        let dateKey: string;
        const date = txn.createdAt;

        switch (granularity) {
            // Add 'week' and 'month' logic here if needed, potentially using a date library
            case 'day':
            default:
              //@ts-ignore
                dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
                break;
        }

        result[dateKey] = (result[dateKey] || 0) + Number(txn.amount);
    });

    return Object.entries(result)
        .map(([date, amount]) => ({ date, amount }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // Ensure chronological order
};

/**
 * Calculates total spending grouped by vault for a user within a date range.
 */
export const getSpendingByVault = async (options: AnalyticsOptions) => {
    const { userId, startDate, endDate } = options;

    const where: Prisma.TransactionsWhereInput = {
        userId,
        status: 'completed',
        transactionType: 'debit',
        category: { not: 'vault_allocation' },
        vaultId: { not: null }, // Only transactions linked to a vault
    };

    if (startDate || endDate) {
        where.createdAt = {};
        if (startDate && !isNaN(startDate.getTime())) {
            where.createdAt.gte = startDate;
        }
        if (endDate && !isNaN(endDate.getTime())) {
             const endOfDay = new Date(endDate);
             endOfDay.setHours(23, 59, 59, 999);
            where.createdAt.lte = endOfDay;
        }
    }

    const spending = await prisma.transactions.groupBy({
        by: ['vaultId'],
        where,
        _sum: {
            amount: true,
        },
    });

     // Fetch vault details
    const vaultIds = spending.map(s => s.vaultId as string);
    const vaults = await prisma.vault.findMany({
        where: { id: { in: vaultIds } },
        select: { id: true, vaultName: true, icon: true, allocatedAmount: true }, // Add allocatedAmount
    });
    const vaultMap = new Map(vaults.map(v => [v.id, { name: v.vaultName, icon: v.icon, allocated: Number(v.allocatedAmount)} ]));

    let totalSpending = 0;
    const resultsWithDetails = spending.map(group => {
        const amount = Number(group._sum.amount) || 0;
        totalSpending += amount;
        return {
            vaultId: group.vaultId,
            amount,
            vaultDetails: vaultMap.get(group.vaultId as string) || { name: 'Unknown Vault', icon: '❓', allocated: 0 },
        };
    });


    // Format output with percentage of total spending
    return resultsWithDetails
        .map(item => ({
            ...item,
            percentageOfTotal: totalSpending > 0 ? (item.amount / totalSpending) * 100 : 0,
             percentageOfAllocation: item.vaultDetails.allocated > 0 ? (item.amount / item.vaultDetails.allocated) * 100 : 0, // Add percentage of allocation used
        }))
        .sort((a, b) => b.amount - a.amount);
};


//bug after updating vault there is no transaction history maintained for the updated vault. Fix it by creating a transaction entry for vault updates.