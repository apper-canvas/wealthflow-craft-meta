const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let transactions = [];

// Load initial data
const loadInitialData = async () => {
  try {
    const response = await import('../mockData/transactions.json');
    transactions = [...response.default];
  } catch (error) {
    console.warn('Could not load initial transaction data');
    transactions = [];
  }
};

// Initialize data
loadInitialData();

const transactionService = {
  async getAll() {
    await delay(300);
    return [...transactions];
  },

  async getById(id) {
    await delay(200);
    const transaction = transactions.find(t => t.id === id);
    return transaction ? { ...transaction } : null;
  },

  async create(transactionData) {
    await delay(300);
    const newTransaction = {
      ...transactionData,
      id: Date.now().toString(),
      date: transactionData.date || new Date().toISOString().split('T')[0]
    };
    transactions.unshift(newTransaction);
    return { ...newTransaction };
  },

  async update(id, updates) {
    await delay(300);
    const index = transactions.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Transaction not found');
    
    transactions[index] = { ...transactions[index], ...updates };
    return { ...transactions[index] };
  },

  async delete(id) {
    await delay(200);
    const index = transactions.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Transaction not found');
    
    const deleted = transactions.splice(index, 1)[0];
    return { ...deleted };
  },

  async getByDateRange(startDate, endDate) {
    await delay(300);
    return transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= new Date(startDate) && transactionDate <= new Date(endDate);
    });
  },

  async getByCategory(category) {
    await delay(200);
    return transactions.filter(t => t.category === category);
  },

  async getByType(type) {
    await delay(200);
    return transactions.filter(t => t.type === type);
  }
};

export default transactionService;