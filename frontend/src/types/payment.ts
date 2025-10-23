export interface PaymentData{
    vaultId:string;
    amount:number;
    description:string;
    recipientPhone?:string;
    recipientUpi?:string;
    recipientId?:string;
}

export interface PaymentResponse{
    transaction: {
        id: string;
        transactionRef: string;
        amount: number;
        description: string;
        status: string;
        paymentMethod: string;
        gatewayTransactionId: string;
        recipientPhone?: string;
        recipientUpi?: string;
        createdAt: string;
        vault:{
            vaultName: string;
            icon: string;
            color: string;
        };
    };
    vault: {
        id: string;
        name: string;
        previousbalance: number;
        newBalance: number;
        usagePercentage: number;
    };
}

export interface Transaction {
  id: string;
  transactionRef: string;
  amount: number;
  description: string;
  status: string;
  transactionType: string;
  category: string;
  paymentMethod: string;
  recipientPhone?: string;
  recipientUpi?: string;
  createdAt: string;
  vault?: {
    vaultName: string;
    icon: string;
    color: string;
  };
  recipient?: {
    fullName: string;
    email: string;
    phone: string;
  };
}