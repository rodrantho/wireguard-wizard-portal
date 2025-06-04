
import React from 'react';
import { Button } from '@/components/ui/button';
import { Grid3X3, LayoutGrid } from 'lucide-react';

export type ViewMode = 'expanded' | 'grid';

interface ViewModeSelectorProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export default function ViewModeSelector({ viewMode, onViewModeChange }: ViewModeSelectorProps) {
  return (
    <div className="flex space-x-1 bg-secondary/20 rounded-lg p-1">
      <Button
        variant={viewMode === 'expanded' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('expanded')}
        className="h-8 px-3"
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
      <Button
        variant={viewMode === 'grid' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('grid')}
        className="h-8 px-3"
      >
        <Grid3X3 className="h-4 w-4" />
      </Button>
    </div>
  );
}
