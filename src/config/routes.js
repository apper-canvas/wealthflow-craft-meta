import Dashboard from '@/components/pages/Dashboard';
import Transactions from '@/components/pages/Transactions';
import Budget from '@/components/pages/Budget';
import Goals from '@/components/pages/Goals';
import Reports from '@/components/pages/Reports';
import Bills from '@/components/pages/Bills';

export const routes = {
  dashboard: {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/',
    icon: 'LayoutDashboard',
    component: Dashboard
  },
  transactions: {
    id: 'transactions',
    label: 'Transactions',
    path: '/transactions',
    icon: 'Receipt',
    component: Transactions
  },
  budget: {
    id: 'budget',
    label: 'Budget',
    path: '/budget',
    icon: 'PieChart',
    component: Budget
  },
  goals: {
    id: 'goals',
    label: 'Goals',
    path: '/goals',
    icon: 'Target',
    component: Goals
  },
  bills: {
    id: 'bills',
    label: 'Bills',
    path: '/bills',
    icon: 'Calendar',
    component: Bills
  },
  reports: {
    id: 'reports',
    label: 'Reports',
    path: '/reports',
    icon: 'BarChart3',
    component: Reports
  }
};

export const routeArray = Object.values(routes);
export default routes;