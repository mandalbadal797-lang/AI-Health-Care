import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../buttons/Button';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  return (
    <nav className="flex items-center justify-center gap-sm mt-8" aria-label="Pagination Navigation">
      <Button
        variant="secondary"
        size="sm"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        leftIcon={<ChevronLeft size={16} />}
      >
        Previous
      </Button>

      <span className="text-small text-muted p-xs">
        Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
      </span>

      <Button
        variant="secondary"
        size="sm"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        rightIcon={<ChevronRight size={16} />}
      >
        Next
      </Button>
    </nav>
  );
};
