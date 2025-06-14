import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import SkeletonLoader from '@/components/molecules/SkeletonLoader';
import ErrorState from '@/components/molecules/ErrorState';
import ExpenseChart from '@/components/organisms/ExpenseChart';
import SpendingTrendChart from '@/components/organisms/SpendingTrendChart';
import ApperIcon from '@/components/ApperIcon';
import { transactionService, categoryService } from '@/services';
import { format, startOfMonth, endOfMonth, subMonths, isWithinInterval } from 'date-fns';

const Reports = () => {
  const [reportData, setReportData] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netIncome: 0,
    topCategories: [],
    monthlyComparison: { current: 0, previous: 0, change: 0 }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('thisMonth');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const loadReportData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [transactions, categories] = await Promise.all([
        transactionService.getAll(),
        categoryService.getAll()
      ]);

      let filteredTransactions = [];
      let startDate, endDate;

      // Determine date range
      switch (dateRange) {
        case 'thisMonth':
          startDate = startOfMonth(new Date());
          endDate = endOfMonth(new Date());
          break;
        case 'lastMonth':
          const lastMonth = subMonths(new Date(), 1);
          startDate = startOfMonth(lastMonth);
          endDate = endOfMonth(lastMonth);
          break;
        case 'last3Months':
          startDate = startOfMonth(subMonths(new Date(), 2));
          endDate = endOfMonth(new Date());
          break;
        case 'custom':
          if (customStartDate && customEndDate) {
            startDate = new Date(customStartDate);
            endDate = new Date(customEndDate);
          } else {
            startDate = startOfMonth(new Date());
            endDate = endOfMonth(new Date());
          }
          break;
        default:
          startDate = startOfMonth(new Date());
          endDate = endOfMonth(new Date());
      }

      // Filter transactions by date range
      filteredTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return isWithinInterval(transactionDate, { start: startDate, end: endDate });
      });

      // Calculate totals
      const totalIncome = filteredTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const totalExpenses = filteredTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const netIncome = totalIncome - totalExpenses;

      // Calculate top spending categories
      const expensesByCategory = {};
      filteredTransactions
        .filter(t => t.type === 'expense')
        .forEach(t => {
          if (expensesByCategory[t.category]) {
            expensesByCategory[t.category] += t.amount;
          } else {
            expensesByCategory[t.category] = t.amount;
          }
        });

      const topCategories = Object.entries(expensesByCategory)
        .map(([category, amount]) => ({
          category,
          amount,
          icon: categories.find(c => c.name === category)?.icon || 'Receipt'
        }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);

      // Calculate monthly comparison (current vs previous month)
      const currentMonth = new Date();
      const currentMonthStart = startOfMonth(currentMonth);
      const currentMonthEnd = endOfMonth(currentMonth);
      
      const previousMonth = subMonths(currentMonth, 1);
      const previousMonthStart = startOfMonth(previousMonth);
      const previousMonthEnd = endOfMonth(previousMonth);

      const currentMonthExpenses = transactions
        .filter(t => {
          const date = new Date(t.date);
          return t.type === 'expense' && 
                 isWithinInterval(date, { start: currentMonthStart, end: currentMonthEnd });
        })
        .reduce((sum, t) => sum + t.amount, 0);

      const previousMonthExpenses = transactions
        .filter(t => {
          const date = new Date(t.date);
          return t.type === 'expense' && 
                 isWithinInterval(date, { start: previousMonthStart, end: previousMonthEnd });
        })
        .reduce((sum, t) => sum + t.amount, 0);

      const change = previousMonthExpenses > 0 
        ? ((currentMonthExpenses - previousMonthExpenses) / previousMonthExpenses) * 100 
        : 0;

      setReportData({
        totalIncome,
        totalExpenses,
        netIncome,
        topCategories,
        monthlyComparison: {
          current: currentMonthExpenses,
          previous: previousMonthExpenses,
          change
        }
      });
    } catch (err) {
      setError(err.message || 'Failed to load report data');
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReportData();
  }, [dateRange, customStartDate, customEndDate]);

  const formatCurrency = (amount) => {
    return amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900 mb-2">Reports</h1>
          <p className="text-gray-600">Detailed analytics of your financial activity</p>
        </div>
        <SkeletonLoader type="card" count={4} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorState message={error} onRetry={loadReportData} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900 mb-2">Reports</h1>
          <p className="text-gray-600">Detailed analytics of your financial activity</p>
        </div>
        
        {/* Date Range Selector */}
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="thisMonth">This Month</option>
            <option value="lastMonth">Last Month</option>
            <option value="last3Months">Last 3 Months</option>
            <option value="custom">Custom Range</option>
          </select>
          
          {dateRange === 'custom' && (
            <div className="flex space-x-2">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <ApperIcon name="TrendingUp" className="w-5 h-5 text-success" />
              </div>
              <span className="text-sm text-success font-medium">Income</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">
              {formatCurrency(reportData.totalIncome)}
            </p>
            <p className="text-sm text-gray-500">Total earnings</p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-red-100 rounded-lg">
                <ApperIcon name="TrendingDown" className="w-5 h-5 text-error" />
              </div>
              <span className="text-sm text-error font-medium">Expenses</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">
              {formatCurrency(reportData.totalExpenses)}
            </p>
            <p className="text-sm text-gray-500">Total spending</p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-lg ${reportData.netIncome >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                <ApperIcon 
                  name={reportData.netIncome >= 0 ? "Plus" : "Minus"} 
                  className={`w-5 h-5 ${reportData.netIncome >= 0 ? 'text-success' : 'text-error'}`} 
                />
              </div>
              <span className={`text-sm font-medium ${reportData.netIncome >= 0 ? 'text-success' : 'text-error'}`}>
                Net
              </span>
            </div>
            <p className={`text-2xl font-bold mb-1 ${reportData.netIncome >= 0 ? 'text-success' : 'text-error'}`}>
              {formatCurrency(Math.abs(reportData.netIncome))}
            </p>
            <p className="text-sm text-gray-500">
              {reportData.netIncome >= 0 ? 'Profit' : 'Loss'}
            </p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-lg ${reportData.monthlyComparison.change <= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                <ApperIcon 
                  name={reportData.monthlyComparison.change <= 0 ? "ArrowDown" : "ArrowUp"} 
                  className={`w-5 h-5 ${reportData.monthlyComparison.change <= 0 ? 'text-success' : 'text-error'}`} 
                />
              </div>
              <span className={`text-sm font-medium ${reportData.monthlyComparison.change <= 0 ? 'text-success' : 'text-error'}`}>
                {reportData.monthlyComparison.change > 0 ? '+' : ''}{Math.abs(reportData.monthlyComparison.change).toFixed(1)}%
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">
              {formatCurrency(reportData.monthlyComparison.current)}
            </p>
            <p className="text-sm text-gray-500">vs last month</p>
          </Card>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <ExpenseChart />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <SpendingTrendChart />
        </motion.div>
      </div>

      {/* Top Categories */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="p-6">
          <h3 className="text-lg font-heading font-semibold text-gray-900 mb-4">
            Top Spending Categories
          </h3>
          
          {reportData.topCategories.length === 0 ? (
            <div className="text-center py-8">
              <ApperIcon name="BarChart3" className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No expense data available for the selected period</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reportData.topCategories.map((category, index) => {
                const percentage = reportData.totalExpenses > 0 
                  ? (category.amount / reportData.totalExpenses) * 100 
                  : 0;
                
                return (
                  <motion.div
                    key={category.category}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white rounded-lg">
                        <ApperIcon name={category.icon} className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{category.category}</h4>
                        <p className="text-sm text-gray-500">
                          {percentage.toFixed(1)}% of total expenses
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(category.amount)}
                      </p>
                      <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                        <motion.div
                          className="bg-primary h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
};

export default Reports;