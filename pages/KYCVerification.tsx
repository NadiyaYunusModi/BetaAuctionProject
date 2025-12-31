
import React, { useState } from 'react';
import { User } from '../types';

interface KYCProps {
  user: User;
  onVerified: () => void;
}

const KYCVerification: React.FC<KYCProps> = ({ user, onVerified }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [declaredVolume, setDeclaredVolume] = useState('');

  const handleSubmit = () => {
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onVerified();
    }, 2000);
  };

  return (
    <div className="max-w-2xl mx-auto py-12">
      <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100">
        <div className="bg-slate-900 h-2 w-full">
           <div className={`bg-orange-500 h-full transition-all duration-700 ease-out ${step === 1 ? 'w-1/3' : step === 2 ? 'w-2/3' : 'w-full'}`}></div>
        </div>
        
        <div className="p-12">
          <div className="text-center mb-12">
            <span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em] mb-4 block">Identity Vault</span>
            <h2 className="text-4xl font-black italic tracking-tighter text-slate-900 uppercase">KYC Protocol</h2>
            <p className="text-slate-500 font-medium text-sm mt-2 uppercase tracking-widest">Bank Compliance Verification</p>
          </div>

          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center">
                <i className="fa-solid fa-address-card mr-3 text-orange-500"></i>
                01. Document Selection
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {['Aadhar (UIDAI)', 'PAN (Income Tax)', 'Voter Card', 'GST Registration'].map(doc => (
                  <button key={doc} className="p-6 border-2 border-slate-50 rounded-[1.5rem] text-left hover:border-orange-500 hover:bg-orange-50/50 transition-all group">
                    <i className="fa-regular fa-id-badge mb-3 text-slate-300 group-hover:text-orange-500 transition-colors"></i>
                    <p className="font-black text-xs text-slate-700 uppercase tracking-tighter">{doc}</p>
                  </button>
                ))}
              </div>
              <button 
                onClick={() => setStep(2)}
                className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl mt-8 text-xs uppercase tracking-widest hover:bg-orange-600 transition shadow-xl"
              >
                Proceed to Upload
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center">
                <i className="fa-solid fa-cloud-arrow-up mr-3 text-blue-500"></i>
                02. Evidence Capture
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="aspect-[4/3] border-2 border-dashed border-slate-100 rounded-[2rem] flex flex-col items-center justify-center bg-slate-50/50 hover:bg-white hover:border-blue-500 transition-all cursor-pointer group">
                  <i className="fa-solid fa-camera text-2xl text-slate-300 group-hover:text-blue-500 mb-4 transition-colors"></i>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Front Image</span>
                </div>
                <div className="aspect-[4/3] border-2 border-dashed border-slate-100 rounded-[2rem] flex flex-col items-center justify-center bg-slate-50/50 hover:bg-white hover:border-blue-500 transition-all cursor-pointer group">
                  <i className="fa-solid fa-camera-rotate text-2xl text-slate-300 group-hover:text-blue-500 mb-4 transition-colors"></i>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Back Image</span>
                </div>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setStep(1)} className="flex-1 py-5 bg-slate-100 text-slate-500 font-black rounded-2xl text-xs uppercase tracking-widest">Back</button>
                <button onClick={() => setStep(3)} className="flex-1 py-5 bg-slate-900 text-white font-black rounded-2xl text-xs uppercase tracking-widest shadow-xl hover:bg-orange-600 transition">Confirm Uploads</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center">
                <i className="fa-solid fa-hand-holding-dollar mr-3 text-emerald-500"></i>
                03. Financial Declaration
              </h3>
              <p className="text-xs text-slate-500 font-bold leading-relaxed bg-slate-50 p-6 rounded-2xl border border-slate-100">
                To enable high-volume bidding, declare your monthly business volume. Bidders with turnover > ₹10 Lakh are prioritized for premium assets.
              </p>
              <div className="relative">
                <input 
                  type="number" 
                  placeholder="Monthly Volume (₹)" 
                  value={declaredVolume}
                  onChange={(e) => setDeclaredVolume(e.target.value)}
                  className="w-full bg-white border-2 border-slate-100 rounded-2xl px-6 py-5 text-sm font-black focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all" 
                />
                <i className="fa-solid fa-chart-line absolute right-6 top-5 text-slate-300"></i>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setStep(2)} className="flex-1 py-5 bg-slate-100 text-slate-500 font-black rounded-2xl text-xs uppercase tracking-widest">Back</button>
                <button 
                  onClick={handleSubmit}
                  disabled={isSubmitting || !declaredVolume}
                  className="flex-1 py-5 bg-emerald-600 text-white font-black rounded-2xl text-xs uppercase tracking-widest shadow-xl shadow-emerald-900/10 hover:bg-emerald-700 transition disabled:opacity-50"
                >
                  {isSubmitting ? <i className="fa-solid fa-spinner fa-spin"></i> : "Submit for Approval"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="mt-12 text-center">
        <div className="inline-flex items-center space-x-3 px-6 py-3 bg-slate-900/5 rounded-full text-slate-400 text-[9px] font-black uppercase tracking-widest">
          <i className="fa-solid fa-lock text-slate-300"></i>
          <span>Encrypted with SHA-256 Protocol</span>
        </div>
      </div>
    </div>
  );
};

export default KYCVerification;
