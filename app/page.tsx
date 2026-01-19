"use client";

import { useState, useEffect, useRef } from "react";

const DEFAULT_MINUTES = 25;

export default function Home() {
  const [timeLeft, setTimeLeft] = useState(DEFAULT_MINUTES * 60);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(DEFAULT_MINUTES * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const display = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <main className="flex flex-col items-center gap-8">
        <h1 className="text-2xl font-semibold text-zinc-800 dark:text-zinc-100">
          Focus Timer
        </h1>
        <div className="text-7xl font-mono font-bold text-zinc-900 dark:text-zinc-50">
          {display}
        </div>
        <div className="flex gap-4">
          {!isRunning ? (
            <button
              onClick={handleStart}
              disabled={timeLeft === 0}
              className="px-6 py-2 rounded-full bg-zinc-900 text-white font-medium hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              Start
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="px-6 py-2 rounded-full bg-zinc-900 text-white font-medium hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              Pause
            </button>
          )}
          <button
            onClick={handleReset}
            className="px-6 py-2 rounded-full border border-zinc-300 text-zinc-700 font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Reset
          </button>
        </div>
      </main>
    </div>
  );
}
