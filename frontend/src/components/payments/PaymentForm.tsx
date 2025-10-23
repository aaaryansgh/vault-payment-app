import { useState, useEffect } from 'react';
import { Wallet, User, Phone, FileText, AlertCircle } from 'lucide-react';
import type{ Vault } from '../../types/vault';

interface PaymentFormProps {
  vaults: Vault[];
  onSubmit: (data:any) => void;
  loading: boolean;
}

export default function PaymentForm({ vaults, onSubmit, loading }: PaymentFormProps) {
  const [selectedVault, setSelectedVault] = useState<Vault | null>(null);
  const [formData, setFormData] = useState({
    amount: '',
    recipientPhone: '',
    recipientUpi: '',
    description: '',
  });
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (vaults.length > 0 && !selectedVault) {
      setSelectedVault(vaults[0]);
    }
  }, [vaults]);

  const handleVaultChange = (vaultId: string) => {
    const vault = vaults.find((v) => v.id === vaultId);
    setSelectedVault(vault || null);
    setErrors([]);
  };

  const validateForm = () => {
    const newErrors: string[] = [];

    if (!selectedVault) {
      newErrors.push('Please select a vault');
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.push('Please enter a valid amount');
    }

    if (selectedVault && parseFloat(formData.amount) > selectedVault.remainingAmount) {
      newErrors.push('Amount exceeds vault balance');
    }

    if (!formData.recipientPhone && !formData.recipientUpi) {
      newErrors.push('Please enter recipient phone or UPI ID');
    }

    if (formData.recipientPhone && !/^[+]?[0-9]{10,15}$/.test(formData.recipientPhone.replace(/\s/g, ''))) {
      newErrors.push('Invalid phone number format');
    }

    if (!formData.description || formData.description.trim().length < 3) {
      newErrors.push('Description must be at least 3 characters');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSubmit({
      vaultId: selectedVault!.id,
      amount: parseFloat(formData.amount),
      description: formData.description,
      recipientPhone: formData.recipientPhone || undefined,
      recipientUpi: formData.recipientUpi || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-red-900 mb-1">Please fix the following:</h4>
              <ul className="text-sm text-red-700 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Select Vault */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Wallet className="inline w-4 h-4 mr-2" />
          Pay from Vault *
        </label>
        <select
          value={selectedVault?.id || ''}
          onChange={(e) => handleVaultChange(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          disabled={loading}
        >
          {vaults.map((vault) => (
            <option key={vault.id} value={vault.id}>
              {vault.icon} {vault.vaultName} - ₹{vault.remainingAmount.toLocaleString()} available
            </option>
          ))}
        </select>
      </div>

      {/* Vault Balance Display */}
      {selectedVault && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-700">Available Balance</span>
            <span className="text-2xl font-bold text-gray-900">
              ₹{selectedVault.remainingAmount.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>Allocated: ₹{selectedVault.allocatedAmount.toLocaleString()}</span>
            <span>Spent: ₹{selectedVault.spentAmount.toLocaleString()}</span>
          </div>
          <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${selectedVault.usagePercentage}%`
              }}
            />
          </div>
        </div>
      )}

      {/* Amount */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Amount (₹) *
        </label>
        <input
          type="number"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-lg"
          placeholder="500"
          min="1"
          step="0.01"
          disabled={loading}
          required
        />
        {selectedVault && formData.amount && parseFloat(formData.amount) > 0 && (
          <p className="text-sm text-gray-600 mt-1">
            Remaining after payment: ₹
            {(selectedVault.remainingAmount - parseFloat(formData.amount)).toLocaleString()}
          </p>
        )}
      </div>

      {/* Recipient Phone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Phone className="inline w-4 h-4 mr-2" />
          Recipient Phone Number
        </label>
        <input
          type="tel"
          value={formData.recipientPhone}
          onChange={(e) => setFormData({ ...formData, recipientPhone: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          placeholder="+919876543210"
          disabled={loading}
        />
      </div>

      {/* Recipient UPI */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <User className="inline w-4 h-4 mr-2" />
          Recipient UPI ID
        </label>
        <input
          type="text"
          value={formData.recipientUpi}
          onChange={(e) => setFormData({ ...formData, recipientUpi: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          placeholder="user@paytm"
          disabled={loading}
        />
        <p className="text-xs text-gray-500 mt-1">Enter either phone number or UPI ID</p>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <FileText className="inline w-4 h-4 mr-2" />
          Description *
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
          placeholder="What's this payment for?"
          rows={3}
          disabled={loading}
          required
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || !selectedVault}
        className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
      >
        {loading ? 'Processing Payment...' : `Pay ₹${formData.amount || '0'}`}
      </button>
    </form>
  );
}