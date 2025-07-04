import React, { useEffect, useState } from 'react';
import { chatApi } from '@/services/api';

interface PortfolioInsightsGeminiProps {
  portfolioData: any;
  className?: string;
}

/**
 * Component to display AI-generated insights about a portfolio using Google Gemini
 */
const PortfolioInsightsGemini: React.FC<PortfolioInsightsGeminiProps> = ({ 
  portfolioData, 
  className = '' 
}) => {
  const [insights, setInsights] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (portfolioData) {
      fetchInsights();
    }
  }, [portfolioData]);

  const fetchInsights = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await chatApi.analyzePortfolioWithGemini(portfolioData);
      setInsights(response);
    } catch (err) {
      console.error('Failed to get portfolio insights:', err);
      setError('Unable to generate insights for your portfolio. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`p-4 bg-gray-50 rounded-lg shadow ${className}`}>
        <h3 className="text-lg font-medium text-gray-900">Portfolio Insights</h3>
        <div className="mt-3 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 bg-red-50 rounded-lg shadow ${className}`}>
        <h3 className="text-lg font-medium text-red-800">Portfolio Insights</h3>
        <p className="mt-2 text-sm text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className={`p-4 bg-white rounded-lg shadow ${className}`}>
      <h3 className="text-lg font-medium text-gray-900">Portfolio Insights</h3>
      {insights ? (
        <div className="mt-2 text-sm text-gray-700">{insights}</div>
      ) : (
        <p className="mt-2 text-sm text-gray-500">No insights available yet.</p>
      )}
      <button 
        onClick={fetchInsights}
        className="mt-3 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Refresh Insights
      </button>
    </div>
  );
};

export default PortfolioInsightsGemini;
