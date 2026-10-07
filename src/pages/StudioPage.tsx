import React, { useState, useEffect } from 'react';
import {
  Volume2,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Undo,
  Redo,
  Globe,
  SlidersHorizontal,
  BookOpen,
  Check,
  AlertCircle,
  Download,
  Copy,
  Trash2,
  Plus,
  VolumeX,
  Languages,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Settings2,
  HelpCircle,
  FileAudio
} from 'lucide-react';
import { LanguageCode, Voice, PresetTemplate, HistoryItem } from '../types';
import { LANGUAGES, VOICES, PRESETS } from '../data';
import {
  getSavedPronunciations,
  savePronunciationRule,
  deletePronunciationRule,
  applyPronunciationRules,
  PronunciationRule
} from '../utils/geezPhonetics';

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
  // Live player controls synced with dock
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
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);

  // Auxiliary feature drawers
  const [showTranslator, setShowTranslator] = useState(false);
  const [translateFrom, setTranslateFrom] = useState<LanguageCode>('en');
  const [translateTo, setTranslateTo] = useState<LanguageCode>('am');
  const [translationText, setTranslationText] = useState('');

  // Pronunciation Tools Modal
  const [showPronunciationModal, setShowPronunciationModal] = useState(false);
  const [pronunciationRules, setPronunciationRules] = useState<PronunciationRule[]>([]);
  const [newOrigWord, setNewOrigWord] = useState('');
  const [newCustomPronounce, setNewCustomPronounce] = useState('');

  // Advanced settings accordion
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  // Load custom pronunciations on mount
  useEffect(() => {
    setPronunciationRules(getSavedPronunciations());
  }, []);

  const updateText = (newVal: string) => {
    setUndoStack((prev) => [...prev.slice(-25), inputText]);
    setRedoStack([]);
    setInputText(newVal);
  };

  const handleUndo = () => {
    if (undoStack.length > 0) {
      const prev = undoStack[undoStack.length - 1];
      setRedoStack((r) => [...r, inputText]);
      setInputText(prev);
      setUndoStack((u) => u.slice(0, -1));
    }
  };

  const handleRedo = () => {
    if (redoStack.length > 0) {
      const next = redoStack[redoStack.length - 1];
      setUndoStack((u) => [...u, inputText]);
      setInputText(next);
      setRedoStack((r) => r.slice(0, -1));
    }
  };

  // Step 1: Language selection with context-aware sample preservation
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
      updateText(currentLangObj.sampleText);
    }
  };

  const handleLoadPreset = (preset: PresetTemplate) => {
    updateText(preset.text);
    handleLanguageChange(preset.language);
    triggerToast(`Loaded "${preset.title}"`, 'success');
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        updateText(text);
        triggerToast('Pasted text from clipboard', 'info');
      }
    } catch {
      const manual = prompt('Paste your text here:');
      if (manual) {
        updateText(manual);
      }
    }
  };

  const handleInsertSample = () => {
    const activeVoice = VOICES.find((v) => v.id === selectedVoiceId);
    const langObj = LANGUAGES.find((l) => l.code === selectedLanguage);
    const sample = activeVoice?.sampleText || langObj?.sampleText || '';
    if (sample) {
      updateText(sample);
      triggerToast(`Loaded sample text for ${activeVoice?.name || langObj?.name}`, 'info');
    }
  };

  // Pronunciation rules management
  const handleAddPronunciationRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrigWord.trim() || !newCustomPronounce.trim()) {
      triggerToast('Please provide both original word and custom pronunciation', 'error');
      return;
    }
    const updated = savePronunciationRule({
      original: newOrigWord.trim(),
      replacement: newCustomPronounce.trim(),
      language: selectedLanguage,
      enabled: true
    });
    setPronunciationRules(updated);
    setNewOrigWord('');
    setNewCustomPronounce('');
    triggerToast('Custom pronunciation rule saved!', 'success');
  };

  const handleToggleRule = (id: string, currentEnabled: boolean) => {
    const target = pronunciationRules.find((r) => r.id === id);
    if (!target) return;
    const updated = savePronunciationRule({ ...target, enabled: !currentEnabled });
    setPronunciationRules(updated);
  };

  const handleDeleteRule = (id: string) => {
    const updated = deletePronunciationRule(id);
    setPronunciationRules(updated);
    triggerToast('Pronunciation rule removed', 'info');
  };

  const handleApplyRulesToText = () => {
    const transformed = applyPronunciationRules(inputText, pronunciationRules);
    if (transformed !== inputText) {
      updateText(transformed);
      triggerToast('Applied pronunciation corrections to text', 'success');
    } else {
      triggerToast('No matching words found in current text', 'info');
    }
  };

  // Format time mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const activeVoiceObj = VOICES.find((v) => v.id === selectedVoiceId) || VOICES[0];
  const voicesForLang = VOICES.filter((v) => v.language === selectedLanguage);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Studio Header & Workflow Guide */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#006241]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#006241]">
              Primary Speech Studio
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Ethiopian Speech Synthesis Studio
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Choose language → Enter text → Choose voice → Generate speech → Listen & Download.
          </p>
        </div>

        {/* Quick Language Badges */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200/80 self-start md:self-auto">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => handleLanguageChange(l.code)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                selectedLanguage === l.code
                  ? 'bg-white text-[#006241] shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>{l.flag}</span>
              <span>{l.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* STEP 1: LANGUAGE SELECTION */}
      <section aria-labelledby="step-1-title" className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#006241] text-white flex items-center justify-center text-xs font-bold">
              1
            </span>
            <h2 id="step-1-title" className="text-sm sm:text-base font-bold text-slate-900">
              Choose Language
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            Active: <strong className="text-slate-800">{LANGUAGES.find((l) => l.code === selectedLanguage)?.name}</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {LANGUAGES.map((lang) => {
            const isSelected = selectedLanguage === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`p-4 rounded-2xl border-2 text-left transition relative flex flex-col justify-between min-h-[92px] ${
                  isSelected
                    ? 'border-[#006241] bg-emerald-50/50 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl" role="img" aria-label={lang.name}>
                    {lang.flag}
                  </span>
                  {isSelected && (
                    <span className="w-5 h-5 rounded-full bg-[#006241] text-white flex items-center justify-center text-[10px]">
                      ✓
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 leading-tight">
                    {lang.nativeName}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">{lang.name}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* STEP 2: TEXT INPUT EDITOR */}
      <section aria-labelledby="step-2-title" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#006241] text-white flex items-center justify-center text-xs font-bold">
              2
            </span>
            <h2 id="step-2-title" className="text-sm sm:text-base font-bold text-slate-900">
              Enter or Paste Text
            </h2>
          </div>

          {/* Quick editor actions */}
          <div className="flex items-center gap-1.5 flex-wrap text-xs">
            <button
              type="button"
              onClick={handlePasteClipboard}
              className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl transition"
            >
              Paste
            </button>
            <button
              type="button"
              onClick={() => updateText('')}
              className="px-2.5 py-1.5 bg-white border border-slate-200 hover:text-red-600 font-semibold rounded-xl text-slate-600 transition"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleInsertSample}
              className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-emerald-50 hover:border-emerald-300 font-semibold rounded-xl text-[#006241] transition flex items-center gap-1"
            >
              <BookOpen size={13} />
              <span>Sample Text</span>
            </button>
            <button
              type="button"
              onClick={() => setShowPronunciationModal(true)}
              className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#006241] border border-emerald-200 font-bold rounded-xl transition flex items-center gap-1.5"
            >
              <Sparkles size={13} />
              <span>Pronunciation & Prosody</span>
            </button>
          </div>
        </div>

        {/* Text Area Card */}
        <div className="bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden flex flex-col focus-within:border-[#006241] focus-within:ring-2 focus-within:ring-[#006241]/10 transition">
          {/* Sub Toolbar for Undo / Redo */}
          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleUndo}
                disabled={undoStack.length === 0}
                className="p-1 hover:bg-white rounded border border-transparent hover:border-slate-200 disabled:opacity-30"
                title="Undo"
                aria-label="Undo text change"
              >
                <Undo size={14} />
              </button>
              <button
                type="button"
                onClick={handleRedo}
                disabled={redoStack.length === 0}
                className="p-1 hover:bg-white rounded border border-transparent hover:border-slate-200 disabled:opacity-30"
                title="Redo"
                aria-label="Redo text change"
              >
                <Redo size={14} />
              </button>
              <span className="text-[11px] text-slate-400">
                Supports Ge'ez Fidel & Qubee scripts
              </span>
            </div>

            <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
              {selectedLanguage === 'am'
                ? 'Amharic (ግዕዝ)'
                : selectedLanguage === 'ti'
                ? 'Tigrinya (ትግርኛ)'
                : selectedLanguage === 'om'
                ? 'Afaan Oromoo (Qubee)'
                : 'English (Latin)'}
            </span>
          </div>

          {/* Text Area */}
          <textarea
            value={inputText}
            onChange={(e) => updateText(e.target.value)}
            rows={5}
            placeholder={
              selectedLanguage === 'am'
                ? 'የሚፈልጉትን ጽሁፍ እዚህ ይጻፉ ወይም ይለጥፉ...'
                : selectedLanguage === 'ti'
                ? 'ዝደለይዎ ጽሑፍ ኣብዚ ጸሓፉ ወይ ለጥፉ...'
                : selectedLanguage === 'om'
                ? 'Barreeffama keessan asitti barreessaa ykn koppii godhaa...'
                : 'Type or paste English or multilingual text here to synthesize...'
            }
            className={`w-full p-4 sm:p-5 text-slate-800 leading-relaxed border-0 bg-transparent resize-y min-h-[140px] focus:outline-none placeholder:text-slate-400 break-words whitespace-pre-wrap ${
              accessibilityMode ? 'text-xl font-bold' : 'text-base font-normal'
            }`}
          />

          {/* Counter Status Bar */}
          <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <span>
                <strong className="text-slate-700 font-mono">{inputText.length}</strong> Characters
              </span>
              <span>
                <strong className="text-slate-700 font-mono">
                  {inputText.split(/\s+/).filter(Boolean).length}
                </strong> Words
              </span>
            </div>

            <button
              type="button"
              onClick={onNormalizePronunciation}
              disabled={isNormalizing || !inputText.trim()}
              className="text-[#006241] hover:underline font-semibold flex items-center gap-1 disabled:opacity-40"
            >
              <Sparkles size={12} />
              <span>{isNormalizing ? 'Optimizing prosody...' : 'Optimize Punctuation'}</span>
            </button>
          </div>
        </div>

        {/* Normalization explanation toast if present */}
        {normalizationLog && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-2.5">
            <Sparkles size={15} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">Linguistic Normalization Applied: </strong>
              <span>{normalizationLog}</span>
            </div>
          </div>
        )}

        {/* Collapsible Cross-Language Translation Bar */}
        <div className="bg-slate-50/60 border border-slate-200/80 rounded-2xl p-3.5 text-xs">
          <div
            className="flex items-center justify-between cursor-pointer select-none"
            onClick={() => setShowTranslator(!showTranslator)}
          >
            <div className="flex items-center gap-2">
              <Globe size={15} className="text-[#006241]" />
              <span className="font-bold text-slate-800">Cross-Language Audio Translation</span>
              <span className="text-[11px] text-slate-500 hidden sm:inline">
                (Translate between Amharic, Tigrinya, Oromo, and English)
              </span>
            </div>
            <span className="font-bold text-[#006241]">
              {showTranslator ? 'Close ▲' : 'Open Translator ▼'}
            </span>
          </div>

          {showTranslator && (
            <div className="mt-3 pt-3 border-t border-slate-200 space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-slate-600 font-semibold">Direction:</span>
                <select
                  value={translateFrom}
                  onChange={(e) => setTranslateFrom(e.target.value as LanguageCode)}
                  className="p-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                >
                  <option value="en">English</option>
                  <option value="am">Amharic (አማርኛ)</option>
                  <option value="om">Afaan Oromoo</option>
                  <option value="ti">Tigrinya (ትግርኛ)</option>
                </select>
                <span className="text-slate-400 font-mono">➙</span>
                <select
                  value={translateTo}
                  onChange={(e) => setTranslateTo(e.target.value as LanguageCode)}
                  className="p-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                >
                  <option value="am">Amharic (አማርኛ)</option>
                  <option value="en">English</option>
                  <option value="om">Afaan Oromoo</option>
                  <option value="ti">Tigrinya (ትግርኛ)</option>
                </select>
              </div>

              <textarea
                rows={2}
                value={translationText}
                onChange={(e) => setTranslationText(e.target.value)}
                placeholder="Type text in source language to translate..."
                className="w-full text-xs p-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#006241]"
              />

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (!translationText.trim()) return;
                    onTranslateAndInject(translationText, translateFrom, translateTo);
                    setShowTranslator(false);
                    setTranslationText('');
                  }}
                  disabled={isTranslating || !translationText.trim()}
                  className="px-4 py-2 bg-[#006241] hover:bg-[#004d33] text-white text-xs font-bold rounded-xl shadow-xs transition disabled:opacity-50"
                >
                  {isTranslating ? 'Translating via AI...' : 'Translate & Send to Editor'}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* STEP 3: CHOOSE VOICE */}
      <section aria-labelledby="step-3-title" className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#006241] text-white flex items-center justify-center text-xs font-bold">
              3
            </span>
            <h2 id="step-3-title" className="text-sm sm:text-base font-bold text-slate-900">
              Choose Voice Persona
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {voicesForLang.length} Authentic Voices Available
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {voicesForLang.map((voice) => {
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
                        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                          <span>{voice.name}</span>
                          <span className="text-slate-400 text-xs font-normal">
                            ({voice.nativeName})
                          </span>
                        </h3>
                        {/* Clear metadata format per prompt: Language · Gender · Region */}
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                          {langName} · <span className="capitalize">{voice.gender}</span> · {voice.region || voice.accent}
                        </p>
                      </div>
                    </div>

                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-[#006241] text-white flex items-center justify-center text-[10px] shrink-0">
                        ✓
                      </span>
                    )}
                  </div>

                  {/* Short Description */}
                  <p className="text-xs text-slate-600 line-clamp-2 mt-2.5 leading-snug">
                    {voice.description}
                  </p>
                </div>

                {/* Card Footer: Obvious Preview Button & Sample Insert */}
                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateText(voice.sampleText);
                      triggerToast(`Loaded sample for ${voice.name}`, 'info');
                    }}
                    className="text-[11px] text-slate-500 hover:text-[#006241] font-semibold"
                  >
                    Use Sample Phrase
                  </button>

                  {/* Obvious Preview Button */}
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
      </section>

      {/* STEP 4: GENERATE BUTTON */}
      <section aria-labelledby="step-4-title" className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-[#006241] text-white flex items-center justify-center text-xs font-bold">
            4
          </span>
          <h2 id="step-4-title" className="text-sm sm:text-base font-bold text-slate-900">
            Generate Speech
          </h2>
        </div>

        {/* Primary Call to Action */}
        <button
          type="button"
          onClick={onGenerateSpeech}
          disabled={isGenerating || !inputText.trim()}
          className="w-full py-4 sm:py-5 px-6 bg-[#006241] hover:bg-[#004d33] text-white rounded-2xl font-bold text-base sm:text-lg shadow-lg shadow-emerald-950/15 flex items-center justify-center gap-3 transition transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isGenerating ? (
            <>
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Generating Speech (Authentic {LANGUAGES.find((l) => l.code === selectedLanguage)?.name})...</span>
            </>
          ) : (
            <>
              <Volume2 size={22} />
              <span>Generate Speech</span>
            </>
          )}
        </button>

        {isGenerating && (
          <p className="text-center text-xs text-slate-500 font-medium animate-pulse">
            Neural synthesis in progress. Please wait a moment while we produce natural Ethiopian prosody...
          </p>
        )}
      </section>

      {/* STEP 5: INLINE GENERATED AUDIO PLAYER */}
      {currentTrack && (
        <section aria-labelledby="player-title" className="space-y-3">
          <div className="bg-white border-2 border-emerald-500/80 rounded-3xl p-5 sm:p-6 shadow-md space-y-4">
            {/* Header: ✓ Speech generated */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-emerald-100 text-[#006241] flex items-center justify-center font-bold text-sm">
                  ✓
                </span>
                <div>
                  <h3 id="player-title" className="text-sm sm:text-base font-extrabold text-[#006241]">
                    Speech Generated
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {currentTrack.voiceName} · {LANGUAGES.find((l) => l.code === currentTrack.language)?.name || currentTrack.language}
                  </p>
                </div>
              </div>

              {/* Actions: Regenerate & Download */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onGenerateSpeech}
                  disabled={isGenerating}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition flex items-center gap-1.5"
                >
                  <RotateCcw size={12} />
                  <span>Regenerate</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenDownloadModal && onOpenDownloadModal(currentTrack)}
                  className="px-4 py-1.5 bg-[#006241] hover:bg-[#004d33] text-white font-bold rounded-xl text-xs shadow-xs transition flex items-center gap-1.5"
                >
                  <Download size={13} />
                  <span>Download Audio</span>
                </button>
              </div>
            </div>

            {/* Spoken Text Preview */}
            <p className="text-xs sm:text-sm text-slate-700 italic font-serif bg-slate-50 p-3 rounded-xl border border-slate-100 line-clamp-2">
              "{currentTrack.text}"
            </p>

            {/* Audio Timeline & Scrubber */}
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
                className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-[#006241]"
                aria-label="Audio playback seek scrubber"
              />
            </div>

            {/* Player Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
              {/* Play / Pause / Replay buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onReplay}
                  className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition"
                  title="Replay from beginning"
                  aria-label="Replay audio"
                >
                  <RotateCcw size={15} />
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

              {/* Speed Buttons */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
                <span className="text-[11px] font-semibold text-slate-500 px-1.5">Speed:</span>
                {[0.75, 1.0, 1.25, 1.5, 2.0].map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => setPlaybackSpeed(rate)}
                    className={`px-2 py-1 rounded-lg text-xs font-bold transition ${
                      playbackSpeed === rate
                        ? 'bg-white text-[#006241] shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>

              {/* Volume & Mute */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onToggleMute}
                  className="p-1.5 text-slate-500 hover:text-slate-800"
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
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
                  className="w-20 h-1.5 bg-slate-200 rounded-full accent-[#006241] cursor-pointer"
                  aria-label="Volume slider"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* COLLAPSIBLE ADVANCED SETTINGS (Technical Details Hidden Away from Primary Path) */}
      <section className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
        <button
          type="button"
          onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
          className="w-full flex items-center justify-between text-xs font-bold text-slate-700 hover:text-slate-900"
        >
          <div className="flex items-center gap-2">
            <Settings2 size={15} className="text-[#006241]" />
            <span>Advanced Audio Settings & Export Preferences</span>
          </div>
          <span className="text-[#006241]">{showAdvancedSettings ? 'Hide ▲' : 'Show ▼'}</span>
        </button>

        {showAdvancedSettings && (
          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {/* Preferred Format */}
            <div>
              <label className="font-bold text-slate-700 block mb-1.5">Default Export Format</label>
              <div className="flex gap-1.5">
                {(['wav', 'mp3', 'aac'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setAudioFormat(fmt)}
                    className={`flex-1 py-1.5 rounded-xl font-mono uppercase font-bold text-xs transition border ${
                      audioFormat === fmt
                        ? 'bg-[#006241] text-white border-[#006241]'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-white'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>

            {/* Quality */}
            <div>
              <label className="font-bold text-slate-700 block mb-1.5">Acoustic Bitrate Quality</label>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setAudioQuality('standard')}
                  className={`flex-1 py-1.5 rounded-xl font-bold text-xs transition border ${
                    audioQuality === 'standard'
                      ? 'bg-[#006241] text-white border-[#006241]'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-white'
                  }`}
                >
                  Standard (24kHz)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!isPremium) onOpenUpgradeModal();
                    else setAudioQuality('hd');
                  }}
                  className={`flex-1 py-1.5 rounded-xl font-bold text-xs transition border ${
                    audioQuality === 'hd'
                      ? 'bg-amber-500 text-white border-amber-500'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-white'
                  }`}
                >
                  HD Master (48kHz)
                </button>
              </div>
            </div>

            {/* Save Classification Category */}
            <div>
              <label className="font-bold text-slate-700 block mb-1.5">Save Category</label>
              <select
                value={saveCategory}
                onChange={(e) => setSaveCategory(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none"
              >
                <option value="Personal">Personal</option>
                <option value="School">School / Homework</option>
                <option value="Work">Work / Lessons</option>
                <option value="Religion">Religion / Liturgical</option>
                <option value="Stories">Cultural Stories / Proverbs</option>
              </select>
            </div>
          </div>
        )}
      </section>

      {/* QUICK PRESET TEMPLATES */}
      <section className="bg-slate-50 border border-slate-200 rounded-3xl p-5 sm:p-6 space-y-3">
        <div className="flex items-center gap-2">
          <BookOpen size={16} className="text-[#006241]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Quick-Load Ethiopian Literature & Proverbs
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handleLoadPreset(p)}
              className="p-3 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 rounded-xl text-left transition flex flex-col justify-between"
            >
              <span className="font-bold text-slate-800 line-clamp-1">{p.title}</span>
              <span className="text-[10px] text-[#006241] font-semibold mt-1">
                {p.category} · {p.language.toUpperCase()}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* PRONUNCIATION TOOLS MODAL / DIALOG */}
      {showPronunciationModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pronunciation-modal-title"
        >
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-[#006241] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={18} />
                <h3 id="pronunciation-modal-title" className="font-bold text-base">
                  Pronunciation & Prosody Studio
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPronunciationModal(false)}
                className="text-white/80 hover:text-white text-lg font-bold"
                aria-label="Close pronunciation modal"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-xs flex-1">
              <div>
                <p className="text-slate-600 leading-relaxed">
                  Correct specific words or names to ensure accurate pronunciation across all regional Ethiopian dialects.
                </p>
              </div>

              {/* Add Custom Pronunciation Rule */}
              <form onSubmit={handleAddPronunciationRule} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <h4 className="font-bold text-slate-800 text-xs">Add Custom Pronunciation</h4>

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
                    value={newCustomPronounce}
                    onChange={(e) => setNewCustomPronounce(e.target.value)}
                    placeholder="e.g. Ityopp'ya"
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#006241]"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#006241] hover:bg-[#004d33] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition"
                  >
                    <Plus size={13} />
                    <span>Save Pronunciation</span>
                  </button>
                </div>
              </form>

              {/* Saved Rules List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-800 text-xs">Active Pronunciation Rules ({pronunciationRules.length})</h4>
                  {pronunciationRules.length > 0 && (
                    <button
                      type="button"
                      onClick={handleApplyRulesToText}
                      className="text-[#006241] hover:underline font-bold"
                    >
                      Apply All to Editor Text
                    </button>
                  )}
                </div>

                {pronunciationRules.length === 0 ? (
                  <p className="text-slate-400 italic py-2">No custom pronunciations defined yet.</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {pronunciationRules.map((rule) => (
                      <div
                        key={rule.id}
                        className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{rule.original}</span>
                            <span className="text-slate-400">➙</span>
                            <span className="text-[#006241] font-medium">{rule.replacement}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleToggleRule(rule.id, rule.enabled)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              rule.enabled
                                ? 'bg-emerald-100 text-[#006241]'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {rule.enabled ? 'Active' : 'Paused'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteRule(rule.id)}
                            className="p-1 text-slate-400 hover:text-red-600 rounded"
                            title="Delete rule"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowPronunciationModal(false)}
                className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs transition"
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
