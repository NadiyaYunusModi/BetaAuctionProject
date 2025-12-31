
import React, { useState, useEffect, useCallback } from 'react';
import { User, UserRole, Auction, Notification, AuctionStatus, UserActivity, PaymentProcessStatus } from './types';
import { MOCK_BIDDERS, MOCK_ADMIN, MOCK_AUCTIONS, MOCK_PUBLIC_USER } from './services/mockData';
import Layout from './components/Layout';
import Home from './pages/Home';
import AuctionDetail from './pages/AuctionDetail';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import MyBids from './pages/MyBids';
import WatchlistPage from './pages/Watchlist';
import KYCVerification from './pages/KYCVerification';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [auctions, setAuctions] = useState<Auction[]>(MOCK_AUCTIONS);
  const [allUsers, setAllUsers] = useState<User[]>([MOCK_ADMIN, ...MOCK_BIDDERS]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<'home' | 'auction' | 'admin' | 'profile' | 'mybids' | 'kyc' | 'watchlist'>('home');
  const [selectedAuctionId, setSelectedAuctionId] = useState<string | null>(null);
  const [showPolicies, setShowPolicies] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('ab_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      const actualUser = allUsers.find(u => u.id === parsed.id) || parsed;
      setCurrentUser(actualUser);
    }
    const savedWatchlist = localStorage.getItem('ab_watchlist');
    if (savedWatchlist) setWatchlist(JSON.parse(savedWatchlist));
  }, [allUsers]);

  const addNotification = useCallback((message: string, type: Notification['type']) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [{ id, message, type, timestamp: new Date().toISOString() }, ...prev].slice(0, 5));
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }, []);

  const recordActivity = useCallback((userId: string, activity: Omit<UserActivity, 'id' | 'timestamp'>) => {
    const newActivity: UserActivity = {
      ...activity,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString()
    };
    
    setAllUsers(prev => prev.map(u => {
      if (u.id === userId) return { ...u, activityHistory: [newActivity, ...u.activityHistory] };
      return u;
    }));

    if (currentUser?.id === userId) {
      setCurrentUser(prev => {
        if (!prev) return null;
        const updated = { ...prev, activityHistory: [newActivity, ...prev.activityHistory] };
        localStorage.setItem('ab_user', JSON.stringify(updated));
        return updated;
      });
    }
  }, [currentUser]);

  const handleSelectAuction = (id: string) => {
    setSelectedAuctionId(id);
    setCurrentPage('auction');
  };

  const handleBidSubmission = (auctionId: string, bidAmount: number, settlementAmount: number) => {
    if (!currentUser) return;

    const alreadyBidded = currentUser.activityHistory.some(act => act.targetId === auctionId && act.type === 'BID_SUBMITTED');
    if (alreadyBidded) {
      addNotification("Restriction: Bid already registered for this floor.", "warning");
      return;
    }

    setAuctions(prev => prev.map(auc => {
      if (auc.id === auctionId) {
        return { 
          ...auc, 
          isApprovalPending: true,
          paymentStatus: PaymentProcessStatus.AWAITING_APPROVAL,
          bidSubmission: {
            userId: currentUser.id,
            userName: currentUser.name,
            bidAmount,
            settlementAmount
          }
        };
      }
      return auc;
    }));

    recordActivity(currentUser.id, {
      type: 'BID_SUBMITTED',
      description: `BID FLOOR: ₹${bidAmount.toLocaleString()} locked for review.`,
      amount: bidAmount,
      settlementAmount: settlementAmount,
      targetId: auctionId,
      targetName: auctions.find(a => a.id === auctionId)?.vehicle.model,
      status: 'PENDING'
    });

    addNotification("Bid added successfully. Admin review initiated.", "success");
    
    // Auto-refresh detail view or navigate
    setTimeout(() => {
      setCurrentPage('mybids');
    }, 1500);
  };

  const approveBid = (auctionId: string) => {
    const auc = auctions.find(a => a.id === auctionId);
    if (!auc || !auc.bidSubmission) return;

    setAuctions(prev => prev.map(a => {
      if (a.id === auctionId) {
        return {
          ...a,
          isApprovalPending: false,
          currentBid: auc.bidSubmission!.bidAmount,
          winnerId: auc.bidSubmission!.userId,
          status: AuctionStatus.CLOSED,
          paymentStatus: PaymentProcessStatus.OPEN_FOR_PAYMENT
        };
      }
      return a;
    }));

    recordActivity(auc.bidSubmission.userId, {
      type: 'BID',
      description: `APPROVAL GRANTED: Asset ${auc.id} assigned. Awaiting Deposit.`,
      status: 'SUCCESS',
      targetId: auctionId,
      targetName: auc.vehicle.model,
      amount: auc.bidSubmission.bidAmount
    });

    addNotification(`Bid for ${auctionId} Approved. Payment portal opened for bidder.`, 'success');
  };

  const rejectBid = (auctionId: string) => {
    const auc = auctions.find(a => a.id === auctionId);
    if (!auc || !auc.bidSubmission) return;

    setAuctions(prev => prev.map(a => a.id === auctionId ? { ...a, isApprovalPending: false, paymentStatus: undefined, bidSubmission: undefined } : a));

    recordActivity(auc.bidSubmission.userId, {
      type: 'BID',
      description: `BOARD REJECTION: Asset ${auc.id} offer declined.`,
      status: 'REJECTED',
      targetId: auctionId,
      targetName: auc.vehicle.model
    });

    addNotification(`Bid for ${auctionId} rejected.`, 'warning');
  };

  const confirmBankPayment = (auctionId: string) => {
    const auction = auctions.find(a => a.id === auctionId);
    if (!auction) return;
    
    setAuctions(prev => prev.map(a => a.id === auctionId ? { ...a, paymentStatus: PaymentProcessStatus.PAYMENT_DONE } : a));
    
    if (auction.winnerId) {
      recordActivity(auction.winnerId, {
        type: 'PAYMENT_COMPLETE',
        description: `PAYMENT VERIFIED: ${auction.vehicle.model} release NOC generated.`,
        amount: auction.currentBid * 1.02,
        targetId: auctionId,
        targetName: auction.vehicle.model,
        status: 'SUCCESS'
      });
    }
    addNotification("Payment confirmed. Asset settlement complete.", "success");
  };

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const loginId = (form.elements.namedItem('loginId') as HTMLInputElement).value;
    const loginPass = (form.elements.namedItem('loginPass') as HTMLInputElement).value;
    const user = allUsers.find(u => u.id === loginId && u.password === loginPass);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('ab_user', JSON.stringify(user));
      recordActivity(user.id, { type: 'LOGIN', description: 'Bidding session secured.' });
      setCurrentPage('home');
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('ab_user');
    setCurrentPage('home');
    setSelectedAuctionId(null);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 text-center relative overflow-hidden">
        {showPolicies && (
          <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-8 animate-in fade-in zoom-in duration-300">
             <div className="max-w-2xl bg-white rounded-[3rem] p-12 text-left relative shadow-2xl">
               <button onClick={() => setShowPolicies(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 transition"><i className="fa-solid fa-xmark text-2xl"></i></button>
               <h2 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 mb-6">Security & Bidding Protocols</h2>
               <div className="space-y-6 text-sm text-slate-600 font-medium overflow-y-auto max-h-[60vh] pr-4 no-scrollbar">
                 <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-[2rem]">
                   <h4 className="font-black text-emerald-900 uppercase text-[10px] tracking-widest mb-2 flex items-center"><i className="fa-solid fa-infinity mr-2"></i> Unlimited Bidding Policy</h4>
                   <p>Verified bidders are permitted to bid on unlimited assets within their authorized territories. Manual bid inputs are audited for compliance.</p>
                 </div>
                 <div className="p-5 bg-blue-50 border border-blue-100 rounded-[2rem]">
                   <h4 className="font-black text-blue-900 uppercase text-[10px] tracking-widest mb-2">Expansion Tier (>20L/3m)</h4>
                   <p>Elite Bidders achieving ₹20 Lakh turnover in any 3-month window unlock a 4th Bidding State (3 Existing + 1 Dynamic).</p>
                 </div>
               </div>
               <button onClick={() => setShowPolicies(false)} className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black mt-8 hover:bg-orange-600 transition">ACCEPT & CONTINUE</button>
             </div>
          </div>
        )}

        <div className="max-w-md w-full bg-white/5 backdrop-blur-3xl rounded-[3rem] border border-white/10 p-10 shadow-2xl z-10">
          <h1 className="text-4xl font-black text-white mb-2 tracking-tighter italic">Auction<span className="text-orange-500">Baba</span></h1>
          <p className="text-slate-400 text-[10px] mb-10 font-bold uppercase tracking-widest">Bank Asset Liquidation Portal</p>
          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <input name="loginId" placeholder="Authorized User ID" className="w-full bg-white/10 border border-white/10 rounded-2xl px-5 py-3.5 text-white text-sm outline-none focus:ring-2 focus:ring-orange-500 transition" required />
            <input name="loginPass" type="password" placeholder="Passcode" className="w-full bg-white/10 border border-white/10 rounded-2xl px-5 py-3.5 text-white text-sm outline-none focus:ring-2 focus:ring-orange-500 transition" required />
            <button type="submit" className="w-full py-4 bg-orange-600 text-white font-black rounded-2xl shadow-xl shadow-orange-900/20 uppercase text-xs tracking-widest hover:bg-orange-500 transition">Enter Secure Vault</button>
          </form>
          <div className="mt-8 flex flex-col gap-4">
            <button onClick={() => setShowPolicies(true)} className="text-[10px] font-black text-white/40 hover:text-white uppercase tracking-widest border-b border-white/5 pb-1 transition">Elite Rules • Financial Policy</button>
            <p className="text-[9px] text-white/20 uppercase tracking-tighter">Login: bidder01 - bidder50 (pass) | admin01 (admin)</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout user={currentUser} onLogout={logout} onNavigate={setCurrentPage} currentPage={currentPage} notifications={notifications} watchlistCount={watchlist.length}>
      {currentPage === 'home' && (
        <Home 
          auctions={auctions} 
          onSelectAuction={handleSelectAuction} 
          user={currentUser} 
          watchlist={watchlist} 
          onToggleWatchlist={(id) => setWatchlist(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])} 
        />
      )}
      {currentPage === 'auction' && selectedAuctionId && (
        <AuctionDetail 
          auction={auctions.find(a => a.id === selectedAuctionId)!} 
          user={currentUser} 
          watchlist={watchlist} 
          onToggleWatchlist={(id) => setWatchlist(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])}
          onBidPlaced={(bid, settlement) => handleBidSubmission(selectedAuctionId, bid, settlement)}
        />
      )}
      {currentPage === 'admin' && (
        <AdminDashboard 
          auctions={auctions} 
          users={allUsers} 
          onApproveWinner={approveBid} 
          onRejectBid={rejectBid}
          onConfirmPayment={confirmBankPayment} 
        />
      )}
      {currentPage === 'mybids' && (
        <MyBids 
          user={currentUser} 
          auctions={auctions} 
          onInitiatePayment={(id, ref) => {
            setAuctions(prev => prev.map(a => a.id === id ? { ...a, paymentStatus: PaymentProcessStatus.VERIFYING_PAYMENT, paymentReference: ref } : a));
            recordActivity(currentUser.id, {
              type: 'PAYMENT_INITIATED',
              description: `Submitted Reference ID: ${ref}`,
              targetId: id
            });
            addNotification("Reference received. Verifying with Bank Accounts.", "success");
          }} 
        />
      )}
      {currentPage === 'profile' && <Profile user={currentUser} setUser={(updated) => {
        setAllUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
        setCurrentUser(updated);
      }} />}
      {currentPage === 'kyc' && <KYCVerification user={currentUser} onVerified={() => recordActivity(currentUser.id, { type: 'KYC_SUBMIT', description: 'High Volume Bidding KYC Verified.' })} />}
      {currentPage === 'watchlist' && <WatchlistPage user={currentUser} auctions={auctions} watchlist={watchlist} onToggleWatchlist={(id) => setWatchlist(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])} onSelectAuction={handleSelectAuction} />}
    </Layout>
  );
};

export default App;
