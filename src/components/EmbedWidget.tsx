import React, { useEffect, useState } from 'react';
import { Book, Users, AlertTriangle } from 'lucide-react';
import { Batch } from '../types';
import { firebaseService } from '../services/firebase';

interface EmbedWidgetProps {
  type: 'batches';
}

const EmbedWidget: React.FC<EmbedWidgetProps> = ({ type }) => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const handleError = (message: string) => {
      if (isMounted) {
        setError(message);
      }
    };

    const unsubscribeBatches = firebaseService.onBatchesChange(
      (updatedBatches) => {
        if (isMounted) {
          setBatches(updatedBatches);
        }
      },
      () => handleError("Could not load data.")
    );

    return () => {
      isMounted = false;
      unsubscribeBatches();
    };
  }, []);

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 flex items-center gap-3">
        <AlertTriangle className="w-5 h-5" />
        <p>{error}</p>
      </div>
    );
  }

  if (type === 'batches') {
    return (
      <div className="p-4 bg-white">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Book className="w-5 h-5 text-blue-600" />
          Available Courses
        </h2>
        
        {batches.length === 0 ? (
          <p className="text-gray-500">No courses available</p>
        ) : (
          <div className="grid gap-4">
            {batches.map((batch) => (
              <div key={batch.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex gap-4">
                  <img
                    src={batch.thumbnail}
                    alt={batch.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-1">{batch.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{batch.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Book className="w-3 h-3" />
                        {batch.subjects?.length || 0} subjects
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {batch.enrolledStudents} enrolled
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default EmbedWidget;
