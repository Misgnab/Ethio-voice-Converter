import React from 'react';
import { Globe, Heart, Shield, Terminal, BookOpen } from 'lucide-react';
import { LANGUAGES } from '../data';

interface FooterProps {
  onSelectTab: (tab: string) => void;
}

export default function Footer({ onSelectTab }: FooterProps) {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800">
      {/* Subtle Ethiopian Tricolor Accent Strip */}
      <div className="h-1 w-full flex">
        <div className="h-full flex-1 bg-[#006241]" />
        <div className="h-full flex-1 bg-[#F9D616]" />
        <div className="h-full flex-1 bg-[#E21C21]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Wordmark & Cultural Mission */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#006241] flex items-center justify-center text-white">
                <span className="font-serif font-black text-sm">ኢ</span>
              </div>
              <span className="text-white text-base font-bold tracking-tight">EthioVoice</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Empowering Ethiopian languages through state-of-the-art neural acoustic synthesis. Preserving heritage, supporting education, and bridging the digital divide for 120M+ speakers.
            </p>
            <div className="flex items-center gap-3 pt-1 text-slate-500 text-[11px]">
              <span>Made with care in Addis Ababa, Ethiopia</span>
            </div>
          </div>

          {/* Col 2: Voice Platforms & Tools */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">Platforms & Tools</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onSelectTab('tts')} className="hover:text-white transition-colors">
                  Synthesis Studio Lab
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('voices')} className="hover:text-white transition-colors">
                  Voice & Dialect Directory
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('ocr')} className="hover:text-white transition-colors">
                  Optical OCR Manuscript Scanner
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('docs')} className="hover:text-white transition-colors">
                  Continuous Document Reader
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('library')} className="hover:text-white transition-colors">
                  Archived Audio Library
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Languages & Linguistic Research */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">Supported Dialects</h4>
            <ul className="space-y-2">
              {LANGUAGES.map((lang) => (
                <li key={lang.code} className="flex items-center gap-1.5">
                  <span>{lang.flag}</span>
                  <span className="text-slate-300 font-medium">{lang.name}</span>
                  <span className="text-slate-600 text-[10px]">({lang.nativeName})</span>
                </li>
              ))}
              <li className="pt-1">
                <button onClick={() => onSelectTab('about')} className="text-emerald-400 hover:text-emerald-300 transition-colors">
                  Ge'ez Phonology Research ↗
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Developers, Enterprise & Local Billing */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">Enterprise & Developers</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onSelectTab('docs-api')} className="hover:text-white transition-colors">
                  REST Speech Synthesis API
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('pricing')} className="hover:text-white transition-colors">
                  Telebirr & Chapa Billing
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('admin')} className="hover:text-white transition-colors">
                  Platform Reliability & Stats
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('about')} className="hover:text-white transition-colors">
                  Accessibility & Universal Design
                </button>
              </li>
            </ul>
            <div className="mt-4 pt-3 border-t border-slate-800">
              <span className="text-[10px] text-slate-500 block">Accepted Local Gateways:</span>
              <div className="flex gap-2 mt-1.5 text-[10px] text-slate-300 font-medium">
                <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">Telebirr</span>
                <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">Chapa</span>
                <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">CBE Birr</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} EthioVoice. All rights reserved. Preserving African oral and written heritage.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span>·</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span>·</span>
            <span className="hover:text-slate-400 cursor-pointer">Security Standards</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
