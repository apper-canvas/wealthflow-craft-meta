import { toast } from 'react-toastify';

const savingsGoalService = {
  async getAll() {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const params = {
        Fields: ['Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy', 
                'target_amount', 'current_amount', 'target_date', 'category']
      };
      
      const response = await apperClient.fetchRecords('savings_goal', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }
      
      // Map database fields to UI fields for backward compatibility
      const mappedData = (response.data || []).map(goal => ({
        ...goal,
        name: goal.Name,
        targetAmount: goal.target_amount,
        currentAmount: goal.current_amount,
        targetDate: goal.target_date
      }));
      
      return mappedData;
    } catch (error) {
      console.error('Error fetching savings goals:', error);
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
                'target_amount', 'current_amount', 'target_date', 'category']
      };
      
      const response = await apperClient.getRecordById('savings_goal', parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        return null;
      }
      
      // Map database fields to UI fields for backward compatibility
      const goal = response.data;
      if (goal) {
        goal.name = goal.Name;
        goal.targetAmount = goal.target_amount;
        goal.currentAmount = goal.current_amount;
        goal.targetDate = goal.target_date;
      }
      
      return goal || null;
    } catch (error) {
      console.error(`Error fetching savings goal with ID ${id}:`, error);
      return null;
    }
  },

  async create(goalData) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      // Map UI fields to database fields and include only Updateable fields
      const params = {
        records: [{
          Name: goalData.name,
          target_amount: goalData.targetAmount,
          current_amount: goalData.currentAmount || 0,
          target_date: goalData.targetDate,
          category: goalData.category
        }]
      };
      
      const response = await apperClient.createRecord('savings_goal', params);
      
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
        
        const newGoal = successfulRecords[0]?.data;
        if (newGoal) {
          // Map database fields to UI fields for backward compatibility
          newGoal.name = newGoal.Name;
          newGoal.targetAmount = newGoal.target_amount;
          newGoal.currentAmount = newGoal.current_amount;
          newGoal.targetDate = newGoal.target_date;
        }
        
        return newGoal || null;
      }
      
      return null;
    } catch (error) {
      console.error('Error creating savings goal:', error);
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
      if (updates.targetAmount !== undefined) updateData.target_amount = updates.targetAmount;
      if (updates.currentAmount !== undefined) updateData.current_amount = updates.currentAmount;
      if (updates.targetDate !== undefined) updateData.target_date = updates.targetDate;
      if (updates.category !== undefined) updateData.category = updates.category;
      
      const params = {
        records: [updateData]
      };
      
      const response = await apperClient.updateRecord('savings_goal', params);
      
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
        
        const updatedGoal = successfulUpdates[0]?.data;
        if (updatedGoal) {
          // Map database fields to UI fields for backward compatibility
          updatedGoal.name = updatedGoal.Name;
          updatedGoal.targetAmount = updatedGoal.target_amount;
          updatedGoal.currentAmount = updatedGoal.current_amount;
          updatedGoal.targetDate = updatedGoal.target_date;
        }
        
        return updatedGoal || null;
      }
      
      return null;
    } catch (error) {
      console.error('Error updating savings goal:', error);
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
      
      const response = await apperClient.deleteRecord('savings_goal', params);
      
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
      console.error('Error deleting savings goal:', error);
      throw error;
    }
  },

  async addToGoal(id, amount) {
    try {
      // First get the current goal to retrieve current amount
      const currentGoal = await this.getById(id);
      if (!currentGoal) {
        throw new Error('Savings goal not found');
      }
      
      // Update with new current amount
      const newCurrentAmount = currentGoal.currentAmount + amount;
      return await this.update(id, { currentAmount: newCurrentAmount });
    } catch (error) {
      console.error('Error adding to savings goal:', error);
      throw error;
    }
  }
};

export default savingsGoalService;