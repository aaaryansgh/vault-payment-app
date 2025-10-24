import { CheckCircle, X, Download } from 'lucide-react';
import type{ PaymentResponse } from '../../types/payment';

interface PaymentSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentData: PaymentResponse | null;
}

export default function PaymentSuccessModal({
  isOpen,
  onClose,
  paymentData,
}: PaymentSuccessModalProps) {
  if (!isOpen || !paymentData) return null;

  const { transaction, vault } = paymentData;
  const isSuccess = transaction.status === 'completed';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <X size={20} />
        </button>

        {/* Success Icon */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
          {isSuccess ? 'Payment Successful!' : 'Payment Failed'}
        </h2>
        <p className="text-gray-600 text-center mb-6">
          {isSuccess
            ? 'Your payment has been processed successfully'
            : 'Something went wrong with your payment'}
        </p>

        {/* Transaction Details */}
        {isSuccess && (
          <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Amount Paid</span>
              <span className="font-bold text-gray-900">
                ₹{transaction.amount.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Transaction ID</span>
              <span className="font-mono text-sm text-gray-900">
                {transaction.transactionRef}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Gateway ID</span>
              <span className="font-mono text-xs text-gray-600">
                {transaction.gatewayTransactionId}
              </span>
            </div>
            {transaction.recipientPhone && (
              <div className="flex justify-between">
                <span className="text-gray-600">Recipient</span>
                <span className="text-gray-900">{transaction.recipientPhone}</span>
              </div>
            )}
            {transaction.recipientUpi && (
              <div className="flex justify-between">
                <span className="text-gray-600">UPI ID</span>
                <span className="text-gray-900">{transaction.recipientUpi}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Description</span>
              <span className="text-gray-900">{transaction.description}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date & Time</span>
              <span className="text-gray-900">
                {new Date(transaction.createdAt).toLocaleString()}
              </span>
            </div>
          </div>
        )}

        {/* Vault Update Info */}
        {isSuccess && (
          <div
            className="rounded-xl p-4 mb-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{transaction.vault.icon}</span>
              <div>
                <p className="font-semibold text-gray-900">
                  {transaction.vault.vaultName}
                </p>
                <p className="text-sm text-gray-600">Vault Updated</p>
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Previous Balance:</span>
              <span className="font-medium">₹{vault.previousbalance.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">New Balance:</span>
              <span className="font-bold">
                ₹{vault.newBalance.toLocaleString()}
              </span>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          {isSuccess && (
            <button className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition flex items-center justify-center gap-2">
              <Download size={18} />
              Download Receipt
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-red-900 text-white rounded-lg font-semibold hover:bg-red-950 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}