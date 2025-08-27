import React from 'react';
import { Batch } from '../../types';

interface Props {
  batches: Batch[];
  onSelectBatch: (batch: Batch) => void;
}

const AlternatingList: React.FC<Props> = ({ batches, onSelectBatch }) => {
  return (
    <div className="space-y-8">
      {batches.map((batch) => (
        <div 
          key={batch.id} 
          onClick={() => onSelectBatch(batch)} 
          className="bg-surface rounded-lg overflow-hidden hover:shadow-xl hover:shadow-primary/20 transition-all cursor-pointer group border border-secondary flex flex-col md:flex-row even:md:flex-row-reverse"
        >
          <img src={batch.thumbnail} alt={batch.name} className="w-full md:w-5/12 h-56 md:h-auto object-cover"/>
          <div className="p-8 flex flex-col justify-center flex-1">
            <h3 className="font-semibold text-2xl text-text-primary mb-3 group-hover:text-primary transition-colors">{batch.name}</h3>
            <p className="text-base text-text-secondary mb-5 line-clamp-4">{batch.description}</p>
            <span className="text-sm font-medium text-primary">
              View Course &rarr;
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AlternatingList;
