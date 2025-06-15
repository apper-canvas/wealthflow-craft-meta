import { toast } from 'react-toastify';

const budgetService = {
  async getAll() {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const params = {
        Fields: ['Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy', 
                'month', 'total_limit']
      };
      
      const response = await apperClient.fetchRecords('budget', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }
      
      // Map database fields to UI fields for backward compatibility
      const mappedData = (response.data || []).map(budget => ({
        ...budget,
        totalLimit: budget.total_limit
      }));
      
      return mappedData;
    } catch (error) {
      console.error('Error fetching budgets:', error);
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
                'month', 'total_limit']
      };
      
      const response = await apperClient.getRecordById('budget', parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        return null;
      }
      
      // Map database fields to UI fields for backward compatibility
      const budget = response.data;
      if (budget) {
        budget.totalLimit = budget.total_limit;
      }
      
      return budget || null;
    } catch (error) {
      console.error(`Error fetching budget with ID ${id}:`, error);
      return null;
    }
  },

  async create(budgetData) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      // Check if budget already exists for this month
      const existingParams = {
        Fields: ['Name', 'month'],
        where: [
          {
            FieldName: 'month',
            Operator: 'ExactMatch',
            Values: [budgetData.month]
          }
        ]
      };
      
      const existingResponse = await apperClient.fetchRecords('budget', existingParams);
      
      if (existingResponse.success && existingResponse.data && existingResponse.data.length > 0) {
        throw new Error(`Budget already exists for ${budgetData.month}`);
      }
      
      // Map UI fields to database fields and include only Updateable fields
      const params = {
        records: [{
          Name: budgetData.name || `Budget for ${budgetData.month}`,
          month: budgetData.month,
          total_limit: budgetData.totalLimit || budgetData.amount
        }]
      };
      
      const response = await apperClient.createRecord('budget', params);
      
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
        
        const newBudget = successfulRecords[0]?.data;
        if (newBudget) {
          // Map database fields to UI fields for backward compatibility
          newBudget.totalLimit = newBudget.total_limit;
          // Add categories from budgetData if provided
          if (budgetData.categories) {
            newBudget.categories = budgetData.categories;
          }
        }
        
        return newBudget || null;
      }
      
      return null;
    } catch (error) {
      console.error('Error creating budget:', error);
      throw error;
    }
  },

  async update(id, updates) {
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
      
      if (updates.name !== undefined) updateData.Name = updates.name;
      if (updates.month !== undefined) updateData.month = updates.month;
      if (updates.totalLimit !== undefined) updateData.total_limit = updates.totalLimit;
      
      const params = {
        records: [updateData]
      };
      
      const response = await apperClient.updateRecord('budget', params);
      
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
        
        const updatedBudget = successfulUpdates[0]?.data;
        if (updatedBudget) {
          // Map database fields to UI fields for backward compatibility
          updatedBudget.totalLimit = updatedBudget.total_limit;
          // Preserve categories from updates if provided
          if (updates.categories) {
            updatedBudget.categories = updates.categories;
          }
        }
        
        return updatedBudget || null;
      }
      
      return null;
    } catch (error) {
      console.error('Error updating budget:', error);
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
      
      const response = await apperClient.deleteRecord('budget', params);
      
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
      console.error('Error deleting budget:', error);
      throw error;
    }
  },

  async getCurrentBudget() {
    try {
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
      
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const params = {
        Fields: ['Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy', 
                'month', 'total_limit'],
        where: [
          {
            FieldName: 'month',
            Operator: 'ExactMatch',
            Values: [currentMonth]
          }
        ]
      };
      
      const response = await apperClient.fetchRecords('budget', params);
      
      if (!response.success) {
        console.error(response.message);
        return null;
      }
      
      const budget = response.data?.[0];
      if (budget) {
        // Map database fields to UI fields for backward compatibility
        budget.totalLimit = budget.total_limit;
      }
      
      return budget || null;
    } catch (error) {
      console.error('Error fetching current budget:', error);
      return null;
    }
  },

  async getAllBudgets() {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const params = {
        Fields: ['Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy', 
                'month', 'total_limit'],
        orderBy: [{ FieldName: 'month', SortType: 'DESC' }]
      };
      
      const response = await apperClient.fetchRecords('budget', params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }
      
      // Map database fields to UI fields for backward compatibility
      const mappedData = (response.data || []).map(budget => ({
        ...budget,
        totalLimit: budget.total_limit
      }));
      
      return mappedData;
    } catch (error) {
      console.error('Error fetching all budgets:', error);
      return [];
    }
  }
};

export default budgetService;