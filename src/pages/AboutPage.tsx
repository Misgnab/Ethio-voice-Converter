import React from 'react';
import { BookOpen, ShieldCheck, Heart, Award, Globe, Users } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Title */}
      <div className="space-y-3">
        <p className="text-xs font-bold text-[#006241] uppercase tracking-wider">Mission & Heritage</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight text-balance">
          Preserving and Elevating Ethiopian Languages for the AI Era.
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
          EthioVoice was founded with a singular purpose: to ensure that the rich linguistic heritage of Ethiopia—spanning over 80 languages and 3,000 years of written civilization—thrives in the modern digital age.
        </p>
      </div>

      {/* Narrative Section 1: The Ge'ez Fidel Breakthrough */}
      <div className="p-8 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-6">
        <h2 className="text-xl font-bold text-slate-900">The Phonetic Challenge of Ge'ez Fidel (ግዕዝ ፊደል)</h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          The Ge'ez writing system is an abugida where each character denotes a consonant-vowel pair organized across seven grammatical orders: ግዕዝ (ä), ካዕብ (u), ሣልስ (i), ራብዕ (a), ኃምስ (e), ሳድስ (ə/null), and ሳብዕ (o).
        </p>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Standard global speech models regularly fail on the sixth order (ሳድስ), which can either carry an epenthetic vowel [ə] or remain a pure consonant depending on syllable structure. Moreover, Ethiopian languages feature ejective glottalic consonants (ጠ, ጨ, ጰ, ጸ, ፀ) that require acoustic pressure buildup and sudden release. EthioVoice addresses these exact acoustic phenomena directly within its neural architecture.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="font-bold text-[#006241] text-sm block mb-1">01. Glottal Ejectives</span>
            <p className="text-slate-500 leading-relaxed">Accurately reproduces the burst dynamics of ጠ, ጨ, ጰ, ጸ.</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="font-bold text-[#006241] text-sm block mb-1">02. Gemination (ማጥበቅ)</span>
            <p className="text-slate-500 leading-relaxed">Distinguishes meaning changes caused by consonant doubling (e.g. አለ vs አለለ).</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="font-bold text-[#006241] text-sm block mb-1">03. Qubee Prosody</span>
            <p className="text-slate-500 leading-relaxed">Models long vs short vowels in Afaan Oromoo with authentic rhythmic flow.</p>
          </div>
        </div>
      </div>

      {/* Narrative Section 2: Societal & Educational Impact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-emerald-50/60 border border-emerald-200 rounded-3xl space-y-3">
          <h3 className="font-bold text-base text-[#006241]">Accessibility for Visually Impaired Ethiopians</h3>
          <p className="text-xs text-slate-700 leading-relaxed">
            In Ethiopia, visually impaired students and professionals have historically lacked screen readers that reliably speak Amharic, Tigrinya, or Oromo. EthioVoice integrates directly with accessible web standards to read schoolbooks and legal documents aloud.
          </p>
        </div>

        <div className="p-6 bg-amber-50/60 border border-amber-200 rounded-3xl space-y-3">
          <h3 className="font-bold text-base text-amber-900">Diaspora Cultural Continuity</h3>
          <p className="text-xs text-slate-700 leading-relaxed">
            Millions of Ethiopians live across North America, Europe, the Middle East, and Australia. EthioVoice gives diaspora parents and educators tools to generate interactive stories, lessons, and proverbs with authentic accents.
          </p>
        </div>
      </div>
    </div>
  );
}
