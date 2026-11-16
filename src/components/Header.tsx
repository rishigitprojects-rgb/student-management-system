import React, { useEffect, useRef } from 'react';
import { AppUser } from '../types';
import { 
  Search, Database, FileCode2, RotateCcw, Download, 
  LogOut, ChevronRight, Home, Shield, Sparkles, UserCheck 
} from 'lucide-react';
import crestImage from '../assets/images/university_crest_1791475297419.jpg';
import { downloadProjectZip } from '../utils/projectDownloader';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  currentUser: AppUser;
  onUserSwitch: (user: AppUser) => void;
  allUsers: AppUser[];
  onOpenSqlConsole: () => void;
  onOpenJavaArch: () => void;
  onResetDb: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  currentUser,
  onUserSwitch,
  allUsers,
  onOpenSqlConsole,
  onOpenJavaArch,
  onResetDb,
  onLogout
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  const navItems = [
    { id: 'students', label: 'Students', category: 'Academic Registry' },
    { id: 'courses', label: 'Courses', category: 'Curriculum' },
    { id: 'grades', label: 'Grades & GPA', category: 'Evaluations' },
    { id: 'attendance', label: 'Attendance', category: 'Class Monitoring' },
    { id: 'fees', label: 'Fee Ledger', category: 'Bursar & Accounts' },
    { id: 'calendar', label: 'Academic Calendar', category: 'Scheduling' },
  ];

  const currentNav = navItems.find(n => n.id === activeTab) || navItems[0];

  // Cmd+K / Ctrl+K keyboard shortcut listener to focus search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="no-print sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] shadow-2xs">
      
      {/* Primary Top Bar: Brand, Navigation, Search & Controls */}
      <div className="max-w-7xl 2xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-7 h-16 flex items-center justify-between gap-2 xl:gap-3">
        
        {/* Zone 1: University Crest & System Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative cursor-pointer" onClick={() => setActiveTab('students')} title="Return to Dashboard">
            <img 
              src={crestImage} 
              alt="University Seal" 
              className="w-9 h-9 rounded-full object-cover border border-[#CBD5E1] shadow-2xs"
              referrerPolicy="no-referrer"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm sm:text-base font-bold tracking-tight text-[#0F172A] leading-tight font-heading">
                State University ERP
              </span>
              <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 bg-slate-100 text-slate-600 border border-slate-200 rounded">
                PROD
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono tracking-normal block">
              Java Enterprise Architecture · H2 Engine
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden min-[1536px]:flex items-center gap-0.5">
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-2.5 xl:px-3 2xl:px-2 py-1.5 text-[11px] xl:text-xs font-semibold rounded-md transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#0F172A] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Search with Cmd+K hint, Developer Tools, Role Profile & Logout */}
        <div className="flex items-center gap-1.5 shrink-0">
          
          {/* Integrated Real-Time Search Bar with Keyboard Hint */}
          <div className="relative w-32 sm:w-36 md:w-40 2xl:w-44">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Filter records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-14 py-1.5 text-xs bg-[#F8F9FA] hover:bg-white border border-[#CBD5E1] rounded-md text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
            />
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            ) : (
              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-0.5">
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-400 bg-white border border-slate-300 rounded shadow-2xs">
                  ⌘K
                </kbd>
              </div>
            )}
          </div>

          {/* Java Architecture Inspector Button */}
          <button
            onClick={onOpenJavaArch}
            title="Inspect Java Enterprise Domain Classes & Architecture"
            className="hidden min-[1840px]:flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-[#E2E8F0] rounded-md hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <FileCode2 className="w-3.5 h-3.5 text-slate-600" />
            <span>Architecture</span>
          </button>

          {/* Virtual H2 SQL Console */}
          <button
            onClick={onOpenSqlConsole}
            title="Open H2 Database Query Console"
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-[#E2E8F0] rounded-md hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Database className="w-3.5 h-3.5 text-slate-600" />
            <span>SQL Console</span>
          </button>

          {/* Download Complete Project ZIP */}
          <button
            onClick={async () => {
              try {
                await downloadProjectZip();
              } catch (e) {
                console.error(e);
                window.location.href = '/student-management-system.zip';
              }
            }}
            title="Download full project as ZIP"
            className="hidden min-[1840px]:flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-[#CBD5E1] rounded-md hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-700" />
            <span>VS Code (.zip)</span>
          </button>

          {/* Database Reset Action */}
          <button
            onClick={onResetDb}
            title="Reset database to seed records"
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Role Access / User Profile Badge */}
          <div className="relative flex items-center pl-2 border-l border-[#E2E8F0] gap-1.5 shrink-0">
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-md text-white flex items-center justify-center text-xs font-bold font-mono ${
                currentUser.role === 'ADMIN' ? 'bg-[#0F172A]' : currentUser.role === 'FACULTY' ? 'bg-indigo-600' : 'bg-emerald-600'
              }`}>
                {currentUser.role.charAt(0)}
              </div>
              
              <div className="hidden lg:block text-left max-w-[132px]">
                <span className="block text-xs font-semibold text-slate-900 leading-tight truncate">
                  {currentUser.displayName}
                </span>
                <span className="block text-[10px] text-slate-500 font-mono truncate">
                  {currentUser.role}: {currentUser.department || 'Registrar'}
                </span>
              </div>
            </div>

            {/* Quick Perspective Switcher Dropdown */}
            <select
              value={currentUser.id}
              onChange={(e) => {
                const target = allUsers.find(u => u.id === e.target.value);
                if (target) onUserSwitch(target);
              }}
              title="Switch user perspective"
              className="text-[11px] bg-transparent border-0 text-slate-500 hover:text-slate-800 cursor-pointer focus:ring-0 max-w-[68px] truncate"
            >
              {allUsers.map(u => (
                <option key={u.id} value={u.id}>
                  {u.role}: {u.displayName}
                </option>
              ))}
            </select>

            {/* Sign Out / Lock Session Action */}
            {onLogout && (
              <button
                onClick={onLogout}
                title="Lock session & return to authentication screen"
                className="inline-flex h-9 min-w-[72px] items-center justify-center gap-1.5 rounded-md border border-rose-200 bg-rose-50 px-2.5 text-xs font-semibold text-rose-700 transition-colors hover:border-rose-300 hover:bg-rose-100 hover:text-rose-800 cursor-pointer"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span>Exit</span>
              </button>
            )}
          </div>

        </div>

      </div>

      {/* Secondary Live Breadcrumb Strip */}
      <div className="border-t border-[#E2E8F0] bg-[#FAF9F6]/80 px-4 sm:px-6 lg:px-8 py-1.5 flex items-center justify-between text-xs text-slate-500">
        
        {/* Live Breadcrumb Trail */}
        <div className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap">
          <button 
            onClick={() => setActiveTab('students')}
            className="flex items-center gap-1 text-slate-500 hover:text-slate-900 cursor-pointer"
          >
            <Home className="w-3 h-3" />
            <span className="font-medium">University Portal</span>
          </button>
          
          <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
          <span className="text-slate-500 font-medium">{currentNav.category}</span>
          
          <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
          <span className="text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-200/60 font-heading">
            {currentNav.label}
          </span>
        </div>

        {/* Live System Context Status */}
        <div className="hidden sm:flex items-center gap-2 text-[10px] sm:text-[11px] font-mono text-slate-500 whitespace-nowrap">
          <span className="flex items-center gap-1 rounded bg-white/70 px-1.5 py-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>SESSION: 256-BIT ENCRYPTED</span>
          </span>
          <span className="rounded bg-white/70 px-1.5 py-0.5">TERM: FALL 2024</span>
        </div>
      </div>

      {/* Mobile Horizontal Nav Scroller */}
      <div className="min-[1536px]:hidden border-t border-[#E2E8F0] px-4 py-2 flex items-center gap-1 overflow-x-auto bg-white">
        {navItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-3 py-1 text-xs font-semibold rounded-md whitespace-nowrap cursor-pointer ${
                isActive ? 'bg-[#0F172A] text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

    </header>
  );
};
