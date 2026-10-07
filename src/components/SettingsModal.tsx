import React from 'react';
import { X, Sliders, Volume2, Globe, Sparkles, Eye, Download, Trash2, Check } from 'lucide-react';
import { LanguageCode, Voice } from '../types';
import { LANGUAGES, VOICES } from '../data';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLanguage: LanguageCode;
  onSelectLanguage: (lang: LanguageCode) => void;
  selectedVoiceId: string;
  onSelectVoiceId: (id: string) => void;
  playbackSpeed: number;
  onSelectPlaybackSpeed: (speed: number) => void;
  audioFormat: 'mp3' | 'wav' | 'aac';
  onSelectAudioFormat: (fmt: 'mp3' | 'wav' | 'aac') => void;
  audioQuality: 'low' | 'standard' | 'hd';
  onSelectAudioQuality: (ql: 'low' | 'standard' | 'hd') => void;
  accessibilityMode: boolean;
  onToggleAccessibility: () => void;
  onClearHistory?: () => void;
  triggerToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  selectedLanguage,
  onSelectLanguage,
  selectedVoiceId,
  onSelectVoiceId,
  playbackSpeed,
  onSelectPlaybackSpeed,
  audioFormat,
  onSelectAudioFormat,
  audioQuality,
  onSelectAudioQuality,
  accessibilityMode,
  onToggleAccessibility,
  onClearHistory,
  triggerToast
}: SettingsModalProps) {
  if (!isOpen) return null;

  const voicesForLang = VOICES.filter((v) => v.language === selectedLanguage);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div
        className="w-full max-w-xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-labelledby="settings-modal-title"
        aria-modal="true"
      >
        {/* Ethiopian Ribbon */}
        <div className="h-1.5 w-full flex shrink-0">
          <div className="h-full flex-1 bg-[#006241]" />
          <div className="h-full flex-1 bg-[#F9D616]" />
          <div className="h-full flex-1 bg-[#E21C21]" />
        </div>

        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#006241] flex items-center justify-center">
              <Sliders size={20} />
            </div>
            <div>
              <h2 id="settings-modal-title" className="text-lg font-bold text-slate-900">
                EthioVoice Settings
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Personalize your voice synthesis and display preferences
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
            aria-label="Close settings"
          >
            <X size={20} />
          </button>
        </div>

        {/* Settings Form Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
          {/* Default Language */}
          <div className="space-y-2">
            <label className="font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Globe size={13} className="text-[#006241]" />
              <span>Default Language</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {LANGUAGES.map((lang) => {
                const isSelected = selectedLanguage === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      onSelectLanguage(lang.code);
                      const first = VOICES.find((v) => v.language === lang.code);
                      if (first) onSelectVoiceId(first.id);
                      triggerToast(`Default set to ${lang.name}`, 'info');
                    }}
                    className={`p-2.5 rounded-xl border text-left transition flex items-center justify-between ${
                      isSelected
                        ? 'border-[#006241] bg-emerald-50 text-[#006241] font-bold shadow-2xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <p className="font-bold text-xs">{lang.nativeName.split(' ')[0]}</p>
                      <p className="text-[10px] text-slate-500">{lang.name}</p>
                    </div>
                    {isSelected && <Check size={14} className="text-[#006241]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preferred Voice for this language */}
          <div className="space-y-2">
            <label className="font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Volume2 size={13} className="text-[#006241]" />
              <span>Preferred Voice ({LANGUAGES.find((l) => l.code === selectedLanguage)?.name})</span>
            </label>
            <select
              value={selectedVoiceId}
              onChange={(e) => {
                onSelectVoiceId(e.target.value);
                triggerToast('Voice preference saved', 'info');
              }}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#006241]"
            >
              {voicesForLang.map((voice) => (
                <option key={voice.id} value={voice.id}>
                  {voice.name} ({voice.nativeName}) — {voice.gender}, {voice.region || voice.accent}
                </option>
              ))}
            </select>
          </div>

          {/* Default Download Format */}
          <div className="space-y-2">
            <label className="font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Download size={13} className="text-[#006241]" />
              <span>Default Download Format</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['mp3', 'wav', 'aac'] as const).map((fmt) => {
                const isSelected = audioFormat === fmt;
                return (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => {
                      onSelectAudioFormat(fmt);
                      triggerToast(`Download format set to ${fmt.toUpperCase()}`, 'info');
                    }}
                    className={`p-2.5 rounded-xl border text-center transition uppercase font-bold text-xs ${
                      isSelected
                        ? 'border-[#006241] bg-emerald-50 text-[#006241] shadow-2xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {fmt}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Default Playback Speed */}
          <div className="space-y-2">
            <label className="font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Sparkles size={13} className="text-[#006241]" />
              <span>Default Playback Speed</span>
            </label>
            <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
              {[0.75, 1.0, 1.25, 1.5].map((speed) => {
                const isSelected = playbackSpeed === speed;
                return (
                  <button
                    key={speed}
                    type="button"
                    onClick={() => {
                      onSelectPlaybackSpeed(speed);
                      triggerToast(`Playback speed set to ${speed}x`, 'info');
                    }}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
                      isSelected
                        ? 'bg-[#006241] text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {speed}×
                  </button>
                );
              })}
            </div>
          </div>

          {/* High Contrast / Accessibility Mode */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <Eye size={14} className="text-[#006241]" />
                <span>Large Text & Accessibility Mode</span>
              </p>
              <p className="text-[11px] text-slate-500">
                Enhance contrast and enlarge fonts for comfortable reading
              </p>
            </div>
            <button
              type="button"
              onClick={onToggleAccessibility}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                accessibilityMode ? 'bg-[#006241]' : 'bg-slate-300'
              }`}
              aria-label="Toggle accessibility mode"
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                  accessibilityMode ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* History Management */}
          {onClearHistory && (
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div>
                <p className="font-bold text-xs text-slate-900">Clear Speech History</p>
                <p className="text-[11px] text-slate-500">Remove all generated audio clips from local storage</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (confirm('Are you sure you want to clear your local audio history?')) {
                    onClearHistory();
                    triggerToast('Audio history cleared', 'info');
                  }
                }}
                className="px-3 py-1.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs transition flex items-center gap-1"
              >
                <Trash2 size={13} />
                <span>Clear</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#006241] hover:bg-[#004d33] text-white font-bold text-xs rounded-xl shadow-xs transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
