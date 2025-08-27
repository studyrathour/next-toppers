import React from 'react';
import { Batch } from '../../types';
import { Book } from 'lucide-react';

interface Props {
  batches: Batch[];
  onSelectBatch: (batch: Batch) => void;
}

const HorizontalList: React.FC<Props> = ({ batches, onSelectBatch }) => {
  return (
    <div className="space-y-6">
      {batches.map((batch) => (
        <div 
          key={batch.id} 
          onClick={() => onSelectBatch(batch)} 
          className="bg-surface rounded-lg overflow-hidden hover:shadow-xl hover:shadow-primary/20 transition-all cursor-pointer group border border-secondary flex flex-col md:flex-row"
        >
          <img src={batch.thumbnail} alt={batch.name} className="w-full md:w-1/3 h-48 md:h-auto object-cover"/>
          <div className="p-6 flex flex-col">
            <h3 className="font-semibold text-xl text-text-primary mb-2 group-hover:text-primary transition-colors">{batch.name}</h3>
            <p className="text-sm text-text-secondary mb-4 line-clamp-3 flex-grow">{batch.description}</p>
            <div className="flex items-center gap-2 text-xs text-text-tertiary">
              <Book className="w-4 h-4" />
              <span>{batch.subjects?.length || 0} subjects</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HorizontalList;
