import { AlertCircle, Loader2 } from 'lucide-react';
import type{ Vault } from '../../types/vault';

interface PaymentConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  loading: boolean;
  amount: number;
  description: string;
  recipient: string;
  vault: Vault | null;
}

export default function PaymentConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  loading,
  amount,
  description,
  recipient,
  vault,
}: PaymentConfirmModalProps) {
  if (!isOpen || !vault) return null;

  const newBalance = vault.remainingAmount - amount;
  const newUsage = ((vault.spentAmount + amount) / vault.allocatedAmount) * 100;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        {/* Icon */}
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl"
        >
          {vault.icon}
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
          Confirm Payment
        </h2>

        {/* Payment Details */}
        <div className="space-y-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Amount</span>
              <span className="font-bold text-gray-900 text-lg">
                ₹{amount.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">To</span>
              <span className="font-medium text-gray-900">{recipient}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Description</span>
              <span className="font-medium text-gray-900">{description}</span>
            </div>
          </div>

          {/* Vault Info */}
          <div className="border-t border-gray-200 pt-4">
            <p className="text-sm text-gray-600 mb-2">From Vault:</p>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{vault.icon}</span>
              <div>
                <p className="font-semibold text-gray-900">{vault.vaultName}</p>
                <p className="text-sm text-gray-600">
                  Current: ₹{vault.remainingAmount.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Balance Preview */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-red-900">After payment:</span>
                <span className="font-semibold text-red-900">
                  ₹{newBalance.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-red-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.min(newUsage, 100)}%`
                  }}
                />
              </div>
              <p className="text-xs text-red-900 mt-1">
                {newUsage.toFixed(1)}% used
              </p>
            </div>

            {/* Warning if low balance */}
            {newBalance < vault.allocatedAmount * 0.1 && (
              <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-800">
                  This payment will leave you with less than 10% of your vault budget
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-red-900 text-white rounded-lg font-semibold hover:bg-red-950 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              'Confirm Payment'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}