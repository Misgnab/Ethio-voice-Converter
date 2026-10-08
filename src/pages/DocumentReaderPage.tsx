import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  FileUp,
  Play,
  Pause,
  RotateCcw,
  ArrowRight,
  Volume2,
  Sparkles,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Sliders,
  CheckCircle2,
  File
} from 'lucide-react';
import { Voice, LanguageCode } from '../types';
import { VOICES, LANGUAGES } from '../data';

interface DocumentReaderPageProps {
  onSpeakSentence: (sentence: string, voice: Voice) => void;
  isPlaying: boolean;
  activeSentence: string | null;
  onSendToStudio: (text: string) => void;
  triggerToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export default function DocumentReaderPage({
  onSpeakSentence,
  isPlaying,
  activeSentence,
  onSendToStudio,
  triggerToast
}: DocumentReaderPageProps) {
  const [documentContent, setDocumentContent] = useState<string>('');
  const [docChunks, setDocChunks] = useState<string[]>([]);
  const [activeChunkIndex, setActiveChunkIndex] = useState<number>(0);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>('v-almaz');
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [documentTitle, setDocumentTitle] = useState<string>('Untitled Document');

  const sentenceRefs = useRef<(HTMLDivElement | null)[]>([]);

  const selectedVoice = VOICES.find((v) => v.id === selectedVoiceId) || VOICES[0];

  // Auto-scroll active sentence into view
  useEffect(() => {
    if (activeChunkIndex !== null && sentenceRefs.current[activeChunkIndex]) {
      sentenceRefs.current[activeChunkIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [activeChunkIndex]);

  const processExtractedText = (text: string, title: string = 'Document') => {
    setDocumentContent(text);
    setDocumentTitle(title);
    // Split on Ethiopian & standard sentence terminators: ።, ፧, ፨, ., !, ?, newlines
    const chunks = text
      .split(/(?<=[.!?።፧፨\n]+)\s*/)
      .map((t) => t.trim())
      .filter((t) => t.length > 3);

    const validChunks = chunks.length > 0 ? chunks : [text.trim()];
    setDocChunks(validChunks);
    setActiveChunkIndex(0);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name;
    const ext = (fileName.split('.').pop() || '').toLowerCase();

    // Plain text formats (.txt, .md)
    if (ext === 'txt' || ext === 'md') {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = (event.target?.result as string) || '';
        if (text.trim()) {
          processExtractedText(text, fileName);
          triggerToast(`Extracted ${fileName} successfully!`, 'success');
        } else {
          triggerToast('Uploaded text file was empty', 'error');
        }
      };
      reader.readAsText(file);
      e.target.value = '';
      return;
    }

    // Binary documents (.pdf, .docx): use real server-side parser
    if (ext === 'pdf' || ext === 'docx') {
      triggerToast(`Extracting text from ${fileName}...`, 'info');
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const fileBase64 = event.target?.result as string;
          const res = await fetch('/api/document/extract', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileBase64,
              filename: fileName,
              mimeType: file.type
            })
          });
          const data = await res.json();
          if (!res.ok || !data.success) {
            triggerToast(data.error || 'Failed to extract text from document', 'error');
            return;
          }
          processExtractedText(data.text, fileName);
          triggerToast(`Extracted ${data.wordCount} words from ${fileName}`, 'success');
        } catch (err: any) {
          triggerToast(err.message || 'Error extracting document', 'error');
        }
      };
      reader.readAsDataURL(file);
      e.target.value = '';
      return;
    }

    triggerToast('Unsupported file type. Please upload a .txt, .md, .pdf, or .docx file.', 'error');
    e.target.value = '';
  };

  const handleLoadSample = (sampleType: 'dam' | 'fikr' | 'gadaa' | 'axum' | 'diplomacy') => {
    let sample = '';
    let title = '';
    if (sampleType === 'dam') {
      title = 'ታላቁ የኢትዮጵያ ሕዳሴ ግድብ';
      sample =
        'ታላቁ የሕዳሴ ግድብ በኢትዮጵያ ወንዝ ዓባይ ላይ የሚገነባ ታላቅ የኃይል ማመንጫ ፕሮጀክት ነው። አገራችን በኤሌክትሪክ ኃይል ራሷን እንድትችልና ለጎረቤት አገራትም እንድትሸጥ ከፍተኛ አስተዋጽኦ ያደርጋል። የህዝባችን የጋራ አሻራና የአገር ልማት መሰረት ነው። ፕሮጀክቱ በስኬት ተጠናቆ ለትውልድ ብርሃን ይሆናል።';
      setSelectedVoiceId('v-dawit');
    } else if (sampleType === 'fikr') {
      title = 'ፍቅር እስከ መቃብር (ሀዲስ አለማየሁ)';
      sample =
        'በደራሲ ሀዲስ አለማየሁ የተደረሰው ፍቅር እስከ መቃብር የኢትዮጵያ ክላሲክ ልብወለድ ነው። በፊውዳል ሥርዓት ውስጥ ያለውን የፍቅር፣ የክብርና የህይወት ትግል በጥልቅ ያሳያል። የበዛብህና የሰበላ ፍቅር ለትውልድ የሚነገር ታሪክ ነው። እውነተኛ ፍቅር ሁልጊዜ በልብ ውስጥ የማይጠፋ ፋና ሆኖ ይኖራል።';
      setSelectedVoiceId('v-almaz');
    } else if (sampleType === 'gadaa') {
      title = 'Sirna Gadaa Oromoo';
      sample =
        'Sirni Gadaa sirna dimokraatawaa fi aadaa bulchiinsa Oromooti. Waggoota saddeet saddeetiin geggeeffamoota haaraya filachuun nagaa fi tasgabbii uummataa eega. Kunis qabeenya aadaa addunyaati. Sirni kun mirga namoomaa fi nageenya hawaasaa mirkaneessa.';
      setSelectedVoiceId('v-chala');
    } else if (sampleType === 'axum') {
      title = 'ጥንታዊት ከተማ ኣኽሱም';
      sample =
        'ጥንታዊት ከተማ ኣኽሱም ውቁብ ሓወልትታትን ጥንታዊ ቅርስታትን ዝሓዘለት ታሪኻዊት ዓዲ እያ። ንትውልዲ ዝተረከበ ታሪኽና ክንዕቅቦን ከነማዕብሎን ይግባእ። እዚ ቅርስና መግለጺ ክብረትናን ታሪኽናን እዩ።';
      setSelectedVoiceId('v-hagos');
    } else {
      title = 'African Union & Pan-African Vision';
      sample =
        'Addis Ababa stands as the historic diplomatic crossroads of Africa. As the headquarters of the African Union and UNECA, the city hosts global leaders and champions continental solidarity, sustainable growth, and rich pan-African heritage.';
      setSelectedVoiceId('v-michael');
    }

    processExtractedText(sample, title);
    triggerToast(`Loaded sample: ${title}`, 'success');
  };

  const handlePlayChunk = (idx: number) => {
    if (idx < 0 || idx >= docChunks.length) return;
    setActiveChunkIndex(idx);
    const chunk = docChunks[idx];
    if (chunk) {
      onSpeakSentence(chunk, selectedVoice);
    }
  };

  const handlePreviousChunk = () => {
    if (activeChunkIndex > 0) {
      handlePlayChunk(activeChunkIndex - 1);
    }
  };

  const handleNextChunk = () => {
    if (activeChunkIndex < docChunks.length - 1) {
      handlePlayChunk(activeChunkIndex + 1);
    }
  };

  const handleClearDocument = () => {
    setDocumentContent('');
    setDocChunks([]);
    setActiveChunkIndex(0);
    triggerToast('Document cleared', 'info');
  };

  const progressPercent = docChunks.length > 0 ? Math.round(((activeChunkIndex + 1) / docChunks.length) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title & Workflow Guide */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <p className="text-xs font-bold text-[#006241] uppercase tracking-wider">
            Audiobook & Manuscript Engine
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Continuous Document Reader
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Listen to textbooks, articles, or books sentence-by-sentence with visual synchronized highlighting.
          </p>
        </div>

        {/* Narrator Voice Picker */}
        <div className="flex items-center gap-2 bg-white p-2 border border-slate-200 rounded-2xl shadow-2xs self-start md:self-auto">
          <span className="text-xs text-slate-500 font-semibold pl-1">Narrator:</span>
          <select
            value={selectedVoiceId}
            onChange={(e) => setSelectedVoiceId(e.target.value)}
            className="text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none"
          >
            {VOICES.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} ({v.language.toUpperCase()} · {v.accent.split(' ')[0]})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 5-Step Workflow Banner */}
      <div className="hidden sm:grid grid-cols-5 gap-2 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] font-semibold text-slate-600 text-center">
        <span className="text-[#006241]">1. Upload Document</span>
        <span>➙</span>
        <span className="text-[#006241]">2. Extract Sentences</span>
        <span>➙</span>
        <span className="text-[#006241]">3. Listen & Follow Along</span>
      </div>

      {!documentContent ? (
        /* Empty State & Upload Area */
        <div className="space-y-6">
          <div className="border-2 border-dashed border-slate-300 hover:border-[#006241] rounded-3xl p-10 sm:p-14 text-center bg-white hover:bg-slate-50/50 transition relative group cursor-pointer">
            <input
              type="file"
              accept=".txt,.pdf,.docx"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              aria-label="Upload document file"
            />
            <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 text-[#006241] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xs group-hover:scale-110 transition-transform">
              <FileUp size={28} />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Upload Ethiopian Document, Textbook, or Article
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Drag & drop plain text (.txt), PDF excerpts, or study notes for sentence-by-sentence reading
            </p>
          </div>

          {/* Quick-Load Sample Ethiopian Classics */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Or load sample Ethiopian classics to start immediately:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
              <button
                type="button"
                onClick={() => handleLoadSample('dam')}
                className="p-3 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 rounded-xl text-left transition text-xs font-semibold text-slate-800"
              >
                🇪🇹 Renaissance Dam (Amharic)
              </button>
              <button
                type="button"
                onClick={() => handleLoadSample('fikr')}
                className="p-3 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 rounded-xl text-left transition text-xs font-semibold text-slate-800"
              >
                📖 Fikr Eske Meqabr (Literature)
              </button>
              <button
                type="button"
                onClick={() => handleLoadSample('gadaa')}
                className="p-3 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 rounded-xl text-left transition text-xs font-semibold text-slate-800"
              >
                🌳 Oromo Gadaa (Afaan Oromoo)
              </button>
              <button
                type="button"
                onClick={() => handleLoadSample('axum')}
                className="p-3 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 rounded-xl text-left transition text-xs font-semibold text-slate-800"
              >
                🏛️ Axum Heritage (Tigrinya)
              </button>
              <button
                type="button"
                onClick={() => handleLoadSample('diplomacy')}
                className="p-3 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 rounded-xl text-left transition text-xs font-semibold text-slate-800"
              >
                🌐 African Union (English)
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Active Document Reader View */
        <div className="space-y-4">
          {/* Reader Sticky Control Dock */}
          <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-sm space-y-3 sticky top-16 z-20 backdrop-blur-md bg-white/95">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-[#006241]" />
                <span className="font-bold text-sm text-slate-900 truncate max-w-xs">
                  {documentTitle}
                </span>
                <span className="text-xs text-slate-400">
                  ({docChunks.length} sentences)
                </span>
              </div>

              {/* Progress & Speed */}
              <div className="flex items-center gap-3 text-xs">
                <span className="font-mono text-slate-600 font-semibold">
                  Sentence {activeChunkIndex + 1} of {docChunks.length} ({progressPercent}%)
                </span>
                <button
                  type="button"
                  onClick={handleClearDocument}
                  className="text-slate-400 hover:text-red-600 font-semibold flex items-center gap-1"
                >
                  <Trash2 size={13} />
                  <span>Clear</span>
                </button>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-[#006241] h-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Playback Transport: Prev, Play/Pause, Next */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2">
                {/* Previous Sentence */}
                <button
                  type="button"
                  onClick={handlePreviousChunk}
                  disabled={activeChunkIndex <= 0}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-bold rounded-xl text-xs transition flex items-center gap-1"
                >
                  <ChevronLeft size={15} />
                  <span>Previous</span>
                </button>

                {/* Play / Pause Sentence */}
                <button
                  type="button"
                  onClick={() => handlePlayChunk(activeChunkIndex)}
                  className="px-5 py-2 bg-[#006241] hover:bg-[#004d33] text-white font-bold rounded-xl text-xs shadow-xs transition flex items-center gap-2"
                >
                  {isPlaying ? (
                    <>
                      <Pause size={15} />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play size={15} className="fill-current ml-0.5" />
                      <span>Read Sentence</span>
                    </>
                  )}
                </button>

                {/* Next Sentence */}
                <button
                  type="button"
                  onClick={handleNextChunk}
                  disabled={activeChunkIndex >= docChunks.length - 1}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-bold rounded-xl text-xs transition flex items-center gap-1"
                >
                  <span>Next</span>
                  <ChevronRight size={15} />
                </button>
              </div>

              {/* Action: Send to Studio */}
              <button
                type="button"
                onClick={() => {
                  if (docChunks[activeChunkIndex]) {
                    onSendToStudio(docChunks[activeChunkIndex]);
                  }
                }}
                className="text-xs text-[#006241] font-bold hover:underline flex items-center gap-1"
              >
                <span>Edit Sentence in Studio</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>

          {/* Sentence by Sentence Illuminated Text View */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-3 max-h-[60vh] overflow-y-auto">
            {docChunks.map((chunk, idx) => {
              const isActive = activeChunkIndex === idx;
              return (
                <div
                  key={idx}
                  ref={(el) => {
                    sentenceRefs.current[idx] = el;
                  }}
                  onClick={() => handlePlayChunk(idx)}
                  className={`p-4 rounded-2xl cursor-pointer transition flex items-start gap-3 ${
                    isActive
                      ? 'bg-emerald-50 border-2 border-[#006241] shadow-2xs'
                      : 'hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-lg text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                      isActive
                        ? 'bg-[#006241] text-white'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <p
                    className={`leading-relaxed text-sm sm:text-base ${
                      isActive
                        ? 'font-bold text-[#006241]'
                        : 'text-slate-700'
                    }`}
                  >
                    {chunk}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
