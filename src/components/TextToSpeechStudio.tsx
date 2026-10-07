import React, { useState, useRef } from 'react';
import {
  Volume2,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Download,
  Copy,
  Trash2,
  Camera,
  FileText,
  VolumeX,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Check,
  Edit3
} from 'lucide-react';
import { LanguageCode, Voice, HistoryItem } from '../types';
import { LANGUAGES, VOICES } from '../data';

export interface TextToSpeechStudioProps {
  inputText: string;
  setInputText: (text: string) => void;
  selectedLanguage: LanguageCode;
  setSelectedLanguage: (lang: LanguageCode) => void;
  selectedVoiceId: string;
  setSelectedVoiceId: (id: string) => void;
  playbackSpeed: number;
  setPlaybackSpeed: (speed: number) => void;
  audioFormat: 'mp3' | 'wav' | 'aac';
  setAudioFormat: (fmt: 'mp3' | 'wav' | 'aac') => void;
  audioQuality: 'low' | 'standard' | 'hd';
  setAudioQuality: (ql: 'low' | 'standard' | 'hd') => void;
  onGenerateSpeech: () => void;
  isGenerating: boolean;
  currentTrack?: HistoryItem | null;
  isPlaying?: boolean;
  currentTime?: number;
  duration?: number;
  volume?: number;
  isMuted?: boolean;
  onTogglePlayPause?: () => void;
  onSeek?: (time: number) => void;
  onVolumeChange?: (vol: number) => void;
  onToggleMute?: () => void;
  onReplay?: () => void;
  onPreviewVoice: (voice: Voice) => void;
  activePreviewVoiceId: string | null;
  isPlayingPreview: boolean;
  onOpenDownloadModal?: (track?: HistoryItem | null) => void;
  conversionsLeft: number;
  isPremium: boolean;
  onOpenUpgradeModal: () => void;
  triggerToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onNavigate?: (tab: string) => void;
  showHeroLayout?: boolean;
}

export default function TextToSpeechStudio({
  inputText,
  setInputText,
  selectedLanguage,
  setSelectedLanguage,
  selectedVoiceId,
  setSelectedVoiceId,
  playbackSpeed,
  setPlaybackSpeed,
  audioFormat,
  setAudioFormat,
  audioQuality,
  setAudioQuality,
  onGenerateSpeech,
  isGenerating,
  currentTrack,
  isPlaying = false,
  currentTime = 0,
  duration = 0,
  volume = 0.85,
  isMuted = false,
  onTogglePlayPause,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onReplay,
  onPreviewVoice,
  activePreviewVoiceId,
  isPlayingPreview,
  onOpenDownloadModal,
  conversionsLeft,
  isPremium,
  onOpenUpgradeModal,
  triggerToast,
  onNavigate
}: TextToSpeechStudioProps) {
  const [showAllVoicesMobile, setShowAllVoicesMobile] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Filter voices for currently selected language
  const voicesForLang = VOICES.filter((v) => v.language === selectedLanguage);
  const activeVoiceObj = VOICES.find((v) => v.id === selectedVoiceId) || voicesForLang[0] || VOICES[0];

  // Language Change: preserve user custom text unless empty or standard sample
  const handleLanguageChange = (lang: LanguageCode) => {
    setSelectedLanguage(lang);
    const available = VOICES.filter((v) => v.language === lang);
    if (available.length > 0) {
      setSelectedVoiceId(available[0].id);
    }
    const currentLangObj = LANGUAGES.find((l) => l.code === lang);
    const isDefaultOrEmpty =
      !inputText.trim() ||
      LANGUAGES.some((l) => l.sampleText.trim() === inputText.trim()) ||
      VOICES.some((v) => v.sampleText.trim() === inputText.trim());

    if (isDefaultOrEmpty && currentLangObj) {
      setInputText(currentLangObj.sampleText);
    }
  };

  // Quick Action: Paste from Clipboard
  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInputText(text);
        triggerToast('Pasted text from clipboard', 'info');
      }
    } catch {
      const manual = prompt('Paste your text here:');
      if (manual) {
        setInputText(manual);
      }
    }
  };

  // Quick Action: Clear Text
  const handleClearText = () => {
    setInputText('');
    triggerToast('Text cleared', 'info');
    textareaRef.current?.focus();
  };

  // Quick Action: Insert Sample Text
  const handleInsertSample = () => {
    const sample = activeVoiceObj?.sampleText || LANGUAGES.find((l) => l.code === selectedLanguage)?.sampleText || '';
    if (sample) {
      setInputText(sample);
      triggerToast(`Loaded sample phrase for ${activeVoiceObj?.name || 'language'}`, 'info');
    }
  };

  // Quick Action: Upload plain document or text file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = (event.target?.result as string) || '';
      if (content.trim()) {
        // Take up to 5,000 characters
        const safeContent = content.slice(0, 5000);
        setInputText(safeContent);
        triggerToast(`Loaded ${file.name} (${safeContent.length} characters)`, 'success');
      } else {
        triggerToast('The uploaded file was empty', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Format time mm:ss
  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Mobile voice visible count
  const displayedVoices = showAllVoicesMobile ? voicesForLang : voicesForLang.slice(0, 3);

  return (
    <div className="w-full bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden">
      {/* Top Studio Bar with Subtle Ethiopian Ribbon */}
      <div className="h-1.5 w-full flex">
        <div className="h-full flex-1 bg-[#006241]" />
        <div className="h-full flex-1 bg-[#F9D616]" />
        <div className="h-full flex-1 bg-[#E21C21]" />
      </div>

      <div className="p-5 sm:p-7 lg:p-8 space-y-7">
        {/* Header / Sub-banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#006241]">
              Text to Speech Studio
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Type your text. We will make it speak.
            </h2>
          </div>

          {/* Friendly Quota Indicator */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-[#006241] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#006241]" />
              <span>
                {isPremium ? 'Pro: Unlimited generations' : `${conversionsLeft} free generations today`}
              </span>
            </div>
            {!isPremium && (
              <button
                type="button"
                onClick={onOpenUpgradeModal}
                className="text-xs font-bold text-amber-700 hover:text-amber-800 underline underline-offset-2"
              >
                Upgrade
              </button>
            )}
          </div>
        </div>

        {/* STEP 1: CHOOSE LANGUAGE */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Step 1 — Choose Language
            </label>
            <span className="text-xs text-slate-500 font-medium">
              Selected: <strong className="text-slate-900">{LANGUAGES.find((l) => l.code === selectedLanguage)?.name}</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            {LANGUAGES.map((lang) => {
              const isSelected = selectedLanguage === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`p-3.5 sm:p-4 rounded-2xl border-2 text-left transition relative flex flex-col justify-between min-h-[76px] sm:min-h-[84px] cursor-pointer ${
                    isSelected
                      ? 'border-[#006241] bg-emerald-50/60 shadow-xs ring-1 ring-[#006241]'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70'
                  }`}
                  aria-pressed={isSelected}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xl sm:text-2xl" role="img" aria-label={lang.name}>
                      {lang.flag}
                    </span>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-[#006241] text-white flex items-center justify-center text-[10px] font-bold">
                        ✓
                      </span>
                    )}
                  </div>
                  <div className="mt-1">
                    <p className="font-extrabold text-sm sm:text-base text-slate-900 leading-tight">
                      {lang.nativeName}
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium">{lang.name}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* STEP 2: CHOOSE A VOICE */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Step 2 — Choose a Voice
            </label>
            <span className="text-xs text-slate-500 font-medium">
              {voicesForLang.length} Voices in {LANGUAGES.find((l) => l.code === selectedLanguage)?.name}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {displayedVoices.map((voice) => {
              const isSelected = selectedVoiceId === voice.id;
              const isPlayingThis = isPlayingPreview && activePreviewVoiceId === voice.id;
              const langName = LANGUAGES.find((l) => l.code === voice.language)?.name || voice.language;

              return (
                <div
                  key={voice.id}
                  onClick={() => setSelectedVoiceId(voice.id)}
                  className={`p-4 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between gap-3 ${
                    isSelected
                      ? 'border-[#006241] bg-emerald-50/50 shadow-xs ring-1 ring-[#006241]'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                  }`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedVoiceId(voice.id);
                    }
                  }}
                  aria-pressed={isSelected}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            voice.gender === 'female'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-[#006241]'
                          }`}
                        >
                          {voice.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5 leading-snug">
                            <span>{voice.name}</span>
                            <span className="text-slate-400 text-xs font-normal">
                              ({voice.nativeName})
                            </span>
                          </h4>
                          {/* Unboxed Metadata: Language · Gender · Region per Frontend Constitution */}
                          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                            {langName} · <span className="capitalize">{voice.gender}</span> · {voice.region || voice.accent}
                          </p>
                        </div>
                      </div>

                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-[#006241] text-white flex items-center justify-center text-[10px] shrink-0 font-bold">
                          ✓
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 mt-2 leading-relaxed">
                      {voice.description}
                    </p>
                  </div>

                  {/* Card Footer: Obvious Preview Button */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-400 font-medium truncate">
                      {voice.persona}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onPreviewVoice(voice);
                      }}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                        isPlayingThis
                          ? 'bg-[#006241] text-white border-[#006241] shadow-2xs'
                          : 'bg-white hover:bg-emerald-50 text-[#006241] border-slate-200 hover:border-emerald-300'
                      }`}
                      title={`Audition voice preview of ${voice.name}`}
                      aria-label={isPlayingThis ? `Pause sample for ${voice.name}` : `Preview voice of ${voice.name}`}
                    >
                      {isPlayingThis ? (
                        <>
                          <Pause size={13} className="animate-pulse" />
                          <span>Playing</span>
                        </>
                      ) : (
                        <>
                          <Play size={13} className="fill-current" />
                          <span>▶ Preview</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobile "See all voices" toggle */}
          {voicesForLang.length > 3 && (
            <div className="sm:hidden text-center pt-1">
              <button
                type="button"
                onClick={() => setShowAllVoicesMobile(!showAllVoicesMobile)}
                className="text-xs font-bold text-[#006241] hover:underline py-1.5 px-3 rounded-lg border border-emerald-200 bg-emerald-50/50 inline-flex items-center gap-1"
              >
                <span>{showAllVoicesMobile ? 'Show fewer voices' : `See all ${voicesForLang.length} voices`}</span>
                {showAllVoicesMobile ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>
          )}
        </div>

        {/* STEP 3: ENTER TEXT */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label htmlFor="studio-text-input" className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Step 3 — What would you like me to say?
            </label>
            <span className="text-xs text-slate-400 font-mono">
              {inputText.length} / 5,000 characters
            </span>
          </div>

          <div className="bg-slate-50/50 border border-slate-200 rounded-2xl overflow-hidden focus-within:border-[#006241] focus-within:ring-2 focus-within:ring-[#006241]/10 focus-within:bg-white transition">
            <textarea
              id="studio-text-input"
              ref={textareaRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value.slice(0, 5000))}
              rows={4}
              placeholder={
                selectedLanguage === 'am'
                  ? 'የሚፈልጉትን ጽሁፍ እዚህ ይጻፉ ወይም ይለጥፉ...'
                  : selectedLanguage === 'ti'
                  ? 'ዝደለይዎ ጽሑፍ ኣብዚ ጸሓፉ ወይ ለጥፉ...'
                  : selectedLanguage === 'om'
                  ? 'Barreeffama keessan asitti barreessaa ykn koppii godhaa...'
                  : 'Type or paste your text here...'
              }
              className="w-full p-4 text-slate-800 text-base leading-relaxed border-0 bg-transparent resize-y min-h-[130px] focus:outline-none placeholder:text-slate-400"
            />

            {/* Useful Text Action Buttons */}
            <div className="px-3.5 py-2.5 bg-slate-100/70 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={handlePasteClipboard}
                  className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl transition flex items-center gap-1 shadow-2xs"
                  title="Paste text from clipboard"
                >
                  <Copy size={13} />
                  <span>Paste</span>
                </button>

                <button
                  type="button"
                  onClick={handleClearText}
                  disabled={!inputText}
                  className="px-2.5 py-1.5 bg-white border border-slate-200 hover:text-red-600 font-semibold rounded-xl text-slate-600 transition flex items-center gap-1 disabled:opacity-40 shadow-2xs"
                  title="Clear text"
                >
                  <Trash2 size={13} />
                  <span>Clear</span>
                </button>

                <button
                  type="button"
                  onClick={handleInsertSample}
                  className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-emerald-50 hover:border-emerald-300 text-[#006241] font-semibold rounded-xl transition flex items-center gap-1 shadow-2xs"
                  title="Insert natural sample phrase"
                >
                  <Sparkles size={13} />
                  <span>Sample Text</span>
                </button>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {onNavigate && (
                  <button
                    type="button"
                    onClick={() => onNavigate('ocr')}
                    className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-emerald-50 text-slate-700 font-semibold rounded-xl transition flex items-center gap-1 shadow-2xs"
                    title="Scan photo of text"
                  >
                    <Camera size={13} className="text-[#006241]" />
                    <span>Scan Text</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-emerald-50 text-slate-700 font-semibold rounded-xl transition flex items-center gap-1 shadow-2xs"
                  title="Upload plain document file"
                >
                  <FileText size={13} className="text-[#006241]" />
                  <span>Upload Document</span>
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.md,.pdf,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>
          </div>
        </div>

        {/* STEP 4: GENERATE BUTTON */}
        <div className="space-y-3 pt-1">
          <button
            type="button"
            onClick={onGenerateSpeech}
            disabled={isGenerating || !inputText.trim()}
            className="w-full py-4 sm:py-5 px-6 bg-[#006241] hover:bg-[#004d33] text-white rounded-2xl font-bold text-base sm:text-lg shadow-lg shadow-emerald-950/15 flex items-center justify-center gap-3 transition transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none cursor-pointer"
            aria-label="Generate speech from text"
          >
            {isGenerating ? (
              <>
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Creating your voice...</span>
              </>
            ) : (
              <>
                <Volume2 size={24} />
                <span>🔊 Generate Speech</span>
              </>
            )}
          </button>

          {isGenerating && (
            <p className="text-center text-xs text-slate-500 font-medium animate-pulse">
              Please wait a moment while we create natural Ethiopian speech...
            </p>
          )}
        </div>

        {/* STEP 5: GENERATED AUDIO RESULT */}
        {currentTrack && (
          <section aria-label="Generated Audio Result" className="space-y-3 pt-2">
            <div className="bg-emerald-50/40 border-2 border-[#006241]/70 rounded-3xl p-5 sm:p-6 shadow-md space-y-4">
              {/* Header: Your audio is ready */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-full bg-[#006241] text-white flex items-center justify-center font-bold text-sm shadow-2xs">
                    ✓
                  </span>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                      Your audio is ready
                    </h3>
                    <p className="text-xs text-slate-600 font-medium">
                      Voice: <strong className="text-slate-900">{currentTrack.voiceName}</strong> ·{' '}
                      {LANGUAGES.find((l) => l.code === currentTrack.language)?.name || currentTrack.language}
                    </p>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      textareaRef.current?.focus();
                      textareaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }}
                    className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs border border-slate-200 transition flex items-center gap-1.5 shadow-2xs"
                  >
                    <Edit3 size={12} />
                    <span>✏️ Edit Text</span>
                  </button>

                  <button
                    type="button"
                    onClick={onGenerateSpeech}
                    disabled={isGenerating}
                    className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs border border-slate-200 transition flex items-center gap-1.5 shadow-2xs disabled:opacity-40"
                  >
                    <RotateCcw size={12} />
                    <span>🔄 Generate Again</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenDownloadModal && onOpenDownloadModal(currentTrack)}
                    className="px-4 py-1.5 bg-[#006241] hover:bg-[#004d33] text-white font-bold rounded-xl text-xs shadow-xs transition flex items-center gap-1.5"
                  >
                    <Download size={13} />
                    <span>⬇️ Download</span>
                  </button>
                </div>
              </div>

              {/* Spoken text quote */}
              <p className="text-xs sm:text-sm text-slate-700 italic font-serif bg-white/80 p-3.5 rounded-xl border border-emerald-100 line-clamp-2">
                "{currentTrack.text}"
              </p>

              {/* Scrubber Timeline */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono text-slate-500 font-semibold">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration || currentTrack.duration)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={duration || currentTrack.duration || 10}
                  step="0.05"
                  value={currentTime}
                  onChange={(e) => onSeek && onSeek(parseFloat(e.target.value))}
                  className="w-full h-2.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-[#006241]"
                  aria-label="Audio scrubber"
                />
              </div>

              {/* Audio Controls Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                {/* Play / Pause & Replay */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onReplay}
                    className="w-9 h-9 rounded-full bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center transition"
                    title="Replay from start"
                    aria-label="Replay audio"
                  >
                    <RotateCcw size={14} />
                  </button>

                  <button
                    type="button"
                    onClick={onTogglePlayPause}
                    className="px-5 py-2.5 rounded-full bg-[#006241] hover:bg-[#004d33] text-white font-bold text-xs flex items-center gap-2 shadow-md transition transform hover:scale-105 active:scale-95"
                    aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
                  >
                    {isPlaying ? (
                      <>
                        <Pause size={15} />
                        <span>Pause</span>
                      </>
                    ) : (
                      <>
                        <Play size={15} className="fill-current ml-0.5" />
                        <span>Listen</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Speed Options: 0.5×, 0.75×, 1×, 1.25×, 1.5×, 2× */}
                <div className="flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-xl text-xs">
                  <span className="text-[11px] font-semibold text-slate-400 px-1.5 hidden sm:inline">Speed:</span>
                  {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => setPlaybackSpeed(rate)}
                      className={`px-2 py-1 rounded-lg text-xs font-bold transition ${
                        playbackSpeed === rate
                          ? 'bg-[#006241] text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {rate}×
                    </button>
                  ))}
                </div>

                {/* Volume & Mute */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onToggleMute}
                    className="p-1.5 text-slate-500 hover:text-slate-800"
                    aria-label={isMuted ? 'Unmute volume' : 'Mute volume'}
                  >
                    {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => onVolumeChange && onVolumeChange(parseFloat(e.target.value))}
                    className="w-18 h-1.5 bg-slate-200 rounded-full accent-[#006241] cursor-pointer"
                    aria-label="Volume level"
                  />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Collapsible "More options" for advanced users */}
        <div className="border-t border-slate-100 pt-3">
          <button
            type="button"
            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1.5"
          >
            <SlidersHorizontal size={13} />
            <span>{showAdvancedOptions ? 'Hide options ▲' : 'More options (Audio format & quality) ▼'}</span>
          </button>

          {showAdvancedOptions && (
            <div className="mt-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
              <div className="flex flex-wrap items-center gap-4">
                <div>
                  <span className="font-semibold text-slate-700 block mb-1">Download Format:</span>
                  <div className="flex gap-1.5">
                    {(['wav', 'mp3', 'aac'] as const).map((fmt) => (
                      <button
                        key={fmt}
                        type="button"
                        onClick={() => setAudioFormat(fmt)}
                        className={`px-3 py-1 rounded-lg uppercase font-bold text-xs ${
                          audioFormat === fmt
                            ? 'bg-[#006241] text-white shadow-2xs'
                            : 'bg-white border border-slate-200 text-slate-600'
                        }`}
                      >
                        {fmt}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="font-semibold text-slate-700 block mb-1">Acoustic Quality:</span>
                  <div className="flex gap-1.5">
                    {(['standard', 'hd'] as const).map((ql) => (
                      <button
                        key={ql}
                        type="button"
                        onClick={() => setAudioQuality(ql)}
                        className={`px-3 py-1 rounded-lg uppercase font-bold text-xs ${
                          audioQuality === ql
                            ? 'bg-[#006241] text-white shadow-2xs'
                            : 'bg-white border border-slate-200 text-slate-600'
                        }`}
                      >
                        {ql === 'hd' ? 'HD (Lossless)' : 'Standard'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
