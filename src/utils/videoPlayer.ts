export const getVideoPlayerURL = (videoUrl: string, isLive: boolean = false): string => {
  const prefix = isLive 
    ? 'https://edumastervideoplarerwatch.netlify.app/live/'
    : 'https://edumastervideoplarerwatch.netlify.app/rec/';
  
  return `${prefix}${encodeURIComponent(videoUrl)}`;
};

export const isM3U8Url = (url: string): boolean => {
  return url.includes('.m3u8') || url.includes('m3u8');
};
