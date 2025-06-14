import { motion } from 'framer-motion';

const SkeletonLoader = ({ count = 3, type = 'card', className = '' }) => {
  const shimmer = {
    animate: {
      backgroundPosition: ['200% 0', '-200% 0'],
    },
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'linear'
    }
  };

  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <motion.div
                className="w-12 h-12 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg"
                style={{ backgroundSize: '400% 100%' }}
                {...shimmer}
              />
              <motion.div
                className="w-16 h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded"
                style={{ backgroundSize: '400% 100%' }}
                {...shimmer}
              />
            </div>
            <motion.div
              className="h-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-3/4 mb-2"
              style={{ backgroundSize: '400% 100%' }}
              {...shimmer}
            />
            <motion.div
              className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-1/2"
              style={{ backgroundSize: '400% 100%' }}
              {...shimmer}
            />
          </div>
        );
      
      case 'list':
        return (
          <div className="bg-white rounded-lg border border-gray-100 p-4">
            <div className="flex items-center space-x-4">
              <motion.div
                className="w-10 h-10 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-full"
                style={{ backgroundSize: '400% 100%' }}
                {...shimmer}
              />
              <div className="flex-1 space-y-2">
                <motion.div
                  className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-3/4"
                  style={{ backgroundSize: '400% 100%' }}
                  {...shimmer}
                />
                <motion.div
                  className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-1/2"
                  style={{ backgroundSize: '400% 100%' }}
                  {...shimmer}
                />
              </div>
              <motion.div
                className="w-20 h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded"
                style={{ backgroundSize: '400% 100%' }}
                {...shimmer}
              />
            </div>
          </div>
        );
        
      default:
        return (
          <motion.div
            className="h-20 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg"
            style={{ backgroundSize: '400% 100%' }}
            {...shimmer}
          />
        );
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          {renderSkeleton()}
        </motion.div>
      ))}
    </div>
  );
};

export default SkeletonLoader;