/**
 * Skeleton loading components for better perceived performance
 */

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
      <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
      <div className="space-y-2">
        <div className="bg-gray-200 h-4 rounded w-3/4"></div>
        <div className="bg-gray-200 h-4 rounded w-1/2"></div>
      </div>
    </div>
  );
}

export function SkeletonProfile() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
      <div className="flex items-center space-x-4 mb-4">
        <div className="bg-gray-200 w-16 h-16 rounded-full"></div>
        <div className="flex-1 space-y-2">
          <div className="bg-gray-200 h-4 rounded w-1/3"></div>
          <div className="bg-gray-200 h-3 rounded w-1/2"></div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="bg-gray-200 h-3 rounded"></div>
        <div className="bg-gray-200 h-3 rounded w-5/6"></div>
      </div>
    </div>
  );
}

export function SkeletonMessage() {
  return (
    <div className="flex items-start space-x-3 animate-pulse">
      <div className="bg-gray-200 w-10 h-10 rounded-full flex-shrink-0"></div>
      <div className="flex-1 space-y-2">
        <div className="bg-gray-200 h-3 rounded w-1/4"></div>
        <div className="bg-gray-200 h-4 rounded w-3/4"></div>
        <div className="bg-gray-200 h-4 rounded w-2/3"></div>
      </div>
    </div>
  );
}

export function SkeletonFeed() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonTable() {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="animate-pulse">
        {/* Header */}
        <div className="border-b border-gray-200 p-4 flex space-x-4">
          <div className="bg-gray-200 h-4 rounded w-1/4"></div>
          <div className="bg-gray-200 h-4 rounded w-1/4"></div>
          <div className="bg-gray-200 h-4 rounded w-1/4"></div>
        </div>
        {/* Rows */}
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="border-b border-gray-100 p-4 flex space-x-4">
            <div className="bg-gray-200 h-3 rounded w-1/4"></div>
            <div className="bg-gray-200 h-3 rounded w-1/4"></div>
            <div className="bg-gray-200 h-3 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonList() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="bg-white rounded-lg p-4 animate-pulse">
          <div className="flex items-center space-x-3">
            <div className="bg-gray-200 w-12 h-12 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="bg-gray-200 h-4 rounded w-1/3"></div>
              <div className="bg-gray-200 h-3 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2 animate-pulse">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="bg-gray-200 h-4 rounded"
          style={{ width: i === lines - 1 ? '66%' : '100%' }}
        ></div>
      ))}
    </div>
  );
}
