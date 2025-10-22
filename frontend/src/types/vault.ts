export interface Vault{
    id:string;
    vaultName:string;
    vaultType:string;
    allocatedAmount:number;
    spentAmount:number;
    remainingAmount:number;
    usagePercentage:number;
    icon:string;
    budgetPeriod:string;
    autoRefill:boolean;
    isActive:boolean;
    createdAt: string;
    updatedAt:string;
    bankAccount:{
        id:string;
        accountNumber:string;
        bankName:string;
    }
}
export interface CreateVaultData{
    bankAccountId:string;
    vaultName:string;
    vaultType:string;
    allocatedAmount:string;
    icon?:string;
    budgetPeriod?:string;
    autoRefill?:boolean;
}

export interface VaultSummary{
    bankAccount:{
        id:string;
        accountNumber:string;
        bankName:string;
    };
    summary:{
        totalBalance:number;
        totalAllocated:number;
        totalSpent:number;
        unallocatedBalance:number;
        totalVaults:number;
        allocationPercentage:number;
    }
}

export const VAULT_TYPES = [
  { value: 'groceries', label: 'Groceries', icon: '🛒'},
  { value: 'rent', label: 'Rent', icon: '🏠'},
  { value: 'entertainment', label: 'Entertainment', icon: '🎮'},
  { value: 'savings', label: 'Savings', icon: '💰'},
  { value: 'bills', label: 'Bills', icon: '💡'},
  { value: 'transport', label: 'Transport', icon: '🚗'},
  { value: 'health', label: 'Health', icon: '🏥'},
  { value: 'education', label: 'Education', icon: '📚'},
  { value: 'custom', label: 'Custom', icon: '✨'},
];

export const BUDGET_PERIODS=[
    {value:"monthly",label:"Monthly"},
    {value:"weekly",label:"Weekly"},
    {value:"one-time",label:"One-time"}
]