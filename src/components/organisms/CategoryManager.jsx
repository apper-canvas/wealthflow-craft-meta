import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import ApperIcon from '@/components/ApperIcon';
import SkeletonLoader from '@/components/molecules/SkeletonLoader';
import EmptyState from '@/components/molecules/EmptyState';
import { categoryService } from '@/services';

const CategoryManager = ({ onClose, onCategoryChange }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'expense',
    color: '#3B82F6',
    icon: 'Receipt',
    budgetLimit: ''
  });
  const [formErrors, setFormErrors] = useState({});

  const availableIcons = [
    'Receipt', 'Briefcase', 'Laptop', 'TrendingUp', 'Home', 'UtensilsCrossed',
    'Car', 'Zap', 'Film', 'Heart', 'ShoppingBag', 'CreditCard', 'Smartphone',
    'Gamepad2', 'Book', 'Plane', 'Coffee', 'Gift', 'Music', 'Camera'
  ];

  const availableColors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899',
    '#06B6D4', '#84CC16', '#F97316', '#6366F1', '#14B8A6', '#F43F5E'
  ];

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (error) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (formData.type === 'expense' && (!formData.budgetLimit || parseFloat(formData.budgetLimit) <= 0)) {
      errors.budgetLimit = 'Budget limit must be greater than 0 for expense categories';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const categoryData = {
        ...formData,
        budgetLimit: formData.type === 'expense' && formData.budgetLimit ? parseFloat(formData.budgetLimit) : null
      };

      if (editingCategory) {
        await categoryService.update(editingCategory.id, categoryData);
        toast.success('Category updated successfully!');
      } else {
        await categoryService.create(categoryData);
        toast.success('Category created successfully!');
      }

      setShowForm(false);
      setEditingCategory(null);
      setFormData({ name: '', type: 'expense', color: '#3B82F6', icon: 'Receipt', budgetLimit: '' });
      loadCategories();
      onCategoryChange?.();
    } catch (error) {
      toast.error(error.message || 'Failed to save category');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      type: category.type,
      color: category.color,
      icon: category.icon,
      budgetLimit: category.budgetLimit?.toString() || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (category) => {
    if (!window.confirm(`Are you sure you want to delete "${category.name}"?`)) return;

    try {
      await categoryService.delete(category.id);
      toast.success('Category deleted successfully!');
      loadCategories();
      onCategoryChange?.();
    } catch (error) {
      toast.error('Failed to delete category');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCategory(null);
    setFormData({ name: '', type: 'expense', color: '#3B82F6', icon: 'Receipt', budgetLimit: '' });
    setFormErrors({});
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-heading font-semibold text-gray-900">
              Manage Categories
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ApperIcon name="X" className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {!showForm ? (
            <>
              <div className="flex justify-between items-center mb-6">
                <p className="text-gray-600">Manage your income and expense categories</p>
                <Button
                  onClick={() => setShowForm(true)}
                  variant="primary"
                  icon="Plus"
                >
                  Add Category
                </Button>
              </div>

              {loading ? (
                <SkeletonLoader type="card" count={4} />
              ) : categories.length === 0 ? (
                <EmptyState
                  icon="Tags"
                  title="No categories found"
                  description="Create your first category to organize your transactions"
                  actionLabel="Add Category"
                  onAction={() => setShowForm(true)}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AnimatePresence>
                    {categories.map((category, index) => (
                      <motion.div
                        key={category.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card hover className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div 
                                className="p-2 rounded-lg"
                                style={{ backgroundColor: `${category.color}20`, color: category.color }}
                              >
                                <ApperIcon name={category.icon} className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">{category.name}</h4>
                                <div className="flex items-center space-x-2 text-sm text-gray-500">
                                  <span className={`px-2 py-1 rounded-full text-xs ${
                                    category.type === 'income' 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {category.type}
                                  </span>
                                  {category.budgetLimit && (
                                    <span>Budget: ${category.budgetLimit}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex space-x-1">
                              <button
                                onClick={() => handleEdit(category)}
                                className="p-2 text-gray-400 hover:text-primary hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                <ApperIcon name="Edit2" className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(category)}
                                className="p-2 text-gray-400 hover:text-error hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <ApperIcon name="Trash2" className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </>
          ) : (
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-lg font-medium text-gray-900">
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </h4>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleCancel}
                  icon="ArrowLeft"
                >
                  Back
                </Button>
              </div>

              <Input
                label="Category Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                error={formErrors.name}
                placeholder="e.g., Groceries, Rent, Salary"
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type *
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
                      <span className="capitalize text-sm font-medium">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {formData.type === 'expense' && (
                <Input
                  label="Budget Limit"
                  type="number"
                  name="budgetLimit"
                  value={formData.budgetLimit}
                  onChange={handleInputChange}
                  error={formErrors.budgetLimit}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icon
                </label>
                <div className="grid grid-cols-8 gap-2">
                  {availableIcons.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, icon }))}
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        formData.icon === icon
                          ? 'border-primary bg-primary/10'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <ApperIcon name={icon} className="w-5 h-5 mx-auto" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color
                </label>
                <div className="grid grid-cols-8 gap-2">
                  {availableColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, color }))}
                      className={`w-8 h-8 rounded-lg border-2 transition-all ${
                        formData.color === color
                          ? 'border-gray-400 scale-110'
                          : 'border-gray-200 hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1"
                >
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
              </div>
            </motion.form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default CategoryManager;