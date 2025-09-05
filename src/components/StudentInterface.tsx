import React, { useState, useEffect } from 'react';
import { Book, AlertTriangle } from 'lucide-react';
import { Batch } from '../types';
import { firebaseService } from '../services/firebase';
import ContentExplorer from './ContentExplorer';
import StandardGrid from './batch-layouts/StandardGrid';
import HorizontalList from './batch-layouts/HorizontalList';
import OverlayGrid from './batch-layouts/OverlayGrid';
import AlternatingList from './batch-layouts/AlternatingList';

const StudentInterface: React.FC = () => {
  const [allBatches, setAllBatches] = useState<Batch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const handleError = (message: string) => {
      if (isMounted) {
        setError(message);
        setIsLoading(false);
      }
    };

    const unsubscribeBatches = firebaseService.onBatchesChange(
      (updatedBatches) => {
        if (isMounted) {
          setAllBatches(updatedBatches);
          setIsLoading(false);
        }
      },
      () => handleError("Failed to load courses. Please check your Firebase setup.")
    );

    return () => {
      isMounted = false;
      unsubscribeBatches();
    };
  }, []);

  const renderMainContent = () => {
    if (error) {
      return (
        <div className="bg-danger/10 border border-danger/30 text-text-primary px-6 py-4 rounded-lg" role="alert">
          <div className="flex items-center">
            <AlertTriangle className="w-8 h-8 mr-4 text-danger" />
            <div>
              <h3 className="font-bold text-xl mb-2">Connection Error</h3>
              <p className="text-text-secondary">{error}</p>
              <p className="text-sm text-text-tertiary mt-2">This is often due to an incomplete Firebase setup (e.g., Firestore database not created) or incorrect security rules.</p>
            </div>
          </div>
        </div>
      );
    }

    if (selectedBatch) {
      return <ContentExplorer batch={selectedBatch} onBackToCourses={() => setSelectedBatch(null)} />;
    }

    const groupedBatches = allBatches.reduce((acc, batch) => {
      const layout = batch.layout || 'standard-grid';
      if (!acc[layout]) {
        acc[layout] = [];
      }
      acc[layout].push(batch);
      return acc;
    }, {} as Record<string, Batch[]>);

    const layoutOrder = ['standard-grid', 'horizontal-list', 'overlay-grid', 'alternating-list'];
    
    return (
      <div>
        {allBatches.length === 0 && !isLoading ? (
          <div className="text-center py-12 bg-surface rounded-lg shadow-lg border border-secondary">
            <Book className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-text-secondary">No Courses Available</h3>
            <p className="text-text-tertiary mt-2">Content is being prepared. Please check back later.</p>
          </div>
        ) : (
          <div className="space-y-16">
            {layoutOrder.map(layoutKey => {
              const batchesForLayout = groupedBatches[layoutKey];
              if (!batchesForLayout || batchesForLayout.length === 0) {
                return null;
              }

              switch (layoutKey) {
                case 'standard-grid':
                  return <StandardGrid key={layoutKey} batches={batchesForLayout} onSelectBatch={setSelectedBatch} />;
                case 'horizontal-list':
                  return <HorizontalList key={layoutKey} batches={batchesForLayout} onSelectBatch={setSelectedBatch} />;
                case 'overlay-grid':
                  return <OverlayGrid key={layoutKey} batches={batchesForLayout} onSelectBatch={setSelectedBatch} />;
                case 'alternating-list':
                  return <AlternatingList key={layoutKey} batches={batchesForLayout} onSelectBatch={setSelectedBatch} />;
                default:
                  return <StandardGrid key={layoutKey} batches={batchesForLayout} onSelectBatch={setSelectedBatch} />;
              }
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <main className={`${
        selectedBatch 
          ? 'h-screen flex flex-col' 
          : 'max-w-screen-2xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8'
      }`}>
        {renderMainContent()}
      </main>
    </div>
  );
};

export default StudentInterface;
