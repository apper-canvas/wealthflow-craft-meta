import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Card from '@/components/atoms/Card';
import SkeletonLoader from '@/components/molecules/SkeletonLoader';
import EmptyState from '@/components/molecules/EmptyState';
import ErrorState from '@/components/molecules/ErrorState';
import { transactionService } from '@/services';
import { formatDistanceToNow } from 'date-fns';

const TransactionList = ({ limit, onTransactionEdit, showAddButton = false, onAddTransaction }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  const loadTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await transactionService.getAll();
      let filteredData = [...data];
      
      // Apply filter
      if (filter !== 'all') {
        filteredData = filteredData.filter(t => t.type === filter);
      }
      
      // Apply sorting
      filteredData.sort((a, b) => {
        if (sortBy === 'date') {
          return new Date(b.date) - new Date(a.date);
        }
        if (sortBy === 'amount') {
          return b.amount - a.amount;
        }
        return 0;
      });
      
      // Apply limit if specified
      if (limit) {
        filteredData = filteredData.slice(0, limit);
      }
      
      setTransactions(filteredData);
    } catch (err) {
      setError(err.message || 'Failed to load transactions');
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [filter, sortBy, limit]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) {
      return;
    }
    
    try {
      await transactionService.delete(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
      toast.success('Transaction deleted successfully');
    } catch (error) {
      toast.error('Failed to delete transaction');
    }
  };

  const formatAmount = (amount, type) => {
    const formatted = Math.abs(amount).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
    return type === 'income' ? `+${formatted}` : `-${formatted}`;
  };

  const getCategoryIcon = (category) => {
    const iconMap = {
      'Salary': 'Briefcase',
      'Freelance': 'Laptop',
      'Investment': 'TrendingUp',
      'Housing': 'Home',
      'Food': 'UtensilsCrossed',
      'Transportation': 'Car',
      'Utilities': 'Zap',
      'Entertainment': 'Film',
      'Healthcare': 'Heart',
      'Shopping': 'ShoppingBag'
    };
    return iconMap[category] || 'Receipt';
  };

  if (loading) {
    return <SkeletonLoader type="list" count={limit || 5} />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadTransactions} />;
  }

  if (transactions.length === 0) {
    return (
      <EmptyState
        icon="Receipt"
        title="No transactions found"
        description="Start tracking your finances by adding your first transaction"
        actionLabel={showAddButton ? "Add Transaction" : undefined}
        onAction={showAddButton ? onAddTransaction : undefined}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters - only show if not limited */}
      {!limit && (
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex space-x-4">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Transactions</option>
                <option value="income">Income Only</option>
                <option value="expense">Expenses Only</option>
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="date">Sort by Date</option>
                <option value="amount">Sort by Amount</option>
              </select>
            </div>
            
            {showAddButton && (
              <Button
                onClick={onAddTransaction}
                variant="primary"
                size="sm"
                icon="Plus"
              >
                Add Transaction
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Transaction List */}
      <div className="space-y-3">
        <AnimatePresence>
          {transactions.map((transaction, index) => (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
              layout
            >
              <Card hover className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${
                      transaction.type === 'income' 
                        ? 'bg-success/10 text-success' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      <ApperIcon 
                        name={getCategoryIcon(transaction.category)} 
                        className="w-5 h-5" 
                      />
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-gray-900 truncate">
                        {transaction.description}
                      </h4>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span>{transaction.category}</span>
                        <span>•</span>
                        <span>
                          {formatDistanceToNow(new Date(transaction.date), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.type === 'income' 
                          ? 'text-success' 
                          : 'text-gray-900'
                      }`}>
                        {formatAmount(transaction.amount, transaction.type)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(transaction.date).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="flex space-x-1">
                      {onTransactionEdit && (
                        <button
                          onClick={() => onTransactionEdit(transaction)}
                          className="p-2 text-gray-400 hover:text-primary hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <ApperIcon name="Edit2" className="w-4 h-4" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDelete(transaction.id)}
                        className="p-2 text-gray-400 hover:text-error hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <ApperIcon name="Trash2" className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TransactionList;