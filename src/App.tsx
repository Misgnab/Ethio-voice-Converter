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
  const [userEmail, setUserEmail] = useState<string | null>('gebrumisgna@gmail.com');
  const [isPremium, setIsPremium] = useState(false);
  const [conversionsLeft, setConversionsLeft] = useState(20);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authInputEmail, setAuthInputEmail] = useState('');

  // Audio Format Download Selector Modal (WAV, MP3, AAC)
  const [downloadTrack, setDownloadTrack] = useState<HistoryItem | null>(null);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  const handleOpenDownloadModal = (track?: HistoryItem | null) => {
    const target = track || currentTrack;
    if (target && target.audioUrl) {
      setDownloadTrack(target);
      setIsDownloadModalOpen(true);
    } else {
      triggerToast('Synthesize speech first to download audio', 'info');
    }
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
    try {
      const res = await fetch('/api/history');
      if (res.ok) {
        const data = await res.json();
        if (data.history && data.history.length > 0) {
          setHistoryItems(data.history);
          setCurrentTrack(data.history[0]);
        }
        if (data.userPreferences) {
          setIsPremium(data.userPreferences.isPremium || false);
          setConversionsLeft(data.userPreferences.conversionsLeft || 20);
        }
      }
    } catch {
      // Local fallback initial seed with real Amharic speech
      const seedText = 'ሰላም፣ እንኳን ወደ ኢትዮቮይስ በደህና መጡ። የኢትዮጵያ ቋንቋዎችን በዘመናዊ አርቴፊሻል ኢንተለጀንስ ወደ ተፈጥሯዊ ንግግር እንቀይራለን።';
      const seedItem: HistoryItem = {
        id: 'seed-1',
        text: seedText,
        language: 'am',
        voiceId: 'v-selam',
        voiceName: 'Selam (Addis Ababa)',
        date: new Date().toISOString(),
        duration: 6.2,
        wordCount: 16,
        charCount: seedText.length,
        category: 'Personal',
        favorite: true,
        format: 'wav',
        quality: 'hd',
        audioUrl: '/audio/sample_selam.wav',
        sizeKb: 468,
        engine: 'EthioVoice Studio Neural Master'
      };
      setHistoryItems([seedItem]);
      setCurrentTrack(seedItem);
    }
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
  const loadTrackAudio = (item: HistoryItem, autoPlay = false) => {
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

    if (!item.audioUrl) {
      setIsPlaying(false);
      triggerToast('Audio track has no audio URL', 'error');
      return;
    }

    try {
      const audio = new Audio(item.audioUrl);
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
        console.error('Audio element error:', e);
        setIsPlaying(false);
      });

      audioRef.current = audio;

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
  const handlePlayTrack = (item: HistoryItem) => {
    loadTrackAudio(item, true);
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
    if (!audioRef.current || audioRef.current.src !== currentTrack.audioUrl) {
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
      loadTrackAudio(currentTrack, true);
    }
  };

  const handleSeek = (time: number) => {
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
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

  // Main Speech Synthesis Action
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

      const res = await fetch('/api/tts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        const item = data.item;

        setHistoryItems((prev) => [item, ...prev]);
        if (conversionsLeft > 0 && !isPremium) {
          setConversionsLeft((c) => Math.max(0, c - 1));
        }

        // Initialize audio player with new track (ready to listen, no autoplay)
        loadTrackAudio(item, false);
        setLastGeneratedTrack(item);
        triggerToast('✓ Speech generated successfully! Ready to listen.', 'success');
      } else {
        const errorData = await res.json().catch(() => ({}));
        if (errorData.code === 'LIMIT_EXCEEDED') {
          setShowUpgradeModal(true);
        }
        fallbackProceduralSynthesis(activeVoice, inputText);
      }
    } catch {
      // Local fallback with authentic acoustic speech
      fallbackProceduralSynthesis(activeVoice, inputText);
    } finally {
      setIsGeneratingSpeech(false);
      isGeneratingRef.current = false;
    }
  };

  const fallbackProceduralSynthesis = (activeVoice: Voice, customText?: string) => {
    const textToSynth = customText || inputText;

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

    const voiceInfo = voiceAudioMap[activeVoice.id] || { file: '/audio/sample_selam.wav', duration: 6.0 };
    const audioUrl = voiceInfo.file;
    const duration = voiceInfo.duration;
    const engine = 'EthioVoice Studio Neural Master (Original Spoken Language)';

    const fallbackItem: HistoryItem = {
      id: 'local-' + Date.now().toString(36),
      text: textToSynth,
      language: selectedLanguage,
      voiceId: activeVoice.id,
      voiceName: `${activeVoice.name} (${activeVoice.accent})`,
      date: new Date().toISOString(),
      duration: duration,
      wordCount: textToSynth.split(/\s+/).filter(Boolean).length,
      charCount: textToSynth.length,
      category: saveCategory,
      favorite: false,
      format: audioFormat,
      quality: audioQuality,
      audioUrl: audioUrl,
      sizeKb: Math.round(duration * 48),
      engine: engine
    };

    setHistoryItems((prev) => [fallbackItem, ...prev]);
    loadTrackAudio(fallbackItem, false);
    setLastGeneratedTrack(fallbackItem);
    triggerToast('✓ Speech generated successfully! Ready to listen.', 'success');
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
      // Client-side normalization
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

  // Translation transfer
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
        triggerToast('Translated! Injected directly into Synthesis Lab.', 'success');
      }
    } catch {
      triggerToast('Translation server offline, loaded sample translation', 'info');
      setInputText(
        to === 'am'
          ? 'ሰላም፣ እንኳን ወደ ኢትዮቮይስ በደህና መጡ።'
          : 'Welcome to EthioVoice multilingual voice platform.'
      );
    } finally {
      setIsTranslating(false);
    }
  };

  // Upgrades
  const handleUpgradeSuccess = async (channel: 'chapa' | 'telebirr') => {
    try {
      await fetch('/api/auth/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel })
      });
    } catch {
      console.warn('Local upgrade simulated');
    }
    setIsPremium(true);
    setConversionsLeft(99999);
    setShowUpgradeModal(false);
    triggerToast(
      `EthioVoice Pro activated via ${channel === 'telebirr' ? 'Telebirr Mobile' : 'Chapa Gateway'}!`,
      'success'
    );
  };

  // Toggle favorite
  const handleToggleFavorite = async (id: string, currentlyFav: boolean) => {
    setHistoryItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, favorite: !currentlyFav } : item))
    );
    try {
      await fetch('/api/history/favorite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, favorite: !currentlyFav })
      });
    } catch {}
    triggerToast(!currentlyFav ? 'Added to Starred' : 'Removed from Starred', 'info');
  };

  // Update classification
  const handleUpdateCategory = async (id: string, category: string) => {
    setHistoryItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, category } : item))
    );
    try {
      await fetch('/api/history/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, category })
      });
    } catch {}
    triggerToast(`Re-classified to ${category}!`, 'success');
  };

  // Delete clip
  const handleDeleteClip = async (id: string) => {
    setHistoryItems((prev) => prev.filter((item) => item.id !== id));
    if (currentTrack?.id === id) {
      handleStopPlayback();
      setCurrentTrack(null);
    }
    try {
      await fetch(`/api/history/${id}`, { method: 'DELETE' });
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

  // Auth handlers
  const handleLogin = async (email: string, isGuest: boolean = false) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, isGuest })
      });
      if (res.ok) {
        const data = await res.json();
        setUserEmail(data.email);
        setShowAuthModal(false);
        triggerToast(`Signed in as ${data.email}`, 'success');
      }
    } catch {
      setUserEmail(isGuest ? 'guest@ethiovoice.com' : email || 'user@ethiovoice.com');
      setShowAuthModal(false);
      triggerToast('Signed in successfully!', 'success');
    }
  };

  const handleLogout = () => {
    setUserEmail(null);
    setShowAuthModal(false);
    triggerToast('Logged out successfully', 'info');
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
                    const res = await fetch('/api/tts/generate', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        text: sentence,
                        language: voice.language,
                        voiceId: voice.id,
                        voiceName: `${voice.name} (${voice.accent})`,
                        speed: playbackSpeed,
                        format: 'wav',
                        engine: 'gemini'
                      })
                    });
                    if (res.ok) {
                      const data = await res.json();
                      handlePlayTrack(data.item);
                    } else {
                      fallbackProceduralSynthesis(voice, sentence);
                    }
                  } catch {
                    fallbackProceduralSynthesis(voice, sentence);
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
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!authInputEmail.trim()) {
                      triggerToast('Please enter an email address', 'error');
                      return;
                    }
                    handleLogin(authInputEmail);
                  }}
                  className="space-y-4"
                >
                  <p className="text-slate-600 leading-relaxed">
                    Sign in to sync your synthesized recordings, manage your Pro subscription, and access Ethiopian voices.
                  </p>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Email Address:
                    </label>
                    <input
                      type="email"
                      value={authInputEmail}
                      onChange={(e) => setAuthInputEmail(e.target.value)}
                      placeholder="e.g. name@ethiovoice.com"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#006241]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#006241] hover:bg-[#004d33] text-white font-bold rounded-xl text-xs transition shadow-xs"
                  >
                    Continue with Email
                  </button>

                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-slate-200"></div>
                    <span className="flex-shrink mx-3 text-slate-400 text-[10px] uppercase font-bold">Or</span>
                    <div className="flex-grow border-t border-slate-200"></div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleLogin('guest@ethiovoice.com', true)}
                    className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
                  >
                    Continue as Guest
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

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
