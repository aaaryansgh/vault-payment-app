// frontend/src/pages/AnalyticsPage.tsx

import { useState, useEffect } from 'react';
import { paymentAPI } from '../lib/api';
import Header from '../components/layout/Header';
import Loader from '../utils/loader';
import { Link } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, BarChart, PieChart, LineChart } from 'lucide-react';

// Import and register Chart.js components
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement, // For Pie charts
  PointElement, // For Line charts
  LineElement, // For Line charts
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

// Register the components you'll use
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

// Define types for our chart data
interface CategoryData {
  category: string;
  amount: number;
  percentage: number;
}
interface VaultData {
  vaultId: string | null;
  amount: number;
  vaultDetails: {
    name: string;
    icon: string;
    allocated: number;
  };
  percentageOfTotal: number;
  percentageOfAllocation: number;
}
interface TimeSeriesData {
  date: string;
  amount: number;
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for chart data
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [vaultData, setVaultData] = useState<VaultData[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);

  // State for filters
  const [filters, setFilters] = useState({
    // Default to last 30 days
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  // Fetch all analytics data
  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        startDate: filters.startDate,
        endDate: filters.endDate,
      };

      const [catRes, vaultRes, timeRes] = await Promise.all([
        paymentAPI.getCategoryAnalytics(params),
        paymentAPI.getVaultBreakdownAnalytics(params),
        paymentAPI.getTimeSeriesAnalytics({ ...params, granularity: 'day' }),
      ]);

      if (!catRes.success) throw new Error(catRes.message || 'Failed to load category data');
      setCategoryData(catRes.data);

      if (!vaultRes.success) throw new Error(vaultRes.message || 'Failed to load vault data');
      setVaultData(vaultRes.data);

      if (!timeRes.success) throw new Error(timeRes.message || 'Failed to load time series data');
      setTimeSeriesData(timeRes.data);

    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    fetchAnalytics();
  }, []); // Run only once on mount

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAnalytics(); // Refetch data with new filters
  };

  // --- Chart Data Formatting ---

  const categoryChartData = {
    labels: categoryData.map(c => c.category.charAt(0).toUpperCase() + c.category.slice(1)),
    datasets: [{
      label: 'Spending by Category',
      data: categoryData.map(c => c.amount),
      backgroundColor: [
        '#881337', // rose-900
        '#BE123C', // rose-700
        '#E11D48', // rose-600
        '#F43F5E', // rose-500
        '#FB7185', // rose-400
        '#FDA4AF', // rose-300
      ],
      hoverOffset: 4,
    }],
  };

  const vaultChartData = {
    labels: vaultData.map(v => v.vaultDetails.name),
    datasets: [{
      label: 'Spending by Vault (₹)',
      data: vaultData.map(v => v.amount),
      backgroundColor: '#881337', // rose-900
      borderColor: '#BE123C', // rose-700
      borderWidth: 1,
    }],
  };

  const timeSeriesChartData = {
    labels: timeSeriesData.map(t => new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })),
    datasets: [{
      label: 'Spending Over Time (₹)',
      data: timeSeriesData.map(t => t.amount),
      fill: false,
      borderColor: '#881337', // rose-900
      tension: 0.1,
    }],
  };

  // --- Render Logic ---

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-8">
            <Link className="py-4 border-b-2 border-transparent text-gray-600 hover:text-gray-900" to="/dashboard">Dashboard</Link>
            <Link className="py-4 border-b-2 border-transparent text-gray-600 hover:text-gray-900" to="/vaults">Vaults</Link>
            <Link className="py-4 border-b-2 border-transparent text-gray-600 hover:text-gray-900" to="/link-bank-account">Bank Accounts</Link>
            <Link className="py-4 border-b-2 border-transparent text-gray-600 hover:text-gray-900" to="/payments">Payments</Link>
            <Link className="py-4 border-b-2 border-transparent text-gray-600 hover:text-gray-900" to="/transactions">Transactions</Link>
            <Link className="py-4 border-b-2 border-red-900 text-red-900 font-medium" to="/analytics">Analytics</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Spending Analytics</h1>
            <p className="text-gray-600 mt-1">Visualize your spending patterns.</p>
          </div>
          <Link className="inline-flex items-center gap-2 text-red-900 hover:font-bold" to="/dashboard">
            <ArrowLeft size={20} />
            Back to Dashboard
          </Link>
        </div>

        {/* Filter Bar */}
        <form onSubmit={handleFilterSubmit} className="bg-white p-4 rounded-lg shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 w-full">
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="date"
              name="startDate"
              id="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="mt-1 w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="flex-1 w-full">
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
            <input
              type="date"
              name="endDate"
              id="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="mt-1 w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>
          <button
            type="submit"
            className="w-full md:w-auto px-6 py-2 mt-5 bg-red-900 text-white rounded-lg font-semibold hover:bg-red-950 transition"
          >
            Apply Filters
          </button>
        </form>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-8 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Spending Over Time (Line Chart) */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <LineChart className="w-5 h-5" /> Spending Over Time
            </h2>
            {timeSeriesData.length > 0 ? (
              <Line options={{ responsive: true, plugins: { legend: { display: false } } }} data={timeSeriesChartData} />
            ) : (
              <p className="text-gray-500 text-center py-10">No spending data for this period.</p>
            )}
          </div>

          {/* Spending by Category (Pie Chart) */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5" /> Spending by Category
            </h2>
            {categoryData.length > 0 ? (
              <div className="max-w-xs mx-auto">
                <Pie options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} data={categoryChartData} />
              </div>
            ) : (
              <p className="text-gray-500 text-center py-10">No category spending data.</p>
            )}
          </div>

          {/* Spending by Vault (Bar Chart) - Spans full width */}
          <div className="bg-white p-6 rounded-lg shadow-sm lg:col-span-2">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart className="w-5 h-5" /> Spending by Vault
            </h2>
            {vaultData.length > 0 ? (
              <Bar options={{ responsive: true, plugins: { legend: { display: false } } }} data={vaultChartData} />
            ) : (
              <p className="text-gray-500 text-center py-10">No vault spending data.</p>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}