import React from 'react';
import { Skeleton } from '../components/ui/skeleton';

/**
 * CardStructureLoader — grid of card skeletons, now built on the shadcn
 * Skeleton primitive + tokens. Public API unchanged (count, minCardWidth).
 */
export default function CardStructureLoader({
  count = 5,
  minCardWidth = '220px',
}) {
  if (count <= 0) return null;

  return (
    <div
      className="grid gap-4"
      style={{
        gridTemplateColumns: `repeat(auto-fit, minmax(${minCardWidth}, 1fr))`,
      }}
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={`card-structure-${index}`}
          className="flex min-h-[110px] flex-col justify-between rounded-lg border border-border bg-card p-4"
        >
          <Skeleton className="h-3 w-2/5" />
          <Skeleton className="h-6 w-[28%]" />
        </div>
      ))}
    </div>
  );
}
