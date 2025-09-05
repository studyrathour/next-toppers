import React, { useState, useMemo } from 'react';
import { Video, FileText, ClipboardCheck, HelpCircle } from 'lucide-react';
import { Subject, Content } from '../types';
import { getVideoPlayerURL } from '../utils/videoPlayer';
import ContentThumbnail from './ContentThumbnail';

type ContentType = 'video' | 'notes' | 'assignment' | 'quiz';

const iconMap: { [key in ContentType]: React.ElementType } = {
  video: Video,
  notes: FileText,
  assignment: ClipboardCheck,
  quiz: HelpCircle,
};

const SubjectView: React.FC<{ subject: Subject }> = ({ subject }) => {
  const [activeTab, setActiveTab] = useState<ContentType>('video');

  const contentByType = useMemo(() => {
    const grouped: Record<ContentType, Content[]> = {
      video: [],
      notes: [],
      assignment: [],
      quiz: [],
    };

    subject.sections?.forEach(section => {
      if (grouped[section.type]) {
        grouped[section.type].push(...section.contents);
      }
    });

    return grouped;
  }, [subject]);

  const availableTabs = Object.keys(contentByType).filter(
    type => contentByType[type as ContentType].length > 0
  ) as ContentType[];
  
  useState(() => {
    if (availableTabs.length > 0 && !availableTabs.includes(activeTab)) {
      setActiveTab(availableTabs[0]);
    }
  });

  const activeContent = contentByType[activeTab];

  const handleTabChange = (tab: ContentType) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
  };

  const getHrefForContent = (content: Content): string => {
    // If the content is not explicitly a document type, treat it as a video.
    // This ensures that any content marked as 'video', or with a missing/undefined type, gets the video player prefix.
    if (content.type !== 'notes' && content.type !== 'assignment' && content.type !== 'quiz') {
      return getVideoPlayerURL(content.url, false);
    }
    // For other types, return the raw URL.
    return content.url || '#';
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 border-b border-secondary mb-6">
        <nav className="flex space-x-1 overflow-x-auto">
          {availableTabs.map(tab => {
            const Icon = iconMap[tab];
            const count = contentByType[tab].length;
            return (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all border-b-2 whitespace-nowrap
                  ${activeTab === tab
                    ? 'border-primary text-primary bg-primary/5'
                    : 'border-transparent text-text-secondary hover:text-text-primary hover:bg-secondary/50'
                  }`}
              >
                <Icon className="w-4 h-4" />
                <span className="capitalize">{tab}s</span>
                <span className="bg-secondary text-text-tertiary px-2 py-1 rounded-full text-xs">
                  {count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="flex-grow overflow-y-auto">
        {activeContent.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {activeContent.map(content => (
              <a 
                key={content.id}
                href={getHrefForContent(content)} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block group"
              >
                <ContentThumbnail 
                  title={content.title} 
                  teacherImageUrl={content.thumbnail}
                  showTitle={true}
                  contentType={content.type}
                  showButton={true}
                  isSubject={false}
                />
              </a>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-text-tertiary">
            <div className="w-20 h-20 bg-secondary/50 rounded-full flex items-center justify-center mb-6">
              <Video className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-semibold text-text-secondary mb-2">No Content Yet</h3>
            <p className="text-text-tertiary max-w-md">
              This section is currently empty. New content will appear here once it's added by the instructor.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectView;
