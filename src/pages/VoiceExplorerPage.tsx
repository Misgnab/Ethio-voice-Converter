import React, { useState } from 'react';
import { Play, Pause, ArrowRight, Sparkles, Filter, Search, RotateCcw } from 'lucide-react';
import { VOICES, LANGUAGES } from '../data';
import { Voice, LanguageCode } from '../types';

interface VoiceExplorerPageProps {
  onSelectVoiceForStudio: (voice: Voice) => void;
  onPreviewVoice: (voice: Voice) => void;
  activePreviewVoiceId: string | null;
  isPlayingPreview: boolean;
  onOpenUpgradeModal: () => void;
}

export default function VoiceExplorerPage({
  onSelectVoiceForStudio,
  onPreviewVoice,
  activePreviewVoiceId,
  isPlayingPreview,
  onOpenUpgradeModal
}: VoiceExplorerPageProps) {
  const [selectedLang, setSelectedLang] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [selectedPersona, setSelectedPersona] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Extract unique regions/personas across voices
  const uniquePersonas = Array.from(new Set(VOICES.map((v) => v.persona)));

  const filteredVoices = VOICES.filter((voice) => {
    const matchesLang = selectedLang === 'all' || voice.language === selectedLang;
    const matchesGender = selectedGender === 'all' || voice.gender === selectedGender;
    const matchesPersona = selectedPersona === 'all' || voice.persona === selectedPersona;
    const matchesSearch =
      voice.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      voice.accent.toLowerCase().includes(searchQuery.toLowerCase()) ||
      voice.persona.toLowerCase().includes(searchQuery.toLowerCase()) ||
      voice.region.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLang && matchesGender && matchesPersona && matchesSearch;
  });

  const handleResetFilters = () => {
    setSelectedLang('all');
    setSelectedGender('all');
    setSelectedPersona('all');
    setSearchQuery('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="max-w-3xl space-y-2">
        <p className="text-xs font-bold text-[#006241] uppercase tracking-wider">
          Voice Directory & Soundboard
        </p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Authentic Ethiopian Voices
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Explore our collection of 13 natural voices across Amharic, Tigrinya, Afaan Oromoo, and Ethiopian English. Audition real audio previews or select a voice for the Speech Studio.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-xs space-y-4">
        {/* Language Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pb-3 border-b border-slate-100">
          <button
            type="button"
            onClick={() => setSelectedLang('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              selectedLang === 'all'
                ? 'bg-[#006241] text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Languages ({VOICES.length})
          </button>
          {LANGUAGES.map((l) => {
            const count = VOICES.filter((v) => v.language === l.code).length;
            return (
              <button
                key={l.code}
                type="button"
                onClick={() => setSelectedLang(l.code)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  selectedLang === l.code
                    ? 'bg-[#006241] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{l.flag}</span>
                <span>{l.name}</span>
                <span className="opacity-70 font-mono text-[11px]">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Dropdown Filters: Gender, Persona/Region, Search */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Gender */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">
              Filter by Gender:
            </label>
            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#006241] font-medium"
            >
              <option value="all">All Genders</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
          </div>

          {/* Region / Role */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">
              Filter by Style / Role:
            </label>
            <select
              value={selectedPersona}
              onChange={(e) => setSelectedPersona(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#006241] font-medium"
            >
              <option value="all">All Styles & Roles</option>
              {uniquePersonas.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">
              Search by Name or Accent:
            </label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Selam, Dawit, Mekelle..."
                className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#006241]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Voice Grid */}
      {filteredVoices.length === 0 ? (
        <div className="py-16 text-center bg-white border border-slate-200 rounded-3xl p-8 space-y-4">
          <p className="text-base font-bold text-slate-800">
            No voices match the selected filters.
          </p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search criteria or resetting filters to browse all 13 authentic Ethiopian personas.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="px-4 py-2 bg-[#006241] hover:bg-[#004d33] text-white font-bold text-xs rounded-xl shadow-xs transition inline-flex items-center gap-1.5"
          >
            <RotateCcw size={13} />
            <span>Reset All Filters</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredVoices.map((voice) => {
            const isPlayingThis = isPlayingPreview && activePreviewVoiceId === voice.id;
            const langName = LANGUAGES.find((l) => l.code === voice.language)?.name || voice.language;

            return (
              <div
                key={voice.id}
                className={`p-5 bg-white border rounded-3xl transition flex flex-col justify-between gap-4 ${
                  isPlayingThis
                    ? 'border-[#006241] shadow-md ring-2 ring-[#006241]/20'
                    : 'border-slate-200 hover:border-slate-300 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shadow-2xs ${
                          voice.gender === 'female'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-[#006241]'
                        }`}
                      >
                        {voice.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-slate-900 flex items-center gap-1.5">
                          <span>{voice.name}</span>
                          <span className="text-slate-400 text-xs font-normal">
                            ({voice.nativeName})
                          </span>
                        </h3>
                        <p className="text-[11px] text-[#006241] font-semibold">{voice.persona}</p>
                      </div>
                    </div>

                    {voice.isPopular && (
                      <span className="px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold rounded-md">
                        Popular
                      </span>
                    )}
                  </div>

                  {/* Clean unboxed metadata per Frontend Constitution */}
                  <div className="text-[11px] text-slate-500 font-medium mb-2.5">
                    <span>{langName}</span>
                    <span aria-hidden="true" className="mx-1.5">·</span>
                    <span className="capitalize">{voice.gender}</span>
                    <span aria-hidden="true" className="mx-1.5">·</span>
                    <span>{voice.region || voice.accent}</span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    {voice.description}
                  </p>

                  {/* Sample Text Quote */}
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-700 italic font-serif break-words">
                    "{voice.sampleText}"
                  </div>
                </div>

                {/* Actions: Obvious Preview Button & Select for Studio */}
                <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onPreviewVoice(voice)}
                    className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      isPlayingThis
                        ? 'bg-[#006241] text-white shadow-2xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                    }`}
                    title={`Audition voice preview of ${voice.name}`}
                  >
                    {isPlayingThis ? (
                      <>
                        <Pause size={14} className="animate-spin" />
                        <span>Playing...</span>
                      </>
                    ) : (
                      <>
                        <Play size={14} className="fill-current" />
                        <span>▶ Preview</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectVoiceForStudio(voice)}
                    className="py-2.5 px-4 bg-[#006241] hover:bg-[#004d33] text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <span>Select for Studio</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
