import { Edit2, Trash2, TrendingUp } from 'lucide-react';
import type{ Vault } from '../../types/vault';

interface VaultCardProps {
  vault: Vault;
  onEdit: (vault: Vault) => void;
  onDelete: (vault: Vault) => void;
}

export default function VaultCard({ vault, onEdit, onDelete }: VaultCardProps) {
  const isLow = vault.remainingAmount < vault.allocatedAmount * 0.2;
  const isFull = vault.remainingAmount === 0;

  return (
    <div className="bg-white mx-2 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl shadow-md">
            {vault.icon}
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-800">{vault.vaultName}</h3>
            <p className="text-sm text-gray-500 capitalize">{vault.vaultType}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(vault)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            title="Edit vault"
          >
            <Edit2 size={16} className="text-gray-600" />
          </button>
          <button
            onClick={() => onDelete(vault)}
            className="p-2 hover:bg-red-50 rounded-lg transition"
            title="Delete vault"
          >
            <Trash2 size={16} className="text-red-500" />
          </button>
        </div>
      </div>

      {/* Amounts */}
      <div className="space-y-3">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-sm text-gray-600">Remaining</p>
            <p className="text-2xl font-bold text-gray-800">
              ₹{vault.remainingAmount.toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">of ₹{vault.allocatedAmount.toLocaleString()}</p>
            <p className="text-xs text-gray-500">{vault.budgetPeriod}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative">
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all bg-black duration-500"
              style={{
                width: `${vault.usagePercentage}%`,
              }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {vault.usagePercentage.toFixed(1)}% used
          </p>
        </div>

        {/* Spent Amount */}
        <div className="flex justify-between text-sm pt-2 border-t border-gray-100">
          <span className="text-gray-600">Spent</span>
          <span className="font-medium text-gray-800">
            ₹{vault.spentAmount.toLocaleString()}
          </span>
        </div>

        {/* Warnings */}
        {isLow && !isFull && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 text-xs text-yellow-700 flex items-center gap-2">
            <TrendingUp size={14} />
            Low balance warning
          </div>
        )}
        {isFull && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-xs text-red-700">
            🚫 Vault depleted
          </div>
        )}

        {/* Action Button */}
        <button
          className="w-full py-2 rounded-lg font-medium text-sm transition-all duration-200 text-white"
        >
          Pay from this vault
        </button>
      </div>
    </div>
  );
}