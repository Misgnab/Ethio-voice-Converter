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
  Award,
  Layers,
  Code2,
  Copy,
  ShieldCheck,
  Headphones
} from 'lucide-react';
import { LANGUAGES, VOICES, PRICING_PLANS, COMMUNITY_STORIES } from '../data';
import { Voice, LanguageCode } from '../types';
import heroStudioImg from '../assets/images/hero_ethiopian_voice_studio_1790321908036.jpg';
import communityImg from '../assets/images/ethiopian_voices_community_1790321932002.jpg';

interface HomePageProps {
  onNavigate: (tab: string) => void;
  onPreviewVoice: (voice: Voice) => void;
  activePreviewVoiceId: string | null;
  isPlayingPreview: boolean;
  onOpenUpgradeModal: () => void;
}

export default function HomePage({
  onNavigate,
  onPreviewVoice,
  activePreviewVoiceId,
  isPlayingPreview,
  onOpenUpgradeModal
}: HomePageProps) {
  const [activeHeroTab, setActiveHeroTab] = useState<LanguageCode>('am');
  const [copiedCode, setCopiedCode] = useState(false);

  const heroSamples: Record<LanguageCode, { text: string; native: string; voice: string }> = {
    am: {
      native: 'አማርኛ',
      text: 'ሰላም፣ እንኳን ወደ ኢትዮቮይስ በደህና መጡ። የኢትዮጵያ ቋንቋዎችን በዘመናዊ አርቴፊሻል ኢንተለጀንስ ወደ ተፈጥሯዊ ንግግር እንቀይራለን።',
      voice: 'Selam (Addis)'
    },
    ti: {
      native: 'ትግርኛ',
      text: 'ሰላም፣ ናብ ኢትዮቮይስ ብደሓን መጻእኩም። ጽሑፍኩም ናብ ጥዑም ዝኾነ ናይ ትግርኛ ድምጺ ንምልዋጥ እዚ ዘመናዊ መሳርሒ ተጠቐሙ።',
      voice: 'Hagos (Mekelle)'
    },
    om: {
      native: 'Afaan Oromoo',
      text: 'Baga nagaan gara EthioVoice dhuftan. Sagalee qulqulluu fi ammayyaa Afaan Oromootiin barreeffama gara dubbiitti jijjiiraa.',
      voice: 'Chala (Finfinne)'
    },
    en: {
      native: 'English (ET)',
      text: 'Welcome to EthioVoice. The next-generation multilingual voice synthesis platform for Ethiopia and the global diaspora.',
      voice: 'Michael (Addis Intl)'
    }
  };

  const handleCopyApiSnippet = () => {
    const code = `curl -X POST https://api.ethiovoice.com/v1/tts/generate \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "text": "ሰላም እንኳን ደህና መጡ",
    "language": "am",
    "voiceId": "v-selam",
    "format": "wav"
  }'`;
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="w-full flex flex-col space-y-20 pb-20">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-8 md:pt-14 pb-12 bg-gradient-to-b from-slate-50 via-white to-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Value Proposition & CTAs */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#006241]">
                <span className="w-2 h-2 rounded-full bg-[#006241]" />
                <span>Multilingual Ethiopian AI Speech Ecosystem</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1] text-balance">
                The Authentic Voice of Ethiopia, Powered by AI.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                Transform Amharic, Tigrinya, Afaan Oromoo, and English text into natural, expressive speech. Built with deep respect for Ethiopian phonetics, Ge'ez script nuances, and regional cadences.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => onNavigate('tts')}
                  className="px-6 py-3.5 bg-[#006241] hover:bg-[#004d33] text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-950/15 flex items-center gap-2 transform hover:-translate-y-0.5 transition duration-200"
                >
                  <span>Open Synthesis Studio</span>
                  <ArrowRight size={16} />
                </button>

                <button
                  onClick={() => onNavigate('voices')}
                  className="px-5 py-3.5 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm rounded-xl border border-slate-200 shadow-2xs transition"
                >
                  Explore 12+ Voices
                </button>

                <button
                  onClick={() => onNavigate('ocr')}
                  className="px-4 py-3.5 text-slate-600 hover:text-slate-900 font-semibold text-sm flex items-center gap-1.5 transition"
                >
                  <Camera size={16} />
                  <span>Scan Manuscript</span>
                </button>
              </div>

              {/* Trust & Metric signals */}
              <div className="pt-6 border-t border-slate-200/80 grid grid-cols-3 gap-4 text-xs">
                <div>
                  <p className="text-xl sm:text-2xl font-black text-slate-900 tabular-nums">4</p>
                  <p className="text-slate-500 font-medium mt-0.5">Core Ethiopian Languages</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-black text-[#006241] tabular-nums">12+</p>
                  <p className="text-slate-500 font-medium mt-0.5">Regional Dialect Personas</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-black text-slate-900 tabular-nums">98.4%</p>
                  <p className="text-slate-500 font-medium mt-0.5">Ge'ez Phonetic Accuracy</p>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Studio & Interactive Audio Sample */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 bg-slate-900 group">
                <img
                  src={heroStudioImg}
                  alt="EthioVoice high-fidelity acoustic sound recording studio in Addis Ababa"
                  referrerPolicy="no-referrer"
                  className="w-full h-64 sm:h-72 object-cover object-center transform group-hover:scale-102 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent p-6 flex flex-col justify-end text-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      Addis Acoustic Neural Core
                    </span>
                    <span className="text-[11px] text-slate-300">48kHz Lossless</span>
                  </div>
                  <p className="text-sm font-bold">Acoustic Formant Resonance Engine</p>
                  <p className="text-xs text-slate-300 mt-0.5">Precision-tuned for Ethiopian glottal & tonal inflections</p>
                </div>
              </div>

              {/* Interactive Audio Preview Widget */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Audition In-Browser</span>
                  <div className="flex gap-1 text-xs">
                    {(['am', 'ti', 'om', 'en'] as const).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setActiveHeroTab(lang)}
                        className={`px-2.5 py-1 rounded-lg font-bold text-xs transition ${
                          activeHeroTab === lang
                            ? 'bg-[#006241] text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {heroSamples[lang].native}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 leading-relaxed font-medium">
                  "{heroSamples[activeHeroTab].text}"
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="text-xs text-slate-500">
                    <span>Voice: </span>
                    <strong className="text-slate-800 font-semibold">{heroSamples[activeHeroTab].voice}</strong>
                  </div>
                  <button
                    onClick={() => {
                      const v = VOICES.find((voice) => voice.language === activeHeroTab);
                      if (v) onPreviewVoice(v);
                    }}
                    className="px-4 py-2 bg-[#006241] hover:bg-[#004d33] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow-2xs"
                  >
                    {isPlayingPreview && VOICES.find((voice) => voice.language === activeHeroTab)?.id === activePreviewVoiceId ? (
                      <>
                        <Pause size={13} />
                        <span>Pause Sample</span>
                      </>
                    ) : (
                      <>
                        <Play size={13} />
                        <span>Play Sample</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT IS ETHIOVOICE & 5-STEP WORKFLOW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs space-y-8">
          <div className="max-w-3xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#006241]">
              About EthioVoice
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              What is EthioVoice?
            </h2>
            <p className="text-base sm:text-lg text-slate-700 font-medium leading-relaxed">
              Convert Amharic, Tigrinya, Afaan Oromoo, and English text into natural speech.
            </p>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              EthioVoice is a dedicated AI voice platform tailored to Ethiopian phonetics, Ge'ez script nuances, and authentic regional cadences.
            </p>
          </div>

          {/* Clear 5-Step Process */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Step 1 */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
              <span className="w-7 h-7 rounded-xl bg-[#006241] text-white flex items-center justify-center font-bold text-xs">
                1
              </span>
              <h3 className="font-bold text-sm text-slate-900">Choose Language</h3>
              <p className="text-xs text-slate-500 leading-snug">
                Select Amharic (አማርኛ), Tigrinya (ትግርኛ), Afaan Oromoo, or English.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
              <span className="w-7 h-7 rounded-xl bg-[#006241] text-white flex items-center justify-center font-bold text-xs">
                2
              </span>
              <h3 className="font-bold text-sm text-slate-900">Choose Voice</h3>
              <p className="text-xs text-slate-500 leading-snug">
                Pick from 13 expressive regional dialect personas with real auditions.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
              <span className="w-7 h-7 rounded-xl bg-[#006241] text-white flex items-center justify-center font-bold text-xs">
                3
              </span>
              <h3 className="font-bold text-sm text-slate-900">Enter Text</h3>
              <p className="text-xs text-slate-500 leading-snug">
                Type, paste, or scan any Ge'ez Fidel or Qubee text with pronunciation tools.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
              <span className="w-7 h-7 rounded-xl bg-[#006241] text-white flex items-center justify-center font-bold text-xs">
                4
              </span>
              <h3 className="font-bold text-sm text-slate-900">Generate</h3>
              <p className="text-xs text-slate-500 leading-snug">
                Click Generate Speech to synthesize speech with authentic tone and prosody.
              </p>
            </div>

            {/* Step 5 */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
              <span className="w-7 h-7 rounded-xl bg-[#006241] text-white flex items-center justify-center font-bold text-xs">
                5
              </span>
              <h3 className="font-bold text-sm text-slate-900">Listen / Download</h3>
              <p className="text-xs text-slate-500 leading-snug">
                Listen with full player controls and download in WAV, MP3, or AAC.
              </p>
            </div>
          </div>

          {/* Quick CTA */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-xs text-slate-500 font-medium">Ready to convert your Ethiopian text?</span>
            <button
              type="button"
              onClick={() => onNavigate('tts')}
              className="px-5 py-2.5 bg-[#006241] hover:bg-[#004d33] text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
            >
              <span>Try Speech Studio Now</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 01: CAPABILITIES BENTO GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="max-w-2xl">
          <p className="text-xs font-bold text-[#006241] uppercase tracking-wider mb-2">Capabilities</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight text-balance">
            Everything you need for Ethiopian voice narration.
          </h2>
          <p className="text-slate-600 text-sm mt-3 leading-relaxed">
            From single-sentence voiceovers to full audiobooks and ancient manuscript reading, EthioVoice provides an end-to-end linguistic ecosystem.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Bento Card 1: Neural Speech Synthesis */}
          <div className="p-6 md:p-8 bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col justify-between hover:border-emerald-300 transition duration-300 group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#006241] flex items-center justify-center group-hover:scale-105 transition-transform">
                <Volume2 size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Neural Speech Studio</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Adjust speed (0.5x to 2.0x), pitch, and pauses. Export in crisp MP3, WAV, or AAC with real-time waveform monitoring.
              </p>
            </div>
            <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono">13 Authentic Voices</span>
              <button
                onClick={() => onNavigate('tts')}
                className="text-[#006241] font-bold hover:underline flex items-center gap-1"
              >
                Launch Studio ↗
              </button>
            </div>
          </div>

          {/* Bento Card 2: Optical OCR Scanner */}
          <div className="p-6 md:p-8 bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col justify-between hover:border-emerald-300 transition duration-300 group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Camera size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Optical OCR Scanner</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Snap photos of printed books, school notes, or Ge'ez scriptures and convert them into natural speech in seconds.
              </p>
            </div>
            <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono">98% Fidel Accuracy</span>
              <button
                onClick={() => onNavigate('ocr')}
                className="text-sky-700 font-bold hover:underline flex items-center gap-1"
              >
                Try Scanner ↗
              </button>
            </div>
          </div>

          {/* Bento Card 3: Continuous Document Reader */}
          <div className="p-6 md:p-8 bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col justify-between hover:border-emerald-300 transition duration-300 group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <FileText size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Audiobook Document Reader</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Upload lengthy TXT, PDF, or DOCX files. Follow along with interactive sentence chunks and automated continuous playback.
              </p>
            </div>
            <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono">Karaoke Highlight</span>
              <button
                onClick={() => onNavigate('docs')}
                className="text-amber-800 font-bold hover:underline flex items-center gap-1"
              >
                Open Reader ↗
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Narrator Voices Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-[#006241] uppercase tracking-wider mb-1">Authentic Personas</p>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Explore Narrator Voices</h2>
            <p className="text-xs text-slate-500 mt-1">Click to hear authentic samples from across Ethiopia.</p>
          </div>
          <button
            onClick={() => onNavigate('voices')}
            className="text-xs font-bold text-[#006241] hover:underline flex items-center gap-1 self-start sm:self-end"
          >
            <span>View Full Directory (13 Voices)</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {VOICES.slice(0, 8).map((voice) => {
            const isPlayingThis = isPlayingPreview && activePreviewVoiceId === voice.id;
            return (
              <div
                key={voice.id}
                className={`p-5 bg-white border rounded-2xl transition duration-200 flex flex-col justify-between gap-4 ${
                  isPlayingThis
                    ? 'border-[#006241] shadow-md ring-2 ring-[#006241]/20'
                    : 'border-slate-200 hover:border-slate-300 shadow-2xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-900">{voice.name}</span>
                    <span className="text-[10px] uppercase font-semibold text-slate-500">
                      {voice.language === 'am' ? 'Amharic' : voice.language === 'ti' ? 'Tigrinya' : voice.language === 'om' ? 'Oromo' : 'English'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {voice.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 capitalize">{voice.gender} · {voice.region}</span>
                  <button
                    onClick={() => onPreviewVoice(voice)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
                      isPlayingThis
                        ? 'bg-[#006241] text-white animate-pulse'
                        : 'bg-slate-100 text-slate-700 hover:bg-[#006241] hover:text-white'
                    }`}
                  >
                    {isPlayingThis ? <Pause size={13} /> : <Play size={13} className="ml-0.5" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 04: COMMUNITY IMPACT & EDUCATIONAL REACH */}
      <section className="bg-slate-50 py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-4">
              <p className="text-xs font-bold text-[#006241] uppercase tracking-wider">Social Impact</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight text-balance">
                Bridging literacy and access across all 12 regions of Ethiopia.
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Over 120 million people live in Ethiopia, with rich oral traditions and varying literacy rates. EthioVoice empowers rural educators, enables visually impaired students to read textbooks independently, and keeps diaspora youth connected to their mother tongues.
              </p>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-3xl overflow-hidden shadow-lg border border-slate-200">
                <img
                  src={communityImg}
                  alt="Young Ethiopian students and professionals collaborating with audiobooks in Addis Ababa"
                  referrerPolicy="no-referrer"
                  className="w-full h-64 object-cover"
                />
              </div>
            </div>
          </div>

          {/* Testimonial Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {COMMUNITY_STORIES.slice(0, 2).map((item) => (
              <div key={item.id} className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-4">
                <p className="text-xs text-slate-700 italic leading-relaxed">
                  "{item.story}"
                </p>
                <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                  <div className="w-9 h-9 rounded-full bg-emerald-100 text-[#006241] font-bold text-sm flex items-center justify-center">
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

      {/* SECTION 05: PRICING */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <p className="text-xs font-bold text-[#006241] uppercase tracking-wider">Transparent Pricing</p>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Accessible for Every Ethiopian</h2>
          <p className="text-xs text-slate-500">Pay directly with Telebirr, Chapa, CBE Birr, or international cards.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PRICING_PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`p-6 sm:p-8 rounded-3xl border flex flex-col justify-between gap-6 transition ${
                plan.popular
                  ? 'bg-white border-[#006241] shadow-xl ring-2 ring-[#006241]/20 relative'
                  : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div>
                {plan.popular && (
                  <span className="inline-block px-3 py-1 bg-[#F9D616] text-[#006241] font-bold text-[10px] uppercase rounded-full mb-3">
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

                <ul className="space-y-2.5 mt-6 text-xs text-slate-600">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <Check size={14} className="text-[#006241] shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => {
                  if (plan.id === 'free') {
                    onNavigate('tts');
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

      {/* SECTION 06: DEVELOPER REST API QUICKSTART */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 border border-slate-800 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-4">
            <div className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
              <Code2 size={16} />
              <span>Developer REST API</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-white">Integrate EthioVoice into your mobile app or website.</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Synthesize Amharic and Tigrinya audio via a single HTTP POST request. Ideal for news apps, interactive bots, voice assistance, and accessibility tools.
            </p>
            <button
              onClick={() => onNavigate('docs-api')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white rounded-xl border border-slate-700 inline-flex items-center gap-1.5 transition"
            >
              <span>View Full API Documentation</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="lg:col-span-7 bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 font-mono text-xs overflow-x-auto relative">
            <button
              onClick={handleCopyApiSnippet}
              className="absolute top-3 right-3 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] flex items-center gap-1 transition"
            >
              <Copy size={12} />
              <span>{copiedCode ? 'Copied!' : 'Copy'}</span>
            </button>
            <pre className="text-emerald-400 leading-relaxed">
{`curl -X POST https://api.ethiovoice.com/v1/tts/generate \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "text": "ሰላም እንኳን ደህና መጡ",
    "language": "am",
    "voiceId": "v-selam",
    "format": "wav"
  }'`}
            </pre>
          </div>
        </div>
      </section>

      {/* Bottom Call to Action */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#006241] text-white rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-xl">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight max-w-2xl mx-auto text-balance">
            Start synthesizing Ethiopian speech in your browser now.
          </h2>
          <p className="text-sm text-emerald-100 max-w-xl mx-auto">
            Free forever for community members with 20 syntheses daily. No credit card required.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => onNavigate('tts')}
              className="px-7 py-3.5 bg-[#F9D616] hover:bg-yellow-400 text-[#006241] font-bold text-sm rounded-xl shadow-md transition transform hover:-translate-y-0.5"
            >
              Launch Studio Now
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
