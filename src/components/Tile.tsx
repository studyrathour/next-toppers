import React from 'react';
import { LucideProps } from 'lucide-react';

interface TileProps {
  title: string;
  subtitle?: string;
  icon: React.ElementType<LucideProps>;
  iconColor?: string;
  onClick: () => void;
}

const Tile: React.FC<TileProps> = ({ title, subtitle, icon: Icon, iconColor = 'text-primary', onClick }) => {
  return (
    <div
      onClick={onClick}
      className="group flex flex-col items-center justify-center text-center p-4 bg-background rounded-lg border border-secondary hover:border-primary hover:bg-secondary transition-all cursor-pointer aspect-square"
    >
      <Icon className={`w-12 h-12 sm:w-16 sm:h-16 mb-4 transition-colors ${iconColor} group-hover:text-primary`} />
      <h3 className="font-semibold text-sm sm:text-base text-text-primary transition-colors group-hover:text-primary line-clamp-2">{title}</h3>
      {subtitle && <p className="text-xs text-text-tertiary mt-1">{subtitle}</p>}
    </div>
  );
};

export default Tile;
