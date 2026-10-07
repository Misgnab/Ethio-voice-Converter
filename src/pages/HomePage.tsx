import React, { useState } from 'react';
import {
  Play,
  Pause,
  ArrowRight,
  Sparkles,
  Camera,
  FileText,
  Volume2,
  Check,
  Globe,
  ChevronDown,
  HelpCircle,
  MessageCircle,
  Zap,
  Shield,
  Smartphone
} from 'lucide-react';
import { LANGUAGES, VOICES, PRICING_PLANS, COMMUNITY_STORIES } from '../data';
import { Voice, LanguageCode, HistoryItem } from '../types';
import TextToSpeechStudio from '../components/TextToSpeechStudio';
import communityImg from '../assets/images/ethiopian_voices_community_1790321932002.jpg';

export interface HomePageProps {
  onNavigate: (tab: string) => void;
  onPreviewVoice: (voice: Voice) => void;
  activePreviewVoiceId: string | null;
  isPlayingPreview: boolean;
  onOpenUpgradeModal: () => void;
  // Studio Props for In-Page Experience
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
  onOpenDownloadModal?: (track?: HistoryItem | null) => void;
  conversionsLeft: number;
  isPremium: boolean;
  triggerToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onOpenHelpModal?: () => void;
}

export default function HomePage({
  onNavigate,
  onPreviewVoice,
  activePreviewVoiceId,
  isPlayingPreview,
  onOpenUpgradeModal,
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
  onOpenDownloadModal,
  conversionsLeft,
  isPremium,
  triggerToast,
  onOpenHelpModal
}: HomePageProps) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const scrollToStudio = () => {
    const el = document.getElementById('studio-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Focus textarea slightly after smooth scroll
      setTimeout(() => {
        const textarea = document.getElementById('studio-text-input');
        if (textarea) textarea.focus();
      }, 500);
    }
  };

  const faqs = [
    {
      q: 'How do I type in Amharic or Tigrinya (Ge\'ez script)?',
      a: 'On phones, install Gboard, SwiftKey, or Keyman and add the Amharic or Tigrinya keyboard. On desktop, enable the Ethiopian keyboard in Windows/Mac settings. You can also click the "Sample Text" button in the Studio to try phrases instantly!'
    },
    {
      q: 'Which Ethiopian languages are supported?',
      a: 'EthioVoice natively supports Amharic (አማርኛ), Tigrinya (ትግርኛ), Afaan Oromoo, and English (with natural Ethiopian and international accents).'
    },
    {
      q: 'Can I download the audio for WhatsApp, Telegram, or video voiceovers?',
      a: 'Yes! After clicking Generate Speech, you can download your audio file in MP3 (ideal for Telegram & WhatsApp), WAV (studio high quality), or AAC.'
    },
    {
      q: 'How can I pay for Pro with Telebirr or CBE Birr?',
      a: 'We accept local Ethiopian payment methods including Telebirr, CBE Birr, and Chapa, as well as international cards. Pro gives you unlimited voice generations and HD audio quality.'
    },
    {
      q: 'Can I convert scanned documents or books?',
      a: 'Yes! EthioVoice includes an OCR Scanner under "More > OCR Scanner" where you can snap photos of printed books or manuscripts and have them read aloud.'
    }
  ];

  return (
    <div className="w-full flex flex-col space-y-16 sm:space-y-24 pb-20">
      {/* 1. HERO SECTION: SHORT, CLEAR, SIMPLE */}
      <section className="relative overflow-hidden pt-8 sm:pt-14 pb-8 sm:pb-12 bg-gradient-to-b from-emerald-50/40 via-white to-slate-50 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-5">
          {/* Subtle Friendly Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-[#006241] text-xs font-bold shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#006241] animate-pulse" />
            <span>Ethiopian AI Speech Platform</span>
          </div>

          {/* Main Heading per specification */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15] text-balance">
            Turn Ethiopian text into natural speech.
          </h1>

          {/* Supporting Text per specification */}
          <p className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
            Type or paste your text in Amharic, Tigrinya, Afaan Oromoo, or English. Choose a voice and listen instantly.
          </p>

          {/* Primary Action Button: Start Speaking */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={scrollToStudio}
              className="px-8 py-4 bg-[#006241] hover:bg-[#004d33] text-white font-black text-base rounded-2xl shadow-lg shadow-emerald-950/15 flex items-center gap-2.5 transition transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <Volume2 size={20} />
              <span>Start Speaking</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('voices')}
              className="px-6 py-4 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm rounded-2xl border border-slate-200 shadow-2xs transition"
            >
              Audition 13 Voices
            </button>
          </div>

          {/* Quick Core Benefits Pills */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <Check size={14} className="text-[#006241] shrink-0" />
              <span>4 Ethiopian Languages</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Check size={14} className="text-[#006241] shrink-0" />
              <span>13 Authentic Dialects</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Check size={14} className="text-[#006241] shrink-0" />
              <span>Free to use everyday</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Check size={14} className="text-[#006241] shrink-0" />
              <span>Works on mobile & PC</span>
            </span>
          </div>
        </div>
      </section>

      {/* 2. THE VISUAL CENTERPIECE: MAIN TEXT-TO-SPEECH STUDIO */}
      <section
        id="studio-section"
        aria-label="Text to Speech Studio"
        className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-10 scroll-mt-20 w-full"
      >
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
          conversionsLeft={conversionsLeft}
          isPremium={isPremium}
          onOpenUpgradeModal={onOpenUpgradeModal}
          triggerToast={triggerToast}
          onNavigate={onNavigate}
        />
      </section>

      {/* 3. SIMPLE 3-STEP USER JOURNEY */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-50 border border-slate-200/90 rounded-3xl p-6 sm:p-10 space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#006241]">
              Simple & Fast
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              How EthioVoice works
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              No technical knowledge needed. Simply pick your voice and listen.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Step 1 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#006241] font-black text-sm flex items-center justify-center">
                  1
                </div>
                <h3 className="font-extrabold text-base text-slate-900">
                  Pick language & voice
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Choose Amharic, Tigrinya, Afaan Oromoo, or English. Listen to previews from Addis Ababa, Gondar, Tigray, and Oromia.
                </p>
              </div>
              <span className="text-[11px] font-semibold text-[#006241]">13 Regional voices</span>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 font-black text-sm flex items-center justify-center">
                  2
                </div>
                <h3 className="font-extrabold text-base text-slate-900">
                  Enter your text
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Type or paste up to 5,000 characters. You can also click "Sample Text" for ready-made phrases, or scan printed paper.
                </p>
              </div>
              <span className="text-[11px] font-semibold text-amber-800">Ge'ez & Qubee supported</span>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-800 font-black text-sm flex items-center justify-center">
                  3
                </div>
                <h3 className="font-extrabold text-base text-slate-900">
                  Listen & download
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Click Generate Speech, adjust the speed (0.5× to 2×), and download as MP3, WAV, or AAC for easy sharing.
                </p>
              </div>
              <span className="text-[11px] font-semibold text-sky-800">Instant audio playback</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FEATURED VOICES SHOWCASE */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#006241]">
              Hear the difference
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Featured Ethiopian voices
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Natural pronunciation and genuine regional warmth.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('voices')}
            className="text-xs font-bold text-[#006241] hover:underline flex items-center gap-1 self-start sm:self-end"
          >
            <span>Explore all 13 voices</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {VOICES.slice(0, 6).map((voice) => {
            const isPlayingThis = isPlayingPreview && activePreviewVoiceId === voice.id;
            const langName = LANGUAGES.find((l) => l.code === voice.language)?.name || voice.language;

            return (
              <div
                key={voice.id}
                className={`p-4 bg-white border-2 rounded-2xl transition duration-200 flex flex-col justify-between gap-3 ${
                  isPlayingThis
                    ? 'border-[#006241] shadow-md ring-1 ring-[#006241]'
                    : 'border-slate-200 hover:border-slate-300 shadow-2xs'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                          voice.gender === 'female'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-[#006241]'
                        }`}
                      >
                        {voice.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 leading-tight">
                          {voice.name} <span className="text-slate-400 font-normal text-xs">({voice.nativeName})</span>
                        </h4>
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                          {langName} · <span className="capitalize">{voice.gender}</span> · {voice.region || voice.accent}
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 mt-2 leading-relaxed">
                    {voice.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedLanguage(voice.language);
                      setSelectedVoiceId(voice.id);
                      if (!inputText.trim()) {
                        setInputText(voice.sampleText);
                      }
                      scrollToStudio();
                      triggerToast(`Selected ${voice.name} for Studio`, 'success');
                    }}
                    className="text-xs font-bold text-[#006241] hover:underline"
                  >
                    Select this voice
                  </button>

                  <button
                    type="button"
                    onClick={() => onPreviewVoice(voice)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 ${
                      isPlayingThis
                        ? 'bg-[#006241] text-white border-[#006241]'
                        : 'bg-slate-50 hover:bg-emerald-50 text-[#006241] border-slate-200'
                    }`}
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

      {/* 5. COMMUNITY STORIES */}
      <section className="bg-slate-50 py-12 sm:py-16 border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#006241]">
                Real Ethiopian Impact
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight text-balance">
                Making information accessible across Ethiopia.
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Whether you're an educator preparing audio lessons for students, a content creator recording videos, a diaspora Ethiopian reading traditional books, or someone with visual impairment, EthioVoice gives written words an authentic local voice.
              </p>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-3xl overflow-hidden shadow-md border border-slate-200">
                <img
                  src={communityImg}
                  alt="Ethiopian students and educators learning together"
                  referrerPolicy="no-referrer"
                  className="w-full h-56 object-cover"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {COMMUNITY_STORIES.slice(0, 2).map((item) => (
              <div key={item.id} className="p-5 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-3">
                <p className="text-xs text-slate-700 italic leading-relaxed">
                  "{item.story}"
                </p>
                <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#006241] font-bold text-xs flex items-center justify-center">
                    {item.avatarLetter}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{item.author}</p>
                    <p className="text-[10px] text-slate-500">{item.role} · {item.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. TRANSPARENT PRICING CARDS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#006241]">
            Clear Pricing
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Free forever, upgrade for unlimited
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Pay easily with Telebirr, CBE Birr, Chapa, or international cards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {PRICING_PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`p-6 rounded-3xl border flex flex-col justify-between gap-6 transition ${
                plan.popular
                  ? 'bg-white border-[#006241] shadow-xl ring-2 ring-[#006241]/20'
                  : 'bg-white border-slate-200 shadow-2xs'
              }`}
            >
              <div>
                {plan.popular && (
                  <span className="inline-block px-2.5 py-1 bg-[#F9D616] text-[#006241] font-bold text-[10px] uppercase rounded-full mb-3">
                    Most Popular in Ethiopia
                  </span>
                )}
                <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                <p className="text-xs text-slate-500 mt-1">{plan.description}</p>

                <div className="mt-4 pt-4 border-t border-slate-100">
                  <span className="text-3xl font-black text-slate-900">
                    {plan.priceEtb === 0 ? 'Free' : `${plan.priceEtb} ETB`}
                  </span>
                  <span className="text-xs text-slate-400 font-medium"> / {plan.billingPeriod}</span>
                </div>

                <ul className="space-y-2.5 mt-5 text-xs text-slate-600">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <Check size={14} className="text-[#006241] shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (plan.id === 'free') {
                    scrollToStudio();
                  } else {
                    onOpenUpgradeModal();
                  }
                }}
                className={`w-full py-3 rounded-xl font-bold text-xs transition duration-200 ${
                  plan.popular
                    ? 'bg-[#006241] hover:bg-[#004d33] text-white shadow-md'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                }`}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 7. FREQUENTLY ASKED QUESTIONS */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#006241]">
            Common Questions
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Everything you need to know about using EthioVoice.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          {faqs.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={index}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs transition"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  className="w-full p-4 sm:p-5 text-left font-bold text-sm text-slate-900 flex items-center justify-between gap-3 hover:bg-slate-50/50"
                  aria-expanded={isOpen}
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={16}
                    className={`text-slate-400 transform transition-transform shrink-0 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/30">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {onOpenHelpModal && (
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={onOpenHelpModal}
              className="text-xs font-bold text-[#006241] hover:underline inline-flex items-center gap-1.5"
            >
              <HelpCircle size={14} />
              <span>Need more help? Open full user guide</span>
            </button>
          </div>
        )}
      </section>

      {/* 8. BOTTOM CALL TO ACTION */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#006241] text-white rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-xl relative overflow-hidden">
          {/* Subtle Ethiopian Ribbon Accent */}
          <div className="absolute top-0 left-0 right-0 h-1.5 flex">
            <div className="h-full flex-1 bg-[#006241]" />
            <div className="h-full flex-1 bg-[#F9D616]" />
            <div className="h-full flex-1 bg-[#E21C21]" />
          </div>

          <div className="max-w-xl mx-auto space-y-3 pt-2">
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight text-balance">
              Type your text. We will make it speak.
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
              Experience authentic Ethiopian speech synthesis in Amharic, Tigrinya, Afaan Oromoo, and English.
            </p>
          </div>

          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={scrollToStudio}
              className="px-8 py-3.5 bg-[#F9D616] hover:bg-yellow-400 text-[#006241] font-black text-sm rounded-xl shadow-md transition transform hover:-translate-y-0.5 cursor-pointer"
            >
              Start Speaking Now
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
