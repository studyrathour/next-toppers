import React, { useState, useEffect } from 'react';
import { Book, Users, Edit, Trash2, AlertTriangle, FileJson, Plus } from 'lucide-react';
import { Batch } from '../types';
import { firebaseService } from '../services/firebase';
import SkeletonLoader from './SkeletonLoader';
import toast from 'react-hot-toast';

interface BatchListProps {
  onEdit: (batch: Batch) => void;
  onNew: () => void;
}

const BatchList: React.FC<BatchListProps> = ({ onEdit, onNew }) => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = firebaseService.onBatchesChange(
      (updatedBatches) => {
        setBatches(updatedBatches);
        setIsLoading(false);
        setError(null);
      },
      () => {
        setError('Could not load batches. Please check your connection and Firebase setup.');
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleDelete = async (batchId: string, batchName: string) => {
    if (window.confirm(`Are you sure you want to delete "${batchName}"? This action cannot be undone.`)) {
      try {
        await firebaseService.deleteBatch(batchId);
        toast.success('Batch deleted successfully');
      } catch (error) {
        toast.error('Failed to delete batch');
      }
    }
  };
  
  const handleExportJson = (batch: Batch) => {
    const exportData = {
      name: batch.name,
      description: batch.description,
      thumbnail: batch.thumbnail,
      subjects: batch.subjects.map(subject => ({
        name: subject.name,
        thumbnail: subject.thumbnail,
        sections: subject.sections.map(section => ({
          name: section.name,
          type: section.type,
          contents: section.contents.map(content => ({
            title: content.title,
            url: content.url,
            thumbnail: content.thumbnail || '',
          })),
        })),
      })),
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${batch.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success(`Exported ${batch.name}.json`);
  };

  if (isLoading) {
    return (
      <div className="bg-surface rounded-xl shadow-lg p-8 border border-secondary">
        <div className="flex items-center justify-between mb-8">
          <div className="h-8 bg-secondary rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-secondary rounded w-40 animate-pulse"></div>
        </div>
        <SkeletonLoader type="card" count={6} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-danger/10 border border-danger/30 text-danger px-6 py-4 rounded-lg" role="alert">
        <div className="flex items-center">
          <AlertTriangle className="w-6 h-6 mr-3" />
          <div>
            <h3 className="font-bold text-lg">Connection Error</h3>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-xl shadow-lg p-8 border border-secondary">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-text-primary flex items-center gap-3">
          <Book className="w-7 h-7 text-primary" />
          All Batches
        </h2>
        <button
          onClick={onNew}
          className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/80 text-sm flex items-center gap-2 font-medium transition-all hover:shadow-lg hover:shadow-primary/25"
        >
          <Plus className="w-5 h-5" />
          Create New Batch
        </button>
      </div>

      {batches.length === 0 ? (
        <div className="text-center py-16 text-text-secondary">
          <Book className="w-20 h-20 mx-auto mb-6 opacity-50" />
          <h3 className="text-xl font-semibold mb-2">No Batches Available</h3>
          <p className="text-text-tertiary">Create or upload your first batch to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {batches.map((batch) => (
            <div key={batch.id} className="bg-background border border-secondary rounded-xl overflow-hidden hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 group">
              <div className="relative">
                <img
                  src={batch.thumbnail}
                  alt={batch.name}
                  className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="font-bold text-white text-lg mb-1">{batch.name}</h3>
                  <div className="flex items-center gap-4 text-white/80 text-sm">
                    <div className="flex items-center gap-1">
                      <Book className="w-4 h-4" />
                      {batch.subjects?.length || 0} subjects
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {batch.enrolledStudents} students
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <p className="text-sm text-text-secondary mb-6 line-clamp-2">{batch.description}</p>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleExportJson(batch)}
                    className="bg-indigo-500 text-white py-2 px-3 rounded-lg hover:bg-indigo-600 text-sm flex items-center justify-center gap-1 transition-all"
                    title="Export as JSON"
                  >
                    <FileJson className="w-4 h-4" />
                    JSON
                  </button>
                  <button
                    onClick={() => onEdit(batch)}
                    className="bg-yellow-500 text-white py-2 px-3 rounded-lg hover:bg-yellow-600 text-sm flex items-center justify-center gap-1 transition-all"
                    title="Edit batch"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(batch.id, batch.name)}
                    className="bg-danger text-white py-2 px-3 rounded-lg hover:bg-danger/80 text-sm flex items-center justify-center gap-1 transition-all"
                    title="Delete batch"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BatchList;