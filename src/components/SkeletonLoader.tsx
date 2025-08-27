import React from 'react';

interface SkeletonLoaderProps {
  type?: 'card' | 'list' | 'content' | 'subject';
  count?: number;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ type = 'card', count = 6 }) => {
  const renderCardSkeleton = () => (
    <div className="bg-surface rounded-lg border border-secondary overflow-hidden animate-pulse">
      <div className="w-full h-48 bg-secondary"></div>
      <div className="p-4 space-y-3">
        <div className="h-4 bg-secondary rounded w-3/4"></div>
        <div className="h-3 bg-secondary rounded w-full"></div>
        <div className="h-3 bg-secondary rounded w-2/3"></div>
      </div>
    </div>
  );

  const renderListSkeleton = () => (
    <div className="bg-surface rounded-lg border border-secondary overflow-hidden animate-pulse flex">
      <div className="w-1/3 h-48 bg-secondary"></div>
      <div className="flex-1 p-6 space-y-4">
        <div className="h-6 bg-secondary rounded w-3/4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-secondary rounded w-full"></div>
          <div className="h-4 bg-secondary rounded w-5/6"></div>
          <div className="h-4 bg-secondary rounded w-4/6"></div>
        </div>
        <div className="h-4 bg-secondary rounded w-1/4"></div>
      </div>
    </div>
  );

  const renderContentSkeleton = () => (
    <div className="bg-surface rounded-lg border border-secondary overflow-hidden animate-pulse">
      <div className="relative">
        <div className="w-full aspect-video bg-secondary"></div>
        <div className="absolute bottom-4 left-4 right-4">
          <div className="h-4 bg-black/50 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-black/30 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  );

  const renderSubjectSkeleton = () => (
    <div className="bg-surface rounded-lg border border-secondary overflow-hidden animate-pulse">
      <div className="w-full h-32 bg-secondary"></div>
      <div className="p-3 space-y-2">
        <div className="h-4 bg-secondary rounded w-3/4"></div>
        <div className="h-3 bg-secondary rounded w-1/2"></div>
      </div>
    </div>
  );

  const getSkeleton = () => {
    switch (type) {
      case 'list':
        return renderListSkeleton();
      case 'content':
        return renderContentSkeleton();
      case 'subject':
        return renderSubjectSkeleton();
      default:
        return renderCardSkeleton();
    }
  };

  const getGridClass = () => {
    switch (type) {
      case 'list':
        return 'space-y-6';
      case 'content':
        return 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6';
      case 'subject':
        return 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6';
      default:
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6';
    }
  };

  return (
    <div className={getGridClass()}>
      {Array.from({ length: count }, (_, index) => (
        <div key={index}>
          {getSkeleton()}
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;