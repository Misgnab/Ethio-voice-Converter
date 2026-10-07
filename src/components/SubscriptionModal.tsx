import React, { useState } from 'react';
import { Smartphone, CreditCard, Check, X, ShieldCheck, Zap, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgradeSuccess: (channel: 'chapa' | 'telebirr') => void;
  isPremium: boolean;
  conversionsLeft: number;
}

export default function SubscriptionModal({
  isOpen,
  onClose,
  onUpgradeSuccess,
  isPremium,
  conversionsLeft
}: SubscriptionModalProps) {
  const [selectedChannel, setSelectedChannel] = useState<'chapa' | 'telebirr' | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleStartPayment = (channel: 'chapa' | 'telebirr') => {
    setSelectedChannel(channel);
    setPhoneNumber('');
    setFullName('');
    setOtpSent(false);
    setOtpCode('');
    setErrorMessage('');
  };

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (selectedChannel === 'telebirr') {
      if (!phoneNumber.match(/^(09|07|\+2519|\+2517)\d{8}$/)) {
        setErrorMessage('Please enter a valid Ethiopian mobile number (e.g., 0912345678 or 0712345678)');
        return;
      }
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        setOtpSent(true);
      }, 1200);
    } else {
      if (!fullName.trim()) {
        setErrorMessage('Please enter your full name as registered with your bank.');
        return;
      }
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        onUpgradeSuccess('chapa');
        setSelectedChannel(null);
      }, 1600);
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length < 4) {
      setErrorMessage('Please enter the 4-digit SMS OTP code.');
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onUpgradeSuccess('telebirr');
      setSelectedChannel(null);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl text-slate-800"
      >
        {/* Ethiopian Flag Tricolor Accent */}
        <div className="h-1 w-full flex">
          <div className="flex-1 bg-[#006241]" />
          <div className="flex-1 bg-[#F9D616]" />
          <div className="flex-1 bg-[#E21C21]" />
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition"
        >
          <X size={18} />
        </button>

        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3 border border-amber-200 shadow-2xs">
              <Zap size={24} className="fill-amber-500 text-amber-500" />
            </div>
            <h3 className="text-xl font-bold tracking-tight text-slate-900">Upgrade to EthioVoice Pro</h3>
            <p className="text-xs text-slate-500 mt-1">
              Unlock all 12 HD Ethiopian voices, optical OCR scanner & unlimited synthesis
            </p>
          </div>

          {!selectedChannel ? (
            <div className="space-y-6">
              {/* Feature Highlights */}
              <div className="space-y-2.5 text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2.5">
                  <Check size={14} className="text-[#006241] shrink-0" />
                  <span>Unlimited daily audio conversions (no limits)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check size={14} className="text-[#006241] shrink-0" />
                  <span>Full access to all 12 Amharic, Tigrinya, and Oromo HD voices</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check size={14} className="text-[#006241] shrink-0" />
                  <span>Optical Camera & Document OCR scanning</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check size={14} className="text-[#006241] shrink-0" />
                  <span>Lossless 48kHz HD WAV / MP3 direct audio export</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check size={14} className="text-[#006241] shrink-0" />
                  <span>Continuous Document Audiobook reader with sentence highlights</span>
                </div>
              </div>

              {/* Pricing Tag */}
              <div className="text-center py-2">
                <span className="text-3xl font-extrabold text-slate-900">99 ETB</span>
                <span className="text-slate-500 text-xs font-medium"> / month ($3.99 USD)</span>
              </div>

              {/* Local Payment Options */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleStartPayment('telebirr')}
                  className="flex flex-col items-center justify-center p-4 border border-slate-200 bg-slate-50 hover:bg-sky-50 hover:border-sky-300 rounded-2xl group transition"
                >
                  <Smartphone size={26} className="text-sky-600 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-slate-800 mt-2">Ethio Telebirr</span>
                  <span className="text-[10px] text-sky-700 font-semibold uppercase mt-0.5">Instant Mobile Pay</span>
                </button>

                <button
                  onClick={() => handleStartPayment('chapa')}
                  className="flex flex-col items-center justify-center p-4 border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 rounded-2xl group transition"
                >
                  <CreditCard size={26} className="text-[#006241] group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-slate-800 mt-2">Chapa Gateway</span>
                  <span className="text-[10px] text-[#006241] font-semibold uppercase mt-0.5">Card / CBE / Awash</span>
                </button>
              </div>

              {isPremium && (
                <div className="text-center">
                  <p className="text-xs font-semibold text-[#006241]">✨ You currently have an active Pro Membership!</p>
                </div>
              )}
            </div>
          ) : (
            <div>
              <button
                onClick={() => setSelectedChannel(null)}
                className="text-xs text-[#006241] font-bold hover:underline mb-4 inline-block"
              >
                ← Back to payment methods
              </button>

              {errorMessage && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Telebirr Channel */}
              {selectedChannel === 'telebirr' && (
                <form onSubmit={otpSent ? handleVerifyOtp : handleSubmitPayment} className="space-y-4">
                  <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl text-xs text-sky-900">
                    <p className="font-bold">Telebirr Direct Wallet Billing</p>
                    <p className="text-[11px] text-sky-700 mt-0.5">Amount to charge: <strong>99.00 ETB</strong></p>
                  </div>

                  {!otpSent ? (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Ethio Telecom Mobile Number
                      </label>
                      <input
                        type="tel"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="e.g. 0912345678"
                        className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 font-mono"
                        disabled={isProcessing}
                      />
                      <button
                        type="submit"
                        disabled={isProcessing}
                        className="w-full mt-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-xs"
                      >
                        {isProcessing ? 'Contacting Telebirr API...' : 'Request Telebirr SMS OTP'}
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs text-slate-500 mb-2">
                        Simulated SMS code generated: Enter <strong>1234</strong> to verify transaction.
                      </p>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        4-Digit Verification OTP
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="1234"
                        className="w-full text-center text-lg font-mono tracking-widest px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500"
                        disabled={isProcessing}
                      />
                      <button
                        type="submit"
                        disabled={isProcessing}
                        className="w-full mt-4 py-2.5 bg-[#006241] hover:bg-[#004d33] text-white font-bold text-xs rounded-xl transition shadow-xs"
                      >
                        {isProcessing ? 'Verifying transaction...' : 'Confirm 99 ETB Payment'}
                      </button>
                    </div>
                  )}
                </form>
              )}

              {/* Chapa Channel */}
              {selectedChannel === 'chapa' && (
                <form onSubmit={handleSubmitPayment} className="space-y-3.5">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900">
                    <p className="font-bold">Chapa Multi-Bank Gateway</p>
                    <p className="text-[11px] text-emerald-700 mt-0.5">Supports CBE Birr, Awash Bank, Dashen, or Local Debit Card</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Full Legal Name</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Abebe Bikila"
                      className="w-full text-xs px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#006241]"
                      disabled={isProcessing}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Select Local Bank / Card</label>
                    <select className="w-full text-xs px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#006241]">
                      <option>Commercial Bank of Ethiopia (CBE Birr)</option>
                      <option>Awash Bank Internet Banking</option>
                      <option>Dashen Bank / Amole</option>
                      <option>Visa / Mastercard (Domestic or Intl)</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full mt-2 py-2.5 bg-[#006241] hover:bg-[#004d33] text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center justify-center gap-2"
                  >
                    {isProcessing ? 'Connecting to Chapa...' : 'Authorize 99 ETB Checkout'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
