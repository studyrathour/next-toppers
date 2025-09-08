import React, { useState } from 'react';
import { Batch } from '../types';
import BatchList from './BatchList';
import BatchEditor from './BatchEditor';

const BatchManagement: React.FC = () => {
  const [view, setView] = useState<'list' | 'editor'>('list');
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  // State to hold a unique key for new batch creation to ensure component remounts
  const [newBatchKey, setNewBatchKey] = useState<string>('initial-new-key');

  const handleEdit = (batch: Batch) => {
    setSelectedBatch(batch);
    setView('editor');
  };

  const handleNew = () => {
    setSelectedBatch(null);
    // Generate a new, unique key each time we want to create a new batch
    setNewBatchKey(Math.random().toString(36).substr(2, 9));
    setView('editor');
  };

  const handleCloseEditor = () => {
    setView('list');
    setSelectedBatch(null);
  };

  if (view === 'editor') {
    // Use the batch ID as the key for existing batches, or the unique newBatchKey for new ones.
    // This forces React to create a new component instance with fresh state every time.
    const editorKey = selectedBatch ? selectedBatch.id : newBatchKey;
    return <BatchEditor key={editorKey} batchToEdit={selectedBatch} onClose={handleCloseEditor} />;
  }

  return <BatchList onEdit={handleEdit} onNew={handleNew} />;
};

export default BatchManagement;
