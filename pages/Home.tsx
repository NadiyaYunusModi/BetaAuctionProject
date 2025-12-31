
import React, { useState } from 'react';
import { Auction, User, AuctionStatus, UserRole } from '../types';
import AuctionCard from '../components/AuctionCard';

interface HomeProps {
  auctions: Auction[];
  onSelectAuction: (id: string) => void;
  user: User;
  watchlist: string[];
  onToggleWatchlist: (id: string) => void;
}

const Home: React.FC<HomeProps> = ({ auctions, onSelectAuction, user, watchlist, onToggleWatchlist }) => {
  const [filterState, setFilterState] = useState<string>('All');

  // Centralized Visibility Logic: strictly enforce viewingStates unless Admin
  const isStateVisible = (state: string) => {
    if (user.role === UserRole.ADMIN) return true;
    return user.viewingStates.includes(state);
  };

  const visibleAuctions = auctions.filter(a => {
    const stateMatch = filterState === 'All' || a.vehicle.state === filterState;
    const viewMatch = isStateVisible(a.vehicle.state);
    return stateMatch && viewMatch;
  });
  
  const liveAuctions = visibleAuctions.filter(a => a.status === AuctionStatus.LIVE);
  const upcomingAuctions = visibleAuctions.filter(a => a.status === AuctionStatus.UPCOMING);
  
  // Watchlist only shows items from states the user is CURRENTLY permitted to view
  const watchedAuctions = auctions.filter(a => watchlist.includes(a.id) && isStateVisible(a.vehicle.state));

  // Business Dashboard Logic
  const getBidderStats = () => {
    const activeBidsCount = user.activityHistory.filter(h => h.type === 'BID_SUBMITTED' && h.status === 'PENDING').length;
    const winsCount = auctions.filter(a => a.winnerId === user.id).length;
    const isElite = (user.monthlyTurnover || 0) >= 1000000;

    return [
      { label: 'My Submissions', count: activeBidsCount.toString(), icon: 'fa-gavel', color: 'text-orange-500', bg: 'bg-orange-50' },
      { label: 'Inventory Won', count: winsCount.toString(), icon: 'fa-trophy', color: 'text-emerald-600', bg: 'bg-emerald-50' },
      { label: 'Monthly Volume', count: isElite ? '10L+' : `< 10L`, icon: 'fa-chart-line', color: 'text-blue-500', bg: 'bg-blue-50' },
      { label: 'Bidding Tier', count: isElite ? 'UNLIMITED' : 'LOCKED', icon: 'fa-crown', color: 'text-amber-500', bg: 'bg-amber-50' },
    ];
  };

  const getAdminStats = () => [
    { label: 'Bank Assets', count: auctions.length.toString(), icon: 'fa-car-on', color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Live Floors', count: auctions.filter(a => a.status === AuctionStatus.LIVE).length.toString(), icon: 'fa-bolt', color: 'text-orange-500', bg: 'bg-orange-50' },
    { label: 'Bid Reviews', count: auctions.filter(a => a.isApprovalPending).length.toString(), icon: 'fa-user-clock', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Settled Value', count: '₹1.8 Cr', icon: 'fa-money-bill-transfer', color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  const stats = user.role === UserRole.ADMIN ? getAdminStats() : getBidderStats();

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20">
      {/* Hero Banner */}
      <section className="relative h-80 rounded-[3rem] overflow-hidden bg-slate-900 flex items-center px-12 group shadow-2xl">
        <img 
          src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=2000" 
          className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-[4000ms]" 
          alt="Hero Banner"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/40 to-transparent"></div>
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center space-x-3 mb-6">
            <span className="h-[2px] w-12 bg-orange-500"></span>
            <span className="text-orange-500 font-black uppercase tracking-[0.3em] text-[10px]">Premium Repo Assets Portal</span>
          </div>
          <h2 className="text-5xl lg:text-6xl font-black text-white mb-6 leading-tight italic tracking-tighter">
            Bank Assets <br/> <span className="text-orange-500 underline decoration-yellow-400 decoration-4 underline-offset-8">Transparent Bidding.</span>
          </h2>
          <div className="flex items-center space-x-4">
             <div className="bg-white/10 backdrop-blur-md border border-white/20 px-6 py-3 rounded-2xl flex items-center space-x-3">
                <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="text-white font-black text-[10px] uppercase tracking-widest">{user.role === 'ADMIN' ? 'Admin Controller' : `${user.monthlyTurnover && user.monthlyTurnover >= 1000000 ? 'ELITE' : 'STANDARD'} BIDDER SESSION`}</span>
             </div>
          </div>
        </div>
      </section>

      {/* Dashboard Metrics */}
      <div>
        <div className="flex items-center justify-between mb-8 px-4">
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">Control Panel</h3>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Operational Performance & Business Logic</p>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <div key={i} className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 group relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-24 h-24 opacity-5 transform rotate-12 transition-transform group-hover:rotate-0">
                <i className={`fa-solid ${s.icon} text-8xl`}></i>
              </div>
              <div className="flex flex-col space-y-6 relative z-10">
                <div className={`w-14 h-14 ${s.bg} rounded-2xl flex items-center justify-center ${s.color} text-xl group-hover:scale-110 group-hover:rotate-6 transition-transform shadow-sm`}>
                  <i className={`fa-solid ${s.icon}`}></i>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1">{s.label}</p>
                  <p className="text-3xl font-black text-slate-950 tracking-tighter italic uppercase">{s.count}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Floors */}
      <section>
        <div className="flex items-center justify-between mb-10 px-4">
           <div>
              <div className="flex items-center space-x-3 mb-2">
                <span className="w-4 h-4 bg-orange-500 rounded-full animate-ping"></span>
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Live Bidding Floor</h3>
              </div>
              <p className="text-slate-500 text-sm font-bold ml-7">Direct bank repositories active for manual bid submission.</p>
           </div>

           <div className="flex items-center space-x-3 bg-white p-2 rounded-2xl border border-slate-100">
             {['All', 'Maharashtra', 'Karnataka', 'Delhi'].map(s => (
               <button 
                 key={s}
                 onClick={() => setFilterState(s)}
                 className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterState === s ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
               >
                 {s}
               </button>
             ))}
           </div>
        </div>
        
        {liveAuctions.length === 0 ? (
          <div className="bg-slate-50 rounded-[4rem] p-32 text-center border-2 border-dashed border-slate-200">
            <p className="text-slate-400 font-black uppercase tracking-widest text-sm italic">No active assets in this region</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            {liveAuctions.map(auc => (
              <AuctionCard 
                key={auc.id} 
                auction={auc} 
                userRole={user.role} 
                userActivity={user.activityHistory}
                isWatched={watchlist.includes(auc.id)}
                onToggleWatchlist={() => onToggleWatchlist(auc.id)}
                onClick={() => onSelectAuction(auc.id)} 
              />
            ))}
          </div>
        )}
      </section>

      {/* Upcoming Floor */}
      <section className="mt-20">
        <div className="flex items-end justify-between mb-10 px-4">
          <div>
            <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Upcoming Repository Preview</h3>
            <p className="text-slate-500 text-sm font-bold mt-1">Assets arriving for bank review. Prepare your strategy.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
          {upcomingAuctions.map(auc => (
            <AuctionCard 
              key={auc.id} 
              auction={auc} 
              userRole={user.role} 
              userActivity={user.activityHistory}
              isWatched={watchlist.includes(auc.id)}
              onToggleWatchlist={() => onToggleWatchlist(auc.id)}
              onClick={() => onSelectAuction(auc.id)} 
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
