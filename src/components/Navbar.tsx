import React, { useState } from 'react';
import { Bell, MessageSquare, LogOut, Shield, ChevronDown, UserCheck, Download } from 'lucide-react';
import type { User, UserRole } from '../types';

interface NavbarProps {
  currentUser: User;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenNotifications: () => void;
  onOpenMessages: () => void;
  unreadNotificationsCount: number;
  unreadMessagesCount: number;
  onSwitchUser: (role: UserRole) => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab,
  onSelectTab,
  onOpenNotifications,
  onOpenMessages,
  unreadNotificationsCount,
  unreadMessagesCount,
  onSwitchUser,
  onLogout,
}) => {
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  // Dynamic nav links according to role
  const getNavLinks = () => {
    switch (currentUser.role) {
      case 'student':
        return [
          { id: 'overview', label: 'Overview' },
          { id: 'timetable', label: 'Schedule' },
          { id: 'notes', label: 'Learning Materials' },
          { id: 'assignments', label: 'Assignments' },
          { id: 'bus', label: 'Bus Tracker' },
          { id: 'projects', label: 'Projects' },
        ];
      case 'teacher':
        return [
          { id: 'overview', label: 'Overview' },
          { id: 'attendance', label: 'Attendance' },
          { id: 'assignments', label: 'Assignments & Grading' },
          { id: 'notes', label: 'Notes & Recordings' },
          { id: 'exams', label: 'Exams & Results' },
        ];
      case 'parent':
        return [
          { id: 'overview', label: 'Overview' },
          { id: 'academics', label: 'Academic Progress' },
          { id: 'attendance', label: 'Attendance' },
          { id: 'bus', label: 'Live Bus Tracker' },
          { id: 'announcements', label: 'Notices' },
        ];
      case 'principal':
        return [
          { id: 'overview', label: 'School Overview' },
          { id: 'users', label: 'Accounts & Roles' },
          { id: 'academics', label: 'Academics & Exams' },
          { id: 'transport', label: 'Bus Fleet' },
          { id: 'server', label: 'Server Status' },
        ];
      case 'bus_coordinator':
        return [
          { id: 'coordinator', label: 'Live Tracking Console' },
          { id: 'route_stops', label: 'Route & Stops' },
          { id: 'announcements', label: 'School Notices' },
        ];
      default:
        return [{ id: 'overview', label: 'Overview' }];
    }
  };

  const navLinks = getNavLinks();

  const roleLabelMap: Record<UserRole, string> = {
    student: 'Student',
    teacher: 'Faculty / Teacher',
    parent: 'Parent',
    principal: 'Principal / Admin',
    bus_coordinator: 'Bus Coordinator',
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onSelectTab(navLinks[0]?.id || 'overview')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center font-extrabold text-base tracking-wider shadow-sm group-hover:bg-sky-700 transition-colors">
                S
              </div>
              <div>
                <span className="text-lg font-extrabold tracking-tight text-slate-900 group-hover:text-sky-600 transition-colors whitespace-nowrap">
                  S.C.O.P.E.
                </span>
                <span className="hidden sm:inline-block ml-2 text-xs text-slate-400 font-medium">
                  Connected School
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: 4-5 concise single-line nav links */}
          <nav className="hidden md:flex items-center gap-6 overflow-x-auto py-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => onSelectTab(link.id)}
                className={`text-xs font-semibold whitespace-nowrap transition-colors py-1 ${
                  activeTab === link.id
                    ? 'text-sky-600 border-b-2 border-sky-600'
                    : 'text-slate-600 hover:text-slate-900 border-b-2 border-transparent'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Zone 3: Quick Role Switcher, Messages, Notifications, Profile */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Download Project ZIP */}
            <a
              href="/api/export/download-zip"
              download="scope-school-platform.zip"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors shrink-0"
              title="Download Complete Source Code (.zip)"
            >
              <Download className="w-3.5 h-3.5 text-sky-600" />
              <span className="hidden sm:inline">Download ZIP</span>
            </a>

            {/* Quick Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium transition-colors"
                title="Switch active testing role"
              >
                <UserCheck className="w-3.5 h-3.5 text-sky-600" />
                <span className="hidden lg:inline">{roleLabelMap[currentUser.role]}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {roleMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-slate-200 shadow-xl py-1 z-50 animate-in fade-in zoom-in-95"
                  onMouseLeave={() => setRoleMenuOpen(false)}
                >
                  <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Switch Test Account
                  </div>
                  <button
                    onClick={() => {
                      onSwitchUser('student');
                      setRoleMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 ${
                      currentUser.role === 'student' ? 'text-sky-600 font-bold bg-sky-50/50' : 'text-slate-700'
                    }`}
                  >
                    <span>Alex Rivera (Student, 10-A)</span>
                    <span className="text-[10px] text-slate-400">Student</span>
                  </button>
                  <button
                    onClick={() => {
                      onSwitchUser('teacher');
                      setRoleMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 ${
                      currentUser.role === 'teacher' ? 'text-sky-600 font-bold bg-sky-50/50' : 'text-slate-700'
                    }`}
                  >
                    <span>Sarah Jenkins (Teacher)</span>
                    <span className="text-[10px] text-slate-400">Faculty</span>
                  </button>
                  <button
                    onClick={() => {
                      onSwitchUser('parent');
                      setRoleMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 ${
                      currentUser.role === 'parent' ? 'text-sky-600 font-bold bg-sky-50/50' : 'text-slate-700'
                    }`}
                  >
                    <span>Marcus Rivera (Parent)</span>
                    <span className="text-[10px] text-slate-400">Parent</span>
                  </button>
                  <button
                    onClick={() => {
                      onSwitchUser('bus_coordinator');
                      setRoleMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 ${
                      currentUser.role === 'bus_coordinator' ? 'text-sky-600 font-bold bg-sky-50/50' : 'text-slate-700'
                    }`}
                  >
                    <span>David Miller (Bus 04)</span>
                    <span className="text-[10px] text-slate-400">Coordinator</span>
                  </button>
                  <button
                    onClick={() => {
                      onSwitchUser('principal');
                      setRoleMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 ${
                      currentUser.role === 'principal' ? 'text-sky-600 font-bold bg-sky-50/50' : 'text-slate-700'
                    }`}
                  >
                    <span>Dr. Eleanor Vance (Principal)</span>
                    <span className="text-[10px] text-slate-400">Admin</span>
                  </button>
                </div>
              )}
            </div>

            {/* Messaging icon */}
            <button
              onClick={onOpenMessages}
              className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="School Messages"
            >
              <MessageSquare className="w-4 h-4" />
              {unreadMessagesCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-sky-500 ring-2 ring-white" />
              )}
            </button>

            {/* Notification bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* User profile avatar & Logout */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover border border-slate-200"
              />
              <div className="hidden xl:block text-left">
                <p className="text-xs font-bold text-slate-900 truncate max-w-[120px]">{currentUser.name}</p>
                <p className="text-[10px] text-slate-500 capitalize">{currentUser.role.replace('_', ' ')}</p>
              </div>
              <button
                onClick={onLogout}
                className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav strip */}
        <div className="flex md:hidden items-center gap-4 overflow-x-auto py-2 border-t border-slate-100 text-xs font-semibold">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => onSelectTab(link.id)}
              className={`whitespace-nowrap px-1 py-0.5 ${
                activeTab === link.id ? 'text-sky-600 font-bold' : 'text-slate-600'
              }`}
            >
              {link.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
