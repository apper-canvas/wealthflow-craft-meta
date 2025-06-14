import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import { transactionService, categoryService } from '@/services';

const TransactionForm = ({ onSuccess, onCancel, initialData = null }) => {
  const [formData, setFormData] = useState({
    amount: initialData?.amount || '',
    type: initialData?.type || 'expense',
    category: initialData?.category || '',
    description: initialData?.description || '',
    date: initialData?.date || new Date().toISOString().split('T')[0],
    accountId: initialData?.accountId || 'main'
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);

  // Load categories on mount
  useState(() => {
    const loadCategories = async () => {
      try {
        const data = await categoryService.getAll();
        setCategories(data);
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    };
    loadCategories();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const transactionData = {
        ...formData,
        amount: parseFloat(formData.amount)
      };
      
      let result;
      if (initialData) {
        result = await transactionService.update(initialData.id, transactionData);
        toast.success('Transaction updated successfully!');
      } else {
        result = await transactionService.create(transactionData);
        toast.success('Transaction added successfully!');
      }
      
      onSuccess?.(result);
    } catch (error) {
      toast.error(error.message || 'Failed to save transaction');
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(cat => cat.type === formData.type);

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Transaction Type
        </label>
        <div className="flex space-x-4">
          {['income', 'expense'].map((type) => (
            <label key={type} className="flex items-center">
              <input
                type="radio"
                name="type"
                value={type}
                checked={formData.type === type}
                onChange={handleInputChange}
                className="mr-2 text-primary focus:ring-primary"
              />
              <span className="capitalize text-sm font-medium">
                {type}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Amount */}
      <Input
        label="Amount"
        type="number"
        name="amount"
        value={formData.amount}
        onChange={handleInputChange}
        error={errors.amount}
        icon="DollarSign"
        placeholder="0.00"
        step="0.01"
        min="0"
        required
      />

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category *
        </label>
        <select
          name="category"
          value={formData.category}
          onChange={handleInputChange}
          className={`
            w-full px-3 py-3 rounded-lg border transition-all duration-200
            ${errors.category 
              ? 'border-error focus:border-error focus:ring-error' 
              : 'border-gray-300 hover:border-gray-400 focus:border-primary focus:ring-primary'
            }
            focus:outline-none focus:ring-2 focus:ring-opacity-20
          `}
          required
        >
          <option value="">Select a category</option>
          {filteredCategories.map((category) => (
            <option key={category.id} value={category.name}>
              {category.name}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="mt-1 text-sm text-error">{errors.category}</p>
        )}
      </div>

      {/* Description */}
      <Input
        label="Description"
        name="description"
        value={formData.description}
        onChange={handleInputChange}
        error={errors.description}
        icon="FileText"
        placeholder="What was this transaction for?"
        required
      />

      {/* Date */}
      <Input
        label="Date"
        type="date"
        name="date"
        value={formData.date}
        onChange={handleInputChange}
        error={errors.date}
        icon="Calendar"
        required
      />

      {/* Action Buttons */}
      <div className="flex space-x-4 pt-4">
        <Button
          type="submit"
          variant="primary"
          loading={loading}
          className="flex-1"
        >
          {initialData ? 'Update Transaction' : 'Add Transaction'}
        </Button>
        
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
        )}
      </div>
    </motion.form>
  );
};

export default TransactionForm;