import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Trash2,
  Plus,
  Check,
  X
} from 'lucide-react';
import { LanguageCode, Voice, HistoryItem } from '../types';
import {
  getSavedPronunciations,
  savePronunciationRule,
  deletePronunciationRule,
  applyPronunciationRules,
  PronunciationRule
} from '../utils/geezPhonetics';
import TextToSpeechStudio from '../components/TextToSpeechStudio';

export interface StudioPageProps {
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
  saveCategory: string;
  setSaveCategory: (cat: string) => void;
  selectedEngine: 'addis' | 'gemini' | 'browser';
  setSelectedEngine: (eng: 'addis' | 'gemini' | 'browser') => void;
  onGenerateSpeech: () => void;
  isGenerating: boolean;
  onNormalizePronunciation: () => void;
  isNormalizing: boolean;
  normalizationLog: string;
  onTranslateAndInject: (text: string, from: LanguageCode, to: LanguageCode) => void;
  isTranslating: boolean;
  isPremium: boolean;
  onOpenUpgradeModal: () => void;
  accessibilityMode: boolean;
  triggerToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onPreviewVoice: (voice: Voice) => void;
  activePreviewVoiceId: string | null;
  isPlayingPreview: boolean;
  currentTrack?: HistoryItem | null;
  onOpenDownloadModal?: (track?: HistoryItem | null) => void;
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
}

export default function StudioPage({
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
  saveCategory,
  setSaveCategory,
  selectedEngine,
  setSelectedEngine,
  onGenerateSpeech,
  isGenerating,
  onNormalizePronunciation,
  isNormalizing,
  normalizationLog,
  onTranslateAndInject,
  isTranslating,
  isPremium,
  onOpenUpgradeModal,
  accessibilityMode,
  triggerToast,
  onPreviewVoice,
  activePreviewVoiceId,
  isPlayingPreview,
  currentTrack,
  onOpenDownloadModal,
  isPlaying = false,
  currentTime = 0,
  duration = 0,
  volume = 0.85,
  isMuted = false,
  onTogglePlayPause,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onReplay
}: StudioPageProps) {
  // Pronunciation Tools Modal
  const [showPronunciationModal, setShowPronunciationModal] = useState(false);
  const [pronunciationRules, setPronunciationRules] = useState<PronunciationRule[]>([]);
  const [newOrigWord, setNewOrigWord] = useState('');
  const [newPronunWord, setNewPronunWord] = useState('');

  // Load custom pronunciation rules from local storage
  useEffect(() => {
    try {
      const saved = getSavedPronunciations();
      setPronunciationRules(saved);
    } catch {
      // Fallback
    }
  }, []);

  const handleAddPronunciationRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrigWord.trim() || !newPronunWord.trim()) {
      triggerToast('Please provide both original word and phonetic spelling', 'error');
      return;
    }
    const updated = savePronunciationRule({
      original: newOrigWord.trim(),
      replacement: newPronunWord.trim(),
      language: selectedLanguage,
      enabled: true
    });
    setPronunciationRules(updated);
    setNewOrigWord('');
    setNewPronunWord('');
    triggerToast('Added custom pronunciation rule', 'success');
  };

  const handleDeleteRule = (id: string) => {
    const updated = deletePronunciationRule(id);
    setPronunciationRules(updated);
    triggerToast('Pronunciation rule removed', 'info');
  };

  const handleApplyRulesToText = () => {
    const transformed = applyPronunciationRules(inputText, pronunciationRules);
    if (transformed !== inputText) {
      setInputText(transformed);
      triggerToast('Applied pronunciation corrections to text', 'success');
    } else {
      triggerToast('No matching words found in current text', 'info');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Studio Page Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#006241]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#006241]">
            Speech Studio
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Text to Speech Studio
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Choose Language → Enter Text → Choose a Voice → Generate Speech → Listen & Download
        </p>
      </div>

      {/* Main Clean & Compact Studio */}
      <TextToSpeechStudio
        inputText={inputText}
        setInputText={setInputText}
        selectedLanguage={selectedLanguage}
        setSelectedLanguage={setSelectedLanguage}
        selectedVoiceId={selectedVoiceId}
        setSelectedVoiceId={setSelectedVoiceId}
        playbackSpeed={playbackSpeed}
        setPlaybackSpeed={setPlaybackSpeed}
        audioFormat={audioFormat}
        setAudioFormat={setAudioFormat}
        audioQuality={audioQuality}
        setAudioQuality={setAudioQuality}
        onGenerateSpeech={onGenerateSpeech}
        isGenerating={isGenerating}
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        isMuted={isMuted}
        onTogglePlayPause={onTogglePlayPause}
        onSeek={onSeek}
        onVolumeChange={onVolumeChange}
        onToggleMute={onToggleMute}
        onReplay={onReplay}
        onPreviewVoice={onPreviewVoice}
        activePreviewVoiceId={activePreviewVoiceId}
        isPlayingPreview={isPlayingPreview}
        onOpenDownloadModal={onOpenDownloadModal}
        conversionsLeft={20}
        isPremium={isPremium}
        onOpenUpgradeModal={onOpenUpgradeModal}
        triggerToast={triggerToast}
        onNormalizePronunciation={onNormalizePronunciation}
        isNormalizing={isNormalizing}
        normalizationLog={normalizationLog}
        onTranslateAndInject={onTranslateAndInject}
        isTranslating={isTranslating}
        saveCategory={saveCategory}
        setSaveCategory={setSaveCategory}
        selectedEngine={selectedEngine}
        setSelectedEngine={setSelectedEngine}
        accessibilityMode={accessibilityMode}
        onOpenPronunciationModal={() => setShowPronunciationModal(true)}
      />

      {/* Optional Pronunciation Tools Modal */}
      {showPronunciationModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pronunciation-modal-title"
        >
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-[#006241] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={18} />
                <h3 id="pronunciation-modal-title" className="font-bold text-base">
                  Custom Pronunciation Rules
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPronunciationModal(false)}
                className="text-white/80 hover:text-white transition"
                aria-label="Close pronunciation modal"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs flex-1 text-slate-700">
              <p className="text-slate-600 leading-relaxed">
                Add custom pronunciation substitutions for specific names, places, or dialect spellings.
              </p>

              {/* Add Custom Pronunciation Rule Form */}
              <form onSubmit={handleAddPronunciationRule} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <h4 className="font-bold text-slate-800 text-xs">Add New Word Rule</h4>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Original Word / Script:
                  </label>
                  <input
                    type="text"
                    value={newOrigWord}
                    onChange={(e) => setNewOrigWord(e.target.value)}
                    placeholder="e.g. ኢትዮጵያ"
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#006241]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Custom Pronunciation / Phonetic Spelling:
                  </label>
                  <input
                    type="text"
                    value={newPronunWord}
                    onChange={(e) => setNewPronunWord(e.target.value)}
                    placeholder="e.g. ኢት-ዮ-ጵ-ያ"
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#006241]"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#006241] hover:bg-[#004d33] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-xs"
                  >
                    <Plus size={13} />
                    <span>Save Rule</span>
                  </button>
                </div>
              </form>

              {/* List of active rules */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-800 text-xs">
                    Saved Rules ({pronunciationRules.length})
                  </h4>
                  {pronunciationRules.length > 0 && (
                    <button
                      type="button"
                      onClick={handleApplyRulesToText}
                      className="text-[#006241] hover:underline font-bold text-xs"
                    >
                      Apply All to Current Text
                    </button>
                  )}
                </div>

                {pronunciationRules.length === 0 ? (
                  <p className="text-slate-400 italic text-center py-4 bg-slate-50 rounded-xl">
                    No custom pronunciation rules saved yet.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {pronunciationRules.map((rule) => (
                      <div
                        key={rule.id}
                        className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-2 shadow-2xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">{rule.original}</span>
                          <span className="text-slate-400">➙</span>
                          <span className="text-[#006241] font-semibold">{rule.replacement}</span>
                          <span className="text-[10px] text-slate-400 uppercase font-mono">({rule.language})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteRule(rule.id)}
                          className="p-1 text-slate-400 hover:text-red-600 transition"
                          title="Delete rule"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowPronunciationModal(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
