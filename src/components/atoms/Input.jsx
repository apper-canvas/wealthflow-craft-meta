import { useState } from 'react';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';

const Input = ({ 
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  icon,
  disabled = false,
  required = false,
  className = '',
  ...props 
}) => {
  const [focused, setFocused] = useState(false);

  const handleFocus = () => setFocused(true);
  const handleBlur = () => setFocused(false);

  const hasValue = value && value.toString().length > 0;

  return (
    <div className={`relative ${className}`}>
      {label && (
        <motion.label
          animate={{
            scale: focused || hasValue ? 0.85 : 1,
            y: focused || hasValue ? -20 : 0,
            color: focused ? '#2563EB' : error ? '#EF4444' : '#6B7280'
          }}
          transition={{ duration: 0.2 }}
          className="absolute left-3 top-3 font-medium pointer-events-none origin-left z-10"
        >
          {label} {required && <span className="text-error">*</span>}
        </motion.label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <ApperIcon name={icon} className="w-5 h-5" />
          </div>
        )}
        
        <input
          type={type}
          placeholder={focused ? placeholder : ''}
          value={value || ''}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          className={`
            w-full px-3 py-3 rounded-lg border transition-all duration-200
            ${icon ? 'pl-10' : ''}
            ${label ? 'pt-6 pb-2' : ''}
            ${error 
              ? 'border-error focus:border-error focus:ring-error' 
              : focused 
                ? 'border-primary focus:border-primary focus:ring-primary' 
                : 'border-gray-300 hover:border-gray-400'
            }
            ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}
            focus:outline-none focus:ring-2 focus:ring-opacity-20
          `}
          {...props}
        />
      </div>
      
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 text-sm text-error flex items-center"
        >
          <ApperIcon name="AlertCircle" className="w-4 h-4 mr-1" />
          {error}
        </motion.p>
      )}
    </div>
  );
};

export default Input;