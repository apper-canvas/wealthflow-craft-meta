import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ReactApexChart from 'react-apexcharts';
import Card from '@/components/atoms/Card';
import SkeletonLoader from '@/components/molecules/SkeletonLoader';
import ErrorState from '@/components/molecules/ErrorState';
import { transactionService } from '@/services';
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';

const SpendingTrendChart = ({ className = '' }) => {
  const [chartData, setChartData] = useState({ categories: [], series: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const transactions = await transactionService.getAll();
      
      // Get last 6 months
      const endDate = new Date();
      const startDate = subMonths(endDate, 5);
      const months = eachMonthOfInterval({ start: startDate, end: endDate });
      
      const monthlyData = months.map(month => {
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);
        
        const monthTransactions = transactions.filter(t => {
          const transactionDate = new Date(t.date);
          return transactionDate >= monthStart && transactionDate <= monthEnd;
        });
        
        const income = monthTransactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0);
          
        const expenses = monthTransactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);
        
        return {
          month: format(month, 'MMM yyyy'),
          income,
          expenses
        };
      });
      
      const categories = monthlyData.map(d => d.month);
      const incomeSeries = monthlyData.map(d => d.income);
      const expenseSeries = monthlyData.map(d => d.expenses);
      
      setChartData({
        categories,
        series: [
          { name: 'Income', data: incomeSeries },
          { name: 'Expenses', data: expenseSeries }
        ]
      });
    } catch (err) {
      setError(err.message || 'Failed to load trend data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const chartOptions = {
    chart: {
      type: 'bar',
      toolbar: { show: false },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800
      }
    },
    colors: ['#10B981', '#EF4444'],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '60%',
        borderRadius: 4
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      show: true,
      width: 1,
      colors: ['transparent']
    },
    xaxis: {
      categories: chartData.categories,
      labels: {
        style: {
          fontSize: '12px',
          fontWeight: 500
        }
      }
    },
    yaxis: {
      labels: {
        formatter: function(val) {
          return '$' + val.toLocaleString();
        },
        style: {
          fontSize: '12px'
        }
      }
    },
    fill: {
      opacity: 1
    },
    tooltip: {
      y: {
        formatter: function(val) {
          return '$' + val.toLocaleString();
        }
      }
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      fontSize: '14px',
      markers: {
        width: 12,
        height: 12,
        radius: 3
      }
    },
    grid: {
      borderColor: '#f1f5f9',
      strokeDashArray: 3
    },
    responsive: [{
      breakpoint: 480,
      options: {
        legend: {
          position: 'bottom'
        }
      }
    }]
  };

  if (loading) {
    return (
      <Card className={className}>
        <div className="p-6">
          <h3 className="text-lg font-heading font-semibold text-gray-900 mb-4">
            Monthly Trends
          </h3>
          <SkeletonLoader count={1} className="h-64" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <div className="p-6">
          <h3 className="text-lg font-heading font-semibold text-gray-900 mb-4">
            Monthly Trends
          </h3>
          <ErrorState message={error} onRetry={loadData} />
        </div>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <div className="p-6">
        <h3 className="text-lg font-heading font-semibold text-gray-900 mb-4">
          Monthly Trends
        </h3>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <ReactApexChart
            options={chartOptions}
            series={chartData.series}
            type="bar"
            height={320}
          />
        </motion.div>
      </div>
    </Card>
  );
};

export default SpendingTrendChart;