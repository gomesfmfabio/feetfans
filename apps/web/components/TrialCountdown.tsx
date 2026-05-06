'use client';

import { useEffect, useState } from 'react';

interface TrialCountdownProps {
  trialEndsAt: string; // ISO timestamp
  className?: string;
}

export default function TrialCountdown({
  trialEndsAt,
  className = '',
}: TrialCountdownProps) {
  const [daysRemaining, setDaysRemaining] = useState<number>(0);

  useEffect(() => {
    const calculateDaysRemaining = () => {
      const now = new Date();
      const endsAt = new Date(trialEndsAt);
      const diffMs = endsAt.getTime() - now.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      setDaysRemaining(Math.max(0, diffDays));
    };

    // Calculate immediately
    calculateDaysRemaining();

    // Update every hour
    const interval = setInterval(calculateDaysRemaining, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [trialEndsAt]);

  if (daysRemaining === 0) {
    return (
      <div
        className={`bg-red-50 border border-red-200 px-3 py-1.5 rounded-md ${className}`}
      >
        <span className="text-sm text-red-800 font-medium">
          ⚠️ Trial Expired
        </span>
      </div>
    );
  }

  return (
    <div
      className={`bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-md ${className}`}
    >
      <span className="text-sm text-blue-800 font-medium">
        🎁 Trial: {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} remaining
      </span>
    </div>
  );
}
