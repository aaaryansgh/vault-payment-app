import { useEffect, useState } from "react";
import type{ Vault, VaultSummary } from "../types/vault";
import { bankAccountAPI, vaultAPI } from "../lib/api";
import Loader from "../utils/loader";
import Header from "../components/layout/Header";
import DeleteConfirmModal from "../components/vaults/DeleteModal";
import VaultModal from "../components/vaults/VaultModal";
import VaultCard from "../components/vaults/vaultCard";
import { Link } from "react-router-dom";
import { ArrowLeft, PlusCircle, TrendingUp, Wallet } from "lucide-react";
export default function VaultsPage(){
    const[loading,setLoading]=useState(true);
    const[vaults,setVaults]=useState<Vault[]>([])
    const[summary,setSummary]=useState<VaultSummary|null>(null);
    const[bankAccountId,setBankAccountId]=useState<string>("");

    // Modal states
    const [showVaultModal, setShowVaultModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedVault, setSelectedVault] = useState<Vault | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);


    useEffect(()=>{
        loadData();
    },[])
    const loadData=async()=>{
        try{
            setLoading(true);
            const accountRes=await bankAccountAPI.getPrimary();
            const accountId=accountRes.data.account.id;
            setBankAccountId(accountId);

            //load vaults
            const vaultsRes=await vaultAPI.getALL();
            setVaults(vaultsRes.data.vaults);

            //load summary
            const summaryRes=await vaultAPI.getSummary(accountId);
            setSummary(summaryRes.data);
            console.log(summaryRes);
            
            
        }catch(err:any){
            console.log(err);
            if(err.response?.status===404){
                alert('please link a bank account first');
            }
        }finally{
            setLoading(false);
        }
    }
    const handleCreateVault=async(data:any)=>{
        try{
            await vaultAPI.create(data);
            await loadData();
        }catch(err:any){
            throw new Error(err)
        }
    }
    const handleUpdateVault=async(data:any)=>{
        if(!selectedVault)return;
        try{
            await vaultAPI.update(selectedVault.id,data);
            await loadData();
            setShowDeleteModal(false);
            setSelectedVault(null);
        }catch(err){
            console.log(err);
            alert(err);
        }
    }
    const handleDeleteVault=async()=>{
        if(!selectedVault)return;
        try{
            setDeleteLoading(true);
            await vaultAPI.delete(selectedVault.id);
            await loadData();
            setShowDeleteModal(false);
            setSelectedVault(null);
        }catch(err){
            alert(err)
        }finally{
            setDeleteLoading(false);
        }
    }
    const openEditModal=(vault:Vault)=>{
        setSelectedVault(vault);
        setShowVaultModal(true);
    }
    const openDeleteModal=(vault:Vault)=>{
        setSelectedVault(vault);
        setShowDeleteModal(true);
    }
    const closeVaultModal=()=>{
        setShowVaultModal(false);
        setSelectedVault(null);
    }
    if(loading){
        <Loader />
    }
    return(
        <div className="min-h-screen bg-gray-50">
            <Header />
            <nav className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex gap-8">
                        <Link className="py-4 border-b-2 border-transparent text-gray-600 hover:text-gray-900 font-medium" to="/dashboard">Dashboard</Link>
                        <Link className="py-4 border-b-2 border-red-900 text-red-900" to="/vaults">Vaults</Link>
                        <Link className="py-4 border-b-2 border-transparent text-gray-600 hover:text-gray-900" to="/link-bank-account">Bank Account</Link>
                        <Link className="py-4 border-b-2 border-transparent text-gray-600 hover:text-gray-900" to="/payments">Payments</Link>
                        <Link className="py-4 border-b-2 border-transparent text-gray-600 hover:text-gray-900" to="/transactions">Transactions</Link>
                    </div>
                </div>
            </nav>
            <main>
                {/*back button*/}
                <Link className="inline-flex items-center mx-2 mt-2 gap-2 text-red-900 hover:font-bold cursor-pointer mb-6" to="/dashboard"><ArrowLeft size={20}/>Dashboard</Link>
                {/*summary*/}
                {summary && (
                    <div className="bg-gradient-to-r from-red-950 to-red-900  p-6 text-white mb-8 shadow-lg">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div>
                                <p className="text-blue-100 text-sm mb-1">Total Balance</p>
                                <p className="text-3xl font-bold">₹{summary.summary.totalBalance.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-blue-100 text-sm mb-1">Allocated</p>
                                <p className="text-3xl font-bold">₹{summary.summary.totalAllocated.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-blue-100 text-sm mb-1">Spent</p>
                                <p className="text-3xl font-bold">₹{summary.summary.totalSpent.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-blue-100 text-sm mb-1">Unallocated</p>
                                <p className="text-3xl font-bold">₹{summary.summary.unallocatedBalance.toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-red-400">
                            <div className="flex justify-between items-center">
                                <span className="text-blue-100">{summary.summary.totalVaults} active vaults</span>
                                <span className="text-blue-100">{summary.summary.allocationPercentage.toFixed(1)}% allocated</span>
                            </div>
                        </div>
                    </div>
                )}
                {/*vault button*/}
                <div className="flex justify-between mx-2 items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Your vaults</h2>
                    <button onClick={()=>setShowVaultModal(true)} className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-950 transition shadow-md"><PlusCircle size={20} />Create Vault</button>
                </div>
                {/* Vaults Grid */}
                {vaults.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
                        <Wallet className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No Vaults Yet</h3>
                        <p className="text-gray-600 mb-6">Create your first vault to start organizing your money</p>
                        <button onClick={() => setShowVaultModal(true)} className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-950 transition"><PlusCircle size={20} />Create Your First Vault</button>
                    </div>
                ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {vaults.map((vault) => (
                        <VaultCard key={vault.id} vault={vault} onEdit={openEditModal} onDelete={openDeleteModal}/>
                    ))}
                </div>
                )}
                {/* Allocation Tip */}
                {summary && summary.summary.unallocatedBalance > 0 && (
                    <div className="mt-8 bg-black border p-6 flex items-start gap-4">
                        <TrendingUp className="w-6 h-6 text-white flex-shrink-0 mt-1" />
                        <div>
                            <h3 className="font-semibold text-white mb-1">You have ₹{summary.summary.unallocatedBalance.toLocaleString()} unallocated</h3>
                            <p className="text-white text-sm">Create more vaults to organize this money into spending categories</p>
                        </div>
                    </div>
                )}
            </main>
            {/*modals*/}
            <VaultModal isOpen={showVaultModal} onClose={closeVaultModal} onSubmit={selectedVault?handleUpdateVault:handleCreateVault} vault={selectedVault} bankAccountId={bankAccountId} unallocatedBalance={summary?.summary.unallocatedBalance||0} />
            <DeleteConfirmModal isOpen={showDeleteModal} onClose={()=>setShowDeleteModal(false)} onConfirm={handleDeleteVault} vault={selectedVault} loading={deleteLoading} />
        </div>
    )
}