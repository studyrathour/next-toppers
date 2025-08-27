import React from 'react';
import { Batch } from '../../types';

interface Props {
  batches: Batch[];
  onSelectBatch: (batch: Batch) => void;
}

const OverlayGrid: React.FC<Props> = ({ batches, onSelectBatch }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {batches.map((batch) => (
        <div 
          key={batch.id} 
          onClick={() => onSelectBatch(batch)} 
          className="relative bg-surface rounded-lg overflow-hidden hover:-translate-y-1 transition-transform duration-300 cursor-pointer group border border-secondary aspect-video"
        >
          <img src={batch.thumbnail} alt={batch.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-4 w-full">
            <h3 className="font-semibold text-lg text-white group-hover:text-primary transition-colors truncate">{batch.name}</h3>
            <p className="text-xs text-text-secondary line-clamp-1">{batch.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OverlayGrid;
