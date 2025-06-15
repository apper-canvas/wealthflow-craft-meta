import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { format, parseISO, differenceInDays, isAfter, isBefore } from 'date-fns';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import SkeletonLoader from '@/components/molecules/SkeletonLoader';
import ErrorState from '@/components/molecules/ErrorState';
import ApperIcon from '@/components/ApperIcon';
import billService from '@/services/api/billService';

const Bills = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [filter, setFilter] = useState('all'); // all, paid, unpaid, overdue
  const [searchTerm, setSearchTerm] = useState('');

  const loadBills = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await billService.getAll();
      setBills(data);
    } catch (err) {
      setError(err.message || 'Failed to load bills');
      toast.error('Failed to load bills');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBills();
  }, []);

  const handleMarkAsPaid = async (billId) => {
    try {
      await billService.markAsPaid(billId);
      await loadBills();
      toast.success('Bill marked as paid');
    } catch (err) {
      toast.error('Failed to mark bill as paid');
    }
  };

  const handleMarkAsUnpaid = async (billId) => {
    try {
      await billService.markAsUnpaid(billId);
      await loadBills();
      toast.success('Bill marked as unpaid');
    } catch (err) {
      toast.error('Failed to mark bill as unpaid');
    }
  };

  const handleDeleteBill = async (billId) => {
    if (!confirm('Are you sure you want to delete this bill?')) return;
    
    try {
      await billService.delete(billId);
      await loadBills();
      toast.success('Bill deleted successfully');
    } catch (err) {
      toast.error('Failed to delete bill');
    }
  };

  const getBillStatus = (bill) => {
    const today = new Date();
    const dueDate = parseISO(bill.dueDate);
    const daysUntilDue = differenceInDays(dueDate, today);

    if (bill.paymentStatus === 'paid') return 'paid';
    if (daysUntilDue < 0) return 'overdue';
    if (daysUntilDue <= 3) return 'due-soon';
    return 'upcoming';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'text-success bg-green-50 border-green-200';
      case 'overdue': return 'text-error bg-red-50 border-red-200';
      case 'due-soon': return 'text-warning bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'paid': return 'Paid';
      case 'overdue': return 'Overdue';
      case 'due-soon': return 'Due Soon';
      default: return 'Upcoming';
    }
  };

  const filteredBills = bills.filter(bill => {
    const matchesSearch = bill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bill.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    const status = getBillStatus(bill);
    switch (filter) {
      case 'paid': return bill.paymentStatus === 'paid';
      case 'unpaid': return bill.paymentStatus === 'unpaid';
      case 'overdue': return status === 'overdue';
      default: return true;
    }
  });

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900 mb-2">Bills</h1>
          <p className="text-gray-600">Manage your upcoming bills and payments.</p>
        </div>
        <SkeletonLoader type="card" count={6} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorState message={error} onRetry={loadBills} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900 mb-2">Bills</h1>
          <p className="text-gray-600">Manage your upcoming bills and payments.</p>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          variant="primary"
          icon="Plus"
        >
          Add Bill
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search bills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon="Search"
          />
        </div>
        <div className="flex gap-2">
          {[
            { key: 'all', label: 'All' },
            { key: 'unpaid', label: 'Unpaid' },
            { key: 'paid', label: 'Paid' },
            { key: 'overdue', label: 'Overdue' }
          ].map(filterOption => (
            <Button
              key={filterOption.key}
              variant={filter === filterOption.key ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter(filterOption.key)}
            >
              {filterOption.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Bills List */}
      <div className="space-y-4">
        {filteredBills.length === 0 ? (
          <Card className="p-12 text-center">
            <ApperIcon name="Calendar" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No bills found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Add your first bill to get started'
              }
            </p>
            {!searchTerm && filter === 'all' && (
              <Button onClick={() => setShowAddForm(true)} variant="primary" icon="Plus">
                Add Bill
              </Button>
            )}
          </Card>
        ) : (
          filteredBills.map((bill, index) => {
            const status = getBillStatus(bill);
            const dueDate = parseISO(bill.dueDate);
            const daysUntilDue = differenceInDays(dueDate, new Date());
            
            return (
              <motion.div
                key={bill.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{bill.name}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(status)}`}>
                          {getStatusText(status)}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <ApperIcon name="DollarSign" className="w-4 h-4" />
                          <span>${bill.amount.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <ApperIcon name="Calendar" className="w-4 h-4" />
                          <span>Due {format(dueDate, 'MMM dd, yyyy')}</span>
                          {status !== 'paid' && (
                            <span className="text-gray-500">
                              ({daysUntilDue > 0 ? `in ${daysUntilDue} days` : 
                                daysUntilDue === 0 ? 'today' : `${Math.abs(daysUntilDue)} days ago`})
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-1">
                          <ApperIcon name="Tag" className="w-4 h-4" />
                          <span>{bill.category}</span>
                        </div>
                      </div>
                      
                      {bill.description && (
                        <p className="text-sm text-gray-600 mt-2">{bill.description}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {bill.paymentStatus === 'unpaid' ? (
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleMarkAsPaid(bill.id)}
                          icon="CheckCircle"
                        >
                          Mark Paid
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkAsUnpaid(bill.id)}
                          icon="Circle"
                        >
                          Mark Unpaid
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingBill(bill)}
                        icon="Edit"
                      >
                        Edit
                      </Button>
                      
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteBill(bill.id)}
                        icon="Trash2"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Add/Edit Bill Modal */}
      <AnimatePresence>
        {(showAddForm || editingBill) && (
          <BillFormModal
            bill={editingBill}
            onClose={() => {
              setShowAddForm(false);
              setEditingBill(null);
            }}
            onSuccess={() => {
              setShowAddForm(false);
              setEditingBill(null);
              loadBills();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Bill Form Modal Component
const BillFormModal = ({ bill, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    dueDate: '',
    category: '',
    description: '',
    isRecurring: false,
    recurringType: 'monthly',
    reminderSettings: {
      enabled: true,
      daysBefore: 5,
      methods: ['push']
    }
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (bill) {
      setFormData({
        ...bill,
        amount: bill.amount.toString(),
        dueDate: format(parseISO(bill.dueDate), 'yyyy-MM-dd')
      });
    }
  }, [bill]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('reminderSettings.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        reminderSettings: {
          ...prev.reminderSettings,
          [field]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleMethodToggle = (method) => {
    setFormData(prev => ({
      ...prev,
      reminderSettings: {
        ...prev.reminderSettings,
        methods: prev.reminderSettings.methods.includes(method)
          ? prev.reminderSettings.methods.filter(m => m !== method)
          : [...prev.reminderSettings.methods, method]
      }
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Bill name is required';
    if (!formData.amount || parseFloat(formData.amount) <= 0) newErrors.amount = 'Valid amount is required';
    if (!formData.dueDate) newErrors.dueDate = 'Due date is required';
    if (!formData.category.trim()) newErrors.category = 'Category is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const billData = {
        ...formData,
        amount: parseFloat(formData.amount)
      };

      if (bill) {
        await billService.update(bill.id, billData);
        toast.success('Bill updated successfully');
      } else {
        await billService.create(billData);
        toast.success('Bill added successfully');
      }
      
      onSuccess();
    } catch (err) {
      toast.error(err.message || 'Failed to save bill');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-heading font-semibold text-gray-900">
              {bill ? 'Edit Bill' : 'Add Bill'}
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ApperIcon name="X" className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Bill Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              error={errors.name}
              placeholder="Enter bill name"
              required
            />
            
            <Input
              label="Amount"
              name="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={handleInputChange}
              error={errors.amount}
              placeholder="0.00"
              required
            />
            
            <Input
              label="Due Date"
              name="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={handleInputChange}
              error={errors.dueDate}
              required
            />
            
            <Input
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              error={errors.category}
              placeholder="e.g., Utilities, Housing"
              required
            />
          </div>
          
          <Input
            label="Description (Optional)"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Additional notes about this bill"
/>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="bill-recurring"
                name="isRecurring"
                checked={formData.isRecurring}
checked={formData.isRecurring}
                onChange={handleInputChange}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                aria-describedby="bill-recurring-description"
              />
              <label htmlFor="bill-recurring" className="text-sm font-medium text-gray-700">
                This is a recurring bill
              </label>
            </div>
            <div id="bill-recurring-description" className="sr-only">
              Check this if the bill repeats automatically on a schedule
            </div>
            
{formData.isRecurring && (
              <div>
                <label htmlFor="bill-recurring-type" className="block text-sm font-medium text-gray-700 mb-2">
                  Recurring Period
                </label>
                <select
                  id="bill-recurring-type"
                  name="recurringType"
                  value={formData.recurringType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-describedby="bill-recurring-type-description"
                >
>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
                <div id="bill-recurring-type-description" className="sr-only">
                  Select how often this bill should automatically repeat
                </div>
              </div>
            )}
          </div>
          
<div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900">Reminder Settings</h4>
            
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="bill-reminder-enabled"
                name="reminderSettings.enabled"
name="reminderSettings.enabled"
                checked={formData.reminderSettings.enabled}
                onChange={handleInputChange}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                aria-describedby="bill-reminder-enabled-description"
              />
              <label htmlFor="bill-reminder-enabled" className="text-sm font-medium text-gray-700">
                Enable reminders
              </label>
            </div>
            <div id="bill-reminder-enabled-description" className="sr-only">
              Get notified before this bill is due
            </div>
            
            {formData.reminderSettings.enabled && (
              <div className="space-y-4">
                <Input
                  label="Days before due date"
                  name="reminderSettings.daysBefore"
                  type="number"
                  min="1"
                  max="30"
                  value={formData.reminderSettings.daysBefore}
                  onChange={handleInputChange}
/>
                
                <fieldset>
                  <legend className="block text-sm font-medium text-gray-700 mb-2">
                    Reminder Methods
                  </legend>
                  <div className="flex flex-wrap gap-2" role="group" aria-describedby="bill-reminder-methods-description">
                    {[
                      { key: 'push', label: 'Push Notification', icon: 'Bell' },
                      { key: 'email', label: 'Email', icon: 'Mail' },
                      { key: 'sms', label: 'SMS', icon: 'MessageSquare' }
                    ].map(method => (
                      <button
                        key={method.key}
                        type="button"
                        onClick={() => handleMethodToggle(method.key)}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors ${
                          formData.reminderSettings.methods.includes(method.key)
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <ApperIcon name={method.icon} className="w-4 h-4" />
<span className="text-sm">{method.label}</span>
                      </button>
                    ))}
                  </div>
                  <div id="bill-reminder-methods-description" className="sr-only">
                    Choose how you want to be reminded about this bill
                  </div>
                </fieldset>
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              icon={bill ? "Save" : "Plus"}
            >
              {bill ? 'Update Bill' : 'Add Bill'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Bills;