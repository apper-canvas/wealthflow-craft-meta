const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let budgets = [];

// Load initial data
const loadInitialData = async () => {
  try {
    const response = await import('../mockData/budgets.json');
    budgets = [...response.default];
  } catch (error) {
    console.warn('Could not load initial budget data');
    budgets = [];
  }
};

// Initialize data
loadInitialData();

const budgetService = {
  async getAll() {
    await delay(300);
    return [...budgets];
  },

  async getById(id) {
    await delay(200);
    const budget = budgets.find(b => b.id === id);
    return budget ? { ...budget } : null;
  },

async create(budgetData) {
    await delay(300);
    
    // Check if budget already exists for this month
    const existingBudget = budgets.find(b => b.month === budgetData.month);
    if (existingBudget) {
      throw new Error(`Budget already exists for ${budgetData.month}`);
    }
    
    const newBudget = {
      ...budgetData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    budgets.push(newBudget);
    return { ...newBudget };
  },

  async update(id, updates) {
    await delay(300);
    const index = budgets.findIndex(b => b.id === id);
    if (index === -1) throw new Error('Budget not found');
    
    budgets[index] = { ...budgets[index], ...updates };
    return { ...budgets[index] };
  },

  async delete(id) {
    await delay(200);
    const index = budgets.findIndex(b => b.id === id);
    if (index === -1) throw new Error('Budget not found');
    
    const deleted = budgets.splice(index, 1)[0];
    return { ...deleted };
  },

  async getCurrentBudget() {
    await delay(200);
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
    const budget = budgets.find(b => b.month === currentMonth);
    return budget ? { ...budget } : null;
  }
};

export default budgetService;