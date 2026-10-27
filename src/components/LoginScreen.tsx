import React, { useState } from 'react';
import { Shield, Lock, ArrowRight, UserCheck, AlertCircle, CheckCircle2, Download } from 'lucide-react';
import type { UserRole } from '../types';

interface LoginScreenProps {
  onLogin: (email: string, password?: string, role?: UserRole) => Promise<void>;
  isLoading: boolean;
  error?: string | null;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, isLoading, error }) => {
  const [email, setEmail] = useState('alex.student@scope.edu');
  const [password, setPassword] = useState('scope2026!');

  const quickRoles: {
    role: UserRole;
    name: string;
    email: string;
    roleLabel: string;
    description: string;
  }[] = [
    {
      role: 'student',
      name: 'Alex Rivera',
      email: 'alex.student@scope.edu',
      roleLabel: 'Student (Grade 10-A)',
      description: 'Coursework, timetable, recordings, bus tracker & grades',
    },
    {
      role: 'teacher',
      name: 'Sarah Jenkins',
      email: 'sarah.teacher@scope.edu',
      roleLabel: 'Teacher / Faculty',
      description: 'Attendance, notes upload, assignment grading & exams',
    },
    {
      role: 'parent',
      name: 'Marcus Rivera',
      email: 'marcus.parent@scope.edu',
      roleLabel: 'Parent / Guardian',
      description: 'Child switching, attendance alerts & live bus tracking',
    },
    {
      role: 'principal',
      name: 'Dr. Eleanor Vance',
      email: 'eleanor.principal@scope.edu',
      roleLabel: 'Principal / Admin',
      description: 'Full school governance, user roles & server status',
    },
    {
      role: 'bus_coordinator',
      name: 'David Miller',
      email: 'david.bus@scope.edu',
      roleLabel: 'Bus Coordinator',
      description: 'GPS location broadcasting, route stops & live tracking',
    },
  ];

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    onLogin(email.trim(), password);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Graphic Elements */}
      <div className="absolute inset-0 z-0 opacity-20">
        <img
          src="/src/assets/images/scope_school_hero_1793076910691.jpg"
          alt="School Campus"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/90 to-slate-900/70" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto w-full">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-sky-600 text-white font-extrabold text-2xl shadow-lg shadow-sky-500/20 mb-3">
            S
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">S.C.O.P.E.</h1>
          <p className="text-sm font-semibold text-sky-400 mt-1 uppercase tracking-wider">
            Smart Connected Online Platform for Education
          </p>
          <p className="text-xs text-slate-400 mt-1">One Platform. Every Learner. A Connected School.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Quick 1-Click Role Login Selector */}
          <div className="lg:col-span-7 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Select Instant Demo Account</h2>
                <p className="text-xs text-slate-500">Log in immediately as any of the 5 school roles</p>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                1-Click Ready
              </span>
            </div>

            <div className="space-y-2.5">
              {quickRoles.map((qr) => (
                <button
                  key={qr.role}
                  onClick={() => onLogin(qr.email, 'scope2026!', qr.role)}
                  disabled={isLoading}
                  className="w-full p-3 rounded-xl border border-slate-200/90 hover:border-sky-400 hover:bg-sky-50/50 text-left transition-all group flex items-center justify-between gap-3 disabled:opacity-50"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 group-hover:text-sky-700 transition-colors">
                        {qr.name}
                      </span>
                      <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        {qr.roleLabel}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">{qr.description}</p>
                  </div>
                  <div className="shrink-0 w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-sky-600 group-hover:text-white text-slate-500 flex items-center justify-center transition-colors">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Standard Credential Sign In */}
          <div className="lg:col-span-5 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 p-6 shadow-xl">
            <h2 className="text-sm font-bold text-slate-900 mb-1">Standard Portal Sign In</h2>
            <p className="text-xs text-slate-500 mb-4">Enter school email and passkey</p>

            {error && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Institutional Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@scope.edu"
                  className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Security Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:border-sky-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{isLoading ? 'Authenticating...' : 'Sign In to S.C.O.P.E.'}</span>
              </button>
            </form>

            <div className="mt-4 pt-3 border-t border-slate-100 text-center">
              <span className="text-[11px] text-slate-400 font-mono">
                Default Test Password: <strong>scope2026!</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Download Project & Security Footer */}
        <div className="mt-8 text-center text-xs text-slate-400 space-y-3">
          <div className="flex items-center justify-center gap-3">
            <a
              href="/api/export/download-zip"
              download="scope-school-platform.zip"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700/80 shadow-md transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <span>Download Complete Project (.ZIP)</span>
            </a>
          </div>
          <p>© 2026 S.C.O.P.E. Education Systems · Encrypted Enterprise Node · All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};
