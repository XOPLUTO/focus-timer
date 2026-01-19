"use client";

import { useState, useEffect, useRef, useCallback } from "react";

type SessionType = "work" | "shortBreak" | "longBreak";

const SESSION_TIMES: Record<SessionType, number> = {
  work: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

const SESSION_LABELS: Record<SessionType, string> = {
  work: "Focus",
  shortBreak: "Short Break",
  longBreak: "Long Break",
};

const ALARM_SOUNDS = [
  { id: "bell", name: "Bell", frequencies: [880, 1100, 880], duration: 0.15 },
  { id: "chime", name: "Chime", frequencies: [523, 659, 784, 1047], duration: 0.2 },
  { id: "beep", name: "Digital", frequencies: [1000, 1000, 1000], duration: 0.1 },
  { id: "gentle", name: "Gentle", frequencies: [440, 550, 660], duration: 0.3 },
  { id: "alert", name: "Alert", frequencies: [800, 600, 800, 600], duration: 0.08 },
];

export default function Home() {
  const [sessionType, setSessionType] = useState<SessionType>("work");
  const [timeLeft, setTimeLeft] = useState(SESSION_TIMES.work);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedAlarm, setSelectedAlarm] = useState(ALARM_SOUNDS[0].id);
  const [showAlarmSelector, setShowAlarmSelector] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const playAlarm = useCallback(() => {
    const alarm = ALARM_SOUNDS.find((a) => a.id === selectedAlarm);
    if (!alarm) return;

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    const ctx = audioContextRef.current;

    const playSequence = (times: number) => {
      if (times <= 0) return;

      alarm.frequencies.forEach((freq, i) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.frequency.value = freq;
        oscillator.type = alarm.id === "beep" ? "square" : "sine";

        const startTime = ctx.currentTime + i * alarm.duration;
        gainNode.gain.setValueAtTime(0.3, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + alarm.duration);

        oscillator.start(startTime);
        oscillator.stop(startTime + alarm.duration);
      });

      setTimeout(() => playSequence(times - 1), alarm.frequencies.length * alarm.duration * 1000 + 200);
    };

    playSequence(3);
  }, [selectedAlarm]);

  const previewAlarm = useCallback((alarmId: string) => {
    const alarm = ALARM_SOUNDS.find((a) => a.id === alarmId);
    if (!alarm) return;

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    const ctx = audioContextRef.current;

    alarm.frequencies.forEach((freq, i) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = freq;
      oscillator.type = alarm.id === "beep" ? "square" : "sine";

      const startTime = ctx.currentTime + i * alarm.duration;
      gainNode.gain.setValueAtTime(0.3, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + alarm.duration);

      oscillator.start(startTime);
      oscillator.stop(startTime + alarm.duration);
    });
  }, []);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      playAlarm();

      if (sessionType === "work") {
        setCompletedPomodoros((prev) => prev + 1);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft, playAlarm, sessionType]);

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(SESSION_TIMES[sessionType]);
  };

  const handleSessionChange = (type: SessionType) => {
    setIsRunning(false);
    setSessionType(type);
    setTimeLeft(SESSION_TIMES[type]);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const display = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  const progress = 1 - timeLeft / SESSION_TIMES[sessionType];

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <main className="flex flex-col items-center gap-6 px-4">
        <h1 className="text-2xl font-semibold text-zinc-800 dark:text-zinc-100">
          Pomodoro Timer
        </h1>

        {/* Session Type Selector */}
        <div className="flex gap-2">
          {(Object.keys(SESSION_TIMES) as SessionType[]).map((type) => (
            <button
              key={type}
              onClick={() => handleSessionChange(type)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                sessionType === type
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "bg-zinc-200 text-zinc-600 hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
              }`}
            >
              {SESSION_LABELS[type]}
            </button>
          ))}
        </div>

        {/* Progress Ring */}
        <div className="relative">
          <svg className="w-64 h-64 -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-zinc-200 dark:text-zinc-800"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${progress * 283} 283`}
              className="text-zinc-900 dark:text-zinc-100 transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-5xl font-mono font-bold text-zinc-900 dark:text-zinc-50">
              {display}
            </div>
            <div className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              {SESSION_LABELS[sessionType]}
            </div>
          </div>
        </div>

        {/* Pomodoro Count */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-500 dark:text-zinc-400">Completed:</span>
          <div className="flex gap-1">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full ${
                  i < completedPomodoros % 4
                    ? "bg-zinc-900 dark:bg-zinc-100"
                    : "bg-zinc-300 dark:bg-zinc-700"
                }`}
              />
            ))}
          </div>
          {completedPomodoros >= 4 && (
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              ({Math.floor(completedPomodoros / 4)} sets)
            </span>
          )}
        </div>

        {/* Control Buttons */}
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

        {/* Alarm Selector */}
        <div className="relative">
          <button
            onClick={() => setShowAlarmSelector(!showAlarmSelector)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828-9.9a9 9 0 0112.728 0"
              />
            </svg>
            Alarm: {ALARM_SOUNDS.find((a) => a.id === selectedAlarm)?.name}
          </button>

          {showAlarmSelector && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg p-2 min-w-48">
              {ALARM_SOUNDS.map((alarm) => (
                <button
                  key={alarm.id}
                  onClick={() => {
                    setSelectedAlarm(alarm.id);
                    previewAlarm(alarm.id);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded text-sm ${
                    selectedAlarm === alarm.id
                      ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  }`}
                >
                  <span>{alarm.name}</span>
                  {selectedAlarm === alarm.id && (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Skip to next session hint */}
        {timeLeft === 0 && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {sessionType === "work"
              ? "Great work! Take a break."
              : "Break over! Ready to focus?"}
          </p>
        )}
      </main>
    </div>
  );
}
