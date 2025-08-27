import React, { useState } from 'react';
import { 
  Home, 
  Upload, 
  Book, 
  Settings, 
  LogOut,
  BarChart3,
  Clock,
  CheckCircle,
  Image
} from 'lucide-react';
import BatchUpload from './BatchUpload';
import BatchManagement from './BatchManagement';
import ThumbnailManager from './ThumbnailManager';
import { adminLogout } from '../utils/auth';
import toast from 'react-hot-toast';

interface AdminDashboardProps {
  onLogout: () => void;
}

type TabType = 'overview' | 'upload' | 'batches' | 'thumbnails' | 'settings';

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const handleLogout = () => {
    adminLogout();
    toast.success('Logged out successfully');
    onLogout();
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Home },
    { id: 'upload', name: 'Upload Batches', icon: Upload },
    { id: 'batches', name: 'Manage Batches', icon: Book },
    { id: 'thumbnails', name: 'Thumbnails', icon: Image },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="bg-surface rounded-lg shadow-md p-6 border border-secondary">
              <h2 className="text-2xl font-bold text-text-primary mb-6">Dashboard Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-primary/10 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-primary font-medium">Total Batches</p>
                      <p className="text-2xl font-bold text-text-primary">0</p>
                    </div>
                    <Book className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <div className="bg-green-500/10 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-400 font-medium">Total Students</p>
                      <p className="text-2xl font-bold text-text-primary">0</p>
                    </div>
                    <Book className="w-8 h-8 text-green-400" />
                  </div>
                </div>
                <div className="bg-orange-500/10 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-orange-400 font-medium">Completion Rate</p>
                      <p className="text-2xl font-bold text-text-primary">0%</p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-orange-400" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-surface rounded-lg shadow-md p-6 border border-secondary">
                <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm text-text-primary">Welcome to your admin dashboard!</p>
                      <p className="text-xs text-text-tertiary">Start by uploading your first batch</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-surface rounded-lg shadow-md p-6 border border-secondary">
                <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setActiveTab('upload')}
                    className="w-full text-left p-3 bg-secondary rounded-lg hover:bg-primary/20 transition-colors"
                  >
                    <p className="text-sm font-medium text-text-primary">Upload New Batch</p>
                    <p className="text-xs text-primary">Add courses from folder structure</p>
                  </button>
                  <button
                    onClick={() => setActiveTab('batches')}
                    className="w-full text-left p-3 bg-secondary rounded-lg hover:bg-primary/20 transition-colors"
                  >
                    <p className="text-sm font-medium text-text-primary">Create or Edit a Batch</p>
                    <p className="text-xs text-primary">Manually manage course content</p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      case 'upload':
        return <BatchUpload />;
      case 'batches':
        return <BatchManagement />;
      case 'thumbnails':
        return <ThumbnailManager />;
      case 'settings':
        return (
          <div className="bg-surface rounded-lg shadow-md p-6 border border-secondary">
            <h2 className="text-xl font-semibold text-text-primary mb-6 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Platform Settings
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-text-secondary mb-3">Video Player Configuration</h3>
                <div className="bg-background rounded-lg p-4 mt-3">
                  <p className="text-sm text-text-secondary mb-2">Recorded Content Prefix:</p>
                  <code className="text-sm bg-surface p-2 rounded border border-secondary">
                    https://edumastervideoplarerwatch.netlify.app/rec/
                  </code>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-text-secondary mb-3">Firebase Configuration</h3>
                <div className="bg-background rounded-lg p-4">
                  <p className="text-sm text-text-secondary">✅ Connected to Firebase</p>
                  <p className="text-xs text-text-tertiary mt-1">Project: nexttoppers-ab24d</p>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <div className="fixed inset-y-0 left-0 w-64 bg-surface shadow-lg border-r border-secondary">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-16 bg-primary">
            <h1 className="text-white text-lg font-semibold">EduMaster Admin</h1>
          </div>
          
          <nav className="flex-1 px-4 py-6 space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary/20 text-primary'
                    : 'text-text-secondary hover:bg-secondary'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.name}
              </button>
            ))}
          </nav>
          
          <div className="p-4 border-t border-secondary">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-danger hover:bg-danger/10 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="ml-64">
        <div className="p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
