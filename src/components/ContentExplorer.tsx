import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Batch, Subject } from '../types';
import SubjectView from './SubjectView';
import ContentThumbnail from './ContentThumbnail';

type PathItem =
  | { type: 'root'; title: string; data: Subject[] }
  | { type: 'subject'; title: string; data: Subject };

interface ContentExplorerProps {
  batch: Batch;
  onBackToCourses: () => void;
}

const variants = {
  enter: (direction: number) => ({
    scale: direction > 0 ? 0.95 : 1.05,
    opacity: 0,
  }),
  center: {
    scale: 1,
    opacity: 1,
    transition: { type: 'spring', stiffness: 300, damping: 30 }
  },
  exit: (direction: number) => ({
    scale: direction < 0 ? 0.95 : 1.05,
    opacity: 0,
    transition: { duration: 0.2 }
  }),
};

const ContentExplorer: React.FC<ContentExplorerProps> = ({ batch, onBackToCourses }) => {
  const [path, setPath] = useState<PathItem[]>([
    { type: 'root', title: batch.name, data: batch.subjects || [] },
  ]);
  const [direction, setDirection] = useState(1);

  const currentLevel = path[path.length - 1];

  const drillDown = (newItem: PathItem) => {
    setDirection(1);
    setPath([...path, newItem]);
  };

  const goBack = () => {
    if (path.length === 1) {
      onBackToCourses();
      return;
    }
    setDirection(-1);
    setPath(path.slice(0, -1));
  };

  const renderBreadcrumb = () => {
    return (
      <div className="flex items-center gap-2 text-sm text-text-secondary mb-6">
        <button 
          onClick={onBackToCourses}
          className="hover:text-primary transition-colors"
        >
          All Courses
        </button>
        {path.map((item, index) => (
          <React.Fragment key={index}>
            <span>/</span>
            <button
              onClick={() => {
                if (index < path.length - 1) {
                  setPath(path.slice(0, index + 1));
                }
              }}
              className={`${
                index === path.length - 1 
                  ? 'text-primary font-medium' 
                  : 'hover:text-primary transition-colors'
              }`}
            >
              {item.title}
            </button>
          </React.Fragment>
        ))}
      </div>
    );
  };

  const renderContent = () => {
    switch (currentLevel.type) {
      case 'root':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {currentLevel.data.map((subject) => (
              <div
                key={subject.id}
                className="cursor-pointer group"
                onClick={() => drillDown({ type: 'subject', title: subject.name, data: subject })}
              >
                <ContentThumbnail 
                  title={subject.name} 
                  teacherImageUrl={subject.thumbnail}
                  showTitle={true}
                  isSubject={true}
                />
              </div>
            ))}
          </div>
        );
      case 'subject':
        return <SubjectView subject={currentLevel.data} />;
      default:
        return <div>Unknown level</div>;
    }
  };

  return (
    <div className="flex flex-col h-full p-6">
      <div className="flex-shrink-0">
        <div className="flex items-center gap-4 mb-4">
          <button 
            onClick={goBack} 
            className="flex items-center gap-2 text-primary font-medium hover:brightness-125 transition-all bg-primary/10 px-4 py-2 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <h1 className="text-2xl font-bold text-text-primary">{currentLevel.title}</h1>
        </div>
        {renderBreadcrumb()}
      </div>

      <div className="flex-grow relative overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={path.length}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0 overflow-y-auto"
          >
            <div className="min-h-full">
              {renderContent()}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ContentExplorer;
