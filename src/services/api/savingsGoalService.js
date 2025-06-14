const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let savingsGoals = [];

// Load initial data
const loadInitialData = async () => {
  try {
    const response = await import('../mockData/savingsGoals.json');
    savingsGoals = [...response.default];
  } catch (error) {
    console.warn('Could not load initial savings goals data');
    savingsGoals = [];
  }
};

// Initialize data
loadInitialData();

const savingsGoalService = {
  async getAll() {
    await delay(300);
    return [...savingsGoals];
  },

  async getById(id) {
    await delay(200);
    const goal = savingsGoals.find(g => g.id === id);
    return goal ? { ...goal } : null;
  },

  async create(goalData) {
    await delay(300);
    const newGoal = {
      ...goalData,
      id: Date.now().toString(),
      currentAmount: goalData.currentAmount || 0
    };
    savingsGoals.push(newGoal);
    return { ...newGoal };
  },

  async update(id, updates) {
    await delay(300);
    const index = savingsGoals.findIndex(g => g.id === id);
    if (index === -1) throw new Error('Savings goal not found');
    
    savingsGoals[index] = { ...savingsGoals[index], ...updates };
    return { ...savingsGoals[index] };
  },

  async delete(id) {
    await delay(200);
    const index = savingsGoals.findIndex(g => g.id === id);
    if (index === -1) throw new Error('Savings goal not found');
    
    const deleted = savingsGoals.splice(index, 1)[0];
    return { ...deleted };
  },

  async addToGoal(id, amount) {
    await delay(300);
    const index = savingsGoals.findIndex(g => g.id === id);
    if (index === -1) throw new Error('Savings goal not found');
    
    savingsGoals[index].currentAmount += amount;
    return { ...savingsGoals[index] };
  }
};

export default savingsGoalService;