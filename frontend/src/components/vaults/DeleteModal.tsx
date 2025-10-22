import { AlertTriangle, Loader2 } from "lucide-react";
import type{ Vault } from "../../types/vault";
interface DeleteModalProps{
    isOpen:boolean;
    onClose:()=>void;
    onConfirm:()=>Promise<void>;
    vault:Vault|null;
    loading:boolean
}

export default function DeleteConfirmModal({isOpen,onClose,onConfirm,vault,loading}:DeleteModalProps){
    if(!isOpen||!vault)return null;
    const hasSpending=vault.spentAmount>0;
    return(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
                {/* Icon */}
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle className="w-6 h-6 text-red-600" /></div>
                {/* Title */}
                <h2 className="text-xl font-bold text-gray-900 text-center mb-2">Delete Vault?</h2>
                {/* Vault Info */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">{vault.icon}</span>
                        <div>
                            <p className="font-semibold text-gray-900">{vault.vaultName}</p>
                            <p className="text-sm text-gray-600">₹{vault.spentAmount.toLocaleString()} spent of ₹{vault.allocatedAmount.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
                {/* Warning Message */}
                <p className="text-gray-600 text-center mb-6">
                    {hasSpending ? (
                        <>
                        This vault has transaction history. It will be{' '}<span className="font-semibold">archived</span> to preserve records.
                        </>
                    ) : (
                        <>
                        This vault will be <span className="font-semibold text-red-600">permanently deleted</span>. This action cannot be undone.
                        </>
                    )}
                </p>
                {/* Buttons */}
                <div className="flex gap-3">
                    <button onClick={onClose} disabled={loading} className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition disabled:opacity-50">Cancel</button>
                    <button onClick={onConfirm} disabled={loading} className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2">{loading ? (
                        <>
                        <Loader2 className="w-5 h-5 animate-spin" />Deleting...
                        </>
                        ) : (
                        'Delete Vault'
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}