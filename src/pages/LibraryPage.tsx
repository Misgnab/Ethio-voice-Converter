import React, { useState } from 'react';
import {
  History,
  Search,
  Play,
  Pause,
  Heart,
  Download,
  Trash2,
  Share2,
  Volume2,
  FolderOpen,
  Sparkles,
  Star
} from 'lucide-react';
import { HistoryItem } from '../types';
import { LANGUAGES } from '../data';

interface LibraryPageProps {
  historyItems: HistoryItem[];
  currentTrackId: string | null;
  isPlaying: boolean;
  onPlayTrack: (item: HistoryItem) => void;
  onToggleFavorite: (id: string, currentlyFav: boolean) => void;
  onUpdateCategory: (id: string, category: string) => void;
  onDeleteClip: (id: string) => void;
  onShareAudio: (item: HistoryItem, platform: 'telegram' | 'whatsapp') => void;
  onNavigateToStudio: () => void;
  onOpenDownloadModal?: (item: HistoryItem) => void;
}

export default function LibraryPage({
  historyItems,
  currentTrackId,
  isPlaying,
  onPlayTrack,
  onToggleFavorite,
  onUpdateCategory,
  onDeleteClip,
  onShareAudio,
  onNavigateToStudio,
  onOpenDownloadModal
}: LibraryPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const categories = ['All', 'Favorites', 'Personal', 'School', 'Work', 'Religion', 'Stories'];
  const favoritesCount = historyItems.filter((h) => h.favorite).length;

  const filteredItems = historyItems.filter((item) => {
    const matchesSearch =
      item.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.voiceName.toLowerCase().includes(searchQuery.toLowerCase());
    if (categoryFilter === 'Favorites') return matchesSearch && item.favorite;
    if (categoryFilter !== 'All') return matchesSearch && item.category === categoryFilter;
    return matchesSearch;
  });

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const getLanguageLabel = (code: string) => {
    const lang = LANGUAGES.find((l) => l.code === code);
    return lang ? `${lang.name} (${lang.nativeName})` : code.toUpperCase();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <p className="text-xs font-bold text-[#006241] uppercase tracking-wider">
            Your Recordings & Saved Clips
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Audio
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Browse, listen to, download, or favorite your previously synthesized Ethiopian speech clips.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search saved audio clips..."
            className="w-full text-xs pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#006241] shadow-2xs"
            aria-label="Search recordings"
          />
        </div>
      </div>

      {/* Category & Favorites Filter Bar */}
      <div className="flex flex-wrap items-center gap-1.5 pb-2">
        {categories.map((cat) => {
          const isSelected = categoryFilter === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-[#006241] text-white shadow-2xs'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              {cat === 'Favorites' ? (
                <>
                  <Star size={13} className={isSelected ? 'fill-current' : 'text-amber-500 fill-amber-500'} />
                  <span>Favorites</span>
                  <span className="opacity-80 text-[10px]">({favoritesCount})</span>
                </>
              ) : (
                <span>{cat}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Items List / Empty States */}
      {historyItems.length === 0 ? (
        /* Empty State: No history at all */
        <div className="py-20 text-center space-y-4 bg-white border border-slate-200 rounded-3xl p-8">
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto text-[#006241] border border-emerald-100">
            <FolderOpen size={28} />
          </div>
          <h2 className="text-lg font-bold text-slate-800">You haven't generated any audio yet.</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Choose a language, enter your text, and synthesize authentic speech in the Speech Studio.
          </p>
          <button
            type="button"
            onClick={onNavigateToStudio}
            className="px-6 py-2.5 bg-[#006241] hover:bg-[#004d33] text-white font-bold text-xs rounded-xl shadow-xs transition"
          >
            Go to Speech Studio
          </button>
        </div>
      ) : filteredItems.length === 0 ? (
        /* Empty State: Specific Filter (e.g. Favorites) */
        <div className="py-16 text-center space-y-4 bg-white border border-slate-200 rounded-3xl p-8">
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto text-amber-600 border border-amber-100">
            <Heart size={24} />
          </div>
          <h2 className="text-base font-bold text-slate-800">
            {categoryFilter === 'Favorites'
              ? 'Your favorite voices and audio will appear here.'
              : `No audio clips found in category "${categoryFilter}".`}
          </h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {categoryFilter === 'Favorites'
              ? 'Click the heart icon on any generated audio to bookmark it in your favorites.'
              : 'Try clearing your search query or selecting a different category filter.'}
          </p>
          <button
            type="button"
            onClick={() => {
              setCategoryFilter('All');
              setSearchQuery('');
            }}
            className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition"
          >
            View All History
          </button>
        </div>
      ) : (
        /* Items Grid / List */
        <div className="space-y-3">
          {filteredItems.map((item) => {
            const isPlayingThis = currentTrackId === item.id && isPlaying;
            return (
              <div
                key={item.id}
                className={`p-4 sm:p-5 bg-white border rounded-2xl transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  currentTrackId === item.id
                    ? 'border-emerald-300 bg-emerald-50/40 shadow-xs ring-1 ring-emerald-400'
                    : 'border-slate-200 hover:border-slate-300 shadow-2xs'
                }`}
              >
                {/* Left: Play button & text details */}
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => onPlayTrack(item)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition ${
                      isPlayingThis
                        ? 'bg-[#006241] text-white animate-pulse'
                        : 'bg-slate-100 hover:bg-[#006241] text-slate-700 hover:text-white'
                    }`}
                    title={isPlayingThis ? 'Pause' : 'Play'}
                    aria-label={isPlayingThis ? 'Pause audio track' : 'Play audio track'}
                  >
                    {isPlayingThis ? <Pause size={15} /> : <Play size={15} className="ml-0.5 fill-current" />}
                  </button>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug line-clamp-2 break-words">
                      {item.text}
                    </p>

                    {/* Unboxed Metadata: Voice, Language, Duration, Date */}
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 mt-1.5 font-medium">
                      <span className="font-bold text-slate-800">{item.voiceName}</span>
                      <span aria-hidden="true">·</span>
                      <span>{getLanguageLabel(item.language)}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">{formatDuration(item.duration)}</span>
                      <span aria-hidden="true">·</span>
                      <span>{new Date(item.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions (Download, Favorite, Category, Delete) */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  {/* Category dropdown */}
                  <select
                    value={item.category || 'Personal'}
                    onChange={(e) => onUpdateCategory(item.id, e.target.value)}
                    className="text-[11px] font-semibold bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none"
                    aria-label="Audio category"
                  >
                    <option value="Personal">Personal</option>
                    <option value="School">School</option>
                    <option value="Work">Work</option>
                    <option value="Religion">Religion</option>
                    <option value="Stories">Stories</option>
                  </select>

                  {/* Favorite button */}
                  <button
                    type="button"
                    onClick={() => onToggleFavorite(item.id, item.favorite)}
                    className={`p-2 rounded-xl border transition ${
                      item.favorite
                        ? 'bg-amber-50 text-amber-600 border-amber-200'
                        : 'bg-white hover:bg-slate-50 text-slate-400 border-slate-200'
                    }`}
                    title={item.favorite ? 'Remove from favorites' : 'Add to favorites'}
                    aria-label="Toggle favorite"
                  >
                    <Heart size={14} className={item.favorite ? 'fill-amber-500 text-amber-500' : ''} />
                  </button>

                  {/* Download format selector button */}
                  {item.audioUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        if (onOpenDownloadModal) {
                          onOpenDownloadModal(item);
                        } else {
                          const a = document.createElement('a');
                          a.href = item.audioUrl;
                          a.download = `ethiovoice_${item.id}.${item.format || 'wav'}`;
                          a.click();
                        }
                      }}
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#006241] border border-emerald-200 rounded-xl font-bold text-xs transition flex items-center gap-1.5"
                      title="Download audio (WAV, MP3, AAC)"
                      aria-label="Download audio file"
                    >
                      <Download size={13} />
                      <span className="hidden sm:inline">Download</span>
                    </button>
                  )}

                  {/* Share TG / WA */}
                  <button
                    type="button"
                    onClick={() => onShareAudio(item, 'telegram')}
                    className="p-2 bg-sky-50 text-sky-700 hover:bg-sky-100 rounded-xl text-[10px] font-bold transition"
                    title="Share via Telegram"
                    aria-label="Share via Telegram"
                  >
                    TG
                  </button>

                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={() => onDeleteClip(item.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                    title="Delete recording"
                    aria-label="Delete recording"
                  >
                    <Trash2 size={14} />
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
