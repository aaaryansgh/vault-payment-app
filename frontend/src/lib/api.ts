import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const authAPI={
    register:async(data:{
        email:string;
        phone:string;
        passwordHash:string;
        fullname:string;
        pinHash:string
    })=>{
        const response=await axios.post(`${API_URL}/auth/signup`,data,{withCredentials:true})
        return response.data; 
    },
    login:async(data:{email:string;passwordHash:string})=>{
        const response=await axios.post(`${API_URL}/auth/login`,data,{withCredentials:true})
        return response.data;
    },
    getMe:async()=>{
        const response=await axios.get(`${API_URL}/auth/me`,{withCredentials:true});
        return response.data;
    },
    logout:async()=>{
        const response=await axios.post(`${API_URL}/auth/logout`,{},{withCredentials:true})
        return response.data;
    }
}

export const bankAccountAPI={
    getAll:async()=>{
        const response=await axios.get(`${API_URL}/bank-accounts/user-accounts`,{withCredentials:true})
        return response.data;
    },
    getPrimary:async()=>{
        const response=await axios.get(`${API_URL}/bank-accounts/primary`,{withCredentials:true})
        return response.data;
    },
    linkAccount:async(data:{
        accountNumber:string;
        ifscCode:string;
        bankName:string;
        accountHolderName:string;
        initialBalance:number;
    })=>{
        const response=await axios.post(`${API_URL}/bank-accounts/link-account`,data,{withCredentials:true});
        return response.data;
    },
    getSummary:async(id:string)=>{
        const response=await axios.get(`${API_URL}/bank-accounts/${id}/summary`,{withCredentials:true})
        return response;
    },
    setPrimary:async(id:string)=>{
        const response=await axios.patch(`${API_URL}/bank-accounts/${id}/set-primary`,{},{withCredentials:true})
        return response.data;
    },
    updateAccount:async(id:string,data:{
        accountHolderName?:string;
        bankName?:string;
    })=>{
        const response=await axios.patch(`${API_URL}/bank-accounts/${id}`,data,{withCredentials:true})
        return response.data;
    },
    deleteAccount:async(id:string)=>{
        const response=await axios.delete(`${API_URL}/bank-accounts/${id}`,{withCredentials:true})
        return response.data;
    },
    updateBalance:async(id:string,amount:number)=>{
        const response=await axios.patch(`${API_URL}/bank-accounts/${id}/balance`,{amount},{withCredentials:true})
        return response.data;
    }
}

export const vaultAPI={
    getALL:async()=>{
        const response=await axios.get(`${API_URL}/vaults/user-vaults/`,{withCredentials:true})
        return response.data;
    },
    getById:async(id:string)=>{
        const response=await axios.get(`${API_URL}/vaults/${id}`,{withCredentials:true})
        return response.data;
    },
    create:async(data:{
        bankAccountId:string;
        vaultName:string;
        vaultType:string;
        allocatedAmount:number;
        icon:string;
        budgetPeriod:string;
    })=>{
        const response=await axios.post(`${API_URL}/vaults/create-vault`,data,{withCredentials:true})
        return response.data;
    },
    
    update:async(id:string,data:any)=>{
        const response=await axios.patch(`${API_URL}/vaults/update/${id}`,data,{withCredentials:true})
        return response.data;
    },
    delete:async(id:string)=>{
        const response=await axios.delete(`${API_URL}/vaults/delete/${id}`,{withCredentials:true})
        return response.data;
    },
    getSummary:async(bankAccountId:string)=>{
        const response=await axios.get(`${API_URL}/vaults/summary/${bankAccountId}`,{withCredentials:true})
        return response.data;
    }
}

export const paymentAPI={
    makePayment:async(data:{
        vaultId:string;
        amount:string;
        description:string;
        recipientPhone:string;
        recipientUpi:string;
    })=>{
        const response=await axios.post(`${API_URL}/payments/makePayment`,data,{withCredentials:true})
        return response.data;
    },
    getTransaction:async(transactionId:string)=>{
        const response=await axios.get(`${API_URL}/payments/transaction/${transactionId}`,{withCredentials:true})
        return response.data;
    },
    getSpendingSummary:async()=>{
        const response=await axios.get(`${API_URL}/payments/spending-summary/`,{withCredentials:true})
        return response.data;
    },
    getVaultAnalytics:async(vaultId:string)=>{
        const response=await axios.get(`${API_URL}/payments/analytics/vaults/${vaultId}`,{withCredentials:true})
        return response.data;
    },
    getAiInsights:async()=>{
        const response=await axios.get(`${API_URL}/insights`,{withCredentials:true})
        return response.data;
    },
    getCategoryAnalytics: async (params?: { startDate?: string; endDate?: string; }) => {
        const response = await axios.get(`${API_URL}/payments/analytics/category`, { params, withCredentials: true });
        return response.data;
    },
    getTimeSeriesAnalytics: async (params?: { startDate?: string; endDate?: string; granularity?: string; }) => {
         const response = await axios.get(`${API_URL}/payments/analytics/time-series`, { params, withCredentials: true });
        return response.data;
    },
    getVaultBreakdownAnalytics: async (params?: { startDate?: string; endDate?: string; }) => {
         const response = await axios.get(`${API_URL}/payments/analytics/vault-breakdown`, { params, withCredentials: true });
        return response.data;
    },
}

