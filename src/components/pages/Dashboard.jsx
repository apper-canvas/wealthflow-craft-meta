import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import StatCard from '@/components/molecules/StatCard';
import TransactionList from '@/components/organisms/TransactionList';
import ExpenseChart from '@/components/organisms/ExpenseChart';
import SpendingTrendChart from '@/components/organisms/SpendingTrendChart';
import TransactionForm from '@/components/molecules/TransactionForm';
import SkeletonLoader from '@/components/molecules/SkeletonLoader';
import ErrorState from '@/components/molecules/ErrorState';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';
import Card from '@/components/atoms/Card';
import billService from '@/services/api/billService';
import { transactionService, savingsGoalService } from '@/services';
import { useNavigate } from 'react-router-dom';

// Bills Summary Card Component
const BillsSummaryCard = () => {
  const [billsData, setBillsData] = useState({ upcoming: 0, overdue: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadBillsData = async () => {
      try {
        const [upcoming, overdue, all] = await Promise.all([
          billService.getUpcoming(7), // Next 7 days
          billService.getOverdue(),
          billService.getAll()
        ]);
        
        setBillsData({
          upcoming: upcoming.length,
          overdue: overdue.length,
          total: all.filter(b => b.paymentStatus === 'unpaid').length
        });
      } catch (error) {
        console.error('Failed to load bills data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadBillsData();
  }, []);

  if (loading) {
    return (
      <Card className="p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45 }}
    >
      <Card className="p-6 h-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Bills Overview</h3>
          <ApperIcon name="Calendar" className="w-5 h-5 text-gray-400" />
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Upcoming (7 days)</span>
            <span className="text-lg font-semibold text-primary">{billsData.upcoming}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Overdue</span>
            <span className="text-lg font-semibold text-error">{billsData.overdue}</span>
          </div>
          
          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-sm font-medium text-gray-900">Total Unpaid</span>
            <span className="text-xl font-bold text-gray-900">{billsData.total}</span>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/bills')}
            icon="ArrowRight"
            iconPosition="right"
            className="w-full"
          >
            Manage Bills
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};
const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalBalance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    goalProgress: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showTransactionForm, setShowTransactionForm] = useState(false);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [transactions, goals] = await Promise.all([
        transactionService.getAll(),
        savingsGoalService.getAll()
      ]);

      // Calculate current month data
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const currentMonthTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === currentMonth && 
               transactionDate.getFullYear() === currentYear;
      });

      const monthlyIncome = currentMonthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const monthlyExpenses = currentMonthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      // Calculate total balance (all time)
      const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const totalBalance = totalIncome - totalExpenses;

      // Calculate goal progress
      const totalGoalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
      const totalGoalCurrent = goals.reduce((sum, g) => sum + g.currentAmount, 0);
      const goalProgress = totalGoalTarget > 0 ? (totalGoalCurrent / totalGoalTarget) * 100 : 0;

      setDashboardData({
        totalBalance,
        monthlyIncome,
        monthlyExpenses,
        goalProgress
      });
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleTransactionSuccess = () => {
    setShowTransactionForm(false);
    loadDashboardData();
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's your financial overview.</p>
        </div>
        <SkeletonLoader type="card" count={4} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorState message={error} onRetry={loadDashboardData} />
      </div>
    );
  }

  return (
<div className="p-6 space-y-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's your financial overview.</p>
        </div>
        <Button
          onClick={() => setShowTransactionForm(true)}
          variant="primary"
          icon="Plus"
        >
          Add Transaction
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <StatCard
            title="Total Balance"
            value={dashboardData.totalBalance}
            icon="Wallet"
            color="primary"
            gradient
            trend={dashboardData.totalBalance > 0 ? 'up' : 'down'}
            trendValue={`${dashboardData.totalBalance > 0 ? '+' : ''}${Math.abs(dashboardData.totalBalance).toLocaleString()}`}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <StatCard
            title="Monthly Income"
            value={dashboardData.monthlyIncome}
            icon="TrendingUp"
            color="success"
            trend="up"
            trendValue="+12%"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <StatCard
            title="Monthly Expenses"
            value={dashboardData.monthlyExpenses}
            icon="TrendingDown"
            color="error"
            trend="down"
            trendValue="-8%"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <StatCard
            title="Savings Goal Progress"
            value={`${Math.round(dashboardData.goalProgress)}%`}
            icon="Target"
            color="info"
            trend="up"
            trendValue="+5%"
          />
        </motion.div>
      </div>

      {/* Bills Summary and Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <BillsSummaryCard />
        
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

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-heading font-semibold text-gray-900">
            Recent Transactions
          </h2>
          <Button
            variant="outline"
            size="sm"
            icon="ArrowRight"
            iconPosition="right"
          >
            View All
          </Button>
        </div>
        
        <TransactionList 
          limit={5} 
          onAddTransaction={() => setShowTransactionForm(true)}
        />
      </motion.div>

      {/* Transaction Form Modal */}
      {showTransactionForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-heading font-semibold text-gray-900">
                  Add Transaction
                </h3>
                <button
                  onClick={() => setShowTransactionForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ApperIcon name="X" className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <TransactionForm
                onSuccess={handleTransactionSuccess}
                onCancel={() => setShowTransactionForm(false)}
              />
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;