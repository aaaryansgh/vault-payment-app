import { createContext, useContext, useEffect, useState } from "react";
import { authAPI, bankAccountAPI } from "../lib/api";
import { useNavigate } from "react-router-dom";

interface User{
    id:string;
    email:string;
    phone:string;
    fullname:string;
}
interface AuthContextType{
    user:User|null;
    loading:boolean;
    login:(email:string,password:string)=>Promise<void>;
    signup:(data:SignupData)=>Promise<void>;
    logout:()=>void;
    isAuthenticated:boolean;
    hasBankAccount:boolean;
}
interface SignupData{
    email:string;
    phone:string;
    passwordHash:string;
    fullname:string;
    pinHash:string;
}

const AuthContext=createContext<AuthContextType|undefined>(undefined);

export function AuthProvider({children}:{children:React.ReactNode}){
    const [user,setUser]=useState<User|null>(null);
    const [loading,setLoading]=useState(true);
    const [hasBankAccount,setHasBankAccount]=useState(false);
    const navigate=useNavigate();
    useEffect(()=>{
        checkAuth();
    },[])
    const checkAuth=async()=>{
        try{
            const response=await authAPI.getMe();
            const {user}=response.data;
            console.log(user);
            setUser(user);
            
            // Check if user has bank accounts
            try{
                const bankAccounts=await bankAccountAPI.getAll();
                setHasBankAccount(bankAccounts.data.bankAccounts.length > 0);
            }catch(err){
                console.log("Failed to fetch bank accounts:",err);
                setHasBankAccount(false);
            }
        }catch(err){
            console.log("Auth check failed:",err);
        } finally{
            setLoading(false);
        }
    }
    
    const login=async(email:string,passwordHash:string)=>{
        try{
            const response=await authAPI.login({email,passwordHash});
            const {user}=response.data;
            setUser(user);
            console.log(user);
            
            // Check if user has bank accounts
            try{
                const bankAccounts=await bankAccountAPI.getAll();
                const hasAccounts=bankAccounts.data.bankAccounts.length > 0;
                setHasBankAccount(hasAccounts);
                
                // Redirect based on bank account status
                if(hasAccounts){
                    navigate("/dashboard");
                }else{
                    navigate("/link-bank-account");
                }
            }catch(err){
                console.log("Failed to fetch bank accounts:",err);
                navigate("/link-bank-account");
            }
        }catch(err){
            console.log(err);
        }
    }
    const signup=async(data:SignupData)=>{
        try{
            const response=await authAPI.register(data);
            const {user}=response.data;
            setUser(user);
            setHasBankAccount(false); // New users don't have bank accounts
            navigate("/link-bank-account");
        }catch(err){
            console.log(err);
        }
    }
    const logout=async()=>{
        await authAPI.logout();
        setUser(null);
        navigate('/home');
    }
    
    return(
        <AuthContext.Provider value={{user,loading,login,signup,logout,isAuthenticated:!!user,hasBankAccount}}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth=():AuthContextType=>{
    const context=useContext(AuthContext);
    if(context===undefined){
        throw new Error('use Auth must be used within an authProvider')
    }
    return context;
}