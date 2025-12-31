
import React, { useState, useEffect, useMemo } from 'react';
import { Auction, User } from '../types';

interface AuctionDetailProps {
  auction: Auction;
  user: User;
  watchlist: string[];
  onToggleWatchlist: (id: string) => void;
  onBidPlaced: (bid: number, settlement: number) => void;
}

const AuctionDetail: React.FC<AuctionDetailProps> = ({ 
  auction, 
  user, 
  watchlist, 
  onToggleWatchlist, 
  onBidPlaced 
}) => {
  const [manualBid, setManualBid] = useState<string>('');
  const [settlementBid, setSettlementBid] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [simulatedBids, setSimulatedBids] = useState<{name: string, price: number, time: string}[]>([]);
  const [activeTab, setActiveTab] = useState<'floor' | 'history'>('floor');

  // Check if current user has already bidded
  const userBidActivity = user.activityHistory.find(act => act.targetId === auction.id && act.type === 'BID_SUBMITTED');
  const alreadyBidded = !!userBidActivity;

  // Real-time Leaderboard Logic: Merge simulated bids with user's actual bid
  const leaderboard = useMemo(() => {
    let list = [...simulatedBids];
    if (alreadyBidded && userBidActivity) {
      list.push({
        name: user.name + " (YOU)",
        price: userBidActivity.amount || 0,
        time: new Date(userBidActivity.timestamp).toLocaleTimeString()
      });
    }
    return list.sort((a, b) => b.price - a.price);
  }, [simulatedBids, alreadyBidded, userBidActivity, user.name]);

  useEffect(() => {
    const names = ["Delhi Dealer", "Pune Auto Corp", "Elite Motors", "Hassan Aggregator"];
    const interval = setInterval(() => {
      if (auction.status === 'LIVE' && simulatedBids.length < 5) {
        setSimulatedBids(prev => [
          { 
            name: names[Math.floor(Math.random() * names.length)], 
            price: auction.currentBid + (prev.length + 1) * 2000, 
            time: new Date().toLocaleTimeString() 
          }, 
          ...prev 
        ].slice(0, 8));
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [auction.status, auction.currentBid, simulatedBids.length]);

  const hasTerritoryAccess = user.biddingStates.includes(auction.vehicle.state);
  
  const handleSubmitBid = () => {
    const bValue = parseInt(manualBid);
    const sValue = parseInt(settlementBid);
    if (isNaN(bValue) || bValue < auction.currentBid) return alert(`Bid must be higher than floor price: ₹${auction.currentBid.toLocaleString()}`);
    if (isNaN(sValue) || sValue < bValue) return alert("Settlement requirement must be higher or equal to your bid amount.");
    
    setIsSubmitting(true);
    setTimeout(() => {
      onBidPlaced(bValue, sValue);
      setIsSubmitting(false);
    }, 1500); 
  };

  const mockMaintenance = [
    { date: '2023-11-15', kms: auction.vehicle.kms - 5000, task: 'Engine Oil & Filter Replacement', center: 'Authorized Service Center' },
    { date: '2023-04-10', kms: auction.vehicle.kms - 15000, task: 'Brake Pad Check & Suspension Alignment', center: 'Certified Bank Yard' },
    { date: '2022-09-22', kms: auction.vehicle.kms - 28000, task: 'Standard Periodic Service', center: 'Primary Dealer' }
  ];

  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
           <div className="bg-white rounded-[3rem] overflow-hidden border shadow-sm">
              <div className="h-[30rem] relative group">
                 <img src={auction.vehicle.images[0]} className="w-full h-full object-cover transition-transform duration-[5000ms] group-hover:scale-110" alt="" />
                 <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                 <div className="absolute top-8 left-8 flex gap-3">
                    <span className="bg-orange-600 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-orange-500 shadow-xl">LIVE FLOOR</span>
                    <span className="bg-white/90 backdrop-blur px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border">{auction.vehicle.bankName}</span>
                 </div>
                 <div className="absolute bottom-10 left-10">
                    <h1 className="text-5xl font-black italic tracking-tighter uppercase text-white drop-shadow-2xl">
                       {auction.vehicle.year} {auction.vehicle.make} <br/>
                       <span className="text-orange-400">{auction.vehicle.model}</span>
                    </h1>
                 </div>
              </div>
              
              <div className="p-12">
                 <div className="flex justify-between items-center mb-12">
                    <div className="flex items-center gap-6">
                       <div className="p-4 bg-slate-50 rounded-2xl border">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Asset Status</p>
                          <p className="text-xs font-black text-slate-900 uppercase">REPO - READY FOR DELIVERY</p>
                       </div>
                       <div className="p-4 bg-slate-50 rounded-2xl border">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">State Reg</p>
                          <p className="text-xs font-black text-slate-900 uppercase">{auction.vehicle.state}</p>
                       </div>
                    </div>
                    <button onClick={() => onToggleWatchlist(auction.id)} className={`w-16 h-16 rounded-[2rem] border flex items-center justify-center text-2xl transition-all ${watchlist.includes(auction.id) ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-white hover:bg-slate-50 text-slate-200 hover:text-orange-400'}`}>
                       <i className="fa-solid fa-heart"></i>
                    </button>
                 </div>

                 <div className="flex space-x-8 mb-10 border-b">
                   <button 
                     onClick={() => setActiveTab('floor')}
                     className={`pb-4 text-[10px] font-black uppercase tracking-widest transition-all relative ${activeTab === 'floor' ? 'text-slate-900' : 'text-slate-300'}`}
                   >
                     Bidding Floor (Leaderboard)
                     {activeTab === 'floor' && <div className="absolute bottom-0 left-0 w-full h-1 bg-orange-500 rounded-full"></div>}
                   </button>
                   <button 
                     onClick={() => setActiveTab('history')}
                     className={`pb-4 text-[10px] font-black uppercase tracking-widest transition-all relative ${activeTab === 'history' ? 'text-slate-900' : 'text-slate-300'}`}
                   >
                     Vehicle History Report
                     {activeTab === 'history' && <div className="absolute bottom-0 left-0 w-full h-1 bg-orange-500 rounded-full"></div>}
                   </button>
                 </div>

                 {activeTab === 'floor' && (
                    <div className="animate-in fade-in duration-500">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                          <div className="space-y-1">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Powertrain</p>
                            <p className="text-base font-black text-slate-900 uppercase tracking-tighter italic">{auction.vehicle.fuelType}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Odometer</p>
                            <p className="text-base font-black text-slate-900 uppercase tracking-tighter italic">{auction.vehicle.kms.toLocaleString()} KM</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Registry</p>
                            <p className="text-base font-black text-slate-900 uppercase tracking-tighter italic">{auction.vehicle.state}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Stock ID</p>
                            <p className="text-base font-black text-slate-900 uppercase tracking-tighter italic">{auction.id.split('-').pop()}</p>
                          </div>
                      </div>

                      <div className="border-t pt-12">
                          <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center">
                            <i className="fa-solid fa-trophy mr-3 text-orange-500"></i>
                            Floor Leaderboard (Top Bids)
                          </h3>
                          <div className="space-y-4">
                            {leaderboard.map((b, i) => (
                                <div key={i} className={`flex justify-between items-center p-5 rounded-2xl border transition-all duration-500 ${b.name.includes('(YOU)') ? 'bg-orange-50 border-orange-200 shadow-lg' : 'bg-slate-50/50 border-slate-100'}`}>
                                  <div className="flex items-center gap-4">
                                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black ${i === 0 ? 'bg-orange-600 text-white shadow-xl' : 'bg-white text-slate-400 border'}`}>
                                        {i === 0 ? <i className="fa-solid fa-crown"></i> : `#${i+1}`}
                                      </div>
                                      <div>
                                        <p className="text-[10px] font-black text-slate-900 uppercase">{b.name}</p>
                                        <p className="text-[8px] text-slate-400 font-bold uppercase">{b.time}</p>
                                      </div>
                                  </div>
                                  <p className={`text-sm font-black italic ${b.name.includes('(YOU)') ? 'text-orange-600' : 'text-slate-900'}`}>₹{b.price.toLocaleString()}</p>
                                </div>
                            ))}
                            {leaderboard.length === 0 && <p className="text-center py-10 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Opening Live Floor...</p>}
                          </div>
                      </div>
                    </div>
                 )}

                 {activeTab === 'history' && (
                    <div className="animate-in fade-in duration-500 space-y-12">
                       <div className="bg-slate-900 rounded-[2rem] p-8 text-white flex justify-between items-center">
                          <div>
                             <p className="text-orange-500 text-[9px] font-black uppercase tracking-[0.3em] mb-2">Verified Bank Audit</p>
                             <p className="text-2xl font-black italic tracking-tighter uppercase">Asset Forensic ID: {auction.vehicle.vin}</p>
                          </div>
                          <div className="text-right">
                             <p className="text-white/40 text-[9px] font-black uppercase tracking-widest mb-1">Generated On</p>
                             <p className="text-xs font-black uppercase">{new Date().toLocaleDateString()}</p>
                          </div>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className={`p-8 rounded-[2rem] border-2 flex items-center space-x-6 ${auction.vehicle.isAccidental ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'}`}>
                             <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl shadow-sm ${auction.vehicle.isAccidental ? 'bg-white text-red-600' : 'bg-white text-emerald-600'}`}>
                                <i className={`fa-solid ${auction.vehicle.isAccidental ? 'fa-car-burst' : 'fa-shield-check'}`}></i>
                             </div>
                             <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Accident Status</p>
                                <p className={`text-xl font-black italic uppercase tracking-tighter ${auction.vehicle.isAccidental ? 'text-red-600' : 'text-emerald-700'}`}>
                                   {auction.vehicle.isAccidental ? 'Accidental History Found' : 'Clean Title / Non-Accidental'}
                                </p>
                             </div>
                          </div>
                          
                          <div className={`p-8 rounded-[2rem] border-2 flex items-center space-x-6 ${auction.vehicle.rcAvailable ? 'bg-blue-50 border-blue-100' : 'bg-orange-50 border-orange-100'}`}>
                             <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl shadow-sm ${auction.vehicle.rcAvailable ? 'bg-white text-blue-600' : 'bg-white text-orange-600'}`}>
                                <i className={`fa-solid ${auction.vehicle.rcAvailable ? 'fa-file-invoice' : 'fa-file-circle-xmark'}`}></i>
                             </div>
                             <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">RC Availability</p>
                                <p className={`text-xl font-black italic uppercase tracking-tighter ${auction.vehicle.rcAvailable ? 'text-blue-700' : 'text-orange-700'}`}>
                                   {auction.vehicle.rcAvailable ? 'Original RC Available' : 'NOC Provided • Duplicate RC'}
                                </p>
                             </div>
                          </div>
                       </div>

                       <div className="bg-slate-50 rounded-[2rem] p-10 border">
                          <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-8 border-b pb-4">Ownership Portfolio</h4>
                          <div className="grid grid-cols-3 gap-8">
                             <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Previous Owners</p>
                                <p className="text-lg font-black italic text-slate-900 uppercase">01 (Single Owner)</p>
                             </div>
                             <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Owner Category</p>
                                <p className="text-lg font-black italic text-slate-900 uppercase">Individual (Private)</p>
                             </div>
                             <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Registry Tenure</p>
                                <p className="text-lg font-black italic text-slate-900 uppercase">{2024 - auction.vehicle.year} Years</p>
                             </div>
                          </div>
                       </div>

                       <div>
                          <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center">
                             <i className="fa-solid fa-screwdriver-wrench mr-3 text-blue-500"></i>
                             Certified Maintenance Log
                          </h4>
                          <div className="space-y-4">
                             {mockMaintenance.map((log, i) => (
                                <div key={i} className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm flex justify-between items-center group hover:border-blue-200 transition-all">
                                   <div className="flex items-center gap-6">
                                      <div className="text-center bg-slate-50 px-4 py-2 rounded-xl">
                                         <p className="text-[10px] font-black text-slate-400 uppercase">{new Date(log.date).getFullYear()}</p>
                                         <p className="text-xs font-black text-slate-900">{new Date(log.date).toLocaleString('default', { month: 'short' })}</p>
                                      </div>
                                      <div>
                                         <p className="text-sm font-black text-slate-800 uppercase italic tracking-tighter">{log.task}</p>
                                         <p className="text-[9px] text-slate-400 font-bold uppercase">{log.center} • {log.kms.toLocaleString()} KM</p>
                                      </div>
                                   </div>
                                   <div className="text-right">
                                      <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">Verified</span>
                                   </div>
                                </div>
                             ))}
                          </div>
                       </div>
                    </div>
                 )}
              </div>
           </div>
        </div>

        <div>
           <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl sticky top-24 border border-white/5 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
              
              <div className="mb-10 relative">
                 <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Floor High Reserve</p>
                 <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-orange-500 italic tracking-tighter">₹</span>
                    <p className="text-6xl font-black italic tracking-tighter drop-shadow-xl">{auction.currentBid.toLocaleString()}</p>
                 </div>
              </div>

              {alreadyBidded ? (
                <div className="bg-emerald-500/10 border border-emerald-500/30 p-8 rounded-[2.5rem] text-center animate-in zoom-in">
                   <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <i className="fa-solid fa-check-double text-4xl text-emerald-500"></i>
                   </div>
                   <p className="text-sm font-black uppercase tracking-widest text-emerald-400 mb-2">Bidded Successfully</p>
                   <p className="text-[10px] text-emerald-200/60 leading-relaxed font-medium">Your floor lock of ₹{userBidActivity.amount?.toLocaleString()} is now with the bank board. Approval typically takes 4-8 business hours.</p>
                   <button onClick={() => window.location.hash = 'mybids'} className="mt-8 text-[9px] font-black text-emerald-400 border-b border-emerald-400/30 pb-1 uppercase tracking-widest">Track Submission Progress</button>
                </div>
              ) : !hasTerritoryAccess ? (
                <div className="bg-red-500/10 border border-red-500/30 p-8 rounded-[2.5rem] text-center">
                   <i className="fa-solid fa-earth-asia text-4xl text-red-500 mb-6 block"></i>
                   <p className="text-sm font-black uppercase tracking-widest text-red-400">Territory Locked</p>
                   <p className="text-[10px] text-red-200/60 mt-4 leading-relaxed">This asset is located in <span className="text-white">{auction.vehicle.state}</span>. Update settings in Profile.</p>
                </div>
              ) : !user.isKycVerified ? (
                <div className="bg-orange-500/10 border border-orange-500/30 p-8 rounded-[2.5rem] text-center">
                   <i className="fa-solid fa-user-shield text-4xl text-orange-500 mb-6 block"></i>
                   <p className="text-sm font-black uppercase tracking-widest text-orange-400">KYC Required</p>
                   <p className="text-[10px] text-orange-200/60 mt-4 leading-relaxed">Financial floor access is limited to verified entities. Please complete your KYC verification to participate.</p>
                </div>
              ) : (
                <div className="space-y-8 relative">
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-4">Enter Your Floor Bid (₹)</label>
                      <div className="relative">
                         <input 
                           type="number" 
                           value={manualBid}
                           onChange={(e) => setManualBid(e.target.value)}
                           placeholder={`Min: ₹${(auction.currentBid + auction.bidIncrement).toLocaleString()}`}
                           className="w-full bg-white/5 border border-white/10 rounded-3xl px-8 py-5 text-white focus:ring-2 focus:ring-orange-500 outline-none font-black text-lg transition-all"
                         />
                         <i className="fa-solid fa-gavel absolute right-6 top-6 text-white/20"></i>
                      </div>
                   </div>
                   
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-4">Board Settlement Limit (₹)</label>
                      <div className="relative">
                         <input 
                           type="number" 
                           value={settlementBid}
                           onChange={(e) => setSettlementBid(e.target.value)}
                           placeholder="Requested Final Value"
                           className="w-full bg-white/5 border border-white/10 rounded-3xl px-8 py-5 text-white focus:ring-2 focus:ring-emerald-500 outline-none font-black text-lg transition-all"
                         />
                         <i className="fa-solid fa-handshake-angle absolute right-6 top-6 text-white/20"></i>
                      </div>
                   </div>

                   <button 
                     onClick={handleSubmitBid}
                     disabled={isSubmitting || !manualBid || !settlementBid}
                     className="w-full py-6 bg-orange-600 rounded-3xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-orange-500 transition-all shadow-2xl shadow-orange-900/40 active:scale-95 disabled:opacity-50"
                   >
                     {isSubmitting ? (
                        <div className="flex items-center justify-center gap-3">
                           <i className="fa-solid fa-spinner fa-spin"></i>
                           <span>Processing...</span>
                        </div>
                     ) : "Lock Bid & Commit"}
                   </button>
                   
                   <div className="flex flex-col items-center gap-4 pt-4">
                      <div className="flex items-center gap-2 text-[8px] font-black text-emerald-400 uppercase tracking-widest">
                         <i className="fa-solid fa-shield-check"></i>
                         <span>Unlimited Bidding Rights Active</span>
                      </div>
                      <p className="text-[9px] text-white/20 text-center uppercase font-bold tracking-tighter">Your bid is legally binding once locked on the floor.</p>
                   </div>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionDetail;
