import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Download,
  X,
  CheckCircle2,
  AlertCircle,
  FileAudio,
  Radio,
  Sliders,
  Sparkles,
  Music,
  ArrowRight,
  HardDrive
} from 'lucide-react';
import { HistoryItem } from '../types';

export type AudioFormat = 'wav' | 'mp3' | 'aac';

interface DownloadFormatModalProps {
  isOpen: boolean;
  onClose: () => void;
  track: HistoryItem | null;
  onToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

interface FormatOption {
  format: AudioFormat;
  label: string;
  name: string;
  mimeType: string;
  extension: string;
  badge: string;
  description: string;
  specs: string;
  benefits: string[];
  color: string;
  accentBg: string;
}

const FORMAT_OPTIONS: FormatOption[] = [
  {
    format: 'wav',
    label: 'WAV',
    name: 'Waveform Audio Format',
    mimeType: 'audio/wav',
    extension: '.wav',
    badge: 'Lossless Studio Master',
    description: 'Uncompressed linear PCM audio with zero fidelity loss.',
    specs: '48 kHz / 24 kHz • 16-bit Lossless PCM',
    benefits: ['Maximum acoustic purity', 'Perfect for DAW editing & video', 'Archive grade preservation'],
    color: '#006241',
    accentBg: 'bg-emerald-50 text-[#006241] border-emerald-200'
  },
  {
    format: 'mp3',
    label: 'MP3',
    name: 'MPEG-1 Audio Layer III',
    mimeType: 'audio/mpeg',
    extension: '.mp3',
    badge: 'Universal Compatibility',
    description: 'Widely compatible compressed format tuned for natural human voice.',
    specs: '192 / 256 kbps CBR • libmp3lame encoder',
    benefits: ['Plays on all phones & cars', 'Compact file size (~85% smaller)', 'Universal web & app sharing'],
    color: '#2563EB',
    accentBg: 'bg-blue-50 text-blue-700 border-blue-200'
  },
  {
    format: 'aac',
    label: 'AAC',
    name: 'Advanced Audio Coding',
    mimeType: 'audio/aac',
    extension: '.aac',
    badge: 'Modern High-Efficiency',
    description: 'High-clarity compressed audio container (ADTS) with superior treble definition.',
    specs: '192 / 256 kbps ADTS • Low-complexity LC-AAC',
    benefits: ['Modern streaming standard', 'Higher fidelity than MP3 at same bitrate', 'Ideal for Apple/Android devices'],
    color: '#D97706',
    accentBg: 'bg-amber-50 text-amber-800 border-amber-200'
  }
];

export default function DownloadFormatModal({
  isOpen,
  onClose,
  track,
  onToast
}: DownloadFormatModalProps) {
  // Remember last selected format in localStorage
  const [selectedFormat, setSelectedFormat] = useState<AudioFormat>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ethiovoice_download_format');
      if (saved === 'wav' || saved === 'mp3' || saved === 'aac') {
        return saved;
      }
    }
    return 'mp3';
  });
  const [quality, setQuality] = useState<'standard' | 'hd'>('hd');
  const [isConverting, setIsConverting] = useState(false);
  const [conversionStage, setConversionStage] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<{
    format: AudioFormat;
    filename: string;
    sizeKb: number;
  } | null>(null);

  if (!isOpen || !track) return null;

  const handleFormatChange = (fmt: AudioFormat) => {
    setSelectedFormat(fmt);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ethiovoice_download_format', fmt);
    }
  };

  const getEstimatedSizeKb = (fmt: AudioFormat) => {
    const sec = Math.max(1.5, track.duration || 3);
    if (fmt === 'wav') return quality === 'hd' ? Math.round(sec * 96) : Math.round(sec * 48);
    if (fmt === 'mp3') return quality === 'hd' ? Math.round(sec * 32) : Math.round(sec * 24);
    if (fmt === 'aac') return quality === 'hd' ? Math.round(sec * 32) : Math.round(sec * 24);
    return Math.round(sec * 24);
  };

  const handleDownload = async (targetFmt?: AudioFormat) => {
    const fmt = targetFmt || selectedFormat;
    handleFormatChange(fmt);
    setErrorMessage(null);
    setDownloadSuccess(null);
    setIsConverting(true);

    const fmtLabel = fmt.toUpperCase();
    setConversionStage(`Converting speech into ${fmtLabel} audio format...`);

    try {
      // Call server conversion endpoint
      const response = await fetch('/api/audio/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioUrl: track.audioUrl,
          trackId: track.id,
          targetFormat: fmt,
          quality,
          filename: `ethiovoice_${track.id}.${fmt}`
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Conversion failed' }));
        throw new Error(errorData.error || `Server returned status ${response.status}`);
      }

      setConversionStage(`Packaging ${fmtLabel} file for download...`);
      const data = await response.json();

      if (!data.success || !data.audioUrl) {
        throw new Error(data.error || 'Server did not return converted audio');
      }

      // Convert data URL to Blob for clean, compliant download with exact MIME type
      const commaIdx = data.audioUrl.indexOf(',');
      const base64Data = data.audioUrl.slice(commaIdx + 1);
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Uint8Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }

      const mimeType = data.mimeType || (fmt === 'mp3' ? 'audio/mpeg' : fmt === 'aac' ? 'audio/aac' : 'audio/wav');
      const blob = new Blob([byteNumbers], { type: mimeType });
      const blobUrl = URL.createObjectURL(blob);

      const downloadLink = document.createElement('a');
      downloadLink.href = blobUrl;
      downloadLink.download = data.filename || `ethiovoice_${track.id}.${fmt}`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      // Clean up blob URL after delay
      setTimeout(() => URL.revokeObjectURL(blobUrl), 30000);

      const sizeKb = data.sizeKb || Math.round(blob.size / 1024);
      setDownloadSuccess({
        format: fmt,
        filename: data.filename || `ethiovoice_${track.id}.${fmt}`,
        sizeKb
      });

      if (onToast) {
        onToast(`Downloaded ${data.filename || 'audio'} (${sizeKb} KB) successfully!`, 'success');
      }
    } catch (err: any) {
      console.error('Download conversion failed:', err);
      setErrorMessage(
        'Speech conversion failed. Please try again. If the problem continues, check your connection.'
      );
      if (onToast) {
        onToast('Download conversion failed. Please try again.', 'error');
      }
    } finally {
      setIsConverting(false);
    }
  };

  const getLanguageLabel = (code: string) => {
    if (code === 'am') return 'Amharic (አማርኛ)';
    if (code === 'ti') return 'Tigrinya (ትግርኛ)';
    if (code === 'om') return 'Afaan Oromoo';
    return 'English';
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="download-modal-title"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto max-h-[92vh] flex flex-col"
        >
          {/* Header */}
          <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-slate-100 bg-linear-to-r from-emerald-900 via-[#006241] to-emerald-950 text-white shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-xs">
                  <Download className="text-white" size={20} />
                </div>
                <div>
                  <h3 id="download-modal-title" className="text-base sm:text-lg font-bold text-white tracking-tight">
                    Download Audio
                  </h3>
                  <p className="text-xs text-emerald-100/90 font-medium">
                    Export authentic Ethiopian voice in your preferred format
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                disabled={isConverting}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition disabled:opacity-40"
                aria-label="Close download modal"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
            {/* Track Info */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#006241] flex items-center justify-center font-bold text-sm shrink-0 border border-emerald-200">
                {track.voiceName?.charAt(0) || 'E'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                    {track.voiceName}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    · {getLanguageLabel(track.language)} · {track.duration}s
                  </span>
                </div>
                <p className="text-xs text-slate-600 line-clamp-2 italic font-serif">
                  "{track.text}"
                </p>
              </div>
            </div>

            {/* Simple Format Selector */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                Select Audio Format
              </label>

              <div className="space-y-2.5">
                {/* WAV */}
                <label
                  onClick={() => !isConverting && handleFormatChange('wav')}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border-2 cursor-pointer transition ${
                    selectedFormat === 'wav'
                      ? 'border-[#006241] bg-emerald-50/50 shadow-2xs'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                  } ${isConverting ? 'pointer-events-none opacity-60' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="audio-format"
                      value="wav"
                      checked={selectedFormat === 'wav'}
                      onChange={() => handleFormatChange('wav')}
                      className="w-4 h-4 text-[#006241] focus:ring-[#006241] accent-[#006241]"
                    />
                    <div>
                      <span className="text-sm font-bold text-slate-900">WAV</span>
                      <span className="text-xs text-slate-500 ml-1.5">— Lossless / highest quality</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-medium text-slate-400">
                    ~{getEstimatedSizeKb('wav')} KB
                  </span>
                </label>

                {/* MP3 */}
                <label
                  onClick={() => !isConverting && handleFormatChange('mp3')}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border-2 cursor-pointer transition ${
                    selectedFormat === 'mp3'
                      ? 'border-[#006241] bg-emerald-50/50 shadow-2xs'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                  } ${isConverting ? 'pointer-events-none opacity-60' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="audio-format"
                      value="mp3"
                      checked={selectedFormat === 'mp3'}
                      onChange={() => handleFormatChange('mp3')}
                      className="w-4 h-4 text-[#006241] focus:ring-[#006241] accent-[#006241]"
                    />
                    <div>
                      <span className="text-sm font-bold text-slate-900">MP3</span>
                      <span className="text-xs text-slate-500 ml-1.5">— Small size / best compatibility</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-medium text-slate-400">
                    ~{getEstimatedSizeKb('mp3')} KB
                  </span>
                </label>

                {/* AAC */}
                <label
                  onClick={() => !isConverting && handleFormatChange('aac')}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border-2 cursor-pointer transition ${
                    selectedFormat === 'aac'
                      ? 'border-[#006241] bg-emerald-50/50 shadow-2xs'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                  } ${isConverting ? 'pointer-events-none opacity-60' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="audio-format"
                      value="aac"
                      checked={selectedFormat === 'aac'}
                      onChange={() => handleFormatChange('aac')}
                      className="w-4 h-4 text-[#006241] focus:ring-[#006241] accent-[#006241]"
                    />
                    <div>
                      <span className="text-sm font-bold text-slate-900">AAC</span>
                      <span className="text-xs text-slate-500 ml-1.5">— High quality compressed</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-medium text-slate-400">
                    ~{getEstimatedSizeKb('aac')} KB
                  </span>
                </label>
              </div>
            </div>

            {/* Error Message Box */}
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-900 flex items-start gap-2.5"
              >
                <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <strong className="font-bold block mb-0.5">Download Failed</strong>
                  <p>{errorMessage}</p>
                </div>
              </motion.div>
            )}

            {/* Conversion Progress State */}
            {isConverting && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl text-emerald-950 flex items-center gap-3"
              >
                <div className="w-5 h-5 border-2 border-[#006241] border-t-transparent rounded-full animate-spin shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold block text-emerald-900">
                    Preparing {selectedFormat.toUpperCase()} Audio...
                  </span>
                  <p className="text-[11px] text-emerald-700">
                    {conversionStage || 'Transcoding speech audio...'}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Success State */}
            {downloadSuccess && !isConverting && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-950 flex items-start gap-2.5"
              >
                <CheckCircle2 size={16} className="text-[#006241] shrink-0 mt-0.5" />
                <div className="flex-1 text-xs">
                  <strong className="font-bold text-[#006241]">Audio Downloaded!</strong>
                  <p className="text-slate-600 mt-0.5">
                    Saved <code className="font-mono bg-white px-1 py-0.5 rounded border border-emerald-200">{downloadSuccess.filename}</code> ({downloadSuccess.sizeKb} KB)
                  </p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-5 py-4 sm:px-6 bg-slate-50 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isConverting}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs transition disabled:opacity-40"
            >
              Close
            </button>

            <button
              type="button"
              onClick={() => handleDownload()}
              disabled={isConverting}
              className="w-full sm:w-auto px-6 py-2.5 bg-[#006241] hover:bg-[#004d33] text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-950/15 flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {isConverting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Converting...</span>
                </>
              ) : (
                <>
                  <Download size={14} />
                  <span>Download {selectedFormat.toUpperCase()}</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
