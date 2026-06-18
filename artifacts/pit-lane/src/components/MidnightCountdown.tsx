import { useState, useEffect } from 'react';

function getTimeUntilMidnight(): string {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const diff = midnight.getTime() - now.getTime();
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1_000);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function MidnightCountdown({ className = "" }: { className?: string }) {
  const [time, setTime] = useState(getTimeUntilMidnight);

  useEffect(() => {
    const t = setInterval(() => setTime(getTimeUntilMidnight()), 1000);
    return () => clearInterval(t);
  }, []);

  return <span className={className}>{time}</span>;
}
