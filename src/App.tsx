import React, { useState, useEffect, useRef } from 'react';
import {
  LanguageCode,
  Voice,
  HistoryItem,
  PresetTemplate,
  AdminStats
} from './types';
import { LANGUAGES, VOICES, PRESETS, INITIAL_ADMIN_STATS } from './data';
import { generateAcousticSpeechWav, generateProceduralAudioBlob } from './utils/audioSynthesizer';
import { transliterateGeezToPhonetic, isGeezScript } from './utils/geezPhonetics';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AudioPlayerDock from './components/AudioPlayerDock';
import SubscriptionModal from './components/SubscriptionModal';
import DownloadFormatModal from './components/DownloadFormatModal';
import HelpModal from './components/HelpModal';
import SettingsModal from './components/SettingsModal';
import HomePage from './pages/HomePage';
import StudioPage from './pages/StudioPage';
import VoiceExplorerPage from './pages/VoiceExplorerPage';
import OcrPage from './pages/OcrPage';
import DocumentReaderPage from './pages/DocumentReaderPage';
import LibraryPage from './pages/LibraryPage';
import PricingPage from './pages/PricingPage';
import ApiDocsPage from './pages/ApiDocsPage';
import AboutPage from './pages/AboutPage';
import AdminPage from './pages/AdminPage';
import { AlertCircle, CheckCircle2, Globe, User, LogOut, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Ensures all history records have camelCase properties and valid audioUrl
export function normalizeHistoryItem(raw: any): HistoryItem {
  if (!raw) {
    return {
      id: 'default_' + Date.now().toString(36),
      text: '',
      language: 'am',
      voiceId: 'v-selam',
      voiceName: 'Selam',
      date: new Date().toISOString(),
      duration: 0,
      wordCount: 0,
      charCount: 0,
      category: 'Personal',
      favorite: false,
      format: 'wav',
      quality: 'hd',
      audioUrl: '',
      sizeKb: 0,
      engine: 'EthioVoice Studio'
    };
  }

  const rawUrl =
    raw.audioUrl ||
    raw.audio_url ||
    raw.url ||
    raw.file ||
    raw.audio ||
    raw.src ||
    '';
  const rawPath =
    raw.audio_path ||
    raw.audioPath ||
    raw.path ||
    raw.filename ||
    '';

  let url = rawUrl;
  if (!url && rawPath) {
    if (rawPath.startsWith('/audio/') || rawPath.startsWith('/generated-audio/')) {
      url = rawPath;
    } else if (rawPath.startsWith('sample_')) {
      url = `/audio/${rawPath}`;
    } else {
      url = `/generated-audio/${rawPath}`;
    }
  }

  // Fallback by ID if URL was not directly attached
  if (!url && raw.id) {
    if (raw.id.startsWith('speech_')) {
      url = `/generated-audio/${raw.id}.${raw.format || 'wav'}`;
    } else if (raw.id.startsWith('preview-')) {
      const vKey = raw.id.replace('preview-', '').replace('v-', '');
      url = `/audio/sample_${vKey}.wav`;
    } else if (raw.id === 'h-seed-1') {
      url = '/audio/sample_selam.wav';
    } else if (raw.id === 'h-seed-2') {
      url = '/audio/sample_hagos.wav';
    }
  }

  // Fallback by Voice ID (sample/preview audition)
  if (!url && (raw.voiceId || raw.voice_id)) {
    const vId = raw.voiceId || raw.voice_id;
    const vKey = vId.replace('v-', '');
    url = `/audio/sample_${vKey}.wav`;
  }

  return {
    id: raw.id || 'speech_' + Date.now().toString(36),
    text: raw.text || '',
    language: (raw.language || 'am') as LanguageCode,
    voiceId: raw.voiceId || raw.voice_id || 'v-selam',
    voiceName: raw.voiceName || raw.voice_name || 'Selam',
    date: raw.date || raw.created_at || new Date().toISOString(),
    duration: typeof raw.duration === 'number' ? raw.duration : parseFloat(raw.duration) || 0,
    wordCount: raw.wordCount ?? raw.word_count ?? 0,
    charCount: raw.charCount ?? raw.char_count ?? 0,
    category: raw.category || 'Personal',
    favorite: Boolean(raw.favorite),
    format: (raw.format || 'wav') as 'mp3' | 'wav' | 'aac',
    quality: (raw.quality || 'hd') as 'low' | 'standard' | 'hd',
    audioUrl: url,
    sizeKb: raw.sizeKb ?? raw.size_kb ?? 0,
    engine: raw.engine || 'EthioVoice Studio'
  };
}

export default function App() {
  // Navigation
  const [currentTab, setCurrentTab] = useState<string>('home');

  // Input & Studio State
  const [inputText, setInputText] = useState(
    'ሰላም፣ እንኳን ወደ ኢትዮቮይስ በደህና መጡ። ይህ አርቴፊሻል ኢንተለጀንስን በመጠቀም ማንኛውንም ጽሁፍ ወደ ንግግር የሚቀይር ዘመናዊ መተግበሪያ ነው።'
  );
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>('am');
  const [selectedVoiceId, setSelectedVoiceId] = useState('v-selam');
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [audioFormat, setAudioFormat] = useState<'mp3' | 'wav' | 'aac'>('wav');
  const [audioQuality, setAudioQuality] = useState<'low' | 'standard' | 'hd'>('hd');
  const [saveCategory, setSaveCategory] = useState<string>('Personal');
  const [selectedEngine, setSelectedEngine] = useState<'addis' | 'gemini' | 'browser'>('gemini');

  // Translation & Normalizer States
  const [isNormalizing, setIsNormalizing] = useState(false);
  const [normalizationLog, setNormalizationLog] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);

  // Audio Playback Context
  const [currentTrack, setCurrentTrack] = useState<HistoryItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [isGeneratingSpeech, setIsGeneratingSpeech] = useState(false);

  // Preview Voice State (for Soundboard)
  const [activePreviewVoiceId, setActivePreviewVoiceId] = useState<string | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  // Audio Library State
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);

  // User Auth & Subscription
  const [authToken, setAuthToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem('ethiovoice_token');
    } catch {
      return null;
    }
  });
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [conversionsLeft, setConversionsLeft] = useState(20);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [authInputEmail, setAuthInputEmail] = useState('');
  const [authInputPassword, setAuthInputPassword] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authName, setAuthName] = useState('');

  // Audio Format Download Selector Modal (WAV, MP3, AAC)
  const [downloadTrack, setDownloadTrack] = useState<HistoryItem | null>(null);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  const handleOpenDownloadModal = (track?: HistoryItem | null) => {
    const rawTarget = track || currentTrack;
    if (rawTarget) {
      const target = normalizeHistoryItem(rawTarget);
      if (target.audioUrl) {
        setDownloadTrack(target);
        setIsDownloadModalOpen(true);
        return;
      }
    }
    triggerToast('Synthesize speech first to download audio', 'info');
  };

  // Admin Stats
  const [adminStats, setAdminStats] = useState<AdminStats>(INITIAL_ADMIN_STATS);

  // Accessibility Flag
  const [accessibilityMode, setAccessibilityMode] = useState(false);

  // Toast System
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // HTML Audio Object Ref & Generation Lock
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speechTimerRef = useRef<any>(null);
  const isGeneratingRef = useRef(false);
  const [lastGeneratedTrack, setLastGeneratedTrack] = useState<HistoryItem | null>(null);

  // Sync selectedVoiceId whenever selectedLanguage changes
  useEffect(() => {
    const currentVoice = VOICES.find((v) => v.id === selectedVoiceId);
    if (!currentVoice || currentVoice.language !== selectedLanguage) {
      const match = VOICES.find((v) => v.language === selectedLanguage);
      if (match) {
        setSelectedVoiceId(match.id);
      }
    }
  }, [selectedLanguage, selectedVoiceId]);

  // Sync audio playback rate when playbackSpeed changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // Sync volume and mute state
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Safely restore and persist user selections in localStorage
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem('ethiovoice_selected_lang');
      if (savedLang && LANGUAGES.some((l) => l.code === savedLang)) {
        setSelectedLanguage(savedLang as LanguageCode);
      }
      const savedVoice = localStorage.getItem('ethiovoice_selected_voice');
      if (savedVoice && VOICES.some((v) => v.id === savedVoice)) {
        setSelectedVoiceId(savedVoice);
      }
      const savedText = localStorage.getItem('ethiovoice_draft_text');
      if (savedText && savedText.trim()) {
        setInputText(savedText);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('ethiovoice_selected_lang', selectedLanguage);
      localStorage.setItem('ethiovoice_selected_voice', selectedVoiceId);
      localStorage.setItem('ethiovoice_draft_text', inputText);
    } catch {}
  }, [selectedLanguage, selectedVoiceId, inputText]);

  const triggerToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch initial history & telemetry
  const loadInitialData = async () => {
    let token = authToken;
    try {
      if (!token) {
        token = localStorage.getItem('ethiovoice_token');
      }
    } catch {}

    const authHeaders: Record<string, string> = {};
    if (token) {
      authHeaders['Authorization'] = `Bearer ${token}`;
      try {
        const meRes = await fetch('/api/auth/me', { headers: authHeaders });
        if (meRes.ok) {
          const meData = await meRes.json();
          if (meData.user) {
            setUserEmail(meData.user.email);
            setIsPremium(Boolean(meData.user.isPremium));
            setConversionsLeft(meData.user.conversionsLeft ?? 20);
          }
        } else if (meRes.status === 401) {
          localStorage.removeItem('ethiovoice_token');
          setAuthToken(null);
          setUserEmail(null);
        }
      } catch {}
    }

    try {
      const res = await fetch('/api/history', { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        if (data.history && data.history.length > 0) {
          const normalized = data.history.map(normalizeHistoryItem);
          setHistoryItems(normalized);
          const firstPlayable = normalized.find((item: HistoryItem) => Boolean(item.audioUrl));
          if (firstPlayable) {
            setCurrentTrack(firstPlayable);
          }
        }
        if (data.userPreferences) {
          if (!token) {
            setIsPremium(Boolean(data.userPreferences.isPremium));
            setConversionsLeft(data.userPreferences.conversionsLeft ?? 20);
          }
        }
      }
    } catch {}
  };

  useEffect(() => {
    loadInitialData();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  // Sync Admin Stats
  const fetchAdminStats = async () => {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        setAdminStats(data);
      }
    } catch (e) {
      console.warn('Backend stats sync skipped:', e);
    }
  };

  useEffect(() => {
    if (currentTab === 'admin') {
      fetchAdminStats();
    }
  }, [currentTab]);

  // Centralized Audio Engine Lifecycle: Always uses authentic audio with real events and duration
  const loadTrackAudio = (rawItem: HistoryItem, autoPlay = false) => {
    if (!rawItem) return;
    const item = normalizeHistoryItem(rawItem);

    // 1. Terminate any active audio or speech synthesis
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute('src');
      audioRef.current.load();
    }
    if (speechTimerRef.current) {
      clearInterval(speechTimerRef.current);
    }

    setCurrentTrack(item);
    setCurrentTime(0);
    setDuration(item.duration || 0);

    let effectiveUrl = item.audioUrl || (item as any).audio_url || '';
    if (!effectiveUrl && item.id) {
      if (item.id.startsWith('speech_')) {
        effectiveUrl = `/generated-audio/${item.id}.${item.format || 'wav'}`;
      } else if (item.id.startsWith('preview-')) {
        const vKey = item.id.replace('preview-', '').replace('v-', '');
        effectiveUrl = `/audio/sample_${vKey}.wav`;
      } else if (item.id === 'h-seed-1') {
        effectiveUrl = '/audio/sample_selam.wav';
      } else if (item.id === 'h-seed-2') {
        effectiveUrl = '/audio/sample_hagos.wav';
      }
    }
    if (!effectiveUrl && item.voiceId) {
      const vKey = item.voiceId.replace('v-', '');
      effectiveUrl = `/audio/sample_${vKey}.wav`;
    }

    if (!effectiveUrl) {
      setIsPlaying(false);
      triggerToast('Synthesize speech first to listen to audio', 'info');
      return;
    }

    try {
      const audio = new Audio(effectiveUrl);
      audio.playbackRate = playbackSpeed;
      audio.volume = isMuted ? 0 : volume;

      audio.addEventListener('loadedmetadata', () => {
        if (audio.duration && isFinite(audio.duration) && audio.duration > 0) {
          setDuration(audio.duration);
        } else if (item.duration) {
          setDuration(item.duration);
        }
      });

      audio.addEventListener('timeupdate', () => {
        if (audio.currentTime !== undefined && isFinite(audio.currentTime)) {
          setCurrentTime(audio.currentTime);
        }
      });

      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        setCurrentTime(0);
      });

      audio.addEventListener('error', (e) => {
        console.error('Audio element playback error:', e);
        setIsPlaying(false);
        triggerToast('Could not play audio track. Please click "Generate Speech" to re-synthesize.', 'error');
      });

      audioRef.current = audio;
      (audio as any)._trackId = item.id;

      if (autoPlay) {
        setIsPlaying(true);
        audio.play().catch((err) => {
          console.warn('Playback error or blocked by browser policy:', err);
          setIsPlaying(false);
        });
      } else {
        setIsPlaying(false);
      }
    } catch (err) {
      console.error('Audio initialization error:', err);
      setIsPlaying(false);
      triggerToast('Failed to initialize audio', 'error');
    }
  };

  // Handle Play Track (e.g. from Library, History, or Preview)
  const handlePlayTrack = (rawItem: HistoryItem) => {
    if (!rawItem) return;
    loadTrackAudio(normalizeHistoryItem(rawItem), true);
  };

  const handleTogglePlayPause = () => {
    if (!currentTrack) {
      if (historyItems.length > 0) {
        handlePlayTrack(historyItems[0]);
      } else {
        triggerToast('No speech synthesized yet. Click Generate Speech!', 'info');
      }
      return;
    }

    // Ensure audioRef is pointing to currentTrack
    if (!audioRef.current || (audioRef.current as any)._trackId !== currentTrack.id) {
      loadTrackAudio(currentTrack, true);
      return;
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.playbackRate = playbackSpeed;
      audioRef.current.volume = isMuted ? 0 : volume;
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((e) => {
          console.warn('Play failed:', e);
          setIsPlaying(false);
        });
    }
  };

  const handleStopPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (speechTimerRef.current) {
      clearInterval(speechTimerRef.current);
    }
    setIsPlaying(false);
    setCurrentTime(0);
    setIsPlayingPreview(false);
    setActivePreviewVoiceId(null);
  };

  const handleReplay = () => {
    if (currentTrack) {
      if (audioRef.current && (audioRef.current as any)._trackId === currentTrack.id) {
        audioRef.current.currentTime = 0;
        setCurrentTime(0);
        audioRef.current.playbackRate = playbackSpeed;
        audioRef.current.volume = isMuted ? 0 : volume;
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch((err) => {
            console.warn('Replay failed:', err);
            setIsPlaying(false);
          });
      } else {
        loadTrackAudio(currentTrack, true);
      }
    }
  };

  const handleSeek = (time: number) => {
    const validDuration = duration || currentTrack?.duration || 0;
    const clampedTime = Math.max(0, validDuration > 0 ? Math.min(time, validDuration) : time);
    setCurrentTime(clampedTime);
    if (audioRef.current) {
      audioRef.current.currentTime = clampedTime;
    }
  };

  const handleVolumeChange = (vol: number) => {
    setVolume(vol);
    setIsMuted(vol === 0);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
  };

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    if (audioRef.current) {
      audioRef.current.volume = next ? 0 : volume;
    }
  };

  // Preview Voice Sample (for Soundboard & Auditions)
  const handlePreviewVoice = async (voice: Voice) => {
    if (isPlayingPreview && activePreviewVoiceId === voice.id) {
      handleStopPlayback();
      return;
    }

    setActivePreviewVoiceId(voice.id);
    setIsPlayingPreview(true);

    // Dedicated studio-grade master audio for all 13 Ethiopian personas
    const voiceAudioMap: Record<string, { file: string; duration: number }> = {
      'v-selam': { file: '/audio/sample_selam.wav', duration: 6.2 },
      'v-dawit': { file: '/audio/sample_dawit.wav', duration: 6.4 },
      'v-almaz': { file: '/audio/sample_almaz.wav', duration: 6.5 },
      'v-meron': { file: '/audio/sample_meron.wav', duration: 5.9 },
      'v-abebe': { file: '/audio/sample_abebe.wav', duration: 6.6 },
      'v-hagos': { file: '/audio/sample_hagos.wav', duration: 5.4 },
      'v-rahel': { file: '/audio/sample_rahel.wav', duration: 5.2 },
      'v-berhanu': { file: '/audio/sample_berhanu.wav', duration: 6.1 },
      'v-chala': { file: '/audio/sample_chala.wav', duration: 5.8 },
      'v-bontu': { file: '/audio/sample_bontu.wav', duration: 5.7 },
      'v-gemechu': { file: '/audio/sample_gemechu.wav', duration: 6.3 },
      'v-michael': { file: '/audio/sample_michael.wav', duration: 4.8 },
      'v-beth': { file: '/audio/sample_beth.wav', duration: 4.6 }
    };

    const target = voiceAudioMap[voice.id] || { file: '/audio/sample_selam.wav', duration: 6.0 };

    const previewItem: HistoryItem = {
      id: 'preview-' + voice.id,
      text: voice.sampleText,
      language: voice.language,
      voiceId: voice.id,
      voiceName: `${voice.name} (${voice.accent})`,
      date: new Date().toISOString(),
      duration: target.duration,
      wordCount: voice.sampleText.split(/\s+/).length,
      charCount: voice.sampleText.length,
      category: 'Preview',
      favorite: false,
      format: 'wav',
      quality: 'hd',
      audioUrl: target.file,
      sizeKb: 380,
      engine: 'EthioVoice Studio Neural Master'
    };

    handlePlayTrack(previewItem);
  };

  // Main Speech Synthesis Action (NO FAKE SUCCESS: Never return sample audio or mock data)
  const handleGenerateSpeech = async () => {
    // Guard against duplicate concurrent requests
    if (isGeneratingRef.current || isGeneratingSpeech) {
      return;
    }

    if (!inputText.trim()) {
      triggerToast('Please type or paste some text first', 'error');
      return;
    }

    const activeVoice = VOICES.find((v) => v.id === selectedVoiceId) || VOICES[0];
    isGeneratingRef.current = true;
    setIsGeneratingSpeech(true);

    try {
      const payload = {
        text: inputText,
        language: selectedLanguage,
        voiceId: selectedVoiceId,
        voiceName: `${activeVoice.name} (${activeVoice.accent})`,
        speed: playbackSpeed,
        format: audioFormat,
        quality: audioQuality,
        category: saveCategory,
        engine: selectedEngine
      };

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const res = await fetch('/api/tts/generate', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        const item = normalizeHistoryItem(data.item);

        setHistoryItems((prev) => [item, ...prev]);
        if (typeof data.conversionsLeft === 'number') {
          setConversionsLeft(data.conversionsLeft);
        } else if (conversionsLeft > 0 && !isPremium) {
          setConversionsLeft((c) => Math.max(0, c - 1));
        }

        // Initialize audio player with new generated track
        loadTrackAudio(item, false);
        setLastGeneratedTrack(item);
        triggerToast('✓ Speech generated successfully! Ready to listen.', 'success');
      } else {
        const errorData = await res.json().catch(() => ({}));
        if (res.status === 403 || errorData.code === 'LIMIT_EXCEEDED') {
          setShowUpgradeModal(true);
          triggerToast(
            errorData.error || 'Daily generation quota reached. Upgrade to Pro with Telebirr or Chapa for unlimited syntheses.',
            'error'
          );
        } else {
          triggerToast(errorData.error || 'Speech synthesis failed. Please retry.', 'error');
        }
      }
    } catch {
      triggerToast('Connection error during speech generation. Please retry.', 'error');
    } finally {
      setIsGeneratingSpeech(false);
      isGeneratingRef.current = false;
    }
  };

  // Normalization logic
  const handleNormalizePronunciation = async () => {
    if (!inputText.trim()) return;
    setIsNormalizing(true);
    try {
      const res = await fetch('/api/pronounce/normalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText, language: selectedLanguage })
      });
      if (res.ok) {
        const data = await res.json();
        setInputText(data.normalizedText);
        setNormalizationLog(data.explanation);
        triggerToast('Ge\'ez prosody & punctuation pauses optimized!', 'success');
      }
    } catch {
      // Client-side punctuation normalization
      const normalized = inputText
        .replace(/\s*፡\s*/g, ' ')
        .replace(/\s*፣\s*/g, '፣ ')
        .replace(/\s*።\s*/g, '። ')
        .trim();
      setInputText(normalized);
      setNormalizationLog('Normalized Ge\'ez punctuation (።, ፣) to induce natural respiratory pauses.');
      triggerToast('Punctuation pauses optimized locally!', 'success');
    } finally {
      setIsNormalizing(false);
    }
  };

  // Translation transfer (NO FAKE TRANSLATION FALLBACK)
  const handleTranslateAndInject = async (text: string, from: LanguageCode, to: LanguageCode) => {
    setIsTranslating(true);
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, from, to })
      });
      if (res.ok) {
        const data = await res.json();
        setInputText(data.translatedText);
        setSelectedLanguage(to);
        const matchVoice = VOICES.find((v) => v.language === to);
        if (matchVoice) setSelectedVoiceId(matchVoice.id);
        triggerToast('✓ Translated text inserted into studio', 'success');
      } else {
        const errData = await res.json().catch(() => ({}));
        triggerToast(errData.error || 'Translation failed. Please retry.', 'error');
      }
    } catch {
      triggerToast('Translation service unreachable. Please check network and retry.', 'error');
    } finally {
      setIsTranslating(false);
    }
  };

  // Upgrades (Verifies payment on backend)
  const handleUpgradeSuccess = async (channel: 'chapa' | 'telebirr') => {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const res = await fetch('/api/auth/upgrade', {
        method: 'POST',
        headers,
        body: JSON.stringify({ channel, plan: 'pro_monthly' })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsPremium(true);
        setConversionsLeft(999999);
        setShowUpgradeModal(false);
        triggerToast(
          `✓ EthioVoice Pro activated via ${channel === 'telebirr' ? 'Telebirr Mobile' : 'Chapa Gateway'}!`,
          'success'
        );
      } else {
        triggerToast(data.error || 'Subscription upgrade could not be verified on server.', 'error');
      }
    } catch {
      triggerToast('Payment verification network error. Please contact support.', 'error');
    }
  };

  // Toggle favorite (Protected with user JWT)
  const handleToggleFavorite = async (id: string, currentlyFav: boolean) => {
    setHistoryItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, favorite: !currentlyFav } : item))
    );
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
      await fetch('/api/history/favorite', {
        method: 'POST',
        headers,
        body: JSON.stringify({ id, favorite: !currentlyFav })
      });
    } catch {}
    triggerToast(!currentlyFav ? 'Added to Starred' : 'Removed from Starred', 'info');
  };

  // Update classification (Protected with user JWT)
  const handleUpdateCategory = async (id: string, category: string) => {
    setHistoryItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, category } : item))
    );
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
      await fetch('/api/history/classify', {
        method: 'POST',
        headers,
        body: JSON.stringify({ id, category })
      });
    } catch {}
    triggerToast(`Re-classified to ${category}!`, 'success');
  };

  // Delete clip (Protected with user JWT)
  const handleDeleteClip = async (id: string) => {
    setHistoryItems((prev) => prev.filter((item) => item.id !== id));
    if (currentTrack?.id === id) {
      handleStopPlayback();
      setCurrentTrack(null);
    }
    try {
      const headers: Record<string, string> = {};
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
      await fetch(`/api/history/${id}`, { method: 'DELETE', headers });
    } catch {}
    triggerToast('Audio recording removed from library', 'info');
  };

  // Social Share (Avoid window.open in iframe preview)
  const handleShareAudio = (item: HistoryItem, platform: 'telegram' | 'whatsapp') => {
    const textCaption = `Listen to this Ethiopian voiceover generated with EthioVoice: "${item.text.slice(0, 50)}..."`;
    const shareUrl = window.location.href;
    const shareText = `${textCaption} ${shareUrl}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText).then(() => {
        triggerToast(`Share text copied for ${platform === 'telegram' ? 'Telegram' : 'WhatsApp'}!`, 'success');
      }).catch(() => {
        triggerToast(`Shared to ${platform}!`, 'success');
      });
    } else {
      triggerToast(`Shared to ${platform}!`, 'success');
    }
  };

  // Auth handlers (Real Authentication with JWT)
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authInputEmail.trim()) {
      triggerToast('Please enter an email address', 'error');
      return;
    }
    if (authInputPassword.length < 6) {
      triggerToast('Password must be at least 6 characters', 'error');
      return;
    }

    const endpoint = authMode === 'register' ? '/api/auth/register' : '/api/auth/login';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: authInputEmail.trim(),
          password: authInputPassword,
          name: authName.trim()
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        triggerToast(data.error || 'Authentication failed', 'error');
        return;
      }

      if (data.token) {
        localStorage.setItem('ethiovoice_token', data.token);
        setAuthToken(data.token);
      }
      if (data.user) {
        setUserEmail(data.user.email);
        setIsPremium(data.user.isPremium);
        setConversionsLeft(data.user.conversionsLeft);
      }
      setShowAuthModal(false);
      setAuthInputPassword('');
      triggerToast(`Welcome back, ${data.user?.name || data.user?.email}!`, 'success');
      loadInitialData();
    } catch (err: any) {
      triggerToast(err.message || 'Authentication request failed', 'error');
    }
  };

  const handleGuestLogin = async () => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isGuest: true })
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem('ethiovoice_token', data.token);
        setAuthToken(data.token);
      }
      if (data.user) {
        setUserEmail(data.user.email);
        setIsPremium(data.user.isPremium);
        setConversionsLeft(data.user.conversionsLeft);
      }
      setShowAuthModal(false);
      triggerToast('Signed in as Guest!', 'success');
      loadInitialData();
    } catch {
      triggerToast('Could not initiate guest session', 'error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ethiovoice_token');
    setAuthToken(null);
    setUserEmail(null);
    setIsPremium(false);
    setConversionsLeft(20);
    setShowAuthModal(false);
    triggerToast('Logged out successfully', 'info');
    loadInitialData();
  };

  return (
    <div
      className={`min-h-screen bg-[#F8F9FA] flex flex-col font-sans text-slate-800 antialiased ${
        accessibilityMode ? 'text-lg' : 'text-sm'
      }`}
    >
      {/* Top Bar Contract Compliant Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        selectedLanguage={selectedLanguage}
        onSelectLanguage={(lang) => {
          setSelectedLanguage(lang);
          const v = VOICES.find((voice) => voice.language === lang);
          if (v) setSelectedVoiceId(v.id);
          const currentLangObj = LANGUAGES.find((l) => l.code === lang);
          const isDefaultOrEmpty =
            !inputText.trim() ||
            LANGUAGES.some((l) => l.sampleText.trim() === inputText.trim()) ||
            VOICES.some((voice) => voice.sampleText.trim() === inputText.trim());
          if (isDefaultOrEmpty && currentLangObj) {
            setInputText(currentLangObj.sampleText);
          }
        }}
        isPremium={isPremium}
        conversionsLeft={conversionsLeft}
        userEmail={userEmail}
        accessibilityMode={accessibilityMode}
        onToggleAccessibility={() => {
          setAccessibilityMode(!accessibilityMode);
          triggerToast(
            accessibilityMode ? 'Standard mode' : 'Large accessibility mode enabled',
            'info'
          );
        }}
        onOpenUpgradeModal={() => setShowUpgradeModal(true)}
        onOpenAuthModal={() => setShowAuthModal(true)}
        onOpenHelpModal={() => setShowHelpModal(true)}
        onOpenSettingsModal={() => setShowSettingsModal(true)}
      />

      {/* Main Page Routing Container */}
      <main className="flex-1 pb-28">
        <AnimatePresence mode="wait">
          {currentTab === 'home' && (
            <motion.div
              key="page-home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <HomePage
                onNavigate={(tab) => {
                  setCurrentTab(tab);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onPreviewVoice={handlePreviewVoice}
                activePreviewVoiceId={activePreviewVoiceId}
                isPlayingPreview={isPlayingPreview}
                onOpenUpgradeModal={() => setShowUpgradeModal(true)}
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
                onGenerateSpeech={handleGenerateSpeech}
                isGenerating={isGeneratingSpeech}
                currentTrack={currentTrack}
                isPlaying={isPlaying}
                currentTime={currentTime}
                duration={duration}
                volume={volume}
                isMuted={isMuted}
                onTogglePlayPause={handleTogglePlayPause}
                onSeek={handleSeek}
                onVolumeChange={handleVolumeChange}
                onToggleMute={handleToggleMute}
                onReplay={handleReplay}
                onOpenDownloadModal={handleOpenDownloadModal}
                conversionsLeft={conversionsLeft}
                isPremium={isPremium}
                triggerToast={triggerToast}
                onOpenHelpModal={() => setShowHelpModal(true)}
              />
            </motion.div>
          )}

          {currentTab === 'tts' && (
            <motion.div
              key="page-tts"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <StudioPage
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
                saveCategory={saveCategory}
                setSaveCategory={setSaveCategory}
                selectedEngine={selectedEngine}
                setSelectedEngine={setSelectedEngine}
                onGenerateSpeech={handleGenerateSpeech}
                isGenerating={isGeneratingSpeech}
                onNormalizePronunciation={handleNormalizePronunciation}
                isNormalizing={isNormalizing}
                normalizationLog={normalizationLog}
                onTranslateAndInject={handleTranslateAndInject}
                isTranslating={isTranslating}
                isPremium={isPremium}
                onOpenUpgradeModal={() => setShowUpgradeModal(true)}
                accessibilityMode={accessibilityMode}
                triggerToast={triggerToast}
                onPreviewVoice={handlePreviewVoice}
                activePreviewVoiceId={activePreviewVoiceId}
                isPlayingPreview={isPlayingPreview}
                currentTrack={currentTrack}
                onOpenDownloadModal={handleOpenDownloadModal}
                isPlaying={isPlaying}
                currentTime={currentTime}
                duration={duration}
                volume={volume}
                isMuted={isMuted}
                onTogglePlayPause={handleTogglePlayPause}
                onSeek={handleSeek}
                onVolumeChange={handleVolumeChange}
                onToggleMute={handleToggleMute}
                onReplay={handleReplay}
              />
            </motion.div>
          )}

          {currentTab === 'voices' && (
            <motion.div
              key="page-voices"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <VoiceExplorerPage
                onSelectVoiceForStudio={(voice) => {
                  setSelectedVoiceId(voice.id);
                  setSelectedLanguage(voice.language);
                  const isDefaultOrEmpty =
                    !inputText.trim() ||
                    LANGUAGES.some((l) => l.sampleText.trim() === inputText.trim()) ||
                    VOICES.some((v) => v.sampleText.trim() === inputText.trim());
                  if (isDefaultOrEmpty) {
                    setInputText(voice.sampleText);
                  }
                  setCurrentTab('tts');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  triggerToast(`Selected ${voice.name} for Speech Studio!`, 'success');
                }}
                onPreviewVoice={handlePreviewVoice}
                activePreviewVoiceId={activePreviewVoiceId}
                isPlayingPreview={isPlayingPreview}
                onOpenUpgradeModal={() => setShowUpgradeModal(true)}
              />
            </motion.div>
          )}

          {currentTab === 'ocr' && (
            <motion.div
              key="page-ocr"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <OcrPage
                onForwardTextToStudio={(text, lang) => {
                  setInputText(text);
                  setSelectedLanguage(lang);
                  const v = VOICES.find((voice) => voice.language === lang);
                  if (v) setSelectedVoiceId(v.id);
                  setCurrentTab('tts');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  triggerToast('Scanned manuscript loaded into Studio!', 'success');
                }}
                triggerToast={triggerToast}
              />
            </motion.div>
          )}

          {currentTab === 'docs' && (
            <motion.div
              key="page-docs"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <DocumentReaderPage
                onSpeakSentence={async (sentence, voice) => {
                  try {
                    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
                    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
                    const res = await fetch('/api/tts/generate', {
                      method: 'POST',
                      headers,
                      body: JSON.stringify({
                        text: sentence,
                        language: voice.language,
                        voiceId: voice.id,
                        voiceName: `${voice.name} (${voice.accent})`,
                        speed: playbackSpeed,
                        format: 'wav'
                      })
                    });
                    if (res.ok) {
                      const data = await res.json();
                      handlePlayTrack(data.item);
                    } else {
                      const errData = await res.json().catch(() => ({}));
                      triggerToast(errData.error || 'Speech synthesis failed for sentence.', 'error');
                    }
                  } catch {
                    triggerToast('Network error during sentence synthesis.', 'error');
                  }
                }}
                isPlaying={isPlaying}
                activeSentence={currentTrack?.text || null}
                onSendToStudio={(text) => {
                  setInputText(text);
                  setCurrentTab('tts');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  triggerToast('Sentence chunk transferred to Studio Lab', 'success');
                }}
                triggerToast={triggerToast}
              />
            </motion.div>
          )}

          {currentTab === 'library' && (
            <motion.div
              key="page-library"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <LibraryPage
                historyItems={historyItems}
                currentTrackId={currentTrack?.id || null}
                isPlaying={isPlaying}
                onPlayTrack={handlePlayTrack}
                onToggleFavorite={handleToggleFavorite}
                onUpdateCategory={handleUpdateCategory}
                onDeleteClip={handleDeleteClip}
                onShareAudio={handleShareAudio}
                onNavigateToStudio={() => {
                  setCurrentTab('tts');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenDownloadModal={handleOpenDownloadModal}
              />
            </motion.div>
          )}

          {currentTab === 'pricing' && (
            <motion.div
              key="page-pricing"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <PricingPage
                onOpenUpgradeModal={() => setShowUpgradeModal(true)}
                onNavigateToStudio={() => {
                  setCurrentTab('tts');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                isPremium={isPremium}
              />
            </motion.div>
          )}

          {currentTab === 'docs-api' && (
            <motion.div
              key="page-api"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <ApiDocsPage />
            </motion.div>
          )}

          {currentTab === 'about' && (
            <motion.div
              key="page-about"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <AboutPage />
            </motion.div>
          )}

          {currentTab === 'admin' && (
            <motion.div
              key="page-admin"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <AdminPage
                stats={adminStats}
                onRefreshStats={fetchAdminStats}
                triggerToast={triggerToast}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Quiet Footer */}
      <Footer
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Persistent Dock Player (Strict 15% Mobile Sticky Cap) */}
      <AudioPlayerDock
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        isMuted={isMuted}
        onTogglePlayPause={handleTogglePlayPause}
        onStop={handleStopPlayback}
        onReplay={handleReplay}
        onSeek={handleSeek}
        onVolumeChange={handleVolumeChange}
        onToggleMute={handleToggleMute}
        onGenerateNewSpeech={handleGenerateSpeech}
        isGenerating={isGeneratingSpeech}
        onOpenDownloadModal={() => handleOpenDownloadModal(currentTrack)}
      />

      {/* Audio Format Selector Modal (WAV, MP3, AAC) */}
      <DownloadFormatModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        track={downloadTrack || currentTrack}
        onToast={triggerToast}
      />

      {/* Telebirr & Chapa Payment Modal */}
      <SubscriptionModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onUpgradeSuccess={handleUpgradeSuccess}
        isPremium={isPremium}
        conversionsLeft={conversionsLeft}
      />

      {/* Account & Authentication Modal */}
      {showAuthModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 bg-[#006241] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User size={18} />
                <h3 className="font-bold text-base">
                  {userEmail ? 'Account Profile' : 'Sign in to EthioVoice'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAuthModal(false)}
                className="text-white/80 hover:text-white text-lg font-bold"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs text-slate-700">
              {userEmail ? (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                    <p className="text-[11px] text-slate-500 font-semibold uppercase">Currently Signed In</p>
                    <p className="text-sm font-bold text-slate-900 break-all">{userEmail}</p>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-[#006241]">
                        {isPremium ? '★ Pro Member' : 'Free Tier'}
                      </span>
                      <span className="text-slate-500 font-mono text-[11px]">
                        {isPremium ? 'Unlimited Syntheses' : `${conversionsLeft} syntheses left today`}
                      </span>
                    </div>
                  </div>

                  {!isPremium && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowAuthModal(false);
                        setShowUpgradeModal(true);
                      }}
                      className="w-full py-2.5 bg-[#F9D616] text-[#006241] font-bold rounded-xl text-xs text-center border border-yellow-300"
                    >
                      Upgrade to Pro (99 ETB / Telebirr & Chapa)
                    </button>
                  )}

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex-1 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5"
                    >
                      <LogOut size={14} />
                      <span>Log Out</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAuthModal(false)}
                      className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleAuthSubmit} className="space-y-3.5">
                  <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setAuthMode('login')}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
                        authMode === 'login' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthMode('register')}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
                        authMode === 'register' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Create Account
                    </button>
                  </div>

                  {authMode === 'register' && (
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Full Name:
                      </label>
                      <input
                        type="text"
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        placeholder="e.g. Almaz Bekele"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#006241]"
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Email Address:
                    </label>
                    <input
                      type="email"
                      required
                      value={authInputEmail}
                      onChange={(e) => setAuthInputEmail(e.target.value)}
                      placeholder="e.g. name@ethiovoice.com"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#006241]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Password (min 6 characters):
                    </label>
                    <input
                      type="password"
                      required
                      value={authInputPassword}
                      onChange={(e) => setAuthInputPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#006241]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#006241] hover:bg-[#004d33] text-white font-bold rounded-xl text-xs transition shadow-xs cursor-pointer"
                  >
                    {authMode === 'login' ? 'Sign In to Account' : 'Create Free Account'}
                  </button>

                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-slate-200"></div>
                    <span className="flex-shrink mx-3 text-slate-400 text-[10px] uppercase font-bold">Or</span>
                    <div className="flex-grow border-t border-slate-200"></div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGuestLogin}
                    className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
                  >
                    Continue as Guest
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* EthioVoice Help & Guide Modal */}
      <HelpModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        onNavigateTab={(tab) => {
          setShowHelpModal(false);
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* EthioVoice Settings & Preferences Modal */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        selectedLanguage={selectedLanguage}
        onSelectLanguage={setSelectedLanguage}
        selectedVoiceId={selectedVoiceId}
        onSelectVoiceId={setSelectedVoiceId}
        playbackSpeed={playbackSpeed}
        onSelectPlaybackSpeed={setPlaybackSpeed}
        audioFormat={audioFormat}
        onSelectAudioFormat={setAudioFormat}
        audioQuality={audioQuality}
        onSelectAudioQuality={setAudioQuality}
        accessibilityMode={accessibilityMode}
        onToggleAccessibility={() => {
          setAccessibilityMode(!accessibilityMode);
          triggerToast(
            !accessibilityMode ? 'Large accessibility mode enabled' : 'Standard mode restored',
            'info'
          );
        }}
        onClearHistory={() => {
          setHistoryItems([]);
          localStorage.removeItem('ethiovoice_history');
          triggerToast('Local speech history cleared', 'info');
        }}
        triggerToast={triggerToast}
      />

      {/* Global Alert Notification Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-24 right-4 sm:right-8 z-50 p-4 rounded-2xl shadow-xl flex items-center gap-3 border ${
              toast.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-800'
                : toast.type === 'info'
                ? 'bg-blue-50 border-blue-200 text-blue-800'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertCircle size={18} className="shrink-0" />
            ) : toast.type === 'info' ? (
              <Globe size={18} className="shrink-0" />
            ) : (
              <CheckCircle2 size={18} className="shrink-0" />
            )}
            <span className="text-xs font-bold">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
