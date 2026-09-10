"use client";

export function ProductSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-[#E8E5DC] overflow-hidden flex flex-col animate-shimmer relative">
      {/* Image Skeleton */}
      <div className="aspect-square bg-[#F5F3EE] relative">
        <div className="absolute top-3 left-3 w-12 h-5 bg-stone-200/60 rounded-md" />
        <div className="absolute top-3 right-3 w-7 h-7 bg-stone-200/60 rounded-full" />
      </div>

      {/* Details Skeleton */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          <div className="h-3 bg-[#E2E8F0] rounded w-1/3" />
          <div className="h-4 bg-[#E2E8F0] rounded w-11/12" />
          <div className="h-4 bg-[#E2E8F0] rounded w-2/3" />
          <div className="flex items-center gap-1 pt-1">
            <div className="h-3 w-16 bg-[#E2E8F0] rounded" />
          </div>
        </div>

        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
          <div className="h-6 bg-[#E2E8F0] rounded w-24" />
          <div className="h-9 w-9 bg-[#E2E8F0] rounded-xl shrink-0" />
        </div>
      </div>
    </div>
  );
}

export function ProductSkeletonGrid({
  count = 4,
  columns = "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
}: {
  count?: number;
  columns?: string;
}) {
  return (
    <div className={`grid ${columns} gap-4 sm:gap-6`}>
      {Array.from({ length: count }).map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  );
}
