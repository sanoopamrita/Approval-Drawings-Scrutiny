import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, CheckCircle, Coffee, Brain } from 'lucide-react';

type Mode = 'pomodoro' | 'shortBreak' | 'longBreak';

export function FocusTimer() {
  const [mode, setMode] = useState<Mode>('pomodoro');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [completedSessions, setCompletedSessions] = useState(0);

  const customTimes = {
    pomodoro: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
  };

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Play subtle bell sound using Web Audio API
  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3); // A5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } catch {
      // Audio context might be blocked if no user interaction yet
    }
  };

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            playChime();
            if (mode === 'pomodoro') {
              setCompletedSessions((s) => s + 1);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode, soundEnabled]);

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    setIsRunning(false);
    setTimeLeft(customTimes[newMode]);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(customTimes[mode]);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const totalModeTime = customTimes[mode];
  const progressPercent = ((totalModeTime - timeLeft) / totalModeTime) * 100;

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xs text-center space-y-6">
        {/* Mode Selector */}
        <div className="inline-flex p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => switchMode('pomodoro')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              mode === 'pomodoro' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>Focus (25m)</span>
          </button>
          <button
            onClick={() => switchMode('shortBreak')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              mode === 'shortBreak' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Coffee className="w-3.5 h-3.5" />
            <span>Short Break (5m)</span>
          </button>
          <button
            onClick={() => switchMode('longBreak')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              mode === 'longBreak' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Coffee className="w-3.5 h-3.5" />
            <span>Long Break (15m)</span>
          </button>
        </div>

        {/* Big Timer Display */}
        <div className="relative flex flex-col items-center justify-center py-6">
          <div className="text-7xl font-extrabold tracking-tight text-slate-900 font-mono">
            {formatTime(timeLeft)}
          </div>
          <div className="mt-2 text-xs font-medium text-slate-500 uppercase tracking-widest">
            {isRunning ? 'Session Active' : 'Paused / Ready'}
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-100 h-2 rounded-full mt-6 overflow-hidden max-w-xs">
            <div
              className="bg-indigo-600 h-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            id="btn-timer-toggle"
            onClick={() => setIsRunning(!isRunning)}
            className={`flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm transition-all shadow-sm cursor-pointer ${
              isRunning
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-slate-900 hover:bg-slate-800 text-white'
            }`}
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            <span>{isRunning ? 'Pause' : 'Start Focus'}</span>
          </button>

          <button
            onClick={resetTimer}
            className="p-3.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-colors cursor-pointer"
            title="Reset Timer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-3.5 border rounded-xl transition-colors cursor-pointer ${
              soundEnabled
                ? 'border-slate-200 text-slate-700 hover:bg-slate-50'
                : 'border-slate-200 text-slate-400 bg-slate-50'
            }`}
            title={soundEnabled ? 'Mute Chime' : 'Enable Chime'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Stats and tips */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">{completedSessions}</div>
            <div className="text-xs text-slate-500">Completed Sessions</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">{completedSessions * 25}m</div>
            <div className="text-xs text-slate-500">Total Focus Time</div>
          </div>
        </div>
      </div>
    </div>
  );
}
