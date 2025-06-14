import { motion } from 'framer-motion';

const Card = ({ 
  children, 
  className = '', 
  hover = false, 
  onClick,
  gradient = false,
  ...props 
}) => {
  const baseClasses = "bg-white rounded-xl shadow-sm border border-gray-100";
  const hoverClasses = hover ? "hover:shadow-md cursor-pointer" : "";
  const gradientClasses = gradient ? "bg-gradient-to-br from-primary to-secondary text-white border-0" : "";

  const CardComponent = onClick || hover ? motion.div : 'div';
  
  const motionProps = (onClick || hover) ? {
    whileHover: { scale: 1.02, y: -2 },
    whileTap: onClick ? { scale: 0.98 } : {},
    transition: { duration: 0.2 }
  } : {};

  return (
    <CardComponent
      className={`
        ${baseClasses}
        ${hoverClasses}
        ${gradientClasses}
        ${className}
      `}
      onClick={onClick}
      {...motionProps}
      {...props}
    >
      {children}
    </CardComponent>
  );
};

export default Card;