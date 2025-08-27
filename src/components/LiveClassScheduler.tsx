import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Video, Plus, Edit, Trash2, Play, Users } from 'lucide-react';
import { LiveClass, Batch } from '../types';
import { firebaseService } from '../services/firebase';
import { getVideoPlayerURL } from '../utils/videoPlayer';
import toast from 'react-hot-toast';

const LiveClassScheduler: React.FC = () => {
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingClass, setEditingClass] = useState<LiveClass | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduledTime: '',
    videoUrl: '',
    thumbnail: '',
    batchId: '',
    subjectId: ''
  });

  useEffect(() => {
    const unsubscribeBatches = firebaseService.onBatchesChange(setBatches);
    const unsubscribeLive = firebaseService.onLiveClassesChange(setLiveClasses);
    setIsLoading(false);

    return () => {
      unsubscribeBatches();
      unsubscribeLive();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const classData = {
        ...formData,
        scheduledTime: new Date(formData.scheduledTime),
        thumbnail: formData.thumbnail || 'https://images.pexels.com/photos/4050291/pexels-photo-4050291.jpeg?auto=compress&cs=tinysrgb&w=800',
        isLive: false
      };

      if (editingClass) {
        await firebaseService.updateLiveClass(editingClass.id, classData);
        toast.success('Live class updated successfully!');
      } else {
        await firebaseService.addLiveClass(classData);
        toast.success('Live class scheduled successfully!');
      }

      setShowForm(false);
      setEditingClass(null);
      setFormData({
        title: '',
        description: '',
        scheduledTime: '',
        videoUrl: '',
        thumbnail: '',
        batchId: '',
        subjectId: ''
      });
    } catch (error) {
      toast.error('Failed to save live class');
    }
  };

  const handleEdit = (liveClass: LiveClass) => {
    setEditingClass(liveClass);
    setFormData({
      title: liveClass.title,
      description: liveClass.description,
      scheduledTime: new Date(liveClass.scheduledTime).toISOString().slice(0, 16),
      videoUrl: liveClass.videoUrl || '',
      thumbnail: liveClass.thumbnail,
      batchId: liveClass.batchId,
      subjectId: liveClass.subjectId
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Delete "${title}"?`)) {
      try {
        await firebaseService.deleteLiveClass(id);
        toast.success('Live class deleted successfully!');
      } catch (error) {
        toast.error('Failed to delete live class');
      }
    }
  };

  const goLive = async (id: string) => {
    try {
      await firebaseService.updateLiveClass(id, { isLive: true });
      toast.success('Live class is now active!');
    } catch (error) {
      toast.error('Failed to go live');
    }
  };

  const stopLive = async (id: string) => {
    try {
      await firebaseService.updateLiveClass(id, { isLive: false });
      toast.success('Live class stopped');
    } catch (error) {
      toast.error('Failed to stop live class');
    }
  };

  const getTimeUntilClass = (scheduledTime: Date) => {
    const now = new Date();
    const diff = scheduledTime.getTime() - now.getTime();
    
    if (diff <= 0) return 'Time passed';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const upcomingClasses = liveClasses.filter(lc => !lc.isLive && new Date(lc.scheduledTime) > new Date());
  const liveNow = liveClasses.filter(lc => lc.isLive);

  if (isLoading) {
    return <div className="bg-white rounded-lg shadow-md p-6">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Video className="w-5 h-5" />
            Live Classes
          </h2>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingClass(null);
              setFormData({
                title: '',
                description: '',
                scheduledTime: '',
                videoUrl: '',
                thumbnail: '',
                batchId: '',
                subjectId: ''
              });
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Schedule Class
          </button>
        </div>

        {/* Schedule Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Class Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Scheduled Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.scheduledTime}
                  onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Batch
                </label>
                <select
                  value={formData.batchId}
                  onChange={(e) => setFormData({ ...formData, batchId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Batch</option>
                  {batches.map(batch => (
                    <option key={batch.id} value={batch.id}>{batch.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Video URL (Optional)
                </label>
                <input
                  type="url"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Add later or leave empty"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  required
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                {editingClass ? 'Update' : 'Schedule'} Class
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Live Now */}
      {liveNow.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-green-600 mb-4 flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            Live Now
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {liveNow.map((liveClass) => (
              <div key={liveClass.id} className="border border-green-200 rounded-lg p-4 bg-green-50">
                <img
                  src={liveClass.thumbnail}
                  alt={liveClass.title}
                  className="w-full h-32 object-cover rounded-lg mb-3"
                />
                <h4 className="font-medium text-gray-800 mb-2">{liveClass.title}</h4>
                <p className="text-sm text-gray-600 mb-3">{liveClass.description}</p>
                
                <div className="flex gap-2">
                  {liveClass.videoUrl && (
                    <a
                      href={getVideoPlayerURL(liveClass.videoUrl, true)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-green-600 text-white py-2 px-3 rounded text-sm text-center hover:bg-green-700 flex items-center justify-center gap-1"
                    >
                      <Play className="w-4 h-4" />
                      Watch Live
                    </a>
                  )}
                  <button
                    onClick={() => handleEdit(liveClass)}
                    className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => stopLive(liveClass.id)}
                    className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
                  >
                    Stop
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Classes */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Upcoming Classes
        </h3>
        {upcomingClasses.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No upcoming classes scheduled</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingClasses.map((liveClass) => (
              <div key={liveClass.id} className="border rounded-lg p-4">
                <img
                  src={liveClass.thumbnail}
                  alt={liveClass.title}
                  className="w-full h-32 object-cover rounded-lg mb-3"
                />
                <h4 className="font-medium text-gray-800 mb-2">{liveClass.title}</h4>
                <p className="text-sm text-gray-600 mb-3">{liveClass.description}</p>
                
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                  <Clock className="w-4 h-4" />
                  <span>Starts in: {getTimeUntilClass(liveClass.scheduledTime)}</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => goLive(liveClass.id)}
                    className="flex-1 bg-green-600 text-white py-2 px-3 rounded text-sm hover:bg-green-700"
                  >
                    Go Live
                  </button>
                  <button
                    onClick={() => handleEdit(liveClass)}
                    className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(liveClass.id, liveClass.title)}
                    className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveClassScheduler;
