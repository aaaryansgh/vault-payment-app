import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bankAccountAPI } from '../lib/api';
import { Building2, CreditCard, User, Hash, Loader2, Plus, Edit2, Trash2, CheckCircle, X, Wallet } from 'lucide-react';

interface BankAccount {
  id: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  accountHolderName: string;
  balance: number;
  isPrimary: boolean;
  isVerified: boolean;
  createdAt: string;
}

export default function BankAccountLinkingPage() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<string | null>(null);
  const [addMoneyAccount, setAddMoneyAccount] = useState<string | null>(null);
  const [addMoneyAmount, setAddMoneyAmount] = useState<number>(0);
  const [actionLoading, setActionLoading] = useState(false);
  const [formData, setFormData] = useState({
    accountNumber: '',
    ifscCode: '',
    bankName: '',
    accountHolderName: '',
    initialBalance: 0,
  });
  const [editFormData, setEditFormData] = useState({
    accountHolderName: '',
    bankName: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await bankAccountAPI.getAll();
      setAccounts(response.data.accounts);
    } catch (err: any) {
      console.error('Failed to fetch accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.name === 'initialBalance' ? parseFloat(e.target.value) || 0 : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.accountNumber || !formData.ifscCode || !formData.bankName || !formData.accountHolderName) {
      setError('All fields are required');
      return;
    }

    setActionLoading(true);
    try {
      await bankAccountAPI.linkAccount(formData);
      setSuccess('Bank account linked successfully!');
      setFormData({
        accountNumber: '',
        ifscCode: '',
        bankName: '',
        accountHolderName: '',
        initialBalance: 0,
      });
      setShowAddForm(false);
      fetchAccounts();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to link account');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async (accountId: string) => {
    setError('');
    setSuccess('');

    setActionLoading(true);
    try {
      await bankAccountAPI.updateAccount(accountId, editFormData);
      setSuccess('Account updated successfully!');
      setEditingAccount(null);
      fetchAccounts();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update account');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (accountId: string) => {
    if (!window.confirm('Are you sure you want to delete this account?')) {
      return;
    }

    setError('');
    setSuccess('');

    setActionLoading(true);
    try {
      await bankAccountAPI.deleteAccount(accountId);
      setSuccess('Account deleted successfully!');
      fetchAccounts();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete account');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSetPrimary = async (accountId: string) => {
    setError('');
    setSuccess('');

    setActionLoading(true);
    try {
      await bankAccountAPI.setPrimary(accountId);
      setSuccess('Primary account updated!');
      fetchAccounts();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to set primary account');
    } finally {
      setActionLoading(false);
    }
  };

  const startEdit = (account: BankAccount) => {
    setEditingAccount(account.id);
    setEditFormData({
      accountHolderName: account.accountHolderName,
      bankName: account.bankName,
    });
  };

  const cancelEdit = () => {
    setEditingAccount(null);
    setEditFormData({
      accountHolderName: '',
      bankName: '',
    });
  };

  const handleAddMoney = async (accountId: string) => {
    setError('');
    setSuccess('');

    if (addMoneyAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setActionLoading(true);
    try {
      await bankAccountAPI.updateBalance(accountId, addMoneyAmount);
      setSuccess(`₹${addMoneyAmount} added successfully!`);
      setAddMoneyAccount(null);
      setAddMoneyAmount(0);
      fetchAccounts();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add money');
    } finally {
      setActionLoading(false);
    }
  };

  const startAddMoney = (accountId: string) => {
    setAddMoneyAccount(accountId);
    setAddMoneyAmount(0);
  };

  const cancelAddMoney = () => {
    setAddMoneyAccount(null);
    setAddMoneyAmount(0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-red-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bank Accounts</h1>
          <p className="text-gray-600">Link and manage your bank accounts</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError('')}>
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 flex justify-between items-center">
            <span>{success}</span>
            <button onClick={() => setSuccess('')}>
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Add Account Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-red-900 text-white px-6 py-3 rounded-lg hover:bg-red-950 transition flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {showAddForm ? 'Cancel' : 'Link New Account'}
          </button>
        </div>

        {/* Add Account Form */}
        {showAddForm && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Link New Bank Account</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Holder Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="accountHolderName"
                    value={formData.accountHolderName}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bank Name
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="State Bank of India"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Number
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="accountNumber"
                    value={formData.accountNumber}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="1234567890"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  IFSC Code
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="ifscCode"
                    value={formData.ifscCode}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="SBIN0001234"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Initial Balance (Optional)
                </label>
                <input
                  type="number"
                  name="initialBalance"
                  value={formData.initialBalance}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full bg-red-900 text-white py-3 rounded-lg hover:bg-red-950 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {actionLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                {actionLoading ? 'Linking...' : 'Link Account'}
              </button>
            </form>
          </div>
        )}

        {/* Accounts List */}
        <div className="space-y-4">
          {accounts.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Bank Accounts</h3>
              <p className="text-gray-600 mb-4">Link your first bank account to get started</p>
              {accounts.length === 0 && (
                <button
                  onClick={() => navigate('/dashboard')}
                  className="text-red-900 hover:text-red-950 font-medium"
                >
                  Skip for now →
                </button>
              )}
            </div>
          ) : (
            <>
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition"
                >
                  {editingAccount === account.id ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Account Holder Name
                        </label>
                        <input
                          type="text"
                          name="accountHolderName"
                          value={editFormData.accountHolderName}
                          onChange={handleEditChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bank Name
                        </label>
                        <input
                          type="text"
                          name="bankName"
                          value={editFormData.bankName}
                          onChange={handleEditChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdate(account.id)}
                          disabled={actionLoading}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                          {actionLoading ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={cancelEdit}
                          disabled={actionLoading}
                          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : addMoneyAccount === account.id ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Wallet className="w-6 h-6 text-green-600" />
                        <h3 className="text-xl font-bold text-gray-900">Add Money</h3>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Amount (₹)
                        </label>
                        <input
                          type="number"
                          value={addMoneyAmount}
                          onChange={(e) => setAddMoneyAmount(parseFloat(e.target.value) || 0)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-lg"
                          placeholder="Enter amount"
                          min="0"
                          step="0.01"
                          autoFocus
                        />
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Current Balance: <span className="font-semibold text-gray-900">₹{Number(account.balance).toFixed(2)}</span></p>
                        <p className="text-sm text-gray-600 mt-1">New Balance: <span className="font-semibold text-green-600">₹{(Number(account.balance) + addMoneyAmount).toFixed(2)}</span></p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAddMoney(account.id)}
                          disabled={actionLoading}
                          className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {actionLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                          {actionLoading ? 'Adding...' : 'Add Money'}
                        </button>
                        <button
                          onClick={cancelAddMoney}
                          disabled={actionLoading}
                          className="bg-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-400 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl font-bold text-gray-900">{account.bankName}</h3>
                            {account.isPrimary && (
                              <span className="bg-red-100 text-redd-900 text-xs px-2 py-1 rounded-full font-medium">
                                Primary
                              </span>
                            )}
                            {account.isVerified && (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            )}
                          </div>
                          <p className="text-gray-600">{account.accountHolderName}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => startAddMoney(account.id)}
                            disabled={actionLoading}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Add Money"
                          >
                            <Wallet className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => startEdit(account)}
                            disabled={actionLoading}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Edit"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(account.id)}
                            disabled={actionLoading}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete"
                          >
                            {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Account Number</p>
                          <p className="font-medium text-gray-900">
                            ****{account.accountNumber.slice(-4)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">IFSC Code</p>
                          <p className="font-medium text-gray-900">{account.ifscCode}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Balance</p>
                          <p className="font-medium text-gray-900">₹{Number(account.balance).toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Linked On</p>
                          <p className="font-medium text-gray-900">
                            {new Date(account.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {!account.isPrimary && (
                        <button
                          onClick={() => handleSetPrimary(account.id)}
                          disabled={actionLoading}
                          className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                          {actionLoading ? 'Setting...' : 'Set as Primary'}
                        </button>
                      )}
                    </>
                  )}
                </div>
              ))}

              <div className="text-center pt-4">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="bg-red-900 text-white px-8 py-3 rounded-lg hover:bg-red-950 transition font-medium"
                >
                  Continue to Dashboard
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
