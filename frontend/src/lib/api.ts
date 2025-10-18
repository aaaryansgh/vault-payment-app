import axios from "axios";

const API_URL='http://localhost:5000/api'

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
        const response=await axios.get(`${API_URL}/user-accounts`,{withCredentials:true})
        return response.data;
    },
    getPrimary:async()=>{
        const response=await axios.get(`${API_URL}/primary`,{withCredentials:true})
        return response.data;
    },
    linkAccount:async(data:{
        accountNumber:string;
        ifscCode:string;
        bankName:string;
        accountHolderName:string;
        initialBalance:number;
    })=>{
        const response=await axios.post(`${API_URL}/link-account`,data,{withCredentials:true});
        return response.data;
    },
    getSummary:async(id:string)=>{
        const response=await axios.get(`${API_URL}/${id}/summary`,{withCredentials:true})
        return response;
    },
    setPrimary:async(id:string)=>{
        const response=await axios.get(`${API_URL}/${id}/set-primary`,{withCredentials:true})
        return response.data;
    }
}

export const vaultAPI={
    getALL:async(bankAccountId:string)=>{
        const response=await axios.get(`${API_URL}/user-vaults/${bankAccountId}`,{withCredentials:true})
        return response.data;
    },
    getById:async(id:string)=>{
        const response=await axios.get(`${API_URL}/vault/${id}`,{withCredentials:true})
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
        const response=await axios.post(`${API_URL}/create-vault`,data,{withCredentials:true})
        return response.data;
    },
    update:async(id:string,data:any)=>{
        const response=await axios.patch(`${API_URL}/update/${id}`,data,{withCredentials:true})
        return response.data;
    },
    delete:async(id:string)=>{
        const response=await axios.delete(`${API_URL}/delete/${id}`,{withCredentials:true})
        return response.data;
    },
    getSummary:async(bankAccountId:string)=>{
        const response=await axios.get(`${API_URL}/vault/summary/${bankAccountId}`,{withCredentials:true})
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
        const response=await axios.post(`${API_URL}/makePayment`,data,{withCredentials:true})
        return response.data;
    },
    getTransaction:async(transactionId:string)=>{
        const response=await axios.get(`${API_URL}/transaction/${transactionId}`,{withCredentials:true})
        return response.data;
    },
    getSpendingSummary:async(vaultId:string)=>{
        const response=await axios.get(`${API_URL}/summary/${vaultId}`,{withCredentials:true})
        return response.data;
    },
    getVaultAnalytics:async(vaultId:string)=>{
        const response=await axios.get(`${API_URL}/analytics/vaults/${vaultId}`,{withCredentials:true})
        return response.data;
    }
}

