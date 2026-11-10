import React, { useState } from 'react';
import { AppUser } from '../types';
import { Search, UserCheck, Database, FileCode2, RotateCcw, Download, Check } from 'lucide-react';
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
  onResetDb
}) => {
  const navItems = [
    { id: 'students', label: 'Students' },
    { id: 'courses', label: 'Courses' },
    { id: 'grades', label: 'Grades & GPA' },
    { id: 'attendance', label: 'Attendance' },
    { id: 'fees', label: 'Fee Ledger' },
    { id: 'calendar', label: 'Academic Calendar' },
  ];

  return (
    <header className="no-print sticky top-0 z-30 bg-[#F9F8F6] border-b border-[#E2E8F0] shadow-xs">
      {/* Top 3-Zone Contract: Brand — Navigation — Primary Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Zone 1: Single text element wordmark with clean seal */}
        <div className="flex items-center gap-3 shrink-0">
          <img 
            src={crestImage} 
            alt="University Seal" 
            className="w-9 h-9 rounded-full object-cover border border-[#CBD5E1]"
            referrerPolicy="no-referrer"
          />
          <div>
            <span className="text-base font-semibold tracking-tight text-[#1E293B] block leading-tight">
              Student Management System
            </span>
            <span className="text-[11px] text-slate-500 font-mono tracking-wide block">
              Java Enterprise Architecture · H2 Engine
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-[#1E293B] text-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Search, Utilities & Role Switcher */}
        <div className="flex items-center gap-2.5">
          {/* Integrated Real-Time Search Bar */}
          <div className="relative w-44 md:w-56">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by ID, name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-white border border-[#E2E8F0] rounded-md text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Java Architecture Inspector Button */}
          <button
            onClick={onOpenJavaArch}
            title="Inspect Java Enterprise Domain Classes & Architecture"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-[#E2E8F0] rounded-md hover:bg-slate-50 transition-colors"
          >
            <FileCode2 className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden xl:inline">Java Source</span>
          </button>

          {/* Virtual H2 SQL Console */}
          <button
            onClick={onOpenSqlConsole}
            title="Open H2 Database Query Console"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-[#E2E8F0] rounded-md hover:bg-slate-50 transition-colors"
          >
            <Database className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden xl:inline">SQL Console</span>
          </button>

          {/* Download Complete Project ZIP for VS Code */}
          <button
            onClick={async () => {
              try {
                await downloadProjectZip();
              } catch (e) {
                console.error(e);
                window.location.href = '/student-management-system.zip';
              }
            }}
            title="Download full project as ZIP to open and run in Visual Studio Code"
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-[#CBD5E1] rounded-md hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-700" />
            <span>VS Code (.zip)</span>
          </button>

          {/* Reset DB Button */}
          <button
            onClick={onResetDb}
            title="Reset database to seed records"
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Role Access Selector */}
          <div className="relative flex items-center pl-1 border-l border-[#E2E8F0]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-[#1E293B] text-white flex items-center justify-center text-xs font-semibold">
                {currentUser.role === 'ADMIN' ? 'A' : currentUser.role === 'FACULTY' ? 'F' : 'S'}
              </div>
              <div className="hidden md:block text-left">
                <span className="block text-xs font-semibold text-slate-800 leading-tight">
                  {currentUser.displayName}
                </span>
                <span className="block text-[10px] text-slate-500">
                  {currentUser.role === 'ADMIN' ? 'Full Administrator' : currentUser.role === 'FACULTY' ? 'Faculty Member' : `Student (${currentUser.studentId})`}
                </span>
              </div>
            </div>

            <select
              value={currentUser.id}
              onChange={(e) => {
                const target = allUsers.find(u => u.id === e.target.value);
                if (target) onUserSwitch(target);
              }}
              title="Switch user perspective"
              className="ml-1 text-xs bg-transparent border-0 text-slate-500 hover:text-slate-800 cursor-pointer focus:ring-0"
            >
              {allUsers.map(u => (
                <option key={u.id} value={u.id}>
                  {u.role}: {u.displayName}
                </option>
              ))}
            </select>
          </div>
        </div>

      </div>

      {/* Mobile Nav strip */}
      <div className="lg:hidden border-t border-[#E2E8F0] px-4 py-2 flex items-center gap-1 overflow-x-auto">
        {navItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
                isActive ? 'bg-[#1E293B] text-white' : 'text-slate-600 hover:bg-slate-100'
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
