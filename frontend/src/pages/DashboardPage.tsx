import { useEffect, useState } from "react";
import { paymentAPI, vaultAPI } from "../lib/api"
import { ArrowUpRight, CreditCard, TrendingUp, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "../components/layout/Header";
import Loader from "../utils/loader";
import Insights from "../components/AI/insight";
export default function DashboardPage(){
    const [loading,setLoading]=useState(true);
    const [summary,setSummary]=useState<any>(null);
    const [vaults,setVaults]=useState<any>([]);
    useEffect(()=>{
        loadDashboardData();
    },[])
    const loadDashboardData=async()=>{
        try{
            const summaryResult=await paymentAPI.getSpendingSummary();
            setSummary(summaryResult.data)
            // load vaults
            const vaultRes=await vaultAPI.getALL();
            setVaults(vaultRes.data.vaults)
            
        }catch(err){
            console.log(err);
        }finally{
            setLoading(false);
        }
    }
    if(loading){
        <Loader />
    }
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <Header />
            {/*Navigation*/}
            <nav className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex gap-8">
                        <Link className="py-4 border-b-2 border-red-900 text-red-900 font-medium" to="/dashboard">Dashboard</Link>
                        <Link className="py-4 border-b-2 border-transparent text-gray-600 hover:text-gray-900" to="/vaults">Vaults</Link>
                        <Link className="py-4 border-b-2 border-transparent text-gray-600 hover:text-gray-900" to="/link-bank-account">Bank Account</Link>
                        <Link className="py-4 border-b-2 border-transparent text-gray-600 hover:text-gray-900" to="/payments">Payments</Link>
                        <Link className="py-4 border-b-2 border-transparent text-gray-600 hover:text-gray-900" to="/transactions">Transactions</Link>
                        <Link className="py-4 border-b-2 border-transparent text-gray-600 hover:text-gray-900" to="/analytics">Analytics</Link>
                    </div>
                </div>
            </nav>
            {/* main content */}
            <main>
                {/*summary cards*/}
                <div className="grid grid-cols-1 mx-2 mt-2 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-blue-50 p-6 shadow-sm hover:shadow-2xl hover:shadow-blue-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-blue-200 rounded-lg flex items-center justify-center">
                                <Wallet className="w-6 h-6 text-blue-600" />
                            </div>
                            <span className="text-sm text-gray-500">Total Allocated</span>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{summary?.summary.totalAllocated.toLocaleString()||"0"}</p>
                    </div>
                    <div className="bg-green-50 p-6 shadow-sm hover:shadow-2xl hover:shadow-green-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-green-300 rounded-lg flex items-center justify-center">
                                <CreditCard />
                            </div>
                            <span className="text-sm text-gray-500">Total spent</span>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{summary?.summary.totalSpent.toLocaleString()||"0"}</p>
                    </div>
                    <div className="bg-purple-50 p-6 shadow-sm hover:shadow-2xl hover:shadow-purple-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-purple-300 rounded-lg flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-purple-600" />
                            </div>
                            <span className="text-sm text-gray-500">Remaining</span>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{summary?.summary.totalRemaining.toLocaleString()||"0"}</p>
                    </div>
                </div>
                <div className="mb-8">
                  <Insights />
                </div>
                {/*vaults overview */}
                <div className="bg-white shadow-sm p-6 mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Your vaults</h2>
                        <Link className="text-red-900 hover:text-blue-950 cursor-pointer font-medium flex items-center gap-2" to="/vaults">View All <ArrowUpRight /></Link>
                    </div>
                    {vaults.length===0?(
                        <div className="text-center py-12">
                            <Wallet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-600 mb-4">No vaults created yet</p>
                            <Link className="inline-block bg-red-900 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-950" to="/vaults">Created your first vault</Link>
                        </div>
                    ):(
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {vaults.slice(0,6).map((vault)=>(
                                <div key={vault.id} className="border cursor-pointer border-gray-200 p-4 hover:shadow-xl transition">
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="text-3xl">{vault.icon}</span>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{vault.vaultName}</h3>
                                            <p className="text-xs text-gray-500 capitalize">{vault.vaultType}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Allocated:</span>
                                            <span className="font-medium text-green-500">{vault.allocatedAmount.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Remaining:</span>
                                            <span className="font-medium text-red-600">{vault.remainingAmount.toLocaleString()}</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div className="h-2 rounded-full transition-all bg-red-900" style={{width:`${vault.usagePercentage}%`}}></div>
                                        </div>
                                        <p className="text-xs text-gray-500 text-right">{vault.usagePercentage.toFixed(1)}% used</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                {/*spending by category*/}
                {summary?.spendingByCategory&& summary.spendingByCategory.length>0&&(
                    <div className="bg-white shadow-sm p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Spending by Category</h2>
                        <div className="space-y-4">
                            {summary.spendingByCategory.map((category: any) => (
                                <div key={category.category}>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-gray-700 capitalize">{category.category}</span>
                                        <span className="font-medium">₹{category.amount.toLocaleString()} ({category.percentage.toFixed(1)}%)</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div className="bg-red-900 h-2 rounded-full" style={{ width: `${category.percentage}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}