
import React, { useState } from 'react';
import { User, UserRole, Notification } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
  onNavigate: (page: any) => void;
  currentPage: string;
  notifications: Notification[];
  watchlistCount?: number;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  user, 
  onLogout, 
  onNavigate, 
  currentPage, 
  notifications,
  watchlistCount = 0
}) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { id: 'home', label: 'Dashboard', icon: 'fa-house', role: [UserRole.BIDDER, UserRole.ADMIN] },
    { id: 'watchlist', label: 'My Watchlist', icon: 'fa-heart', role: [UserRole.BIDDER], badge: watchlistCount > 0 ? watchlistCount : null },
    { id: 'mybids', label: 'My Participation', icon: 'fa-gavel', role: [UserRole.BIDDER] },
    { id: 'admin', label: 'Admin Panel', icon: 'fa-shield-halved', role: [UserRole.ADMIN] },
    { id: 'profile', label: 'Settings', icon: 'fa-user-gear', role: [UserRole.BIDDER, UserRole.ADMIN] },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={`fixed lg:relative z-40 w-64 h-full bg-slate-900 transition-transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex flex-col h-full">
          <div className="p-8 flex items-center space-x-3 text-white border-b border-slate-800">
            <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-900/20">
              <i className="fa-solid fa-gavel text-xl"></i>
            </div>
            <span className="text-xl font-black tracking-tighter italic">Auction<span className="text-orange-500">Baba</span></span>
          </div>
          
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto mt-4">
            {menuItems.filter(item => item.role.includes(user.role)).map(item => (
              <button
                key={item.id}
                onClick={() => { onNavigate(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-5 py-3.5 rounded-2xl transition-all duration-300 group ${
                  currentPage === item.id 
                  ? 'bg-orange-600 text-white shadow-xl shadow-orange-900/40 translate-x-1' 
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <i className={`fa-solid ${item.icon} w-5 group-hover:scale-110 transition-transform`}></i>
                  <span className="font-black text-[11px] uppercase tracking-widest">{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${currentPage === item.id ? 'bg-white text-orange-600' : 'bg-orange-600 text-white'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div className="p-6 border-t border-slate-800">
            <div className="flex items-center space-x-4 p-4 rounded-3xl bg-slate-800/30 border border-slate-700/50">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-yellow-500 flex items-center justify-center text-xs font-black text-slate-900 uppercase">
                {user.name.charAt(0)}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-black truncate text-white uppercase tracking-tighter">{user.name}</p>
                <p className="text-[9px] truncate text-slate-500 font-bold uppercase tracking-widest">{user.role}</p>
              </div>
              <button onClick={onLogout} title="Logout" className="text-slate-500 hover:text-red-400 transition-colors p-1">
                <i className="fa-solid fa-power-off"></i>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b flex items-center justify-between px-8 shrink-0 z-30">
          <button className="lg:hidden w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center" onClick={() => setSidebarOpen(true)}>
            <i className="fa-solid fa-bars text-slate-600"></i>
          </button>
          
          <div className="hidden lg:flex items-center space-x-4">
             <div className="relative group">
                <input 
                  type="text" 
                  placeholder="Scan model, bank or VIN..." 
                  className="bg-slate-100 border-none rounded-2xl px-6 py-3 pl-12 focus:ring-2 focus:ring-orange-500 text-xs font-bold w-80 transition-all group-hover:bg-slate-200/50"
                />
                <i className="fa-solid fa-magnifying-glass absolute left-5 top-3.5 text-slate-400 text-sm"></i>
             </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="relative group cursor-pointer">
              <div className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-orange-500 transition-all border border-transparent hover:border-orange-100 hover:bg-orange-50">
                <i className="fa-solid fa-bell text-lg"></i>
                {notifications.length > 0 && <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>}
              </div>
              
              <div className="absolute right-0 mt-4 w-80 bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-50">
                <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
                  <span className="font-black text-[10px] uppercase tracking-widest text-slate-900">Live Alerts</span>
                  <button className="text-[9px] font-black text-orange-500 uppercase tracking-widest">Clear All</button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-12 text-center">
                      <i className="fa-solid fa-envelope-open text-4xl text-slate-100 mb-4 block"></i>
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No unread alerts</p>
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className="p-5 border-b border-slate-50 hover:bg-orange-50/30 transition-colors group/item">
                        <div className="flex space-x-3">
                          <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.type === 'success' ? 'bg-emerald-500' : 'bg-orange-500'}`}></div>
                          <div>
                            <p className="text-xs font-bold text-slate-800 leading-relaxed">{n.message}</p>
                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-2">{new Date(n.timestamp).toLocaleTimeString()}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            
            <div className="hidden sm:flex items-center px-5 py-2.5 bg-emerald-50 text-emerald-700 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 shadow-sm shadow-emerald-100/50">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-3 animate-pulse"></span>
              Vault Secured
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 scroll-smooth no-scrollbar">
          {children}
        </div>
      </main>

      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-30 lg:hidden animate-in fade-in" onClick={() => setSidebarOpen(false)}></div>
      )}
    </div>
  );
};

export default Layout;
