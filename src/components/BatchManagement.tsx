import React, { useState } from 'react';
import { Batch } from '../types';
import BatchList from './BatchList';
import BatchEditor from './BatchEditor';

const BatchManagement: React.FC = () => {
  const [view, setView] = useState<'list' | 'editor'>('list');
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);

  const handleEdit = (batch: Batch) => {
    setSelectedBatch(batch);
    setView('editor');
  };

  const handleNew = () => {
    setSelectedBatch(null);
    setView('editor');
  };

  const handleCloseEditor = () => {
    setView('list');
    setSelectedBatch(null);
  };

  if (view === 'editor') {
    return <BatchEditor batchToEdit={selectedBatch} onClose={handleCloseEditor} />;
  }

  return <BatchList onEdit={handleEdit} onNew={handleNew} />;
};

export default BatchManagement;
