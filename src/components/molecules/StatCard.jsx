import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Card from '@/components/atoms/Card';

const StatCard = ({ 
  title, 
  value, 
  icon, 
  trend, 
  trendValue, 
  color = 'primary',
  gradient = false,
  className = '',
  ...props 
}) => {
  const colors = {
    primary: 'text-primary',
    success: 'text-success',
    warning: 'text-warning',
    error: 'text-error',
    info: 'text-info'
  };

  const trendColors = {
    up: 'text-success',
    down: 'text-error',
    neutral: 'text-gray-500'
  };

  const formatValue = (val) => {
    if (typeof val === 'number') {
      return val.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      });
    }
    return val;
  };

  return (
    <Card hover gradient={gradient} className={className} {...props}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg ${gradient ? 'bg-white/20' : 'bg-gray-50'}`}>
            <ApperIcon 
              name={icon} 
              className={`w-6 h-6 ${gradient ? 'text-white' : colors[color]}`} 
            />
          </div>
          
          {trend && (
            <div className={`flex items-center space-x-1 ${gradient ? 'text-white/80' : trendColors[trend]}`}>
              <ApperIcon 
                name={trend === 'up' ? 'TrendingUp' : trend === 'down' ? 'TrendingDown' : 'Minus'} 
                className="w-4 h-4" 
              />
              <span className="text-sm font-medium">{trendValue}</span>
            </div>
          )}
        </div>
        
        <div>
          <motion.h3 
            className={`text-2xl font-bold ${gradient ? 'text-white' : 'text-gray-900'} mb-1`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            key={value} // Re-animate when value changes
          >
            {formatValue(value)}
          </motion.h3>
          <p className={`text-sm ${gradient ? 'text-white/80' : 'text-gray-600'}`}>
            {title}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default StatCard;