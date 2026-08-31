import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, MoveHorizontal } from 'lucide-react';

interface ScrollableTableContainerProps {
  children: React.ReactNode;
  className?: string;
  showDragHint?: boolean;
}

export const ScrollableTableContainer: React.FC<ScrollableTableContainerProps> = ({
  children,
  className = '',
  showDragHint = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (!containerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
    const overflow = scrollWidth > clientWidth + 4;
    setHasOverflow(overflow);
    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [children]);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag with primary mouse button and not when clicking inside interactive elements
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest('button, a, input, select, textarea, [role="button"]')) return;

    if (!containerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Drag sensitivity multiplier
    containerRef.current.scrollLeft = scrollLeft - walk;
    checkScroll();
  };

  const stopDragging = () => {
    if (isDragging) {
      setIsDragging(false);
    }
  };

  const scrollByAmount = (amount: number) => {
    if (!containerRef.current) return;
    containerRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    setTimeout(checkScroll, 200);
  };

  return (
    <div className="relative group/scroll-container">
      {/* Visual edge fade indicators */}
      {canScrollLeft && (
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white dark:from-slate-900 to-transparent z-10 pointer-events-none transition-opacity duration-200" />
      )}
      {canScrollRight && (
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-slate-900 to-transparent z-10 pointer-events-none transition-opacity duration-200" />
      )}

      {/* Floating quick scroll buttons on hover */}
      {hasOverflow && (
        <div className="hidden lg:flex items-center gap-1 absolute top-3 right-4 z-20 opacity-0 group-hover/scroll-container:opacity-100 transition-opacity bg-white/90 dark:bg-slate-800/90 backdrop-blur-xs p-1 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => scrollByAmount(-250)}
            disabled={!canScrollLeft}
            className="p-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            title="Rolar para esquerda"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1 px-1 text-[10px] font-bold text-slate-500 dark:text-slate-400">
            <MoveHorizontal className="w-3.5 h-3.5 text-amber-500" />
            <span>Arraste ou use setas</span>
          </div>
          <button
            type="button"
            onClick={() => scrollByAmount(250)}
            disabled={!canScrollRight}
            className="p-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            title="Rolar para direita"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main scrollable view */}
      <div
        ref={containerRef}
        onScroll={checkScroll}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={stopDragging}
        onMouseLeave={stopDragging}
        className={`overflow-x-auto select-none ${
          isDragging ? 'cursor-grabbing select-none' : hasOverflow ? 'cursor-grab' : ''
        } ${className}`}
        style={{
          userSelect: isDragging ? 'none' : 'auto',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {children}
      </div>
    </div>
  );
};
