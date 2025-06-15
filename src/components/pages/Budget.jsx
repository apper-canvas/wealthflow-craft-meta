import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import SkeletonLoader from '@/components/molecules/SkeletonLoader';
import EmptyState from '@/components/molecules/EmptyState';
import ErrorState from '@/components/molecules/ErrorState';
import BudgetForm from '@/components/molecules/BudgetForm';
import ApperIcon from '@/components/ApperIcon';
import { budgetService, transactionService, categoryService } from '@/services';
import { format } from 'date-fns';

const Budget = () => {
  const [budget, setBudget] = useState(null);
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState(false);
const loadBudgetData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [allBudgets, categoriesData, transactions] = await Promise.all([
        budgetService.getAllBudgets(),
        categoryService.getAll(),
        transactionService.getAll()
      ]);

      setCategories(categoriesData);
      setBudgets(allBudgets);

      // Find the most recent budget or current month budget
      const currentMonth = new Date().toISOString().slice(0, 7);
      let activeBudget = allBudgets.find(b => b.month === currentMonth);
      
      // If no current month budget, use the most recent one
      if (!activeBudget && allBudgets.length > 0) {
        activeBudget = allBudgets[0]; // Already sorted by month desc
      }

      if (activeBudget) {
        // Calculate actual spending for the active budget's month
        const budgetDate = new Date(activeBudget.month);
        const budgetMonth = budgetDate.getMonth();
        const budgetYear = budgetDate.getFullYear();
        
        const monthlyExpenses = transactions.filter(t => {
          const transactionDate = new Date(t.date);
          return t.type === 'expense' &&
                 transactionDate.getMonth() === budgetMonth && 
                 transactionDate.getFullYear() === budgetYear;
        });
const updatedCategories = activeBudget?.categories?.map(budgetCategory => {
          const spent = monthlyExpenses
            .filter(t => t.category === budgetCategory.name)
            .reduce((sum, t) => sum + t.amount, 0);
          
          return { ...budgetCategory, spent };
        }) || [];

        setBudget({ ...activeBudget, categories: updatedCategories });
      } else {
        setBudget(null);
      }
    } catch (err) {
      setError(err.message || 'Failed to load budget data');
      toast.error('Failed to load budget data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBudgetData();
  }, []);

const handleCreateBudget = async () => {
    // Determine target month - current if no budget exists, next month if current budget exists
    const now = new Date();
    const targetDate = budget ? new Date(now.getFullYear(), now.getMonth() + 1, 1) : now;
    const targetMonth = format(targetDate, 'yyyy-MM');
    
    const expenseCategories = categories.filter(c => c.type === 'expense');
    
    const budgetCategories = expenseCategories.map(category => ({
      categoryId: category.id,
      name: category.name,
      budgetLimit: category.budgetLimit || 500,
      spent: 0
    }));

    const totalLimit = budgetCategories.reduce((sum, cat) => sum + cat.budgetLimit, 0);

try {
      const newBudget = await budgetService.create({
        month: targetMonth,
        categories: budgetCategories,
        totalLimit
      });
      
      setBudget(newBudget);
      setShowBudgetForm(false);
      toast.success('Budget created successfully!');
    } catch (error) {
      if (error.message.includes('Budget already exists')) {
        toast.error(`A budget already exists for ${format(new Date(targetMonth), 'MMMM yyyy')}. Please edit the existing budget or create one for a different month.`);
      } else {
        toast.error('Failed to create budget');
      }
    }
  };

  const getProgressColor = (spent, limit) => {
    const percentage = (spent / limit) * 100;
    if (percentage >= 100) return 'bg-error';
    if (percentage >= 80) return 'bg-warning';
    return 'bg-success';
  };

  const getProgressPercentage = (spent, limit) => {
    return Math.min((spent / limit) * 100, 100);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900 mb-2">Budget</h1>
          <p className="text-gray-600">Manage your monthly spending limits</p>
        </div>
        <SkeletonLoader type="card" count={3} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorState message={error} onRetry={loadBudgetData} />
      </div>
    );
  }

if (!budget && budgets.length === 0) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-heading font-bold text-gray-900 mb-2">Budget</h1>
            <p className="text-gray-600">Manage your monthly spending limits</p>
          </div>
        </div>

        <EmptyState
          icon="PieChart"
          title="No Budget Set"
          description="Create your first monthly budget to start tracking your spending limits and stay on top of your finances."
          actionLabel="Create Budget"
          onAction={handleCreateBudget}
        />
      </div>
    );
  }

  // If we have budgets but no active budget selected, show budget selection
  if (!budget && budgets.length > 0) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-heading font-bold text-gray-900 mb-2">Budget</h1>
            <p className="text-gray-600">Select a budget to view or create a new one</p>
          </div>
          <Button
            onClick={() => setShowBudgetForm(true)}
            variant="primary"
            icon="Plus"
          >
            New Budget
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map((b) => (
            <Card key={b.id} className="p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setBudget(b)}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {format(new Date(b.month), 'MMMM yyyy')}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {b.categories.length} categories
                  </p>
                </div>
                <ApperIcon name="ChevronRight" className="w-5 h-5 text-gray-400" />
              </div>
            </Card>
          ))}
        </div>

        {showBudgetForm && (
          <BudgetForm
            onSuccess={(newBudget) => {
              setBudget(newBudget);
              setShowBudgetForm(false);
              loadBudgetData();
            }}
            onCancel={() => setShowBudgetForm(false)}
            existingBudget={budget}
          />
        )}
      </div>
    );
  }

  const totalSpent = budget.categories.reduce((sum, cat) => sum + cat.spent, 0);
  const totalBudget = budget.categories.reduce((sum, cat) => sum + cat.budgetLimit, 0);
  const remainingBudget = totalBudget - totalSpent;

  return (
    <div className="p-6 space-y-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900 mb-2">Budget</h1>
          <p className="text-gray-600">Manage your monthly spending limits</p>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={() => setEditingBudget(true)}
            variant="outline"
            icon="Edit2"
          >
Edit Budget
          </Button>
          <Button
            onClick={() => setShowBudgetForm(true)}
            variant="primary"
            icon="Plus"
          >
            New Budget
          </Button>
        </div>
      </div>

      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card gradient className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <ApperIcon name="PieChart" className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-white/80 text-sm">Total Budget</p>
                <p className="text-2xl font-bold text-white">
                  ${totalBudget.toLocaleString()}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <ApperIcon name="TrendingDown" className="w-6 h-6 text-error" />
              </div>
              <div className="text-right">
                <p className="text-gray-600 text-sm">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${totalSpent.toLocaleString()}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <ApperIcon name="DollarSign" className="w-6 h-6 text-success" />
              </div>
              <div className="text-right">
                <p className="text-gray-600 text-sm">Remaining</p>
                <p className={`text-2xl font-bold ${remainingBudget >= 0 ? 'text-success' : 'text-error'}`}>
                  ${Math.abs(remainingBudget).toLocaleString()}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Category Budgets */}
      <div className="space-y-4">
        <h2 className="text-xl font-heading font-semibold text-gray-900">
          Category Breakdown
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budget.categories.map((category, index) => {
            const percentage = getProgressPercentage(category.spent, category.budgetLimit);
            const remaining = category.budgetLimit - category.spent;
            
            return (
              <motion.div
                key={category.categoryId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <ApperIcon 
                          name={categories.find(c => c.name === category.name)?.icon || 'Receipt'} 
                          className="w-5 h-5 text-gray-600" 
                        />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{category.name}</h3>
                        <p className="text-sm text-gray-500">
                          ${category.spent.toLocaleString()} of ${category.budgetLimit.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${remaining >= 0 ? 'text-success' : 'text-error'}`}>
                        ${Math.abs(remaining).toLocaleString()} {remaining >= 0 ? 'left' : 'over'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {Math.round(percentage)}% used
                      </p>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      className={`h-2 rounded-full ${getProgressColor(category.spent, category.budgetLimit)}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                    />
                  </div>
                </Card>
              </motion.div>
            );
})}
        </div>
      </div>

      {/* Budget Form Modal */}
{showBudgetForm && (
        <BudgetForm
          onSuccess={(newBudget) => {
            setBudget(newBudget);
            setShowBudgetForm(false);
            loadBudgetData(); // Refresh all budget data
          }}
          onCancel={() => setShowBudgetForm(false)}
          existingBudget={budget}
        />
      )}
    </div>
  );
};

export default Budget;