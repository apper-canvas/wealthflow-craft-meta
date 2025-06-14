const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let categories = [];

// Load initial data
const loadInitialData = async () => {
  try {
    const response = await import('../mockData/categories.json');
    categories = [...response.default];
  } catch (error) {
    console.warn('Could not load initial category data');
    categories = [];
  }
};

// Initialize data
loadInitialData();

const categoryService = {
  async getAll() {
    await delay(200);
    return [...categories];
  },

  async getById(id) {
    await delay(200);
    const category = categories.find(c => c.id === id);
    return category ? { ...category } : null;
  },

  async create(categoryData) {
    await delay(300);
    const newCategory = {
      ...categoryData,
      id: Date.now().toString()
    };
    categories.push(newCategory);
    return { ...newCategory };
  },

  async update(id, updates) {
    await delay(300);
    const index = categories.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Category not found');
    
    categories[index] = { ...categories[index], ...updates };
    return { ...categories[index] };
  },

  async delete(id) {
    await delay(200);
    const index = categories.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Category not found');
    
    const deleted = categories.splice(index, 1)[0];
    return { ...deleted };
  },

  async getByType(type) {
    await delay(200);
    return categories.filter(c => c.type === type);
  }
};

export default categoryService;