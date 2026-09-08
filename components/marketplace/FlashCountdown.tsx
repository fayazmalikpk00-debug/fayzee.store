"use client";

import { useEffect, useState } from "react";

export function FlashCountdown({ targetDate }: { targetDate: string | Date }) {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 24,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const end = new Date(targetDate).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = end - now;

      if (distance <= 0) {
        clearInterval(interval);
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      } else {
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="flex items-center gap-1.5 text-xs font-bold text-white">
      <span className="bg-[#1C2A39] px-2 py-1 rounded-md shadow-xs">{pad(timeLeft.hours)}</span>
      <span className="text-[#1C2A39] font-extrabold">:</span>
      <span className="bg-[#1C2A39] px-2 py-1 rounded-md shadow-xs">{pad(timeLeft.minutes)}</span>
      <span className="text-[#1C2A39] font-extrabold">:</span>
      <span className="bg-[#1C2A39] px-2 py-1 rounded-md shadow-xs text-[#FF5E00]">{pad(timeLeft.seconds)}</span>
    </div>
  );
}
