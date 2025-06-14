import billsData from '@/services/mockData/bills.json';
import { format, parseISO, isAfter, isBefore, addDays } from 'date-fns';

let bills = [...billsData];

// Simulate API delay
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const billService = {
  // Get all bills
  async getAll() {
    await delay();
    return [...bills];
  },

  // Get upcoming bills (next 30 days)
  async getUpcoming(days = 30) {
    await delay();
    const today = new Date();
    const futureDate = addDays(today, days);
    
    return bills.filter(bill => {
      const dueDate = parseISO(bill.dueDate);
      return isAfter(dueDate, today) && isBefore(dueDate, futureDate);
    }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  },

  // Get overdue bills
  async getOverdue() {
    await delay();
    const today = new Date();
    
    return bills.filter(bill => {
      const dueDate = parseISO(bill.dueDate);
      return isBefore(dueDate, today) && bill.paymentStatus === 'unpaid';
    });
  },

  // Get bill by ID
  async getById(id) {
    await delay();
    const bill = bills.find(b => b.id === parseInt(id));
    if (!bill) {
      throw new Error('Bill not found');
    }
    return { ...bill };
  },

  // Create new bill
  async create(billData) {
    await delay();
    
    if (!billData.name || !billData.amount || !billData.dueDate) {
      throw new Error('Bill name, amount, and due date are required');
    }

    const newBill = {
      id: Date.now(),
      ...billData,
      amount: parseFloat(billData.amount),
      paymentStatus: 'unpaid',
      paymentHistory: [],
      reminderSettings: {
        enabled: true,
        daysBefore: 5,
        methods: ['push'],
        ...billData.reminderSettings
      }
    };

    bills.push(newBill);
    return { ...newBill };
  },

  // Update bill
  async update(id, billData) {
    await delay();
    
    const index = bills.findIndex(b => b.id === parseInt(id));
    if (index === -1) {
      throw new Error('Bill not found');
    }

    const updatedBill = {
      ...bills[index],
      ...billData,
      amount: billData.amount ? parseFloat(billData.amount) : bills[index].amount,
      id: parseInt(id)
    };

    bills[index] = updatedBill;
    return { ...updatedBill };
  },

  // Delete bill
  async delete(id) {
    await delay();
    
    const index = bills.findIndex(b => b.id === parseInt(id));
    if (index === -1) {
      throw new Error('Bill not found');
    }

    const deletedBill = bills.splice(index, 1)[0];
    return { ...deletedBill };
  },

  // Mark bill as paid
  async markAsPaid(id, paymentAmount = null) {
    await delay();
    
    const bill = bills.find(b => b.id === parseInt(id));
    if (!bill) {
      throw new Error('Bill not found');
    }

    const paidAmount = paymentAmount || bill.amount;
    const paymentRecord = {
      paidDate: format(new Date(), 'yyyy-MM-dd'),
      amount: paidAmount
    };

    bill.paymentStatus = 'paid';
    bill.paymentHistory.push(paymentRecord);

    return { ...bill };
  },

  // Mark bill as unpaid
  async markAsUnpaid(id) {
    await delay();
    
    const bill = bills.find(b => b.id === parseInt(id));
    if (!bill) {
      throw new Error('Bill not found');
    }

    bill.paymentStatus = 'unpaid';
    return { ...bill };
  },

  // Update reminder settings
  async updateReminders(id, reminderSettings) {
    await delay();
    
    const bill = bills.find(b => b.id === parseInt(id));
    if (!bill) {
      throw new Error('Bill not found');
    }

    bill.reminderSettings = {
      ...bill.reminderSettings,
      ...reminderSettings
    };

    return { ...bill };
  },

  // Get bills by category
  async getByCategory(category) {
    await delay();
    return bills.filter(bill => 
      bill.category.toLowerCase() === category.toLowerCase()
    );
  },

  // Get payment statistics
  async getPaymentStats() {
    await delay();
    
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
  }
};

export default billService;