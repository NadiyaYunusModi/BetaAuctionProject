
import React from 'react';
import { Auction, User, UserRole } from '../types';
import AuctionCard from '../components/AuctionCard';

interface WatchlistPageProps {
  user: User;
  auctions: Auction[];
  watchlist: string[];
  onToggleWatchlist: (id: string) => void;
  onSelectAuction: (id: string) => void;
}

const WatchlistPage: React.FC<WatchlistPageProps> = ({ 
  user, 
  auctions, 
  watchlist, 
  onToggleWatchlist,
  onSelectAuction 
}) => {
  const isStateVisible = (state: string) => {
    if (user.role === UserRole.ADMIN) return true;
    return user.viewingStates.includes(state);
  };

  const watchedAuctions = auctions.filter(a => 
    watchlist.includes(a.id) && isStateVisible(a.vehicle.state)
  );

  return (
    <div className="max-w-7xl mx-auto pb-20 space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
        <div>
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-14 h-14 bg-orange-600 rounded-2xl flex items-center justify-center text-white text-2xl shadow-xl shadow-orange-900/20">
               <i className="fa-solid fa-heart"></i>
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">My Watchlist</h1>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] mt-2">Saved Bank-Repossessed Assets</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-slate-100 p-5 rounded-[2rem] shadow-sm flex items-center space-x-6">
           <div className="text-center">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Items</p>
             <p className="text-xl font-black text-slate-900">{watchedAuctions.length}</p>
           </div>
           <div className="w-px h-8 bg-slate-100"></div>
           <div className="text-center">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Floors</p>
             <p className="text-xl font-black text-orange-600">{watchedAuctions.filter(a => a.status === 'LIVE').length}</p>
           </div>
        </div>
      </div>

      {watchedAuctions.length === 0 ? (
        <div className="bg-white rounded-[4rem] py-32 text-center border-2 border-dashed border-slate-100 flex flex-col items-center">
          <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 text-5xl mb-8">
            <i className="fa-solid fa-heart-crack"></i>
          </div>
          <h3 className="text-2xl font-black text-slate-900 uppercase italic mb-3 tracking-tighter">Your watchlist is empty</h3>
          <p className="text-slate-400 text-sm font-bold max-w-md mx-auto leading-relaxed">
            Browse the live floors to discover premium bank assets. Tap the heart icon on any vehicle to save it here for quick access.
          </p>
          <button 
            onClick={() => window.location.href = '#'} // Mock navigation to dashboard
            className="mt-10 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition shadow-xl"
          >
            Explore Dashboard
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {watchedAuctions.map(auc => (
            <div key={auc.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <AuctionCard 
                auction={auc} 
                userRole={user.role} 
                isWatched={true}
                onToggleWatchlist={() => onToggleWatchlist(auc.id)}
                onClick={() => onSelectAuction(auc.id)} 
              />
            </div>
          ))}
        </div>
      )}

      {/* Access Restriction Notice */}
      <div className="bg-blue-50/50 border border-blue-100 p-8 rounded-[2.5rem] flex items-start space-x-6 mt-12">
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm shrink-0">
          <i className="fa-solid fa-shield-halved text-xl"></i>
        </div>
        <div>
          <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-1">State Access Protocol</h4>
          <p className="text-xs text-slate-500 font-bold leading-relaxed max-w-2xl">
            You are currently viewing watched items from <span className="text-blue-600">{user.viewingStates.join(', ')}</span>. 
            Assets in other regions are hidden from your list. To expand your reach, please update your Territory Settings in the profile section.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WatchlistPage;
