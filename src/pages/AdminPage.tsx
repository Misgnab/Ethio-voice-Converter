import React, { useState } from 'react';
import { Activity, TrendingUp, DollarSign, Smartphone, Users, Server, RefreshCw } from 'lucide-react';
import { AdminStats } from '../types';

interface AdminPageProps {
  stats: AdminStats;
  onRefreshStats: () => void;
  triggerToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export default function AdminPage({ stats, onRefreshStats, triggerToast }: AdminPageProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefreshStats();
    setTimeout(() => {
      setIsRefreshing(false);
      triggerToast('Analytics synchronized from server', 'info');
    }, 600);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-[#006241] uppercase tracking-wider">Administration Console</p>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Platform Telemetry & Revenue</h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Real-time synthesis volumes, dialect usage distribution, and Telebirr/Chapa settlement metrics.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-2xs transition flex items-center gap-1.5 self-start sm:self-center"
        >
          <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
          <span>Sync Analytics</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-slate-200 rounded-3xl shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Daily Active Users</span>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums">
            {stats.dailyActiveUsers.toLocaleString()}
          </p>
          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 pt-1">
            <TrendingUp size={13} />
            <span>+18.4% this week</span>
          </span>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-3xl shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Syntheses</span>
          <p className="text-2xl sm:text-3xl font-black text-[#006241] tabular-nums">
            {stats.totalConversions.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-400 font-medium block pt-1">Across 4 languages</span>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-3xl shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Telebirr Volume (ETB)</span>
          <p className="text-2xl sm:text-3xl font-black text-sky-700 tabular-nums">
            {stats.revenueTelebirr.toLocaleString()} ETB
          </p>
          <span className="text-[11px] text-sky-600 font-medium block pt-1">Ethio Telecom Wallet</span>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-3xl shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Chapa Revenue (ETB)</span>
          <p className="text-2xl sm:text-3xl font-black text-emerald-700 tabular-nums">
            {stats.revenueChapa.toLocaleString()} ETB
          </p>
          <span className="text-[11px] text-emerald-600 font-medium block pt-1">CBE & Bank Cards</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Bar Chart */}
        <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900">7-Day Synthesis Growth</h3>
          <div className="h-48 flex items-end justify-between gap-2 pt-6 border-b border-l border-slate-100 pl-2">
            {stats.conversionTrend.map((d, i) => {
              const max = 1200;
              const heightPct = Math.min(100, Math.max(12, (d.count / max) * 100));
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                  <span className="text-[10px] font-mono text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    {d.count}
                  </span>
                  <div
                    className="w-full bg-[#006241] group-hover:bg-amber-400 rounded-t-md transition-all duration-300"
                    style={{ height: `${heightPct}%` }}
                  />
                  <span className="text-[10px] font-mono text-slate-400 mt-1">{d.date}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dialect Breakdown */}
        <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Dialect Usage Distribution</h3>

          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs text-slate-700 font-semibold mb-1">
                <span>🇪🇹 Amharic (አማርኛ)</span>
                <span className="tabular-nums font-mono">{stats.languageStats.amharic.toLocaleString()} (58%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-[#006241] h-full rounded-full" style={{ width: '58%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-700 font-semibold mb-1">
                <span>🇪🇹 Afaan Oromoo (Qubee)</span>
                <span className="tabular-nums font-mono">{stats.languageStats.oromo.toLocaleString()} (21%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: '21%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-700 font-semibold mb-1">
                <span>🇪🇹 Tigrinya (ትግርኛ)</span>
                <span className="tabular-nums font-mono">{stats.languageStats.tigrinya.toLocaleString()} (14%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-red-600 h-full rounded-full" style={{ width: '14%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-700 font-semibold mb-1">
                <span>🌐 English (Ethiopian Cadence)</span>
                <span className="tabular-nums font-mono">{stats.languageStats.english.toLocaleString()} (7%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-slate-400 h-full rounded-full" style={{ width: '7%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Engine Status Grid */}
      <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Activity size={18} className="text-[#006241]" />
          <h3 className="text-sm font-bold text-slate-900">Acoustic Engine Health Status</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-900">Addis AI Formant Core</p>
              <p className="text-[11px] text-slate-500">Instant low-latency procedural synthesis</p>
            </div>
            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-lg text-[10px] uppercase">
              Operational
            </span>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-900">Gemini Cloud Studio TTS</p>
              <p className="text-[11px] text-slate-500">Server-side deep neural dubbing</p>
            </div>
            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-lg text-[10px] uppercase">
              Operational
            </span>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-900">Browser Web Speech Driver</p>
              <p className="text-[11px] text-slate-500">Local device fallback engine</p>
            </div>
            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-lg text-[10px] uppercase">
              Operational
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
