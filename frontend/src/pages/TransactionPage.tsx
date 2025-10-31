import { useEffect, useState } from 'react';
import { ArrowLeft, Search, Filter, Calendar, Eye, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import { vaultAPI } from '../lib/api';
import axios from 'axios';
import type { Vault } from '../types/vault';

interface Transaction {
  id: string;
  transactionRef: string;
  amount: number;
  description: string;
  status: string;
  transactionType: string;
  category: string;
  paymentMethod: string;
  recipientPhone?: string;
  recipientUpi?: string;
  createdAt: string;
  vault?: {
    vaultName: string;
    icon: string;
  };
  recipient?: {
    fullname: string;
    email: string;
    phone: string;
  };
}


export default function TransactionsPage() {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    offset: 0,
    hasMore: false,
  });

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVault, setSelectedVault] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Vaults for filter
  const [vaults, setVaults] = useState<Vault[]>([]);

  // Selected transaction for details
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    loadVaults();
    loadTransactions();
  }, []);

  const loadVaults = async () => {
    try {
      const response = await vaultAPI.getALL();
      if (response.success) {
        setVaults(response.data.vaults);
      }
    } catch (err) {
      console.error('Error loading vaults:', err);
    }
  };

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (selectedVault) params.append('vaultId', selectedVault);
      if (selectedStatus) params.append('status', selectedStatus);
      if (startDate) params.append('startDate', new Date(startDate).toISOString());
      if (endDate) params.append('endDate', new Date(endDate).toISOString());
      params.append('limit', pagination.limit.toString());
      params.append('offset', pagination.offset.toString());

      const response = await axios.get(
        `http://localhost:5000/api/payments/transactions?${params.toString()}`,
        { withCredentials: true }
      );

      if (response.data.success) {
        setTransactions(response.data.data.transactions);
        setPagination(response.data.data.pagination);
      }
    } catch (err) {
      console.error('Error loading transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = () => {
    setPagination({ ...pagination, offset: 0 });
    loadTransactions();
  };

  const handleClearFilters = () => {
    setSelectedVault('');
    setSelectedStatus('');
    setStartDate('');
    setEndDate('');
    setSearchQuery('');
    setPagination({ ...pagination, offset: 0 });
    setTimeout(() => loadTransactions(), 0);
  };

  const handleLoadMore = () => {
    setPagination({ ...pagination, offset: pagination.offset + pagination.limit });
    setTimeout(() => loadTransactions(), 0);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'debit' ? (
      <ArrowUpRight className="w-4 h-4 text-red-600" />
    ) : (
      <ArrowDownRight className="w-4 h-4 text-green-600" />
    );
  };

  const filteredTransactions = transactions.filter((txn) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        txn.transactionRef.toLowerCase().includes(query) ||
        txn.description?.toLowerCase().includes(query) ||
        txn.recipientPhone?.toLowerCase().includes(query) ||
        txn.recipientUpi?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-8">
            <Link className="py-4 border-b-2 border-transparent text-gray-600 hover:text-gray-900" to="/dashboard">Dashboard</Link>
            <Link className="py-4 border-b-2 border-transparent text-gray-600 hover:text-gray-900" to="/vaults">Vaults</Link>
            <Link className="py-4 border-b-2 border-transparent text-gray-600 hover:text-gray-900" to="/link-bank-account">Bank Account</Link>
            <Link className="py-4 border-b-2 border-transparent text-gray-600 hover:text-gray-900" to="/payments">Payments</Link>
            <Link className="py-4 border-b-2 border-red-900 text-red-900 font-medium" to="/transactions">Transactions</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link className="inline-flex items-center gap-2 text-red-900 hover:font-bold cursor-pointer mb-6" to="/dashboard">
          <ArrowLeft size={20} />
          Dashboard
        </Link>

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Transaction History</h1>
            <p className="text-gray-600 mt-1">View all your payment transactions</p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by ref, description, phone..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <Filter size={18} />
              Filters
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vault</label>
                <select
                  value={selectedVault}
                  onChange={(e) => setSelectedVault(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">All Vaults</option>
                  {vaults.map((vault) => (
                    <option key={vault.id} value={vault.id}>
                      {vault.icon} {vault.vaultName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="md:col-span-4 flex gap-3">
                <button
                  onClick={handleApplyFilters}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Apply Filters
                </button>
                <button
                  onClick={handleClearFilters}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Clear All
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Transactions List */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-12">
            <div className="flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-red-900 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">Loading transactions...</p>
            </div>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Transactions Found</h3>
            <p className="text-gray-600 mb-6">You haven't made any transactions yet or no results match your filters.</p>
            <Link
              to="/payments"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Make a Payment
            </Link>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vault</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipient</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTransactions.map((txn) => (
                      <tr key={txn.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                              {getTypeIcon(txn.transactionType)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{txn.description}</p>
                              <p className="text-xs text-gray-500 font-mono">{txn.transactionRef}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {txn.vault ? (
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{txn.vault.icon}</span>
                              <span className="text-sm text-gray-700">{txn.vault.vaultName}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`font-semibold ${txn.transactionType === 'debit' ? 'text-red-600' : 'text-green-600'}`}>
                            {txn.transactionType === 'debit' ? '-' : '+'}₹{txn.amount.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-700">{txn.recipientPhone || txn.recipientUpi || '-'}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(txn.status)}`}>
                            {txn.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(txn.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setSelectedTransaction(txn)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition"
                            title="View details"
                          >
                            <Eye size={18} className="text-gray-600" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            <div className="mt-6 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-gray-600">
                Showing {pagination.offset + 1} to {Math.min(pagination.offset + pagination.limit, pagination.total)} of {pagination.total} transactions
              </p>
              {pagination.hasMore && (
                <button
                  onClick={handleLoadMore}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Load More
                </button>
              )}
            </div>
          </>
        )}
      </main>

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Transaction Details</h2>
              <button
                onClick={() => setSelectedTransaction(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Amount</span>
                  <span className={`text-2xl font-bold ${selectedTransaction.transactionType === 'debit' ? 'text-red-600' : 'text-green-600'}`}>
                    {selectedTransaction.transactionType === 'debit' ? '-' : '+'}₹{selectedTransaction.amount.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="space-y-3 border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction ID</span>
                  <span className="font-mono text-sm text-gray-900">{selectedTransaction.transactionRef}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedTransaction.status)}`}>
                    {selectedTransaction.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type</span>
                  <span className="text-gray-900 capitalize">{selectedTransaction.transactionType}</span>
                </div>
                {selectedTransaction.vault && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vault</span>
                    <span className="text-gray-900">
                      {selectedTransaction.vault.icon} {selectedTransaction.vault.vaultName}
                    </span>
                  </div>
                )}
                {selectedTransaction.recipientPhone && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Recipient Phone</span>
                    <span className="text-gray-900">{selectedTransaction.recipientPhone}</span>
                  </div>
                )}
                {selectedTransaction.recipientUpi && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">UPI ID</span>
                    <span className="text-gray-900">{selectedTransaction.recipientUpi}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Description</span>
                  <span className="text-gray-900 text-right">{selectedTransaction.description}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method</span>
                  <span className="text-gray-900 capitalize">{selectedTransaction.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date & Time</span>
                  <span className="text-gray-900">{new Date(selectedTransaction.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedTransaction(null)}
                className="w-full mt-6 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}