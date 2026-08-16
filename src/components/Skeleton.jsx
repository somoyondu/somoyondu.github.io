/**
 * Card-shaped placeholders. The site is a grid of member cards, so skeletons
 * (not spinners) keep the layout from jumping while data loads.
 */
export const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse rounded bg-gray-200 ${className}`} />
);

export const CardSkeletonGrid = ({ count = 8 }) => (
  <div className="mx-6 lg:mx-20 mt-5 lg:mt-10 grid gap-1 lg:gap-4 grid-cols-2 lg:grid-cols-4">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="w-36 lg:w-64 mx-4 my-2 p-1 lg:p-8 bg-white ring-2 lg:ring-4 ring-[#6251A7]/30 rounded-xl shadow-md"
      >
        <Skeleton className="h-12 w-12 lg:h-24 lg:w-24 mx-auto rounded-full mt-3 lg:mt-7" />
        <div className="text-center space-y-2 my-5 lg:my-1">
          <Skeleton className="h-3 lg:h-4 w-3/4 mx-auto" />
          <Skeleton className="h-3 lg:h-4 w-1/2 mx-auto" />
        </div>
      </div>
    ))}
  </div>
);

export const AdvisorSkeletonGrid = ({ count = 6 }) => (
  <div className="mx-6 lg:mx-20 mt-5 lg:mt-10 grid gap-1 lg:gap-4 grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i}>
        <Skeleton className="w-32 lg:w-60 h-32 lg:h-60 mx-auto" />
        <div className="text-center space-y-2 my-5 lg:my-8">
          <Skeleton className="h-3 lg:h-4 w-2/3 mx-auto" />
          <Skeleton className="h-3 lg:h-4 w-1/2 mx-auto" />
        </div>
      </div>
    ))}
  </div>
);

export const SectionError = ({ message = 'তথ্য লোড করা যায়নি', onRetry }) => (
  <div className="mx-6 my-8 rounded-xl border border-red-200 bg-red-50 p-6 text-center">
    <p className="text-sm text-red-800">{message}</p>
    {onRetry && (
      <button
        type="button"
        onClick={onRetry}
        className="mt-3 rounded-md bg-[#1D0061] px-4 py-2 text-sm text-white"
      >
        আবার চেষ্টা করুন
      </button>
    )}
  </div>
);
