
import React, { useState } from 'react';
import { Auction, User, AuctionStatus, PaymentProcessStatus } from '../types';

interface MyBidsProps {
  user: User;
  auctions: Auction[];
  onInitiatePayment: (auctionId: string, reference: string) => void;
}

const MyBids: React.FC<MyBidsProps> = ({ user, auctions, onInitiatePayment }) => {
  const [payRef, setPayRef] = useState<string>('');
  const [payingAuctionId, setPayingAuctionId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'won' | 'history'>('won');

  const myWins = auctions.filter(a => a.status === AuctionStatus.CLOSED && a.winnerId === user.id);

  const getStepStatus = (auction: Auction) => {
    if (auction.paymentStatus === PaymentProcessStatus.AWAITING_APPROVAL) return { 
      label: 'Admin Board Review', 
      color: 'text-amber-500', 
      bg: 'bg-amber-50', 
      icon: 'fa-user-shield', 
      step: 1, 
      desc: 'Your manual bid is being reviewed against reserve bank requirements.' 
    };
    if (auction.paymentStatus === PaymentProcessStatus.OPEN_FOR_PAYMENT) return { 
      label: 'Bid Approved • Pending Payment', 
      color: 'text-blue-600', 
      bg: 'bg-blue-50', 
      icon: 'fa-money-bill-transfer', 
      step: 2, 
      desc: 'Offer accepted. Please deposit funds into the nodal account and share ref.' 
    };
    if (auction.paymentStatus === PaymentProcessStatus.VERIFYING_PAYMENT) return { 
      label: 'Credit Verification In-Process', 
      color: 'text-indigo-600', 
      bg: 'bg-indigo-50', 
      icon: 'fa-sync fa-spin', 
      step: 3, 
      desc: 'Bank account auditing your submitted transaction reference.' 
    };
    if (auction.paymentStatus === PaymentProcessStatus.PAYMENT_DONE) return { 
      label: 'Settlement Finalized', 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50', 
      icon: 'fa-circle-check', 
      step: 4, 
      desc: 'All dues cleared. Asset ready for delivery / NOC collection.' 
    };
    return { label: 'Participating', color: 'text-slate-400', bg: 'bg-slate-50', icon: 'fa-gavel', step: 0, desc: 'Bid recorded.' };
  };

  const StepIndicator = ({ currentStep }: { currentStep: number }) => (
    <div className="flex items-center w-full mb-8">
      {[1, 2, 3, 4].map((s) => (
        <React.Fragment key={s}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black border-2 transition-all duration-700 ${currentStep >= s ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-200 border-slate-100'}`}>
            {currentStep > s ? <i className="fa-solid fa-check"></i> : s}
          </div>
          {s < 4 && <div className={`flex-1 h-0.5 transition-all duration-1000 ${currentStep > s ? 'bg-slate-900' : 'bg-slate-100'}`}></div>}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 italic tracking-tighter uppercase">My Participation</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Official Participation & Settlement Status</p>
        </div>
        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
           <button onClick={() => setActiveView('won')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition ${activeView === 'won' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}>Wins & Process ({myWins.length})</button>
           <button onClick={() => setActiveView('history')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition ${activeView === 'history' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}>Global Log</button>
        </div>
      </div>

      {activeView === 'won' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {myWins.length === 0 ? (
            <div className="col-span-full py-32 text-center text-slate-300 font-black uppercase tracking-widest bg-white border-2 border-dashed rounded-[3rem]">
              <i className="fa-solid fa-trophy text-6xl mb-6 opacity-10"></i>
              <p>No won assets awaiting processing</p>
            </div>
          ) : (
            myWins.map(win => {
              const info = getStepStatus(win);
              const finalAmount = win.currentBid * 1.02;

              return (
                <div key={win.id} className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-2xl transition-all duration-500 animate-in fade-in zoom-in">
                  <div className="p-10 flex-1">
                    <div className="flex justify-between items-start mb-10">
                       <div className="flex gap-6">
                         <img src={win.vehicle.images[0]} className="w-24 h-24 rounded-[2rem] object-cover border-4 border-white shadow-xl" alt="" />
                         <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{win.vehicle.bankName}</p>
                            <h3 className="text-xl font-black text-slate-900 italic tracking-tighter uppercase">{win.vehicle.make} {win.vehicle.model}</h3>
                            <p className="text-[8px] font-black text-blue-500 uppercase tracking-widest mt-2">{win.id}</p>
                         </div>
                       </div>
                       <div className={`px-5 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 border shadow-sm ${info.bg} ${info.color}`}>
                          <i className={`fa-solid ${info.icon}`}></i>
                          {info.label}
                       </div>
                    </div>

                    <StepIndicator currentStep={info.step} />
                    
                    <div className="bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100 mb-8">
                       <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-2">Process Step {info.step}/4</p>
                       <p className="text-xs text-slate-500 font-bold leading-relaxed">{info.desc}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-8 mb-10">
                       <div className="space-y-1">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Winning Value</p>
                          <p className="text-xl font-black text-slate-900 italic">₹{win.currentBid.toLocaleString()}</p>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Settle (Incl Taxes)</p>
                          <p className="text-xl font-black text-orange-600 italic">₹{finalAmount.toLocaleString()}</p>
                       </div>
                    </div>

                    {win.paymentStatus === PaymentProcessStatus.OPEN_FOR_PAYMENT && (
                      <div className="space-y-4 animate-in slide-in-from-bottom-4">
                         <div className="relative">
                            <input 
                              placeholder="UTR / Bank Reference ID" 
                              value={payingAuctionId === win.id ? payRef : ''}
                              onChange={(e) => {
                                setPayingAuctionId(win.id);
                                setPayRef(e.target.value);
                              }}
                              className="w-full bg-white border-2 border-slate-100 rounded-3xl px-8 py-5 text-sm font-black focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                            />
                            <i className="fa-solid fa-receipt absolute right-8 top-5.5 text-slate-300"></i>
                         </div>
                         <button 
                           onClick={() => {
                             if (!payRef) return alert("Valid UTR/Ref ID is mandatory.");
                             onInitiatePayment(win.id, payRef);
                             setPayRef('');
                           }}
                           className="w-full bg-slate-900 text-white py-6 rounded-3xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-emerald-600 transition-all shadow-2xl active:scale-95"
                         >
                           Submit Payment Verification
                         </button>
                      </div>
                    )}

                    {win.paymentStatus === PaymentProcessStatus.PAYMENT_DONE && (
                      <button className="w-full bg-emerald-600 text-white py-6 rounded-3xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl flex items-center justify-center gap-3">
                         <i className="fa-solid fa-file-contract"></i>
                         Download NOC & Gate Pass
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in">
           <div className="p-8 border-b bg-slate-50/50">
             <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Global Activity Feed</h3>
           </div>
           <div className="divide-y divide-slate-50">
             {user.activityHistory.filter(h => h.type === 'BID_SUBMITTED' || h.type === 'BID' || h.type === 'PAYMENT_COMPLETE').map(act => (
               <div key={act.id} className="p-8 flex items-start gap-6 hover:bg-slate-50/50 transition">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg shadow-sm border ${
                    act.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                    act.status === 'REJECTED' ? 'bg-red-50 text-red-600 border-red-100' :
                    'bg-slate-900 text-white'
                  }`}>
                    <i className={`fa-solid ${act.type === 'PAYMENT_COMPLETE' ? 'fa-receipt' : 'fa-gavel'}`}></i>
                  </div>
                  <div className="flex-1">
                     <div className="flex justify-between items-start mb-2">
                        <h4 className="font-black text-slate-900 uppercase tracking-tighter text-sm">{act.targetName || 'Manual Entry'}</h4>
                        <span className="text-[10px] font-black text-slate-300 uppercase">{new Date(act.timestamp).toLocaleString()}</span>
                     </div>
                     <p className="text-xs text-slate-500 font-bold leading-relaxed">{act.description}</p>
                     {act.amount && (
                       <div className="mt-4 flex gap-6">
                          <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Value</p>
                            <p className="text-sm font-black text-slate-800 italic">₹{act.amount.toLocaleString()}</p>
                          </div>
                       </div>
                     )}
                  </div>
                  <div className="self-center">
                     <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                       act.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                       act.status === 'REJECTED' ? 'bg-red-50 text-red-600 border-red-100' :
                       'bg-slate-100 text-slate-400 border-slate-200'
                     }`}>
                       {act.status || 'PROCESSING'}
                     </span>
                  </div>
               </div>
             ))}
           </div>
        </div>
      )}
    </div>
  );
};

export default MyBids;
