// @ts-nocheck
// src/components/skeletons.tsx
export function CardSkeleton() {
  return (
    <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
      <div className="h-8 bg-gray-300 rounded w-1/2"></div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
      <div className="w-full h-[350px] bg-gray-300 rounded-lg"></div>
    </div>
  );
}