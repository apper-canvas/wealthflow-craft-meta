import React, { useState } from "react";
import { motion } from "framer-motion";
import TransactionList from "@/components/organisms/TransactionList";
import TransactionForm from "@/components/molecules/TransactionForm";
import CategoryManager from "@/components/organisms/CategoryManager";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const Transactions = () => {
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showCategoryManager, setShowCategoryManager] = useState(false);

  const handleTransactionEdit = (transaction) => {
    setEditingTransaction(transaction);
    setShowTransactionForm(true);
  };

  const handleTransactionSuccess = () => {
    setShowTransactionForm(false);
    setEditingTransaction(null);
    setRefreshKey(prev => prev + 1); // Force refresh of transaction list
  };

  const handleFormClose = () => {
    setShowTransactionForm(false);
    setEditingTransaction(null);
  };

  return (
    <div className="p-6 space-y-6 max-w-full overflow-hidden">
      {/* Header */}
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900 mb-2">Transactions</h1>
          <p className="text-gray-600">Track and manage all your financial transactions</p>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={() => setShowCategoryManager(true)}
            variant="outline"
            icon="Tags"
          >
            Manage Categories
          </Button>
          <Button
            onClick={() => setShowTransactionForm(true)}
            variant="primary"
            icon="Plus"
          >
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Transaction List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        key={refreshKey} // Force re-render when refreshKey changes
      >
        <TransactionList
          onTransactionEdit={handleTransactionEdit}
          showAddButton={false}
          onAddTransaction={() => setShowTransactionForm(true)}
        />
      </motion.div>

      {/* Transaction Form Modal */}
      {showTransactionForm && (
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
                  {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
                </h3>
                <button
                  onClick={handleFormClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ApperIcon name="X" className="w-5 h-5" />
                </button>
              </div>
            </div>
            
<div className="p-6">
              <TransactionForm
                initialData={editingTransaction}
                onSuccess={handleTransactionSuccess}
                onCancel={handleFormClose}
              />
            </div>
          </motion.div>
        </div>
      )}

      {/* Category Manager Modal */}
      {showCategoryManager && (
        <CategoryManager
          onClose={() => setShowCategoryManager(false)}
          onCategoryChange={() => setRefreshKey(prev => prev + 1)}
        />
      )}
    </div>
  );
};

export default Transactions;