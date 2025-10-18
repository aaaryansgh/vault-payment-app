import { useState } from "react"
import { useAuth } from "../context/authContext";
import { Loader2, Lock, Mail } from "lucide-react";
import { Link } from "react-router-dom";

export default function LoginPage(){
    const [email,setEmail]=useState("");
    const [password,setPassword]=useState("");
    const [error,setError]=useState("");
    const [loading,setLoading]=useState(false);
    const {login}=useAuth();
    const handleSubmit=async(e:React.FormEvent)=>{
        e.preventDefault();
        setError("");
        setLoading(true);
        try{
            await login(email,password);
        }catch(err:any){
            console.log(err);
            setError(err.message||'Login failed')            
        }finally{
            setLoading(false);
        }
    }

    return(
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2"><span className="text-blue-600">Vault</span>Pay</h1>
                    <p className="text-gray-600">Welcome Back! Please login</p>
                </div>
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Login</h2>
                    {error&&(
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" type="email" onChange={(e)=>setEmail(e.target.value)} placeholder="john@gmail.com" required />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" type="password" onChange={(e)=>setPassword(e.target.value)} placeholder="......" required />
                            </div>
                        </div>
                        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                            {loading?(
                                <>
                                  <Loader2 className="w-5 h-5 animate-spin" />
                                  Logging in...
                                </>
                            ):(
                                'Login'
                            )}
                        </button>
                    </form>
                    <p className="text-center text-gray-600 mt-6">Don't have an account?
                        <Link to="/register" className="text-blue-600 font-semibold hover:text-blue-700">Register here</Link>
                    </p>
                    <div>
                        <a href="http://localhost:3001" target="_blank" rel="noopener noreferrer">Back to Landing page</a>
                    </div>
                </div>
            </div>
        </div>
    )
}