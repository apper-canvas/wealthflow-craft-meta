import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import SkeletonLoader from '@/components/molecules/SkeletonLoader';
import EmptyState from '@/components/molecules/EmptyState';
import ErrorState from '@/components/molecules/ErrorState';
import ApperIcon from '@/components/ApperIcon';
import { savingsGoalService } from '@/services';
import { format, differenceInDays } from 'date-fns';

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [contributionAmount, setContributionAmount] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    targetDate: '',
    category: ''
  });

  const loadGoals = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await savingsGoalService.getAll();
      setGoals(data);
    } catch (err) {
      setError(err.message || 'Failed to load savings goals');
      toast.error('Failed to load savings goals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.targetAmount || !formData.targetDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const goalData = {
        ...formData,
        targetAmount: parseFloat(formData.targetAmount),
        currentAmount: 0
      };
      
      const newGoal = await savingsGoalService.create(goalData);
      setGoals(prev => [...prev, newGoal]);
      setShowGoalForm(false);
      setFormData({ name: '', targetAmount: '', targetDate: '', category: '' });
      toast.success('Savings goal created successfully!');
    } catch (error) {
      toast.error('Failed to create savings goal');
    }
  };

  const handleContribute = async (e) => {
    e.preventDefault();
    
    if (!contributionAmount || parseFloat(contributionAmount) <= 0) {
      toast.error('Please enter a valid contribution amount');
      return;
    }

    try {
      const updatedGoal = await savingsGoalService.addToGoal(
        selectedGoal.id, 
        parseFloat(contributionAmount)
      );
      
      setGoals(prev => prev.map(g => 
        g.id === selectedGoal.id ? updatedGoal : g
      ));
      
      setShowContributeModal(false);
      setSelectedGoal(null);
      setContributionAmount('');
      toast.success('Contribution added successfully!');
    } catch (error) {
      toast.error('Failed to add contribution');
    }
  };

  const handleDeleteGoal = async (id) => {
    if (!window.confirm('Are you sure you want to delete this savings goal?')) {
      return;
    }
    
    try {
      await savingsGoalService.delete(id);
      setGoals(prev => prev.filter(g => g.id !== id));
      toast.success('Savings goal deleted successfully');
    } catch (error) {
      toast.error('Failed to delete savings goal');
    }
  };

  const getProgressPercentage = (current, target) => {
    return Math.min((current / target) * 100, 100);
  };

  const getDaysRemaining = (targetDate) => {
    const days = differenceInDays(new Date(targetDate), new Date());
    return days > 0 ? days : 0;
  };

  const getCategoryIcon = (category) => {
    const iconMap = {
      'Emergency': 'Shield',
      'Travel': 'Plane',
      'Transportation': 'Car',
      'Home': 'Home',
      'Education': 'GraduationCap',
      'Investment': 'TrendingUp'
    };
    return iconMap[category] || 'Target';
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900 mb-2">Savings Goals</h1>
          <p className="text-gray-600">Track your progress toward financial milestones</p>
        </div>
        <SkeletonLoader type="card" count={3} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorState message={error} onRetry={loadGoals} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900 mb-2">Savings Goals</h1>
          <p className="text-gray-600">Track your progress toward financial milestones</p>
        </div>
        <Button
          onClick={() => setShowGoalForm(true)}
          variant="primary"
          icon="Plus"
        >
          Add Goal
        </Button>
      </div>

      {/* Goals List */}
      {goals.length === 0 ? (
        <EmptyState
          icon="Target"
          title="No Savings Goals"
          description="Set your first savings goal and start working toward your financial dreams. Whether it's an emergency fund, vacation, or major purchase."
          actionLabel="Create Goal"
          onAction={() => setShowGoalForm(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal, index) => {
            const progress = getProgressPercentage(goal.currentAmount, goal.targetAmount);
            const remaining = goal.targetAmount - goal.currentAmount;
            const daysLeft = getDaysRemaining(goal.targetDate);
            const isCompleted = goal.currentAmount >= goal.targetAmount;

            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 relative overflow-hidden">
                  {isCompleted && (
                    <div className="absolute top-4 right-4">
                      <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center">
                        <ApperIcon name="Check" className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`p-3 rounded-lg ${isCompleted ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'}`}>
                      <ApperIcon name={getCategoryIcon(goal.category)} className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{goal.name}</h3>
                      <p className="text-sm text-gray-500">{goal.category}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Progress */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-600">Progress</span>
                        <span className="text-sm font-medium text-gray-900">
                          {Math.round(progress)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <motion.div
                          className={`h-3 rounded-full ${isCompleted ? 'bg-success' : 'bg-primary'}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 1, delay: 0.2 + index * 0.1 }}
                        />
                      </div>
                    </div>

                    {/* Amount Progress */}
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-lg font-bold text-gray-900">
                          ${goal.currentAmount.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500">
                          of ${goal.targetAmount.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${isCompleted ? 'text-success' : 'text-gray-600'}`}>
                          {isCompleted ? 'Goal Achieved!' : `$${remaining.toLocaleString()} to go`}
                        </p>
                        <p className="text-xs text-gray-500">
                          {daysLeft > 0 ? `${daysLeft} days left` : 'Past due date'}
                        </p>
                      </div>
                    </div>

                    {/* Target Date */}
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-sm text-gray-600">
                        Target: {format(new Date(goal.targetDate), 'MMM dd, yyyy')}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2 pt-2">
                      {!isCompleted && (
                        <Button
                          onClick={() => {
                            setSelectedGoal(goal);
                            setShowContributeModal(true);
                          }}
                          variant="primary"
                          size="sm"
                          className="flex-1"
                          icon="Plus"
                        >
                          Add Money
                        </Button>
                      )}
                      
                      <button
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="p-2 text-gray-400 hover:text-error hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <ApperIcon name="Trash2" className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Goal Form Modal */}
      {showGoalForm && (
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
                  Create Savings Goal
                </h3>
                <button
                  onClick={() => setShowGoalForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ApperIcon name="X" className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleCreateGoal} className="p-6 space-y-4">
              <Input
                label="Goal Name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Emergency Fund"
                required
              />

              <Input
                label="Target Amount"
                type="number"
                value={formData.targetAmount}
                onChange={(e) => setFormData(prev => ({ ...prev, targetAmount: e.target.value }))}
                placeholder="0.00"
                min="0"
                step="0.01"
                icon="DollarSign"
                required
              />

              <Input
                label="Target Date"
                type="date"
                value={formData.targetDate}
                onChange={(e) => setFormData(prev => ({ ...prev, targetDate: e.target.value }))}
                required
              />

<div>
                <label htmlFor="goal-category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  id="goal-category"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                  aria-describedby="goal-category-description"
                >
                  <option value="">Select category</option>
                  <option value="Emergency">Emergency Fund</option>
                  <option value="Travel">Travel</option>
                  <option value="Transportation">Transportation</option>
                  <option value="Home">Home</option>
                  <option value="Education">Education</option>
                  <option value="Investment">Investment</option>
                </select>
                <div id="goal-category-description" className="sr-only">
                  Choose the type of savings goal you want to create
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <Button type="submit" variant="primary" className="flex-1">
                  Create Goal
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowGoalForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Contribute Modal */}
      {showContributeModal && selectedGoal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl shadow-xl max-w-md w-full"
          >
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-heading font-semibold text-gray-900">
                  Add to {selectedGoal.name}
                </h3>
                <button
                  onClick={() => setShowContributeModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ApperIcon name="X" className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleContribute} className="p-6 space-y-4">
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600">Current progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${selectedGoal.currentAmount.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">
                  of ${selectedGoal.targetAmount.toLocaleString()}
                </p>
              </div>

              <Input
                label="Contribution Amount"
                type="number"
                value={contributionAmount}
                onChange={(e) => setContributionAmount(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                icon="DollarSign"
                required
              />

              <div className="flex space-x-4 pt-4">
                <Button type="submit" variant="primary" className="flex-1">
                  Add Contribution
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowContributeModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Goals;