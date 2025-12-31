
import React, { useState } from 'react';
import { User } from '../types';
import { INDIAN_STATES } from '../constants';

interface ProfileProps {
  user: User;
  setUser: (user: User) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, setUser }) => {
  const [biddingStates, setBiddingStates] = useState(user.biddingStates);
  const [viewingStates, setViewingStates] = useState(user.viewingStates);
  const [turnover, setTurnover] = useState(user.monthlyTurnover || 0);
  const [threeMonthTurnover, setThreeMonthTurnover] = useState(user.threeMonthTurnover || 0);

  const isElitePlus = threeMonthTurnover >= 2000000;
  const maxBiddingStates = isElitePlus ? 4 : 3;

  const toggleBiddingState = (state: string) => {
    if (biddingStates.includes(state)) {
      setBiddingStates(prev => prev.filter(s => s !== state));
    } else if (biddingStates.length < maxBiddingStates) {
      setBiddingStates(prev => [...prev, state]);
    } else {
      alert(`Tier Restriction: Your current turnover allows a maximum of ${maxBiddingStates} bidding states.`);
    }
  };

  const toggleViewingState = (state: string) => {
    if (viewingStates.includes(state)) {
      setViewingStates(prev => prev.filter(s => s !== state));
    } else if (viewingStates.length < 6) {
      setViewingStates(prev => [...prev, state]);
    }
  };

  const saveSettings = () => {
    setUser({ 
      ...user, 
      biddingStates, 
      viewingStates, 
      monthlyTurnover: turnover, 
      threeMonthTurnover 
    });
    alert('Operational territories updated.');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="bg-white rounded-[3rem] p-10 border shadow-sm">
        <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic mb-8">Business Financials</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div>
             <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">3-Month Business Volume (₹)</label>
             <div className="relative">
               <input 
                 type="number" 
                 value={threeMonthTurnover} 
                 onChange={(e) => setThreeMonthTurnover(Number(e.target.value))}
                 className="w-full bg-white border-2 border-slate-100 rounded-2xl px-5 py-4 text-slate-900 font-black text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all" 
               />
               <i className="fa-solid fa-chart-line absolute right-5 top-4.5 text-slate-300"></i>
             </div>
             {isElitePlus && (
               <p className="mt-2 text-[9px] font-black text-emerald-600 uppercase tracking-widest flex items-center">
                 <i className="fa-solid fa-bolt mr-1"></i> Expanded Territory Active (4 States Enabled)
               </p>
             )}
           </div>
           <div>
             <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">KYC Status</label>
             <div className={`p-4 rounded-2xl flex items-center justify-between border ${user.isKycVerified ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-orange-50 border-orange-100 text-orange-700'}`}>
                <p className="text-[10px] font-black uppercase tracking-widest">{user.isKycVerified ? 'Verified Elite' : 'Pending Review'}</p>
                <i className={`fa-solid ${user.isKycVerified ? 'fa-check-circle' : 'fa-clock'}`}></i>
             </div>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] p-10 border shadow-sm">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">Operational Range</h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Select your {maxBiddingStates} Bidding territories</p>
          </div>
          <button 
            onClick={saveSettings}
            className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-600 transition shadow-xl"
          >
            Lock Territories
          </button>
        </div>

        <div className="space-y-10">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-black text-slate-900 text-[10px] uppercase tracking-[0.2em]">Bidding States ({biddingStates.length}/{maxBiddingStates})</h3>
              {isElitePlus && <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[8px] font-black uppercase">+1 Bonus State Active</span>}
            </div>
            <div className="flex flex-wrap gap-2">
              {INDIAN_STATES.map(state => (
                <button
                  key={state}
                  onClick={() => toggleBiddingState(state)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all ${
                    biddingStates.includes(state) 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                  }`}
                >
                  {state}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="font-black text-slate-900 text-[10px] uppercase tracking-[0.2em] mb-4">Viewing States (Max 6)</h3>
            <div className="flex flex-wrap gap-2">
              {INDIAN_STATES.map(state => (
                <button
                  key={state}
                  onClick={() => toggleViewingState(state)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all ${
                    viewingStates.includes(state) 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-slate-50 text-slate-400'
                  }`}
                >
                  {state}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
