import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ReactApexChart from 'react-apexcharts';
import Card from '@/components/atoms/Card';
import SkeletonLoader from '@/components/molecules/SkeletonLoader';
import ErrorState from '@/components/molecules/ErrorState';
import { transactionService, categoryService } from '@/services';

const ExpenseChart = ({ className = '' }) => {
  const [chartData, setChartData] = useState({ series: [], labels: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [transactions, categoriesData] = await Promise.all([
        transactionService.getAll(),
        categoryService.getAll()
      ]);
      
      setCategories(categoriesData);
      
      // Filter expenses and group by category
      const expenses = transactions.filter(t => t.type === 'expense');
      const categoryTotals = {};
      
      expenses.forEach(transaction => {
        if (categoryTotals[transaction.category]) {
          categoryTotals[transaction.category] += transaction.amount;
        } else {
          categoryTotals[transaction.category] = transaction.amount;
        }
      });
      
      const labels = Object.keys(categoryTotals);
      const series = Object.values(categoryTotals);
      
      setChartData({ series, labels });
    } catch (err) {
      setError(err.message || 'Failed to load chart data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getCategoryColor = (categoryName) => {
    const category = categories.find(c => c.name === categoryName);
    return category?.color || '#64748b';
  };

  const chartOptions = {
    chart: {
      type: 'pie',
      toolbar: { show: false },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800
      }
    },
    colors: chartData.labels.map(label => getCategoryColor(label)),
    labels: chartData.labels,
    dataLabels: {
      enabled: true,
      formatter: function(val, opts) {
        const value = opts.w.config.series[opts.seriesIndex];
        return `$${value.toLocaleString()}`;
      },
      style: {
        fontSize: '12px',
        fontWeight: 600
      }
    },
    legend: {
      position: 'bottom',
      horizontalAlign: 'center',
      fontSize: '14px',
      markers: {
        width: 12,
        height: 12,
        radius: 3
      },
      itemMargin: {
        horizontal: 8,
        vertical: 4
      }
    },
    plotOptions: {
      pie: {
        expandOnClick: true,
        donut: {
          size: '0%'
        }
      }
    },
    tooltip: {
      y: {
        formatter: function(val) {
          return '$' + val.toLocaleString();
        }
      }
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
            Expense Breakdown
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
            Expense Breakdown
          </h3>
          <ErrorState message={error} onRetry={loadData} />
        </div>
      </Card>
    );
  }

  if (chartData.series.length === 0) {
    return (
      <Card className={className}>
        <div className="p-6">
          <h3 className="text-lg font-heading font-semibold text-gray-900 mb-4">
            Expense Breakdown
          </h3>
          <div className="text-center py-8">
            <p className="text-gray-500">No expense data available</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <div className="p-6">
        <h3 className="text-lg font-heading font-semibold text-gray-900 mb-4">
          Expense Breakdown
        </h3>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <ReactApexChart
            options={chartOptions}
            series={chartData.series}
            type="pie"
            height={320}
          />
        </motion.div>
      </div>
    </Card>
  );
};

export default ExpenseChart;