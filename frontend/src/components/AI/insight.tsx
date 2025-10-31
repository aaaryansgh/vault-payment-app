import { useEffect, useState } from 'react';
import { BrainCircuit, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { paymentAPI } from '../../lib/api'; 

export default function Insights() {
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await paymentAPI.getAiInsights();
      if (response.success && response.data?.insights) {
        setInsights(response.data.insights);
      } else {
        throw new Error(response.message || 'Failed to load insights');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Could not fetch AI insights.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []); // Fetch insights on component mount

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="w-6 h-6 animate-spin text-red-900" />
          <p className="ml-3 text-gray-600">Generating AI insights...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center py-6 text-red-700">
          <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0" />
          <div>
            <p className="font-semibold">Error loading insights</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      );
    }

    if (insights.length === 0) {
      return (
        <div className="flex items-center justify-center py-6">
          <p className="text-gray-600">No insights available at this time.</p>
        </div>
      );
    }

    return (
      <ul className="space-y-3">
        {insights.map((insight, index) => (
          <li key={index} className="flex items-start">
            <span className="text-lg mr-3 mt-1">💡</span>
            <p className="text-gray-700 leading-relaxed">{insight}</p>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="bg-white shadow-sm p-6 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <BrainCircuit className="w-6 h-6 text-red-900" />
          <h2 className="text-xl font-bold text-gray-900">AI Spending Insights</h2>
        </div>
        <button
          onClick={fetchInsights}
          disabled={loading}
          className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed"
          title="Refresh insights"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
      {renderContent()}
    </div>
  );
}