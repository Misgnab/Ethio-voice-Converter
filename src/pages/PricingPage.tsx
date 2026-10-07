import React from 'react';
import { Check, ShieldCheck, Zap, Smartphone, CreditCard, Sparkles } from 'lucide-react';
import { PRICING_PLANS } from '../data';

interface PricingPageProps {
  onOpenUpgradeModal: () => void;
  onNavigateToStudio: () => void;
  isPremium: boolean;
}

export default function PricingPage({
  onOpenUpgradeModal,
  onNavigateToStudio,
  isPremium
}: PricingPageProps) {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <p className="text-xs font-bold text-[#006241] uppercase tracking-wider">Transparent Local Pricing</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Accessible Voice AI for Every Ethiopian
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          No foreign currency needed. Subscribe directly using Ethio Telecom Telebirr mobile wallet, Chapa, CBE Birr, or local debit cards.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PRICING_PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`p-6 sm:p-8 rounded-3xl border flex flex-col justify-between gap-6 transition ${
              plan.popular
                ? 'bg-white border-[#006241] shadow-xl ring-2 ring-[#006241]/20 relative'
                : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div>
              {plan.popular && (
                <span className="text-[11px] font-bold text-[#006241] uppercase tracking-wider block mb-2">
                  ★ Most Popular in Ethiopia
                </span>
              )}
              <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
              <p className="text-xs text-slate-500 mt-1">{plan.description}</p>

              <div className="mt-4 pt-4 border-t border-slate-100">
                <span className="text-3xl font-black text-slate-900">
                  {plan.priceEtb === 0 ? 'Free' : `${plan.priceEtb} ETB`}
                </span>
                <span className="text-xs text-slate-400 font-medium"> / {plan.billingPeriod}</span>
              </div>

              <ul className="space-y-2.5 mt-6 text-xs text-slate-600">
                {plan.features.map((feat, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <Check size={14} className="text-[#006241] shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => {
                if (plan.id === 'free') {
                  onNavigateToStudio();
                } else {
                  onOpenUpgradeModal();
                }
              }}
              className={`w-full py-3 rounded-xl font-bold text-xs transition duration-200 ${
                plan.popular
                  ? 'bg-[#006241] hover:bg-[#004d33] text-white shadow-md'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
              }`}
            >
              {plan.id === 'free' ? 'Start Synthesizing Free' : plan.buttonText}
            </button>
          </div>
        ))}
      </div>

      {/* Accepted Payment Channels */}
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4">
        <h3 className="text-base font-bold text-slate-900">Supported Ethiopian Payment Integrations</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-1">
            <Smartphone size={20} className="text-sky-600 mb-2" />
            <p className="font-bold text-slate-900">Telebirr Mobile Wallet</p>
            <p className="text-slate-500 text-[11px]">Instant SMS OTP verification on any 09 or 07 phone number.</p>
          </div>
          <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-1">
            <CreditCard size={20} className="text-[#006241] mb-2" />
            <p className="font-bold text-slate-900">CBE Birr & Commercial Bank</p>
            <p className="text-slate-500 text-[11px]">Direct account transfer or CBE Birr checkout via Chapa.</p>
          </div>
          <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-1">
            <Zap size={20} className="text-amber-600 mb-2" />
            <p className="font-bold text-slate-900">Awash & Dashen Bank</p>
            <p className="text-slate-500 text-[11px]">Seamless domestic internet banking payment processing.</p>
          </div>
          <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-1">
            <ShieldCheck size={20} className="text-slate-700 mb-2" />
            <p className="font-bold text-slate-900">International Visa / MC</p>
            <p className="text-slate-500 text-[11px]">For diaspora users living in North America, Europe, or the Gulf.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
