import { toast } from 'react-toastify';

const categoryService = {
  async getAll() {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const params = {
        Fields: ['Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy', 
                'type', 'color', 'icon', 'budget_limit']
      };
      
      const response = await apperClient.fetchRecords('category', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }
      
      // Map database fields to UI fields for backward compatibility
const mappedData = (response.data || []).map(category => ({
        ...category,
        id: category.Id || category.id,
        name: category.Name || category.name,
        budgetLimit: category.budget_limit || category.budgetLimit
      }));
      
      return mappedData;
    } catch (error) {
      console.error('Error fetching categories:', error);
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
                'type', 'color', 'icon', 'budget_limit']
      };
      
      const response = await apperClient.getRecordById('category', parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        return null;
      }
      
      // Map database fields to UI fields for backward compatibility
const category = response.data;
      if (category) {
        category.id = category.Id || category.id;
        category.name = category.Name || category.name;
        category.budgetLimit = category.budget_limit || category.budgetLimit;
      }
      
      return category || null;
    } catch (error) {
      console.error(`Error fetching category with ID ${id}:`, error);
      return null;
    }
  },

  async create(categoryData) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      // Map UI fields to database fields and include only Updateable fields
      const params = {
        records: [{
          Name: categoryData.name,
          type: categoryData.type,
          color: categoryData.color,
          icon: categoryData.icon,
          budget_limit: categoryData.budgetLimit
        }]
      };
      
      const response = await apperClient.createRecord('category', params);
      
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
        
        const newCategory = successfulRecords[0]?.data;
        if (newCategory) {
          // Map database fields to UI fields for backward compatibility
          newCategory.name = newCategory.Name;
          newCategory.budgetLimit = newCategory.budget_limit;
        }
        
        return newCategory || null;
      }
      
      return null;
    } catch (error) {
      console.error('Error creating category:', error);
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
      if (updates.type !== undefined) updateData.type = updates.type;
      if (updates.color !== undefined) updateData.color = updates.color;
      if (updates.icon !== undefined) updateData.icon = updates.icon;
      if (updates.budgetLimit !== undefined) updateData.budget_limit = updates.budgetLimit;
      
      const params = {
        records: [updateData]
      };
      
      const response = await apperClient.updateRecord('category', params);
      
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
        
        const updatedCategory = successfulUpdates[0]?.data;
        if (updatedCategory) {
          // Map database fields to UI fields for backward compatibility
          updatedCategory.name = updatedCategory.Name;
          updatedCategory.budgetLimit = updatedCategory.budget_limit;
        }
        
        return updatedCategory || null;
      }
      
      return null;
    } catch (error) {
      console.error('Error updating category:', error);
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
      
      const response = await apperClient.deleteRecord('category', params);
      
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
      console.error('Error deleting category:', error);
      throw error;
    }
  },

  async getByType(type) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const params = {
        Fields: ['Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy', 
                'type', 'color', 'icon', 'budget_limit'],
        where: [
          {
            FieldName: 'type',
            Operator: 'ExactMatch',
            Values: [type]
          }
        ]
      };
      
      const response = await apperClient.fetchRecords('category', params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }
      
      // Map database fields to UI fields for backward compatibility
      const mappedData = (response.data || []).map(category => ({
        ...category,
        name: category.Name,
        budgetLimit: category.budget_limit
      }));
      
      return mappedData;
    } catch (error) {
      console.error('Error fetching categories by type:', error);
      throw error;
    }
  }
};

export default categoryService;