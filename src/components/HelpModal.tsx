import React from 'react';
import { X, HelpCircle, BookOpen, Download, CreditCard, MessageSquare, ExternalLink, Keyboard, Globe } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab?: (tab: string) => void;
}

export default function HelpModal({ isOpen, onClose, onNavigateTab }: HelpModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div
        className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-labelledby="help-modal-title"
        aria-modal="true"
      >
        {/* Header with Ethiopian Ribbon */}
        <div className="h-1.5 w-full flex shrink-0">
          <div className="h-full flex-1 bg-[#006241]" />
          <div className="h-full flex-1 bg-[#F9D616]" />
          <div className="h-full flex-1 bg-[#E21C21]" />
        </div>

        <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#006241] flex items-center justify-center">
              <HelpCircle size={20} />
            </div>
            <div>
              <h2 id="help-modal-title" className="text-lg font-bold text-slate-900">
                EthioVoice Help & Guide
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Simple instructions for Ethiopian speech synthesis
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
            aria-label="Close help guide"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700">
          {/* Quick Step by Step */}
          <section className="space-y-3">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
              <BookOpen size={16} className="text-[#006241]" />
              <span>How to use EthioVoice in 3 simple steps</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-1">
                <span className="w-5 h-5 rounded-full bg-[#006241] text-white text-[11px] font-bold flex items-center justify-center">
                  1
                </span>
                <p className="font-bold text-xs text-slate-900">Choose Language & Voice</p>
                <p className="text-[11px] text-slate-600 leading-snug">
                  Select Amharic, Tigrinya, Afaan Oromoo, or English, and audition voice previews.
                </p>
              </div>

              <div className="p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-1">
                <span className="w-5 h-5 rounded-full bg-[#006241] text-white text-[11px] font-bold flex items-center justify-center">
                  2
                </span>
                <p className="font-bold text-xs text-slate-900">Type or Paste Text</p>
                <p className="text-[11px] text-slate-600 leading-snug">
                  Enter up to 5,000 characters in Ge'ez Fidel or Latin Qubee script.
                </p>
              </div>

              <div className="p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-1">
                <span className="w-5 h-5 rounded-full bg-[#006241] text-white text-[11px] font-bold flex items-center justify-center">
                  3
                </span>
                <p className="font-bold text-xs text-slate-900">Generate & Listen</p>
                <p className="text-[11px] text-slate-600 leading-snug">
                  Click Generate Speech, adjust speed, and download your audio clip.
                </p>
              </div>
            </div>
          </section>

          {/* Typing in Ge'ez */}
          <section className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Keyboard size={14} className="text-[#006241]" />
              <span>Typing Ge'ez (ፊደል) on your Device</span>
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              If your phone or computer does not have an Amharic or Tigrinya keyboard:
            </p>
            <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
              <li><strong>Mobile (Android / iPhone):</strong> Add Amharic/Tigrinya in Gboard, SwiftKey, or Keyman.</li>
              <li><strong>Computer (Windows / Mac):</strong> Enable Ethiopian keyboard in system language settings or use Keyman / Power Ge'ez.</li>
              <li><strong>Easy Alternative:</strong> Click <em>"Sample Text"</em> in the studio to quickly test audio without typing!</li>
            </ul>
          </section>

          {/* Audio formats and Sharing */}
          <section className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Download size={14} className="text-[#006241]" />
              <span>Audio Formats & Sharing</span>
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              You can export your voice recordings in three formats:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
              <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                <span className="font-bold text-[#006241]">MP3</span>
                <p className="text-[11px] text-slate-500 mt-0.5">Best for Telegram, WhatsApp, and social media sharing.</p>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                <span className="font-bold text-[#006241]">WAV</span>
                <p className="text-[11px] text-slate-500 mt-0.5">Uncompressed studio audio for videos and podcasts.</p>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                <span className="font-bold text-[#006241]">AAC</span>
                <p className="text-[11px] text-slate-500 mt-0.5">High quality with minimal file size.</p>
              </div>
            </div>
          </section>

          {/* Ethiopian Payment FAQs */}
          <section className="p-4 bg-emerald-50/40 rounded-2xl border border-emerald-200 space-y-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#006241] flex items-center gap-1.5">
              <CreditCard size={14} />
              <span>Local Ethiopian Payments (Telebirr & CBE Birr)</span>
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed">
              We accept local payments in Ethiopian Birr (ETB) through <strong>Telebirr</strong>, <strong>CBE Birr</strong>, and <strong>Chapa</strong>, as well as Visa/Mastercard for diaspora users. Free users enjoy 20 daily generations forever.
            </p>
          </section>

          {/* Need help contact */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-500 flex items-center gap-1.5">
              <MessageSquare size={13} className="text-[#006241]" />
              <span>Questions? Reach us at support@ethiovoice.com</span>
            </span>

            {onNavigateTab && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateTab('docs-api');
                }}
                className="font-bold text-[#006241] hover:underline flex items-center gap-1"
              >
                <span>Developer REST API Guide</span>
                <ExternalLink size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#006241] hover:bg-[#004d33] text-white font-bold text-xs rounded-xl shadow-xs transition"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
}
