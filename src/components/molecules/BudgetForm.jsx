import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Card from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";
import { budgetService, categoryService } from "@/services";
import { format } from "date-fns";

const BudgetForm = ({ onSuccess, onCancel, existingBudget }) => {
const [formData, setFormData] = useState({
    name: '',
    category: '',
    amount: '',
    period: 'monthly',
    startDate: '',
    endDate: '',
    month: ''
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  useEffect(() => {
    loadCategories();
    initializeFormData();
  }, [existingBudget]);

  const loadCategories = async () => {
    try {
      const data = await categoryService.getAll();
      const expenseCategories = data.filter(c => c.type === 'expense');
      setCategories(expenseCategories);
    } catch (error) {
      toast.error('Failed to load categories');
    }
  };

const initializeFormData = () => {
    const now = new Date();
    const targetDate = existingBudget ? new Date(now.getFullYear(), now.getMonth() + 1, 1) : now;
    const defaultMonth = format(targetDate, 'yyyy-MM');
    const defaultStartDate = format(now, 'yyyy-MM-dd');
    const defaultEndDate = format(new Date(now.getFullYear(), now.getMonth() + 1, 0), 'yyyy-MM-dd');

setFormData({
      name: '',
      category: '',
      amount: '',
      period: 'monthly',
      startDate: defaultStartDate,
      endDate: defaultEndDate,
      month: defaultMonth
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Budget name is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Budget amount must be greater than 0';
    }

    if (!formData.period) {
      newErrors.period = 'Budget period is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (formData.startDate && formData.endDate && formData.startDate >= formData.endDate) {
      newErrors.endDate = 'End date must be after start date';
    }

if (!formData.month) {
      newErrors.month = 'Month is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

setLoading(true);
    try {
      const budgetData = {
        name: formData.name,
        category: formData.category,
        amount: parseFloat(formData.amount),
        period: formData.period,
        startDate: formData.startDate,
        endDate: formData.endDate,
        month: formData.month
      };
      const result = await budgetService.create(budgetData);
      toast.success('Budget created successfully!');
      onSuccess(result);
    } catch (error) {
      if (error.message.includes('Budget already exists')) {
        const monthName = format(new Date(formData.month), 'MMMM yyyy');
        toast.error(`A budget already exists for ${monthName}. Please choose a different month or edit the existing budget.`);
      } else {
        toast.error('Failed to create budget');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ApperIcon name="PieChart" className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-heading font-semibold text-gray-900">
                  Create New Budget
                </h2>
                <p className="text-sm text-gray-500">
                  Set spending limits for each category
                </p>
              </div>
            </div>
            <Button
              onClick={onCancel}
              variant="ghost"
              size="sm"
              icon="X"
            />
          </div>

<form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Budget Name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                error={errors.name}
                placeholder="Enter budget name"
                required
              />
              
<div>
                <label htmlFor="budget-category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  id="budget-category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  aria-describedby={errors.category ? "budget-category-error" : "budget-category-description"}
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <div id="budget-category-description" className="sr-only">
                  Choose the expense category for this budget
                </div>
                {errors.category && (
                  <p id="budget-category-error" className="mt-1 text-sm text-red-600">{errors.category}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Budget Amount"
                name="amount"
                type="number"
                min="0"
                step="0.01"
                value={formData.amount}
                onChange={handleInputChange}
                error={errors.amount}
                placeholder="0.00"
                required
              />
              
<div>
                <label htmlFor="budget-period" className="block text-sm font-medium text-gray-700 mb-2">
                  Budget Period *
                </label>
                <select
                  id="budget-period"
                  name="period"
                  value={formData.period}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  aria-describedby={errors.period ? "budget-period-error" : "budget-period-description"}
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
                <div id="budget-period-description" className="sr-only">
                  Select how often this budget should reset
                </div>
                {errors.period && (
                  <p id="budget-period-error" className="mt-1 text-sm text-red-600">{errors.period}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Start Date"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleInputChange}
                error={errors.startDate}
                required
              />
              
              <Input
                label="End Date"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleInputChange}
                error={errors.endDate}
                required
              />
            </div>

            <div>
              <Input
                label="Budget Month"
                name="month"
                type="month"
                value={formData.month}
                onChange={handleInputChange}
                error={errors.month}
                required
              />
</div>
            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                onClick={onCancel}
                variant="outline"
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
                loading={loading}
                disabled={loading}
              >
                Create Budget
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default BudgetForm;