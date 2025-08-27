import React from 'react';
import { Batch } from '../../types';

interface Props {
  batches: Batch[];
  onSelectBatch: (batch: Batch) => void;
}

const StandardGrid: React.FC<Props> = ({ batches, onSelectBatch }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {batches.map((batch) => (
        <div 
          key={batch.id} 
          onClick={() => onSelectBatch(batch)} 
          className="bg-surface rounded-lg overflow-hidden hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-1 transition-all cursor-pointer group border border-secondary"
        >
          <img src={batch.thumbnail} alt={batch.name} className="w-full h-48 object-cover"/>
          <div className="p-4">
            <h3 className="font-semibold text-text-primary mb-2 group-hover:text-primary transition-colors truncate">{batch.name}</h3>
            <p className="text-sm text-text-secondary mb-4 line-clamp-2">{batch.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StandardGrid;
