import { toast } from 'react-toastify';
import { format, parseISO, isAfter, isBefore, addDays } from 'date-fns';

const billService = {
  async getAll() {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const params = {
        Fields: ['Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy', 
                'amount', 'due_date', 'category', 'payment_status', 'is_recurring', 'recurring_type', 
                'description', 'reminder_settings_enabled', 'reminder_settings_days_before', 'reminder_settings_methods']
      };
      
      const response = await apperClient.fetchRecords('bill', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }
      
      // Map database fields to UI fields for backward compatibility
      const mappedData = (response.data || []).map(bill => ({
        ...bill,
        name: bill.Name,
        dueDate: bill.due_date,
        paymentStatus: bill.payment_status,
        isRecurring: bill.is_recurring,
        recurringType: bill.recurring_type,
        reminderSettings: {
          enabled: bill.reminder_settings_enabled,
          daysBefore: bill.reminder_settings_days_before,
          methods: bill.reminder_settings_methods ? bill.reminder_settings_methods.split(',') : []
        },
        paymentHistory: [] // Initialize empty payment history
      }));
      
      return mappedData;
    } catch (error) {
      console.error('Error fetching bills:', error);
      throw error;
    }
  },

  async getUpcoming(days = 30) {
    try {
      const today = new Date();
      const futureDate = addDays(today, days);
      
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const params = {
        Fields: ['Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy', 
                'amount', 'due_date', 'category', 'payment_status', 'is_recurring', 'recurring_type', 
                'description', 'reminder_settings_enabled', 'reminder_settings_days_before', 'reminder_settings_methods'],
        where: [
          {
            FieldName: 'due_date',
            Operator: 'GreaterThan',
            Values: [format(today, 'yyyy-MM-dd')]
          },
          {
            FieldName: 'due_date',
            Operator: 'LessThan',
            Values: [format(futureDate, 'yyyy-MM-dd')]
          }
        ],
        orderBy: [{ FieldName: 'due_date', SortType: 'ASC' }]
      };
      
      const response = await apperClient.fetchRecords('bill', params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }
      
      // Map database fields to UI fields for backward compatibility
      const mappedData = (response.data || []).map(bill => ({
        ...bill,
        name: bill.Name,
        dueDate: bill.due_date,
        paymentStatus: bill.payment_status,
        isRecurring: bill.is_recurring,
        recurringType: bill.recurring_type,
        reminderSettings: {
          enabled: bill.reminder_settings_enabled,
          daysBefore: bill.reminder_settings_days_before,
          methods: bill.reminder_settings_methods ? bill.reminder_settings_methods.split(',') : []
        }
      }));
      
      return mappedData;
    } catch (error) {
      console.error('Error fetching upcoming bills:', error);
      throw error;
    }
  },

  async getOverdue() {
    try {
      const today = new Date();
      
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const params = {
        Fields: ['Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy', 
                'amount', 'due_date', 'category', 'payment_status', 'is_recurring', 'recurring_type', 
                'description', 'reminder_settings_enabled', 'reminder_settings_days_before', 'reminder_settings_methods'],
        where: [
          {
            FieldName: 'due_date',
            Operator: 'LessThan',
            Values: [format(today, 'yyyy-MM-dd')]
          },
          {
            FieldName: 'payment_status',
            Operator: 'ExactMatch',
            Values: ['unpaid']
          }
        ]
      };
      
      const response = await apperClient.fetchRecords('bill', params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }
      
      // Map database fields to UI fields for backward compatibility
      const mappedData = (response.data || []).map(bill => ({
        ...bill,
        name: bill.Name,
        dueDate: bill.due_date,
        paymentStatus: bill.payment_status,
        isRecurring: bill.is_recurring,
        recurringType: bill.recurring_type,
        reminderSettings: {
          enabled: bill.reminder_settings_enabled,
          daysBefore: bill.reminder_settings_days_before,
          methods: bill.reminder_settings_methods ? bill.reminder_settings_methods.split(',') : []
        }
      }));
      
      return mappedData;
    } catch (error) {
      console.error('Error fetching overdue bills:', error);
      throw error;
    }
  },

  async getById(id) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const params = {
        fields: ['Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy', 
                'amount', 'due_date', 'category', 'payment_status', 'is_recurring', 'recurring_type', 
                'description', 'reminder_settings_enabled', 'reminder_settings_days_before', 'reminder_settings_methods']
      };
      
      const response = await apperClient.getRecordById('bill', parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error('Bill not found');
      }
      
      // Map database fields to UI fields for backward compatibility
      const bill = response.data;
      if (bill) {
        bill.name = bill.Name;
        bill.dueDate = bill.due_date;
        bill.paymentStatus = bill.payment_status;
        bill.isRecurring = bill.is_recurring;
        bill.recurringType = bill.recurring_type;
        bill.reminderSettings = {
          enabled: bill.reminder_settings_enabled,
          daysBefore: bill.reminder_settings_days_before,
          methods: bill.reminder_settings_methods ? bill.reminder_settings_methods.split(',') : []
        };
        bill.paymentHistory = []; // Initialize empty payment history
      }
      
      return bill || null;
    } catch (error) {
      console.error(`Error fetching bill with ID ${id}:`, error);
      throw error;
    }
  },

  async create(billData) {
    try {
      if (!billData.name || !billData.amount || !billData.dueDate) {
        throw new Error('Bill name, amount, and due date are required');
      }

      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      // Map UI fields to database fields and include only Updateable fields
      const params = {
        records: [{
          Name: billData.name,
          amount: parseFloat(billData.amount),
          due_date: billData.dueDate,
          category: billData.category,
          payment_status: 'unpaid',
          is_recurring: billData.isRecurring || false,
          recurring_type: billData.recurringType || 'monthly',
          description: billData.description || '',
          reminder_settings_enabled: billData.reminderSettings?.enabled !== false,
          reminder_settings_days_before: billData.reminderSettings?.daysBefore || 5,
          reminder_settings_methods: billData.reminderSettings?.methods ? billData.reminderSettings.methods.join(',') : 'push'
        }]
      };
      
      const response = await apperClient.createRecord('bill', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }
      
      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }
        
        const newBill = successfulRecords[0]?.data;
        if (newBill) {
          // Map database fields to UI fields for backward compatibility
          newBill.name = newBill.Name;
          newBill.dueDate = newBill.due_date;
          newBill.paymentStatus = newBill.payment_status;
          newBill.isRecurring = newBill.is_recurring;
          newBill.recurringType = newBill.recurring_type;
          newBill.reminderSettings = {
            enabled: newBill.reminder_settings_enabled,
            daysBefore: newBill.reminder_settings_days_before,
            methods: newBill.reminder_settings_methods ? newBill.reminder_settings_methods.split(',') : []
          };
          newBill.paymentHistory = [];
        }
        
        return newBill || null;
      }
      
      return null;
    } catch (error) {
      console.error('Error creating bill:', error);
      throw error;
    }
  },

  async update(id, billData) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      // Map UI fields to database fields and include only Updateable fields
      const updateData = {
        Id: parseInt(id)
      };
      
      if (billData.name !== undefined) updateData.Name = billData.name;
      if (billData.amount !== undefined) updateData.amount = parseFloat(billData.amount);
      if (billData.dueDate !== undefined) updateData.due_date = billData.dueDate;
      if (billData.category !== undefined) updateData.category = billData.category;
      if (billData.paymentStatus !== undefined) updateData.payment_status = billData.paymentStatus;
      if (billData.isRecurring !== undefined) updateData.is_recurring = billData.isRecurring;
      if (billData.recurringType !== undefined) updateData.recurring_type = billData.recurringType;
      if (billData.description !== undefined) updateData.description = billData.description;
      if (billData.reminderSettings !== undefined) {
        updateData.reminder_settings_enabled = billData.reminderSettings.enabled;
        updateData.reminder_settings_days_before = billData.reminderSettings.daysBefore;
        updateData.reminder_settings_methods = billData.reminderSettings.methods ? billData.reminderSettings.methods.join(',') : '';
      }
      
      const params = {
        records: [updateData]
      };
      
      const response = await apperClient.updateRecord('bill', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }
      
      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }
        
        const updatedBill = successfulUpdates[0]?.data;
        if (updatedBill) {
          // Map database fields to UI fields for backward compatibility
          updatedBill.name = updatedBill.Name;
          updatedBill.dueDate = updatedBill.due_date;
          updatedBill.paymentStatus = updatedBill.payment_status;
          updatedBill.isRecurring = updatedBill.is_recurring;
          updatedBill.recurringType = updatedBill.recurring_type;
          updatedBill.reminderSettings = {
            enabled: updatedBill.reminder_settings_enabled,
            daysBefore: updatedBill.reminder_settings_days_before,
            methods: updatedBill.reminder_settings_methods ? updatedBill.reminder_settings_methods.split(',') : []
          };
          // Preserve existing payment history
          updatedBill.paymentHistory = [];
        }
        
        return updatedBill || null;
      }
      
      return null;
    } catch (error) {
      console.error('Error updating bill:', error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const params = {
        RecordIds: [parseInt(id)]
      };
      
      const response = await apperClient.deleteRecord('bill', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }
      
      if (response.results) {
        const failedDeletions = response.results.filter(result => !result.success);
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          failedDeletions.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          return false;
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error deleting bill:', error);
      throw error;
    }
  },

  async markAsPaid(id, paymentAmount = null) {
    try {
      // First get the bill to check amount
      const bill = await this.getById(id);
      if (!bill) {
        throw new Error('Bill not found');
      }

      // Update payment status to paid
      return await this.update(id, { paymentStatus: 'paid' });
    } catch (error) {
      console.error('Error marking bill as paid:', error);
      throw error;
    }
  },

  async markAsUnpaid(id) {
    try {
      // Update payment status to unpaid
      return await this.update(id, { paymentStatus: 'unpaid' });
    } catch (error) {
      console.error('Error marking bill as unpaid:', error);
      throw error;
    }
  },

  async updateReminders(id, reminderSettings) {
    try {
      return await this.update(id, { reminderSettings });
    } catch (error) {
      console.error('Error updating reminders:', error);
      throw error;
    }
  },

  async getByCategory(category) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const params = {
        Fields: ['Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy', 
                'amount', 'due_date', 'category', 'payment_status', 'is_recurring', 'recurring_type', 
                'description', 'reminder_settings_enabled', 'reminder_settings_days_before', 'reminder_settings_methods'],
        where: [
          {
            FieldName: 'category',
            Operator: 'ExactMatch',
            Values: [category]
          }
        ]
      };
      
      const response = await apperClient.fetchRecords('bill', params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }
      
      // Map database fields to UI fields for backward compatibility
      const mappedData = (response.data || []).map(bill => ({
        ...bill,
        name: bill.Name,
        dueDate: bill.due_date,
        paymentStatus: bill.payment_status,
        isRecurring: bill.is_recurring,
        recurringType: bill.recurring_type,
        reminderSettings: {
          enabled: bill.reminder_settings_enabled,
          daysBefore: bill.reminder_settings_days_before,
          methods: bill.reminder_settings_methods ? bill.reminder_settings_methods.split(',') : []
        }
      }));
      
      return mappedData;
    } catch (error) {
      console.error('Error fetching bills by category:', error);
      throw error;
    }
  },

  async getPaymentStats() {
    try {
      const bills = await this.getAll();
      
      const totalBills = bills.length;
      const paidBills = bills.filter(b => b.paymentStatus === 'paid').length;
      const unpaidBills = totalBills - paidBills;
      const totalAmount = bills.reduce((sum, bill) => sum + bill.amount, 0);
      const paidAmount = bills
        .filter(b => b.paymentStatus === 'paid')
        .reduce((sum, bill) => sum + bill.amount, 0);
      const unpaidAmount = totalAmount - paidAmount;

      return {
        totalBills,
        paidBills,
        unpaidBills,
        totalAmount,
        paidAmount,
        unpaidAmount,
        paymentRate: totalBills > 0 ? (paidBills / totalBills) * 100 : 0
      };
    } catch (error) {
      console.error('Error calculating payment stats:', error);
      throw error;
    }
  }
};

export const { getAll, getUpcoming, getOverdue, getById, create, update, delete: deleteBill, markAsPaid, markAsUnpaid, updateReminders, getByCategory, getPaymentStats } = billService;

export default billService;