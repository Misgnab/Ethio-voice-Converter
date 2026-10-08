import React from 'react';
import { Play, Pause, Square, RotateCcw, Volume2, VolumeX, Download, Sparkles } from 'lucide-react';
import { HistoryItem } from '../types';

interface AudioPlayerDockProps {
  currentTrack: HistoryItem | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  onTogglePlayPause: () => void;
  onStop: () => void;
  onReplay: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (vol: number) => void;
  onToggleMute: () => void;
  onGenerateNewSpeech: () => void;
  isGenerating: boolean;
  onOpenDownloadModal?: () => void;
}

export default function AudioPlayerDock({
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  onTogglePlayPause,
  onStop,
  onReplay,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onGenerateNewSpeech,
  isGenerating,
  onOpenDownloadModal
}: AudioPlayerDockProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleDownload = () => {
    const url = currentTrack?.audioUrl || (currentTrack as any)?.audio_url;
    if (!currentTrack || !url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = `ethiovoice_${currentTrack.id}.${currentTrack.format || 'wav'}`;
    a.click();
  };

  return (
    <div
      role="region"
      aria-label="Audio Playback Bar"
      className="fixed bottom-0 left-0 right-0 h-20 sm:h-22 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 sm:px-6 lg:px-8 z-30 shadow-xl flex items-center justify-between gap-2.5 sm:gap-6"
    >
      {/* Left Action Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <button
          type="button"
          onClick={onReplay}
          title="Replay from start"
          aria-label="Replay speech from start"
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
        >
          <RotateCcw size={15} />
        </button>

        <button
          type="button"
          onClick={onTogglePlayPause}
          title={isPlaying ? 'Pause speech' : 'Play speech'}
          aria-label={isPlaying ? 'Pause speech' : 'Play speech'}
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#006241] hover:bg-[#004d33] text-white flex items-center justify-center shadow-md transform hover:scale-105 active:scale-95 transition-all duration-200"
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5 fill-current" />}
        </button>

        <button
          type="button"
          onClick={onStop}
          title="Stop playback"
          aria-label="Stop playback"
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
        >
          <Square size={13} className="fill-current" />
        </button>
      </div>

      {/* Center Scrubber & Metadata Timeline */}
      <div className="flex-1 flex flex-col gap-1 min-w-0 max-w-2xl">
        <div className="flex justify-between items-center text-[11px] text-slate-500 font-medium">
          <span className="tabular-nums font-mono">{formatTime(currentTime)}</span>
          <span className="truncate max-w-[140px] sm:max-w-md px-2 text-slate-800 text-xs text-center">
            {currentTrack ? (
              <span>
                <strong className="text-[#006241] font-semibold mr-1.5">{currentTrack.voiceName}:</strong>
                <span className="italic">{currentTrack.text}</span>
              </span>
            ) : (
              <span className="text-slate-400">Ready in Speech Studio</span>
            )}
          </span>
          <span className="tabular-nums font-mono">{formatTime(duration)}</span>
        </div>

        {/* Range Scrubber Bar */}
        <div className="relative flex items-center">
          <input
            type="range"
            min="0"
            max={duration || 100}
            step="0.05"
            value={currentTime}
            onChange={(e) => onSeek(parseFloat(e.target.value))}
            aria-label="Audio progress scrubber"
            className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-[#006241]"
          />
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 bg-[#006241] rounded-l-full pointer-events-none"
            style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Right Controls: Volume & Download */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Volume controls (desktop & tablet) */}
        <div className="hidden md:flex items-center gap-1.5">
          <button
            type="button"
            onClick={onToggleMute}
            aria-label={isMuted ? 'Unmute volume' : 'Mute volume'}
            className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg"
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            aria-label="Volume level slider"
            className="w-16 h-1 bg-slate-200 rounded-full accent-[#006241] cursor-pointer"
          />
        </div>

        {/* Quick Synthesize trigger button (desktop) */}
        <button
          type="button"
          onClick={onGenerateNewSpeech}
          disabled={isGenerating}
          aria-label="Synthesize speech"
          className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-[#006241] hover:bg-[#004d33] text-white text-xs font-semibold rounded-xl shadow-xs transition disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Sparkles size={13} />
              <span>Synthesize</span>
            </>
          )}
        </button>

        {/* Download Button */}
        {currentTrack && (currentTrack.audioUrl || (currentTrack as any).audio_url) && (
          <button
            type="button"
            onClick={() => {
              if (onOpenDownloadModal) {
                onOpenDownloadModal();
              } else {
                handleDownload();
              }
            }}
            title="Download speech audio (WAV, MP3, AAC)"
            aria-label="Download speech audio"
            className="p-2 sm:px-3 sm:py-2 bg-emerald-50 hover:bg-emerald-100 text-[#006241] text-xs font-bold rounded-xl border border-emerald-200 transition flex items-center gap-1.5 shadow-2xs"
          >
            <Download size={14} />
            <span className="hidden sm:inline">Download</span>
          </button>
        )}
      </div>
    </div>
  );
}
