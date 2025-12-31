
import React from 'react';
import { Auction, AuctionStatus, UserRole, UserActivity } from '../types';

interface AuctionCardProps {
  auction: Auction;
  onClick: () => void;
  userRole?: UserRole;
  isWatched?: boolean;
  onToggleWatchlist?: (e: React.MouseEvent) => void;
  userActivity?: UserActivity[];
}

const AuctionCard: React.FC<AuctionCardProps> = ({ 
  auction, 
  onClick, 
  userRole = UserRole.PUBLIC,
  isWatched = false,
  onToggleWatchlist,
  userActivity = []
}) => {
  const isLive = auction.status === AuctionStatus.LIVE;
  const isPublic = userRole === UserRole.PUBLIC;
  
  // Find if user has a pending bid for this asset
  const myPendingBid = userActivity.find(act => act.targetId === auction.id && act.type === 'BID_SUBMITTED');

  const glowClass = isLive 
    ? "group-hover:shadow-[0_0_35px_rgba(249,115,22,0.45)] border-orange-100" 
    : "group-hover:shadow-[0_0_35px_rgba(234,179,8,0.35)] border-yellow-50";

  return (
    <div 
      onClick={onClick}
      className={`group bg-white rounded-[2.5rem] border overflow-hidden cursor-pointer transition-all duration-500 transform hover:-translate-y-3 ${glowClass}`}
    >
      <div className="relative h-60 overflow-hidden">
        <img 
          src={auction.vehicle.images[0]} 
          alt={auction.vehicle.model}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
        />
        
        <div className="absolute top-5 left-5 flex flex-col gap-2">
          {isLive ? (
            <span className="bg-orange-600 text-white text-[9px] font-black px-4 py-2 rounded-full flex items-center shadow-xl uppercase tracking-tighter animate-pulse">
              <span className="w-2 h-2 bg-white rounded-full mr-2"></span>
              Live Floor
            </span>
          ) : (
            <span className="bg-yellow-400 text-slate-900 text-[9px] font-black px-4 py-2 rounded-full flex items-center shadow-xl uppercase tracking-tighter">
              <i className="fa-solid fa-clock mr-2"></i>
              Upcoming
            </span>
          )}
          {myPendingBid && (
            <span className="bg-emerald-500 text-white text-[9px] font-black px-4 py-2 rounded-full flex items-center shadow-xl uppercase tracking-tighter border border-emerald-400">
              <i className="fa-solid fa-check-double mr-2"></i>
              Bid Placed
            </span>
          )}
        </div>

        <button 
          onClick={(e) => {
            e.stopPropagation();
            onToggleWatchlist?.(e);
          }}
          className="absolute top-5 right-5 w-10 h-10 bg-white/20 backdrop-blur-xl rounded-2xl border border-white/30 flex items-center justify-center text-white transition-all hover:bg-white hover:text-orange-500 z-10"
        >
          <i className={`${isWatched ? 'fa-solid' : 'fa-regular'} fa-heart ${isWatched ? 'text-orange-500' : ''}`}></i>
        </button>

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent p-6 pt-16">
           <div className="flex justify-between items-end">
             <div>
               <p className="text-orange-400 text-[8px] font-black uppercase tracking-widest mb-1">Bank Current Price</p>
               <p className="text-white text-3xl font-black italic tracking-tighter">₹{auction.currentBid.toLocaleString()}</p>
             </div>
             {myPendingBid && (
               <div className="text-right bg-emerald-600/20 backdrop-blur-md p-2 rounded-xl border border-emerald-500/30">
                 <p className="text-emerald-400 text-[8px] font-black uppercase tracking-widest mb-1">Your Submission</p>
                 <p className="text-white font-black text-sm italic tracking-tighter">₹{myPendingBid.amount?.toLocaleString()}</p>
               </div>
             )}
           </div>
        </div>
      </div>

      <div className="p-7">
        <div className="flex justify-between items-start mb-5">
          <div>
            <h4 className="text-2xl font-black text-slate-900 leading-none mb-1 italic tracking-tighter uppercase">
              {auction.vehicle.year} {auction.vehicle.make}
            </h4>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-2">{auction.vehicle.model}</p>
            <div className="flex items-center text-blue-600">
               <i className="fa-solid fa-building-columns text-[10px] mr-2"></i>
               <span className="text-[9px] font-black uppercase tracking-widest">{auction.vehicle.bankName}</span>
            </div>
          </div>
          <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 flex flex-col items-center">
            <p className="text-[8px] text-slate-400 font-black uppercase mb-0.5">Asset ID</p>
            <p className="text-[10px] font-black text-slate-700 uppercase">{auction.id.split('-').pop()}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-8">
          <div className="bg-slate-50/80 rounded-2xl p-3 border border-slate-100 flex items-center space-x-3 group-hover:bg-orange-50/50 transition-colors">
            <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm">
              <i className="fa-solid fa-gauge-high text-orange-500 text-xs"></i>
            </div>
            <div>
              <p className="text-[8px] text-slate-400 font-black uppercase">Odometer</p>
              <p className="text-xs font-black text-slate-800">{auction.vehicle.kms.toLocaleString()} km</p>
            </div>
          </div>
          <div className="bg-slate-50/80 rounded-2xl p-3 border border-slate-100 flex items-center space-x-3 group-hover:bg-blue-50/50 transition-colors">
            <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm">
              <i className="fa-solid fa-location-dot text-blue-500 text-xs"></i>
            </div>
            <div>
              <p className="text-[8px] text-slate-400 font-black uppercase">Region</p>
              <p className="text-xs font-black text-slate-800">{auction.vehicle.state}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6">
          {isPublic ? (
            <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg hover:bg-orange-600 transition transform active:scale-95">
              Unlock Auction Info
            </button>
          ) : (
            <button className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center space-x-3 shadow-lg active:scale-95 ${
              isLive 
              ? (myPendingBid ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-orange-600 text-white hover:bg-orange-700 hover:shadow-orange-200') 
              : 'bg-yellow-400 text-slate-900 hover:bg-yellow-500 hover:shadow-yellow-100'
            }`}>
              <span>{myPendingBid ? 'View My Bid Status' : (isLive ? 'Enter Bidding Floor' : 'Asset Preview')}</span>
              <i className="fa-solid fa-chevron-right text-[10px]"></i>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuctionCard;
