import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { VAULT_TYPES, BUDGET_PERIODS } from "../../types/vault"
import type{ Vault } from '../../types/vault';

interface VaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  vault?: Vault | null;
  bankAccountId: string;
  unallocatedBalance: number;
}

export default function VaultModal({
  isOpen,
  onClose,
  onSubmit,
  vault,
  bankAccountId,
  unallocatedBalance,
}: VaultModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    vaultName: '',
    vaultType: 'groceries',
    allocatedAmount: '',
    icon: '🛒',
    budgetPeriod: 'monthly',
  });

  useEffect(() => {
    if (vault) {
      // Edit mode
      setFormData({
        vaultName: vault.vaultName,
        vaultType: vault.vaultType,
        allocatedAmount: vault.allocatedAmount.toString(),
        icon: vault.icon,
        budgetPeriod: vault.budgetPeriod,
      });
    } else {
      // Create mode - reset form
      setFormData({
        vaultName: '',
        vaultType: 'groceries',
        allocatedAmount: '',
        icon: '🛒',
        budgetPeriod: 'monthly',
      });
    }
    setError('');
  }, [vault, isOpen]);

  const handleVaultTypeChange = (type: string) => {
    const vaultType = VAULT_TYPES.find((v) => v.value === type);
    if (vaultType) {
      setFormData({
        ...formData,
        vaultType: type,
        icon: vaultType.icon,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const amount = parseFloat(formData.allocatedAmount);

      if (isNaN(amount) || amount <= 0) {
        setError('Please enter a valid amount');
        setLoading(false);
        return;
      }

      if (!vault && amount > unallocatedBalance) {
        setError(`Amount exceeds unallocated balance (₹${unallocatedBalance})`);
        setLoading(false);
        return;
      }

      const data = vault
        ? {
            vaultName: formData.vaultName,
            allocatedAmount: amount,
            icon: formData.icon,
            budgetPeriod: formData.budgetPeriod,
          }
        : {
            bankAccountId,
            vaultName: formData.vaultName,
            vaultType: formData.vaultType,
            allocatedAmount: amount,
            icon: formData.icon,
            budgetPeriod: formData.budgetPeriod,
          };

      await onSubmit(data);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save vault');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {vault ? 'Edit Vault' : 'Create New Vault'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Unallocated Balance Info */}
          {!vault && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">Available:</span> ₹
                {unallocatedBalance.toLocaleString()}
              </p>
            </div>
          )}

          {/* Vault Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vault Name *
            </label>
            <input
              type="text"
              value={formData.vaultName}
              onChange={(e) =>
                setFormData({ ...formData, vaultName: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="e.g., Monthly Groceries"
              required
            />
          </div>

          {/* Vault Type */}
          {!vault && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={formData.vaultType}
                onChange={(e) => handleVaultTypeChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                {VAULT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Allocated Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Allocated Amount (₹) *
            </label>
            <input
              type="number"
              value={formData.allocatedAmount}
              onChange={(e) =>
                setFormData({ ...formData, allocatedAmount: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="5000"
              min="1"
              step="0.01"
              required
            />
            {vault && (
              <p className="text-xs text-gray-500 mt-1">
                Currently spent: ₹{vault.spentAmount.toLocaleString()}
              </p>
            )}
          </div>

          {/* Budget Period */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Budget Period
            </label>
            <select
              value={formData.budgetPeriod}
              onChange={(e) =>
                setFormData({ ...formData, budgetPeriod: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              {BUDGET_PERIODS.map((period) => (
                <option key={period.value} value={period.value}>
                  {period.label}
                </option>
              ))}
            </select>
          </div>

          {/* Icon Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Icon & Color
            </label>
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl shadow-md"
              >
                {formData.icon}
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) =>
                    setFormData({ ...formData, icon: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
                  placeholder="Emoji"
                  maxLength={2}
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : vault ? (
                'Update Vault'
              ) : (
                'Create Vault'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}