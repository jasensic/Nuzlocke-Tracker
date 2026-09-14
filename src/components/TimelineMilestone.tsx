import React from 'react';
import { Swords } from 'lucide-react';
import { cn, TONES } from '../utils/ui';

interface TimelineMilestoneProps {
  stepNumber: number;
  isBattle?: boolean;
  isComplete?: boolean;
  isNext?: boolean;
  children: React.ReactNode;
}

export const TimelineMilestone: React.FC<TimelineMilestoneProps> = ({
  stepNumber,
  isBattle = false,
  isComplete = false,
  isNext = false,
  children,
}) => {
  const nodeClass = isBattle && !isComplete
    ? cn(TONES.accent.fill, 'text-white border-2 border-transparent shadow-sm ring-4 ring-brand-bg')
    : isComplete
      ? cn(TONES.success.fill, 'text-white border-2 border-transparent')
      : isNext
        ? cn(TONES.accent.fill, 'text-white border-2 border-transparent')
        : 'bg-brand-border border-2 border-brand-border text-brand-txt2 group-hover:border-brand-accent';

  return (
    <article className="relative pl-12 group">
      <div
        className={cn(
          'absolute left-2 top-5 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold z-10 transition-transform group-hover:scale-110',
          nodeClass
        )}
      >
        {isBattle && !isComplete ? <Swords className="w-2.5 h-2.5" /> : stepNumber}
      </div>
      {children}
    </article>
  );
};

export const TimelineRail: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="relative space-y-3">
    <div
      aria-hidden
      className="pointer-events-none absolute top-4 bottom-4 left-2 w-6 flex justify-center"
    >
      <div className="h-full w-0.5 bg-brand-border/60" />
    </div>
    {children}
  </div>
);
