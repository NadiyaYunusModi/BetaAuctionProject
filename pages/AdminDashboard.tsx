
import React, { useState } from 'react';
import { Auction, PaymentProcessStatus, User, AuctionStatus } from '../types';

interface AdminDashboardProps {
  auctions: Auction[];
  users: User[];
  onApproveWinner: (id: string) => void;
  onRejectBid: (id: string) => void;
  onConfirmPayment: (id: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ auctions, users, onApproveWinner, onRejectBid, onConfirmPayment }) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'payments' | 'ledger'>('pending');
  const [selectedAssetLog, setSelectedAssetLog] = useState<string | null>(null);

  const pendingBids = auctions.filter(a => a.isApprovalPending);
  const verifyingPayments = auctions.filter(a => a.paymentStatus === PaymentProcessStatus.VERIFYING_PAYMENT);

  return (
    <div className="max-w-7xl mx-auto py-6">
      <div className="flex justify-between items-center mb-10 px-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Control Tower</h1>
          <p className="text-slate-500 font-bold text-sm uppercase">Direct Bank Master Registry Control</p>
        </div>
      </div>

      <div className="flex space-x-8 mb-10 border-b border-slate-200 px-4">
        {[
          { id: 'pending', label: `Bid Approvals (${pendingBids.length})` },
          { id: 'payments', label: `Bank Payments (${verifyingPayments.length})` },
          { id: 'ledger', label: 'Asset Ledger & Logs' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-4 px-2 text-xs font-black uppercase tracking-widest transition-colors relative ${activeTab === tab.id ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
          >
            {tab.label}
            {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-900 rounded-full"></div>}
          </button>
        ))}
      </div>

      {activeTab === 'pending' && (
        <div className="bg-white rounded-[3rem] border shadow-sm overflow-hidden animate-in fade-in">
           <div className="p-10 border-b bg-orange-50/50">
             <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center">
               <i className="fa-solid fa-file-signature mr-3 text-orange-500"></i>
               Incoming Bid Submissions
             </h3>
             <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-tighter">Review manual values and settlement requests for final assignment.</p>
           </div>
           <table className="w-full text-left">
              <thead className="bg-slate-50 border-b text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">
                 <tr>
                    <th className="px-10 py-6">Vehicle (Bank)</th>
                    <th className="px-10 py-6">Bidder (Turnover)</th>
                    <th className="px-10 py-6">Manual Bid</th>
                    <th className="px-10 py-6">Settlement Req</th>
                    <th className="px-10 py-6 text-right">Review</th>
                 </tr>
              </thead>
              <tbody className="divide-y text-sm">
                 {pendingBids.length === 0 ? (
                   <tr><td colSpan={5} className="p-32 text-center text-slate-300 font-black uppercase italic tracking-widest opacity-40">Zero bids in approval queue</td></tr>
                 ) : (
                   pendingBids.map(auc => {
                      const bidder = users.find(u => u.id === auc.bidSubmission?.userId);
                      const isHighVolume = (bidder?.monthlyTurnover || 0) >= 1000000;
                      return (
                        <tr key={auc.id} className="hover:bg-slate-50/50 transition group">
                           <td className="px-10 py-8">
                              <p className="font-black text-slate-900 uppercase tracking-tighter">{auc.vehicle.make} {auc.vehicle.model}</p>
                              <p className="text-[9px] text-blue-500 uppercase font-black tracking-widest mt-1">{auc.vehicle.bankName} • {auc.id}</p>
                           </td>
                           <td className="px-10 py-8">
                              <div className="flex items-center gap-3">
                                <p className="font-black text-slate-700 uppercase">{auc.bidSubmission?.userName}</p>
                                {isHighVolume && <i className="fa-solid fa-crown text-amber-500 text-[10px]" title="Elite Bidder"></i>}
                              </div>
                              <p className="text-[9px] text-slate-400 uppercase font-bold">Turnover: ₹{bidder?.monthlyTurnover?.toLocaleString()}</p>
                           </td>
                           <td className="px-10 py-8 font-black text-slate-900">₹{auc.bidSubmission?.bidAmount.toLocaleString()}</td>
                           <td className="px-10 py-8 font-black text-orange-600 italic">₹{auc.bidSubmission?.settlementAmount.toLocaleString()}</td>
                           <td className="px-10 py-8 text-right space-x-3">
                              <button onClick={() => onRejectBid(auc.id)} className="bg-slate-100 text-slate-400 px-5 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-500 transition-all">Reject</button>
                              <button onClick={() => onApproveWinner(auc.id)} className="bg-slate-900 text-white px-5 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl shadow-slate-900/10">Approve</button>
                           </td>
                        </tr>
                      );
                   })
                 )}
              </tbody>
           </table>
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="bg-white rounded-[3rem] border shadow-sm overflow-hidden animate-in fade-in">
           <div className="p-10 border-b bg-emerald-50/50">
             <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center">
               <i className="fa-solid fa-vault mr-3 text-emerald-600"></i>
               Bank Settlement Audit
             </h3>
             <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-tighter">Cross-reference Transaction IDs with Nodal Account credit alerts.</p>
           </div>
           <table className="w-full text-left">
              <thead className="bg-slate-50 border-b text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">
                 <tr>
                    <th className="px-10 py-6">Winner (ID)</th>
                    <th className="px-10 py-6">Bank Reference</th>
                    <th className="px-10 py-6">Amount Paid</th>
                    <th className="px-10 py-6 text-right">Verification</th>
                 </tr>
              </thead>
              <tbody className="divide-y text-sm">
                 {verifyingPayments.length === 0 ? (
                   <tr><td colSpan={4} className="p-32 text-center text-slate-300 font-black uppercase italic tracking-widest opacity-40">No settlements pending audit</td></tr>
                 ) : (
                   verifyingPayments.map(auc => (
                     <tr key={auc.id} className="hover:bg-slate-50/50 transition">
                        <td className="px-10 py-8">
                           <p className="font-black text-slate-900 uppercase">{users.find(u => u.id === auc.winnerId)?.name}</p>
                           <p className="text-[9px] text-slate-400 font-bold uppercase">{auc.vehicle.make} {auc.vehicle.model}</p>
                        </td>
                        <td className="px-10 py-8">
                           <span className="bg-blue-50 text-blue-700 font-mono font-black px-4 py-2 rounded-xl border border-blue-100 uppercase tracking-widest">{auc.paymentReference}</span>
                        </td>
                        <td className="px-10 py-8 font-black text-emerald-600 text-base">₹{(auc.currentBid * 1.02).toLocaleString()}</td>
                        <td className="px-10 py-8 text-right">
                           <button onClick={() => onConfirmPayment(auc.id)} className="bg-emerald-600 text-white px-8 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all">Confirm Bank Credit</button>
                        </td>
                     </tr>
                   ))
                 )}
              </tbody>
           </table>
        </div>
      )}

      {activeTab === 'ledger' && (
        <div className="bg-white rounded-[3rem] border shadow-sm overflow-hidden animate-in fade-in">
           <div className="p-10 border-b bg-slate-50/50 flex justify-between items-center">
             <div>
               <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center">
                 <i className="fa-solid fa-layer-group mr-3 text-slate-600"></i>
                 Asset & Activity Ledger
               </h3>
               <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-tighter">Full lifecycle tracking of repossessed inventory.</p>
             </div>
             {selectedAssetLog && (
               <button onClick={() => setSelectedAssetLog(null)} className="text-[9px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 px-4 py-2 rounded-xl border border-blue-100">Back to Ledger</button>
             )}
           </div>
           
           {!selectedAssetLog ? (
             <table className="w-full text-left">
                <thead className="bg-slate-50 border-b text-[10px] font-black text-slate-400 uppercase">
                   <tr>
                      <th className="px-10 py-6">ID</th>
                      <th className="px-10 py-6">Inventory Asset</th>
                      <th className="px-10 py-6">Region</th>
                      <th className="px-10 py-6">Lifecycle Status</th>
                      <th className="px-10 py-6 text-right">Activity</th>
                   </tr>
                </thead>
                <tbody className="divide-y text-xs font-bold text-slate-600">
                   {auctions.map(auc => (
                     <tr key={auc.id} className="hover:bg-slate-50 transition group">
                        <td className="px-10 py-6 font-mono text-[10px] text-slate-400">{auc.id}</td>
                        <td className="px-10 py-6 font-black uppercase text-slate-900">{auc.vehicle.make} {auc.vehicle.model}</td>
                        <td className="px-10 py-6 uppercase tracking-widest">{auc.vehicle.state}</td>
                        <td className="px-10 py-6">
                           <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                             auc.status === AuctionStatus.LIVE ? 'bg-orange-50 text-orange-600 border-orange-100' : 
                             auc.status === AuctionStatus.CLOSED ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-300 border-slate-100'
                           }`}>
                             {auc.status}
                           </span>
                        </td>
                        <td className="px-10 py-6 text-right">
                           <button onClick={() => setSelectedAssetLog(auc.id)} className="text-[10px] font-black text-slate-400 group-hover:text-blue-500 transition-colors uppercase tracking-widest">
                             View Bid Logs <i className="fa-solid fa-list-check ml-1"></i>
                           </button>
                        </td>
                     </tr>
                   ))}
                </tbody>
             </table>
           ) : (
             <div className="p-10 animate-in slide-in-from-right-8 duration-500">
                <div className="flex items-center gap-6 mb-10">
                   <img src={auctions.find(a => a.id === selectedAssetLog)?.vehicle.images[0]} className="w-24 h-24 rounded-[2rem] object-cover border-4 border-white shadow-xl" alt="" />
                   <div>
                      <h4 className="text-2xl font-black italic tracking-tighter uppercase text-slate-900">{auctions.find(a => a.id === selectedAssetLog)?.vehicle.make} {auctions.find(a => a.id === selectedAssetLog)?.vehicle.model}</h4>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{selectedAssetLog}</p>
                   </div>
                </div>
                <div className="space-y-4">
                   <p className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] mb-6 border-b pb-4">Activity Timeline (Bid No Tracking)</p>
                   {users.flatMap(u => u.activityHistory.filter(h => h.targetId === selectedAssetLog)).length === 0 ? (
                     <div className="p-20 text-center text-slate-300 font-black uppercase tracking-widest bg-slate-50 rounded-[3rem] border-2 border-dashed">No registered activities for this asset</div>
                   ) : (
                     users.flatMap(u => u.activityHistory.filter(h => h.targetId === selectedAssetLog).map(h => ({ ...h, userName: u.name })))
                        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                        .map((h, i) => (
                           <div key={i} className="flex items-center justify-between p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                              <div className="flex items-center gap-6">
                                 <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 font-mono text-[10px] font-black border border-slate-100">#{i+1}</div>
                                 <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{h.userName} • {new Date(h.timestamp).toLocaleString()}</p>
                                    <p className="text-xs font-black text-slate-800 uppercase">{h.description}</p>
                                 </div>
                              </div>
                              <div className="text-right">
                                 <p className={`text-[10px] font-black uppercase tracking-widest ${h.status === 'SUCCESS' ? 'text-emerald-600' : 'text-orange-500'}`}>{h.status || 'PENDING'}</p>
                                 {h.amount && <p className="font-black text-slate-900 text-sm">₹{h.amount.toLocaleString()}</p>}
                              </div>
                           </div>
                        ))
                   )}
                </div>
             </div>
           )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
