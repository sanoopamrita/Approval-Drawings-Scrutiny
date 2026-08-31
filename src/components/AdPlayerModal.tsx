import React, { useState, useEffect, useRef } from 'react';
import { X, Volume2, VolumeX, ExternalLink, Play, Sparkles, Megaphone, Clock } from 'lucide-react';
import { adService, AdItem } from '../services/adService';
import { Language, User } from '../types';

interface AdPlayerModalProps {
  language: Language;
  currentUser?: User | null;
}

export const AdPlayerModal: React.FC<AdPlayerModalProps> = ({ language, currentUser }) => {
  const isMl = language === 'ml';
  const [activeAds, setActiveAds] = useState<AdItem[]>(adService.getActiveAds());
  const [currentAdIndex, setCurrentAdIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(10);
  const [isMuted, setIsMuted] = useState<boolean>(true);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const timerRef = useRef<any>(null);
  const countdownIntervalRef = useRef<any>(null);

  // Subscribe to ad changes from Super Admin
  useEffect(() => {
    const unsub = adService.subscribe((all) => {
      const active = all.filter((a) => a.active);
      setActiveAds(active);
    });
    return () => unsub();
  }, []);

  // Main Orchestration Loop
  useEffect(() => {
    if (activeAds.length === 0) return;

    // First Ad triggers 10 seconds after application load
    const initialTimer = setTimeout(() => {
      startAdPlayback(0);
    }, 10000);

    return () => {
      clearTimeout(initialTimer);
      if (timerRef.current) clearTimeout(timerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [activeAds.length]);

  const startAdPlayback = (index: number) => {
    if (activeAds.length === 0) return;
    const safeIndex = index % activeAds.length;
    const ad = activeAds[safeIndex];

    if (!ad) return;

    setCurrentAdIndex(safeIndex);
    setIsPlaying(true);
    adService.recordView(ad.id);

    if (ad.mediaType === 'image') {
      const duration = 10; // Exactly 10 seconds for images
      setTimeRemaining(duration);

      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(countdownIntervalRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        closeAndScheduleNext(safeIndex);
      }, duration * 1000);
    } else {
      // Video type: plays until video ends (handled by onEnded) or fallback timeout
      setTimeRemaining(ad.durationSeconds || 30);
    }
  };

  const closeAndScheduleNext = (finishedIndex: number) => {
    setIsPlaying(false);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    if (timerRef.current) clearTimeout(timerRef.current);

    if (activeAds.length === 0) return;

    const isLastInQueue = finishedIndex >= activeAds.length - 1;
    // Rule: Next ad after 30 seconds. If all completed, repeat after 50 seconds!
    const delayMs = isLastInQueue ? 50000 : 30000;
    const nextIndex = isLastInQueue ? 0 : finishedIndex + 1;

    timerRef.current = setTimeout(() => {
      startAdPlayback(nextIndex);
    }, delayMs);
  };

  const handleVideoEnded = () => {
    closeAndScheduleNext(currentAdIndex);
  };

  const handleManualClose = () => {
    closeAndScheduleNext(currentAdIndex);
  };

  const handleAdClick = (ad: AdItem) => {
    adService.recordClick(ad.id);
    if (ad.linkUrl) {
      window.open(ad.linkUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (!isPlaying || currentAdIndex < 0 || !activeAds[currentAdIndex]) {
    return null;
  }

  const currentAd = activeAds[currentAdIndex];

  return (
    <div
      id="global-ad-container"
      className="fixed bottom-5 right-5 z-50 max-w-sm sm:max-w-md w-full bg-[#080E1A]/95 border border-cyan-500/50 rounded-3xl p-4 shadow-[0_0_40px_rgba(0,240,255,0.3)] backdrop-blur-xl animate-fadeIn text-left"
    >
      {/* Ad Header Banner */}
      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-cyan-500/20">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1">
            <Megaphone className="w-3 h-3 text-cyan-400" />
            <span>{isMl ? 'പ്രത്യേക അറിയിപ്പ്' : 'Sponsored'}</span>
          </span>
        </div>

        {/* Top Right: Very Small Advertisement Label & Close Button */}
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-semibold text-slate-400/90 tracking-wider uppercase bg-slate-900/90 border border-slate-700/80 px-2 py-0.5 rounded-md select-none">
            {isMl ? 'അഡ്വർടൈസ്മെന്റ്' : 'Advertisement'}
          </span>

          {currentAd.mediaType === 'image' && (
            <span className="text-[10px] font-mono text-slate-300 bg-cyan-950/80 border border-cyan-500/30 px-1.5 py-0.5 rounded-md flex items-center gap-1">
              <Clock className="w-2.5 h-2.5 text-cyan-400" />
              <span>{timeRemaining}s</span>
            </span>
          )}

          <button
            onClick={handleManualClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer flex items-center gap-1 text-[10px]"
            title={isMl ? 'പരസ്യം ക്ലോസ് ചെയ്യുക' : 'Close advertisement'}
            aria-label="Close Advertisement"
          >
            <X className="w-3.5 h-3.5" />
            <span className="sr-only sm:not-sr-only text-[9px]">{isMl ? 'ക്ലോസ്' : 'Close'}</span>
          </button>
        </div>
      </div>

      {/* Media Player (Image or Video) */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 group aspect-video flex items-center justify-center">
        {currentAd.mediaType === 'video' ? (
          <>
            <video
              ref={videoRef}
              src={currentAd.mediaUrl}
              autoPlay
              playsInline
              muted={isMuted}
              onEnded={handleVideoEnded}
              className="w-full h-full object-cover"
            />
            {/* Video Sound Toggle */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-slate-950/80 text-cyan-300 hover:text-white border border-slate-700 backdrop-blur-md cursor-pointer transition-all"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </>
        ) : (
          <img
            src={currentAd.mediaUrl}
            alt={currentAd.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        )}
      </div>

      {/* Ad Content & CTA */}
      <div className="mt-3 space-y-2">
        <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-1">
          {isMl ? (currentAd.titleMl || currentAd.title) : currentAd.title}
        </h4>
        <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
          {isMl ? (currentAd.descriptionMl || currentAd.description) : currentAd.description}
        </p>

        <div className="flex items-center justify-between pt-1">
          <span className="text-[10px] text-slate-400">
            {isMl ? `പരസ്യം ${currentAdIndex + 1} / ${activeAds.length}` : `Ad ${currentAdIndex + 1} of ${activeAds.length}`}
          </span>

          {currentAd.linkUrl && (
            <button
              onClick={() => handleAdClick(currentAd)}
              className="px-3 py-1.5 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>{isMl ? (currentAd.ctaTextMl || 'സന്ദർശിക്കുക') : (currentAd.ctaText || 'Visit Now')}</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
