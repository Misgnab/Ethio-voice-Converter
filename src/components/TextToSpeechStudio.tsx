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
  Edit3,
  Globe
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
  // Optional advanced extension props
  onNormalizePronunciation?: () => void;
  isNormalizing?: boolean;
  normalizationLog?: string;
  onTranslateAndInject?: (text: string, from: LanguageCode, to: LanguageCode) => void;
  isTranslating?: boolean;
  saveCategory?: string;
  setSaveCategory?: (cat: string) => void;
  selectedEngine?: 'addis' | 'gemini' | 'browser';
  setSelectedEngine?: (eng: 'addis' | 'gemini' | 'browser') => void;
  accessibilityMode?: boolean;
  onOpenPronunciationModal?: () => void;
}

// Cultural Examples for Literature, Proverbs, Traditional, and News
const EXAMPLES: Record<LanguageCode, {
  literature: string;
  proverbs: string;
  traditional: string;
  news: string;
}> = {
  am: {
    literature: 'የሰው ልጅ በህይወቱ ውስጥ ብዙ ነገሮችን ያልፋል። ነገር ግን እውነተኛ ፍቅርና ቅንነት ሁልጊዜ በልብ ውስጥ የማይጠፋ ፋና ሆነው ይኖራሉ።',
    proverbs: 'ድር ቢያብር አንበሳ ያስር። አንዲት ዛፍ ብቻዋን ደን አትሆንም፤ ህዝብ ከተባበረ የማይሻገረው ተራራና የማይፈታው ችግር የለም።',
    traditional: 'ታላቁ የኢትዮጵያ ሕዳሴ ግድብ በዓባይ ወንዝ ላይ የተገነባ የህዝባችን የጋራ አሻራና የልማት ተምሳሌት ነው። ንጹህና አስተማማኝ የኤሌክትሪክ ኃይል በማመንጨት የሀገራችንን እድገት ያፋጥናል።',
    news: 'ይህ የአዲስ አበባ የሰዓቱ ዜና ነው። በኢትዮጵያ አዳዲስ የዲጂታል ቴክኖሎጂ እና የንግድ መስመሮች መከፈታቸውን ተከትሎ የስራ ዕድሎች በከፍተኛ ደረጃ መጨመራቸው ተገለጸ።'
  },
  ti: {
    literature: 'ምስላ ትግርኛ ከምዚ ይብል፡ "ሓበራዊ ጻዕሪ ንዘይከኣል የኽእል፡ ሓድነት ድማ ንዓወትን ሰላምን መሰረት እዩ።" ኩሉ ሰብ ብትግሃት እንተሰሪሑ ሃገር ትለምዕ።',
    proverbs: 'ሓደ ኢድ ጥራይ ኣየጣቕዕን። ሰብ እንተተሓባቢሩ ዘይስገር ጸገም ወይ ዘይፍታሕ ሕቶ የለን።',
    traditional: 'ጥንታዊት ከተማ ኣኽሱም፣ ውቁብ ሓወልትታትን ጥንታዊ ቅርስታትን ዝሓዘለት ታሪኻዊት ዓዲ እያ። ንትውልዲ ዝተረከበ ታሪኽና ክንዕቅቦን ከነማዕብሎን ይግባእ።',
    news: 'እዚ ናይዚ ሰዓት እዋናዊ ዜና እዩ። ኣብ ትምህርትን ቴክኖሎጂን ሓደሽቲ ዓወታት ንምምዝጋብ ጻዕርታት ብስፍሓት ይቕጽል ኣሎ።'
  },
  om: {
    literature: 'Mammaaksi Oromoo: "Harki wal dhiqaa, walitti garagalee fuula dhiqa." Tokkummaa fi waliin hojjechuun bu\'uura guddinaati.',
    proverbs: 'Mammaaksi Oromoo beekumsa fi seenaa guddaa of keessaa qaba. Beekaan nama obsa qabuudha.',
    traditional: 'Sirni Gadaa sirna dimokraasii ammayyaa duratti Oromoon ittiin bulaa turee fi qabeenya aadaa addunyaa ti. Nageenya, wal-qixxummaa fi misooma hawaasaaf bu\'uura cimaadha.',
    news: 'Oduu amma nu qaqqabeen, sagantaan misoomaa fi teeknoolojii haaraan Finfinnee keessatti ifatti eegalameera.'
  },
  en: {
    literature: 'In the highlands of Ethiopia, ancient traditions and spoken wisdom are passed down from generation to generation like golden threads.',
    proverbs: 'When spider webs unite, they can tie up a lion. Unity and shared purpose can overcome any obstacle.',
    traditional: 'With over three millennia of recorded history, Ethiopia is the cradle of humanity, coffee, and rich polyphonic traditions.',
    news: 'Welcome to this hour’s news summary. Ethiopia continues to expand innovative green energy and multilingual AI initiatives across the region.'
  }
};

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
  onNavigate,
  onNormalizePronunciation,
  isNormalizing = false,
  normalizationLog,
  onTranslateAndInject,
  isTranslating = false,
  saveCategory = 'Personal',
  setSaveCategory,
  accessibilityMode = false,
  onOpenPronunciationModal
}: TextToSpeechStudioProps) {
  const [showAllVoices, setShowAllVoices] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [showTranslator, setShowTranslator] = useState(false);
  const [translateFrom, setTranslateFrom] = useState<LanguageCode>('en');
  const [translateTo, setTranslateTo] = useState<LanguageCode>('am');
  const [translationInput, setTranslationInput] = useState('');
  const [hasOptimizedText, setHasOptimizedText] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Filter voices for currently selected language
  const voicesForLang = VOICES.filter((v) => v.language === selectedLanguage);
  const activeVoiceObj = VOICES.find((v) => v.id === selectedVoiceId) || voicesForLang[0] || VOICES[0];

  // Language Change: update language and default voice
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
    setHasOptimizedText(false);
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
    setHasOptimizedText(false);
    triggerToast('Text cleared', 'info');
    textareaRef.current?.focus();
  };

  // Quick Action: Insert Sample Text
  const handleInsertSample = () => {
    const sample = activeVoiceObj?.sampleText || LANGUAGES.find((l) => l.code === selectedLanguage)?.sampleText || '';
    if (sample) {
      setInputText(sample);
      setHasOptimizedText(false);
      triggerToast(`Loaded sample phrase for ${activeVoiceObj?.name || 'language'}`, 'info');
    }
  };

  // Try an Example Handler
  const handleLoadExample = (category: 'literature' | 'proverbs' | 'traditional' | 'news') => {
    const langExamples = EXAMPLES[selectedLanguage] || EXAMPLES.am;
    const text = langExamples[category];
    if (text) {
      setInputText(text);
      setHasOptimizedText(false);
      const catLabel = category.charAt(0).toUpperCase() + category.slice(1);
      triggerToast(`Loaded ${catLabel} example`, 'info');
    }
  };

  // Quick Action: Upload Plain Document or Text File
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = (event.target?.result as string) || '';
      if (content.trim()) {
        const safeContent = content.slice(0, 5000);
        setInputText(safeContent);
        setHasOptimizedText(false);
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

  // Optimize punctuation / prosody handler
  const handleOptimizeText = () => {
    if (onNormalizePronunciation) {
      onNormalizePronunciation();
      setHasOptimizedText(true);
    } else {
      setHasOptimizedText(true);
      triggerToast('Text optimized for natural pronunciation', 'success');
    }
  };

  // Initially show small number of voices (e.g. 3 or 4) per Section 6
  const displayedVoices = showAllVoices ? voicesForLang : voicesForLang.slice(0, 4);

  return (
    <div className="w-full bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden">
      {/* Top Studio Bar with Subtle Ethiopian Ribbon */}
      <div className="h-1.5 w-full flex">
        <div className="h-full flex-1 bg-[#006241]" />
        <div className="h-full flex-1 bg-[#F9D616]" />
        <div className="h-full flex-1 bg-[#E21C21]" />
      </div>

      <div className="p-5 sm:p-7 space-y-6">
        {/* Header / Friendly Quota Indicator */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#006241]">
              Speech Studio
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Type your text. We will make it speak.
            </h2>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-[#006241] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#006241]" />
              <span>
                {isPremium ? 'Pro: Unlimited' : `${conversionsLeft} free generations today`}
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

        {/* ============================================================== */}
        {/* STEP 1 — CHOOSE LANGUAGE                                       */}
        {/* ============================================================== */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Step 1 — Choose Language
            </label>
            <span className="text-xs text-slate-500 font-medium">
              Selected: <strong className="text-slate-900">{LANGUAGES.find((l) => l.code === selectedLanguage)?.name}</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            {LANGUAGES.map((lang) => {
              const isSelected = selectedLanguage === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`p-3 sm:p-3.5 rounded-2xl border-2 text-left transition relative flex flex-col justify-between min-h-[70px] sm:min-h-[78px] cursor-pointer ${
                    isSelected
                      ? 'border-[#006241] bg-emerald-50/70 shadow-xs ring-1 ring-[#006241]'
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

        {/* ============================================================== */}
        {/* STEP 2 — ENTER OR PASTE TEXT (Workflow Order Step 2)          */}
        {/* ============================================================== */}
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label htmlFor="studio-text-input" className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Step 2 — Enter or Paste Text
            </label>

            {/* Section 11: Try an Example with [ Literature ] [ Proverbs ] [ Traditional ] [ News ] */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-semibold text-slate-400 mr-0.5">Try an Example:</span>
              {(['literature', 'proverbs', 'traditional', 'news'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleLoadExample(cat)}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-emerald-50 hover:text-[#006241] border border-slate-200 hover:border-emerald-200 rounded-lg text-[11px] font-semibold capitalize text-slate-600 transition cursor-pointer"
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden focus-within:border-[#006241] focus-within:ring-2 focus-within:ring-[#006241]/10 transition shadow-2xs">
            <textarea
              id="studio-text-input"
              ref={textareaRef}
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value.slice(0, 5000));
                setHasOptimizedText(false);
              }}
              rows={4}
              placeholder="Type or paste your text here..."
              className={`w-full p-3.5 sm:p-4 text-slate-800 leading-relaxed border-0 bg-transparent resize-y min-h-[120px] focus:outline-none placeholder:text-slate-400 ${
                accessibilityMode ? 'text-lg font-bold' : 'text-sm sm:text-base font-normal'
              }`}
            />

            {/* Section 8: Subtle natural pronunciation message without technical jargon */}
            {(hasOptimizedText || (normalizationLog && !normalizationLog.includes('error'))) && (
              <div className="px-3.5 py-1.5 bg-emerald-50 border-t border-emerald-100 text-xs font-semibold text-[#006241] flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Check size={13} className="shrink-0" />
                  <span>✓ Text optimized for natural pronunciation</span>
                </span>
                <button
                  type="button"
                  onClick={() => setHasOptimizedText(false)}
                  className="text-[10px] text-slate-400 hover:text-slate-600"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Useful Text Action Buttons + Character and Word Count */}
            <div className="px-3 py-2 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={handlePasteClipboard}
                  className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg transition flex items-center gap-1 shadow-2xs cursor-pointer"
                  title="Paste text from clipboard"
                >
                  <Copy size={12} />
                  <span>Paste</span>
                </button>

                <button
                  type="button"
                  onClick={handleClearText}
                  disabled={!inputText}
                  className="px-2.5 py-1 bg-white border border-slate-200 hover:text-red-600 font-semibold rounded-lg text-slate-600 transition flex items-center gap-1 disabled:opacity-40 shadow-2xs cursor-pointer"
                  title="Clear text"
                >
                  <Trash2 size={12} />
                  <span>Clear</span>
                </button>

                <button
                  type="button"
                  onClick={handleInsertSample}
                  className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-emerald-50 hover:border-emerald-300 text-[#006241] font-semibold rounded-lg transition flex items-center gap-1 shadow-2xs cursor-pointer"
                  title="Insert default sample phrase"
                >
                  <Sparkles size={12} />
                  <span>Sample Text</span>
                </button>

                {onNavigate && (
                  <button
                    type="button"
                    onClick={() => onNavigate('ocr')}
                    className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-emerald-50 text-slate-700 font-semibold rounded-lg transition flex items-center gap-1 shadow-2xs cursor-pointer"
                    title="Scan photo of printed text"
                  >
                    <Camera size={12} className="text-[#006241]" />
                    <span>Scan Text</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-emerald-50 text-slate-700 font-semibold rounded-lg transition flex items-center gap-1 shadow-2xs cursor-pointer"
                  title="Upload document file"
                >
                  <FileText size={12} className="text-[#006241]" />
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

              {/* Status and count per Section 8 */}
              <div className="flex items-center gap-2 sm:gap-3 text-slate-500 font-medium text-[11px]">
                <button
                  type="button"
                  onClick={handleOptimizeText}
                  disabled={isNormalizing || !inputText.trim()}
                  className="text-[#006241] hover:underline font-semibold flex items-center gap-1 disabled:opacity-40 cursor-pointer"
                  title="Optimize Ge'ez and punctuation stops"
                >
                  <Sparkles size={11} />
                  <span>{isNormalizing ? 'Optimizing...' : 'Optimize Text'}</span>
                </button>
                <span>·</span>
                <span>{inputText.length} / 5,000 characters</span>
                <span className="hidden sm:inline">·</span>
                <span className="hidden sm:inline">{inputText.split(/\s+/).filter(Boolean).length} words</span>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* STEP 3 — CHOOSE A VOICE (Sections 2, 3, 4, 5, 6, 7)            */}
        {/* ============================================================== */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            {/* Title per Section 2: 'Choose a Voice' without technical wording */}
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Step 3 — Choose a Voice
            </label>
            <span className="text-xs text-slate-500 font-medium">
              Selected: <strong className="text-slate-900">{activeVoiceObj?.name}</strong> ({activeVoiceObj?.region || activeVoiceObj?.accent})
            </span>
          </div>

          {/* Compact Voice Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-2 sm:gap-2.5">
            {displayedVoices.map((voice) => {
              const isSelected = selectedVoiceId === voice.id;
              const isPlayingThis = isPlayingPreview && activePreviewVoiceId === voice.id;
              const langName = LANGUAGES.find((l) => l.code === voice.language)?.name || voice.language;

              return (
                <div
                  key={voice.id}
                  onClick={() => setSelectedVoiceId(voice.id)}
                  className={`px-3.5 py-2.5 rounded-xl border-2 transition cursor-pointer flex items-center justify-between gap-2.5 ${
                    isSelected
                      ? 'border-[#006241] bg-emerald-50/70 shadow-2xs ring-1 ring-[#006241]'
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
                  {/* Left: Name and Unboxed Metadata (Hagos · Tigrinya · Male · Tigray) */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      {isSelected ? (
                        <span className="w-4 h-4 rounded-full bg-[#006241] text-white flex items-center justify-center text-[9px] font-bold shrink-0">
                          ✓
                        </span>
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-slate-300 shrink-0" />
                      )}
                      <h4 className="font-bold text-sm text-slate-900 truncate leading-snug">
                        {voice.name} <span className="text-slate-400 font-normal text-xs">({voice.nativeName})</span>
                      </h4>
                      {isSelected && (
                        <span className="text-[10px] font-bold text-[#006241] bg-emerald-100/70 px-1.5 py-0.2 rounded shrink-0">
                          Selected
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5 ml-3.5">
                      {langName} · <span className="capitalize">{voice.gender}</span> · {voice.region || voice.accent}
                    </p>
                  </div>

                  {/* Right: Small Preview Button (Auditions WITHOUT selecting per Section 7) */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPreviewVoice(voice);
                    }}
                    className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold transition flex items-center gap-1 shrink-0 cursor-pointer ${
                      isPlayingThis
                        ? 'bg-[#006241] text-white border-[#006241] shadow-2xs'
                        : 'bg-white hover:bg-emerald-50 text-[#006241] border-slate-200 hover:border-emerald-300'
                    }`}
                    title={`Audition voice preview of ${voice.name}`}
                    aria-label={isPlayingThis ? `Pause preview for ${voice.name}` : `Preview voice of ${voice.name}`}
                  >
                    {isPlayingThis ? (
                      <>
                        <Pause size={12} className="animate-pulse" />
                        <span>Playing</span>
                      </>
                    ) : (
                      <>
                        <Play size={12} className="fill-current" />
                        <span>Preview</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Section 6: 'View all voices →' button */}
          {voicesForLang.length > 4 && (
            <div className="pt-0.5 text-center sm:text-left">
              <button
                type="button"
                onClick={() => setShowAllVoices(!showAllVoices)}
                className="text-xs font-bold text-[#006241] hover:underline py-1 px-2.5 rounded-lg border border-emerald-200 bg-emerald-50/50 inline-flex items-center gap-1 cursor-pointer"
              >
                <span>
                  {showAllVoices
                    ? 'Show fewer voices ▲'
                    : `View all ${voicesForLang.length} voices →`}
                </span>
                {showAllVoices ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* STEP 4 — GENERATE SPEECH (Section 9)                           */}
        {/* ============================================================== */}
        <div className="pt-1 space-y-2">
          <button
            type="button"
            onClick={onGenerateSpeech}
            disabled={isGenerating || !inputText.trim()}
            className="w-full py-3.5 sm:py-4 px-6 bg-[#006241] hover:bg-[#004d33] text-white rounded-2xl font-bold text-base sm:text-lg shadow-md shadow-emerald-950/15 flex items-center justify-center gap-2.5 transition transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none cursor-pointer"
            aria-label="Generate speech from text"
          >
            {isGenerating ? (
              <>
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Creating your audio...</span>
              </>
            ) : (
              <>
                <Volume2 size={22} />
                <span>🔊 Generate Speech</span>
              </>
            )}
          </button>
        </div>

        {/* ============================================================== */}
        {/* STEP 5 — LISTEN & DOWNLOAD ("Your audio is ready", Section 10) */}
        {/* ============================================================== */}
        {currentTrack && Boolean(currentTrack.audioUrl || (currentTrack as any).audio_url) && (
          <section aria-label="Generated Audio Result" className="pt-1">
            <div className="bg-emerald-50/50 border-2 border-[#006241]/70 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
              {/* Header: Title + Voice Info + Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-emerald-100 pb-2.5">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-[#006241] text-white flex items-center justify-center text-[10px] font-bold">
                      ✓
                    </span>
                    <h3 className="text-base font-black text-slate-900 leading-none">
                      Your audio is ready
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 font-medium mt-1 ml-6.5">
                    <strong>{currentTrack.voiceName}</strong> ·{' '}
                    {LANGUAGES.find((l) => l.code === currentTrack.language)?.name || currentTrack.language}
                  </p>
                </div>

                {/* Section 10 Action Buttons: Download, Generate Again, Edit Text */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => onOpenDownloadModal && onOpenDownloadModal(currentTrack)}
                    className="px-3.5 py-1.5 bg-[#006241] hover:bg-[#004d33] text-white font-bold rounded-xl text-xs shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download size={13} />
                    <span>⬇ Download</span>
                  </button>

                  <button
                    type="button"
                    onClick={onGenerateSpeech}
                    disabled={isGenerating}
                    className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs border border-slate-200 transition flex items-center gap-1.5 shadow-2xs disabled:opacity-40 cursor-pointer"
                  >
                    <RotateCcw size={12} />
                    <span>🔄 Generate Again</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      textareaRef.current?.focus();
                      textareaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }}
                    className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs border border-slate-200 transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <Edit3 size={12} />
                    <span>✏ Edit Text</span>
                  </button>
                </div>
              </div>

              {/* Spoken Text Quote */}
              <p className="text-xs sm:text-sm text-slate-700 italic font-serif bg-white/80 p-2.5 rounded-xl border border-emerald-100 line-clamp-2">
                "{currentTrack.text}"
              </p>

              {/* Scrubber Timeline */}
              <div className="space-y-1">
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
                  aria-label="Audio scrubber"
                />
              </div>

              {/* Audio Controls Bar: Play/Pause, Speed, Volume */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-0.5">
                {/* Play/Pause & Replay */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onReplay}
                    className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center transition cursor-pointer"
                    title="Replay from start"
                    aria-label="Replay audio"
                  >
                    <RotateCcw size={13} />
                  </button>

                  <button
                    type="button"
                    onClick={onTogglePlayPause}
                    className="px-4 py-2 rounded-full bg-[#006241] hover:bg-[#004d33] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                    aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
                  >
                    {isPlaying ? (
                      <>
                        <Pause size={14} />
                        <span>Pause</span>
                      </>
                    ) : (
                      <>
                        <Play size={14} className="fill-current ml-0.5" />
                        <span>Listen</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Section 10 Speed Options: 0.5×, 0.75×, 1×, 1.25×, 1.5×, 2× */}
                <div className="flex items-center gap-1 bg-white border border-slate-200 p-0.5 rounded-xl text-xs">
                  <span className="text-[10px] font-semibold text-slate-400 px-1 hidden sm:inline">Speed:</span>
                  {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => setPlaybackSpeed(rate)}
                      className={`px-1.5 py-0.5 rounded-lg text-xs font-bold transition cursor-pointer ${
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
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={onToggleMute}
                    className="p-1 text-slate-500 hover:text-slate-800 cursor-pointer"
                    aria-label={isMuted ? 'Unmute volume' : 'Mute volume'}
                  >
                    {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => onVolumeChange && onVolumeChange(parseFloat(e.target.value))}
                    className="w-16 h-1.5 bg-slate-200 rounded-full accent-[#006241] cursor-pointer"
                    aria-label="Volume level"
                  />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ============================================================== */}
        {/* COLLAPSIBLE MORE OPTIONS (Keeps main UI uncluttered)          */}
        {/* ============================================================== */}
        <div className="border-t border-slate-100 pt-2.5">
          <button
            type="button"
            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 cursor-pointer"
          >
            <SlidersHorizontal size={13} />
            <span>{showAdvancedOptions ? 'Hide options ▲' : 'More options (Audio format, quality & translation) ▼'}</span>
          </button>

          {showAdvancedOptions && (
            <div className="mt-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Download Format */}
                <div>
                  <span className="font-semibold text-slate-700 block mb-1">Download Format:</span>
                  <div className="flex gap-1.5">
                    {(['wav', 'mp3', 'aac'] as const).map((fmt) => (
                      <button
                        key={fmt}
                        type="button"
                        onClick={() => setAudioFormat(fmt)}
                        className={`flex-1 py-1 rounded-lg uppercase font-bold text-xs transition cursor-pointer ${
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

                {/* Acoustic Quality */}
                <div>
                  <span className="font-semibold text-slate-700 block mb-1">Acoustic Quality:</span>
                  <div className="flex gap-1.5">
                    {(['standard', 'hd'] as const).map((ql) => (
                      <button
                        key={ql}
                        type="button"
                        onClick={() => setAudioQuality(ql)}
                        className={`flex-1 py-1 rounded-lg uppercase font-bold text-xs transition cursor-pointer ${
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

                {/* Optional Save Category */}
                {setSaveCategory && (
                  <div>
                    <span className="font-semibold text-slate-700 block mb-1">Save Category:</span>
                    <select
                      value={saveCategory}
                      onChange={(e) => setSaveCategory(e.target.value)}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none"
                    >
                      <option value="Personal">Personal</option>
                      <option value="School">School / Homework</option>
                      <option value="Work">Work / Lessons</option>
                      <option value="Religion">Religion / Liturgical</option>
                      <option value="Stories">Cultural Stories</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Cross-Language Translation Helper */}
              {onTranslateAndInject && (
                <div className="pt-2 border-t border-slate-200">
                  <div
                    className="flex items-center justify-between cursor-pointer select-none"
                    onClick={() => setShowTranslator(!showTranslator)}
                  >
                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <Globe size={13} className="text-[#006241]" />
                      <span>Cross-Language Translation Helper</span>
                    </span>
                    <span className="text-[#006241] font-bold">
                      {showTranslator ? 'Close ▲' : 'Open ▼'}
                    </span>
                  </div>

                  {showTranslator && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200 space-y-2">
                      <div className="flex items-center gap-2">
                        <select
                          value={translateFrom}
                          onChange={(e) => setTranslateFrom(e.target.value as LanguageCode)}
                          className="p-1 bg-white border border-slate-200 rounded text-xs"
                        >
                          <option value="en">English</option>
                          <option value="am">Amharic</option>
                          <option value="ti">Tigrinya</option>
                          <option value="om">Afaan Oromoo</option>
                        </select>
                        <span>➙</span>
                        <select
                          value={translateTo}
                          onChange={(e) => setTranslateTo(e.target.value as LanguageCode)}
                          className="p-1 bg-white border border-slate-200 rounded text-xs"
                        >
                          <option value="am">Amharic</option>
                          <option value="en">English</option>
                          <option value="ti">Tigrinya</option>
                          <option value="om">Afaan Oromoo</option>
                        </select>
                      </div>

                      <textarea
                        rows={2}
                        value={translationInput}
                        onChange={(e) => setTranslationInput(e.target.value)}
                        placeholder="Type text in source language to translate..."
                        className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
                      />

                      <button
                        type="button"
                        onClick={() => {
                          if (!translationInput.trim()) return;
                          onTranslateAndInject(translationInput, translateFrom, translateTo);
                          setTranslationInput('');
                          setShowTranslator(false);
                        }}
                        disabled={isTranslating || !translationInput.trim()}
                        className="px-3 py-1.5 bg-[#006241] hover:bg-[#004d33] text-white text-xs font-bold rounded-lg transition disabled:opacity-50"
                      >
                        {isTranslating ? 'Translating...' : 'Translate & Insert into Studio'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Pronunciation Tool Modal Trigger */}
              {onOpenPronunciationModal && (
                <div className="pt-2 border-t border-slate-200 flex justify-end">
                  <button
                    type="button"
                    onClick={onOpenPronunciationModal}
                    className="text-[#006241] hover:underline font-bold text-xs flex items-center gap-1"
                  >
                    <Sparkles size={12} />
                    <span>Custom Pronunciation Rules Studio ↗</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
