import { useState, useEffect } from 'react';
import { ArrowLeft, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PaymentForm from '../components/payments/PaymentForm';
import PaymentConfirmModal from '../components/payments/PaymentConfirmModal';
import PaymentSuccessModal from '../components/payments/PaymentSuccessModal';
import { vaultAPI, paymentAPI } from '../lib/api';
import type { Vault } from '../types/vault';
import type { PaymentData, PaymentResponse } from '../types/payment';

export default function PaymentPage() {
  const navigate = useNavigate();
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingVaults, setFetchingVaults] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Payment data
  const [pendingPayment, setPendingPayment] = useState<PaymentData | null>(null);
  const [paymentResult, setPaymentResult] = useState<PaymentResponse | null>(null);

  // Fetch vaults on mount
  useEffect(() => {
    fetchVaults();
  }, []);

  const fetchVaults = async () => {
    try {
      setFetchingVaults(true);
      setError(null);
      const response = await vaultAPI.getALL();
      
      if (response.success && response.data) {
        setVaults(response.data.vaults);
      } else {
        setError('Failed to load vaults');
      }
    } catch (err: any) {
      console.error('Error fetching vaults:', err);
      setError(err.response?.data?.message || 'Failed to load vaults. Please try again.');
    } finally {
      setFetchingVaults(false);
    }
  };

  const handlePaymentSubmit = (data: PaymentData) => {
    setPendingPayment(data);
    setShowConfirmModal(true);
  };

  const handleConfirmPayment = async () => {
    if (!pendingPayment) return;

    try {
      setLoading(true);
      setError(null);

      const response = await paymentAPI.makePayment({
        vaultId: pendingPayment.vaultId,
        amount: pendingPayment.amount.toString(),
        description: pendingPayment.description,
        recipientPhone: pendingPayment.recipientPhone || '',
        recipientUpi: pendingPayment.recipientUpi || '',
      });

      if (response.success) {
        setPaymentResult(response.data);
        setShowConfirmModal(false);
        setShowSuccessModal(true);
        
        // Refresh vaults to show updated balances
        await fetchVaults();
      } else {
        throw new Error(response.message || 'Payment failed');
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.response?.data?.message || 'Payment failed. Please try again.');
      setShowConfirmModal(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    setPaymentResult(null);
    setPendingPayment(null);
    // Optionally navigate back to dashboard
    // navigate('/dashboard');
  };

  const handleCancelConfirm = () => {
    setShowConfirmModal(false);
    setPendingPayment(null);
  };

  const getSelectedVault = () => {
    if (!pendingPayment) return null;
    return vaults.find((v) => v.id === pendingPayment.vaultId) || null;
  };

  const getRecipientDisplay = () => {
    if (!pendingPayment) return '';
    return pendingPayment.recipientPhone || pendingPayment.recipientUpi || 'Unknown';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Make Payment</h1>
                <p className="text-sm text-gray-600">Pay from your vaults</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {fetchingVaults ? (
          <div className="bg-white rounded-2xl shadow-lg p-12">
            <div className="flex flex-col items-center justify-center">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 font-medium">Loading your vaults...</p>
            </div>
          </div>
        ) : vaults.length === 0 ? (
          /* No Vaults State */
          <div className="bg-white rounded-2xl shadow-lg p-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-10 h-10 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No Vaults Available</h2>
              <p className="text-gray-600 mb-6">
                You need to create a vault with available balance to make payments.
              </p>
              <button
                onClick={() => navigate('/vaults')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Create Vault
              </button>
            </div>
          </div>
        ) : (
          /* Payment Form */
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <PaymentForm
              vaults={vaults}
              onSubmit={handlePaymentSubmit}
              loading={loading}
            />
          </div>
        )}

        {/* Info Cards */}
        {!fetchingVaults && vaults.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">💡 Quick Tip</h3>
              <p className="text-sm text-blue-800">
                Payments are instantly deducted from your selected vault's balance.
              </p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-semibold text-purple-900 mb-2">🔒 Secure</h3>
              <p className="text-sm text-purple-800">
                All transactions are encrypted and processed securely.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <PaymentConfirmModal
        isOpen={showConfirmModal}
        onClose={handleCancelConfirm}
        onConfirm={handleConfirmPayment}
        loading={loading}
        amount={pendingPayment?.amount || 0}
        description={pendingPayment?.description || ''}
        recipient={getRecipientDisplay()}
        vault={getSelectedVault()}
      />

      {/* Success Modal */}
      <PaymentSuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessClose}
        paymentData={paymentResult}
      />
    </div>
  );
}