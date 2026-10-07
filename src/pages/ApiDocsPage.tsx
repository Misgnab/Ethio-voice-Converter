import React, { useState } from 'react';
import { Code2, Copy, Check, Terminal, Layers, Globe, ShieldCheck } from 'lucide-react';

export default function ApiDocsPage() {
  const [activeLang, setActiveLang] = useState<'curl' | 'js' | 'python'>('curl');
  const [copied, setCopied] = useState(false);

  const codeSnippets = {
    curl: `curl -X POST https://api.ethiovoice.com/v1/tts/generate \\
  -H "Authorization: Bearer YOUR_ETHIOVOICE_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "text": "ሰላም፣ እንኳን ወደ ኢትዮቮይስ በደህና መጡ።",
    "language": "am",
    "voiceId": "v-selam",
    "speed": 1.0,
    "format": "wav",
    "quality": "hd"
  }'`,
    js: `import axios from 'axios';

const response = await axios.post(
  'https://api.ethiovoice.com/v1/tts/generate',
  {
    text: 'ሰላም፣ እንኳን ወደ ኢትዮቮይስ በደህና መጡ።',
    language: 'am',
    voiceId: 'v-selam',
    speed: 1.0,
    format: 'wav'
  },
  {
    headers: {
      Authorization: 'Bearer YOUR_ETHIOVOICE_API_KEY'
    }
  }
);

console.log('Audio URL:', response.data.item.audioUrl);`,
    python: `import requests

url = "https://api.ethiovoice.com/v1/tts/generate"
headers = {
    "Authorization": "Bearer YOUR_ETHIOVOICE_API_KEY",
    "Content-Type": "application/json"
}
payload = {
    "text": "ሰላም፣ እንኳን ወደ ኢትዮቮይስ በደህና መጡ።",
    "language": "am",
    "voiceId": "v-selam",
    "format": "wav"
}

response = requests.post(url, json=payload, headers=headers)
data = response.json()
print("Generated audio:", data["item"]["audioUrl"])`
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippets[activeLang]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header */}
      <div className="max-w-2xl space-y-2">
        <p className="text-xs font-bold text-[#006241] uppercase tracking-wider">Developer Platform</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          EthioVoice REST API & SDK Reference
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Embed low-latency Ethiopian Text-to-Speech directly into your web, iOS, Android, or IoT devices.
        </p>
      </div>

      {/* Code Showcase Terminal */}
      <div className="bg-slate-900 text-white rounded-3xl overflow-hidden border border-slate-800 shadow-xl">
        <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500/80" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
            <span className="ml-2 text-xs font-mono text-slate-400">POST /v1/tts/generate</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-800 p-0.5 rounded-lg text-xs font-mono">
              {(['curl', 'js', 'python'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setActiveLang(lang)}
                  className={`px-2.5 py-1 rounded-md transition ${
                    activeLang === lang ? 'bg-[#006241] text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>

            <button
              onClick={handleCopy}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center gap-1 transition"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        <div className="p-5 font-mono text-xs overflow-x-auto text-emerald-400 leading-relaxed">
          <pre>{codeSnippets[activeLang]}</pre>
        </div>
      </div>

      {/* Endpoint Specifications */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-slate-900">Core API Endpoints</h2>

        <div className="space-y-4">
          {/* Endpoint 1 */}
          <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 bg-emerald-100 text-[#006241] font-mono font-bold text-xs rounded-md">POST</span>
              <span className="font-mono text-sm font-bold text-slate-800">/api/tts/generate</span>
            </div>
            <p className="text-xs text-slate-600">
              Converts raw text into an audio file URL using either the Addis Neural Synthesizer, Gemini Cloud TTS, or Web Speech.
            </p>
            <div className="pt-2 text-xs">
              <span className="font-semibold text-slate-700 block mb-1">JSON Parameters:</span>
              <ul className="list-disc pl-5 space-y-1 text-slate-600 font-mono text-[11px]">
                <li><code className="text-slate-900 font-bold">text</code> (string, required): The Ge'ez or Latin text to speak.</li>
                <li><code className="text-slate-900 font-bold">language</code> (string, required): "am", "ti", "om", or "en".</li>
                <li><code className="text-slate-900 font-bold">voiceId</code> (string, optional): e.g. "v-selam", "v-dawit", "v-hagos".</li>
                <li><code className="text-slate-900 font-bold">speed</code> (number, default: 1.0): Speech pace multiplier (0.5 to 2.0).</li>
                <li><code className="text-slate-900 font-bold">format</code> (string, default: "wav"): "wav", "mp3", or "aac".</li>
              </ul>
            </div>
          </div>

          {/* Endpoint 2 */}
          <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 bg-emerald-100 text-[#006241] font-mono font-bold text-xs rounded-md">POST</span>
              <span className="font-mono text-sm font-bold text-slate-800">/api/translate</span>
            </div>
            <p className="text-xs text-slate-600">
              Translates text between English and Ethiopian languages (Amharic, Tigrinya, Afaan Oromoo) before voice generation.
            </p>
          </div>

          {/* Endpoint 3 */}
          <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 bg-sky-100 text-sky-800 font-mono font-bold text-xs rounded-md">POST</span>
              <span className="font-mono text-sm font-bold text-slate-800">/api/ocr</span>
            </div>
            <p className="text-xs text-slate-600">
              Extracts text from base64 image captures of printed manuscripts, textbooks, or documents.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
