import { useState, useEffect } from 'react';
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
    paymentMethod: initialData?.payment_method || 'cash',
    accountId: initialData?.account_id || 'main'
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);

// Load categories on mount
  useEffect(() => {
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
      <fieldset>
        <legend className="block text-sm font-medium text-gray-700 mb-2">
          Transaction Type *
        </legend>
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
                aria-describedby="type-description"
              />
              <span className="capitalize text-sm font-medium">
                {type}
              </span>
            </label>
          ))}
        </div>
        <div id="type-description" className="sr-only">
          Select whether this is income or an expense transaction
        </div>
      </fieldset>

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
        <label htmlFor="transaction-category" className="block text-sm font-medium text-gray-700 mb-2">
          Category *
        </label>
        <select
          id="transaction-category"
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
          aria-describedby={errors.category ? "transaction-category-error" : "transaction-category-description"}
        >
          <option value="">Select a category</option>
          {filteredCategories.map((category) => (
            <option key={category.id} value={category.name}>
              {category.name}
            </option>
))}
        </select>
        <div id="transaction-category-description" className="sr-only">
          Choose the category that best describes this transaction
        </div>
        {errors.category && (
          <p id="transaction-category-error" className="mt-1 text-sm text-error">{errors.category}</p>
        )}
      </div>

{/* Payment Method */}
      <div>
        <label htmlFor="payment-method" className="block text-sm font-medium text-gray-700 mb-2">
          Payment Method
        </label>
        <select
          id="payment-method"
          name="paymentMethod"
          value={formData.paymentMethod}
          onChange={handleInputChange}
          className="w-full px-3 py-3 rounded-lg border border-gray-300 hover:border-gray-400 focus:border-primary focus:ring-primary focus:outline-none focus:ring-2 focus:ring-opacity-20 transition-all duration-200"
          aria-describedby="payment-method-description"
        >
          <option value="cash">Cash</option>
          <option value="credit_card">Credit Card</option>
          <option value="debit_card">Debit Card</option>
          <option value="bank_transfer">Bank Transfer</option>
          <option value="digital_wallet">Digital Wallet</option>
          <option value="check">Check</option>
        </select>
        <div id="payment-method-description" className="sr-only">
          Select the method used for this transaction
        </div>
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