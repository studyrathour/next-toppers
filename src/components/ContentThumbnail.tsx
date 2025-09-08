import React, { useEffect, useRef } from 'react';
import { Play, Book, FileText, ClipboardCheck } from 'lucide-react';
import { Content, Subject } from '../types';
import { getVideoPlayerURL } from '../utils/videoPlayer';

interface ContentThumbnailProps {
  content?: Content;
  subject?: Subject;
  isSubject: boolean;
  onSubjectClick?: (subject: Subject) => void;
}

const defaultThumbnail = 'https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/1280x720/19223c/f0f4f8?text=Missing+Thumbnail';

const getIcon = (type?: string) => {
  switch (type) {
    case 'video':
      return <Play className="w-5 h-5" />;
    case 'notes':
      return <FileText className="w-5 h-5" />;
    case 'assignment':
      return <ClipboardCheck className="w-5 h-5" />;
    case 'quiz':
      return <Book className="w-5 h-5" />;
    default:
      return <Play className="w-5 h-5" />;
  }
};

const getButtonText = (type?: string) => {
  switch (type) {
    case 'video':
      return 'Watch';
    case 'notes':
      return 'Read';
    case 'assignment':
      return 'View';
    case 'quiz':
      return 'Take Quiz';
    default:
      return 'View';
  }
};

const ContentThumbnail: React.FC<ContentThumbnailProps> = ({ 
  content,
  subject,
  isSubject,
  onSubjectClick
}) => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subTitleRef = useRef<HTMLHeadingElement>(null);

  const data = isSubject ? subject : content;
  if (!data) return null;

  const title = isSubject ? (data as Subject).name : (data as Content).title;
  const { thumbnail: teacherImageUrl } = data;
  const contentType = content?.type;
  
  const encodedTitle = btoa(encodeURIComponent(title));
  const encodedUrl = content ? btoa(encodeURIComponent(getVideoPlayerURL(content.url, false))) : '';

  useEffect(() => {
    try {
      const decodedTitle = decodeURIComponent(atob(encodedTitle));
      if (titleRef.current) {
        titleRef.current.setAttribute('data-title', decodedTitle);
      }
      if (subTitleRef.current) {
        subTitleRef.current.setAttribute('data-title', decodedTitle);
      }
    } catch (e) {
      console.error("Failed to decode title:", e);
      const fallbackTitle = "Content";
      if (titleRef.current) titleRef.current.setAttribute('data-title', fallbackTitle);
      if (subTitleRef.current) subTitleRef.current.setAttribute('data-title', fallbackTitle);
    }
  }, [encodedTitle]);

  const handleClick = () => {
    if (isSubject && subject && onSubjectClick) {
      onSubjectClick(subject);
    } else if (content) {
      try {
        const decodedUrl = decodeURIComponent(atob(encodedUrl));
        if (decodedUrl && decodedUrl !== '#') {
          window.open(decodedUrl, '_blank', 'noopener,noreferrer');
        }
      } catch(e) {
        console.error("Failed to decode URL:", e);
      }
    }
  };

  const imageUrl = teacherImageUrl || defaultThumbnail;

  return (
    <div 
      className="group cursor-pointer" 
      onClick={handleClick}
      data-title-b64={encodedTitle}
      data-url-b64={encodedUrl}
    >
      <div className="relative w-full aspect-video bg-surface rounded-lg overflow-hidden border border-secondary group-hover:border-primary/50 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary/20">
        <img
          src={imageUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = defaultThumbnail;
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>

        <div className="absolute top-0 left-0 h-full w-[70%] flex items-center justify-center p-4">
          <h4 
            ref={titleRef}
            className="obfuscated-title text-white font-bold text-center text-base md:text-lg lg:text-xl leading-tight" 
            style={{ textShadow: '2px 2px 8px rgba(0, 0, 0, 0.95)' }}
          >
          </h4>
        </div>

        {!isSubject && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-primary/90 text-white rounded-full p-4 transform scale-75 group-hover:scale-100 transition-transform duration-300 backdrop-blur-sm">
              {getIcon(contentType)}
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 space-y-2">
        <h4 ref={subTitleRef} className="obfuscated-title font-semibold text-text-primary text-sm line-clamp-2 group-hover:text-primary transition-colors">
        </h4>
        {!isSubject && (
          <div className="w-full bg-primary/10 text-primary py-2 px-3 rounded-lg text-sm font-medium hover:bg-primary hover:text-white transition-all duration-200 flex items-center justify-center gap-2">
            {getIcon(contentType)}
            <span>{getButtonText(contentType)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentThumbnail;
