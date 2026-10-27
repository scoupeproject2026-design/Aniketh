import React from 'react';
import { X, CheckCheck, Bell, AlertTriangle, Info, Clock } from 'lucide-react';
import type { Notification } from '../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAllRead: () => void;
  onSelectTab?: (tab: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
  onSelectTab,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-sky-600" />
            <h2 className="text-base font-bold text-slate-900">Notifications</h2>
            <span className="text-xs font-mono bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full font-medium">
              {notifications.filter((n) => !n.isRead).length} unread
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onMarkAllRead}
              className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-100 transition-colors"
              title="Mark all as read"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2">
          {notifications.length === 0 ? (
            <div className="text-center py-16 px-4">
              <Bell className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-700">No new notifications</p>
              <p className="text-xs text-slate-400 mt-1">Updates regarding classes, bus routes, and assignments will appear here.</p>
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  if (item.linkTab && onSelectTab) {
                    onSelectTab(item.linkTab);
                    onClose();
                  }
                }}
                className={`p-3.5 rounded-lg transition-colors cursor-pointer ${
                  !item.isRead ? 'bg-sky-50/60 hover:bg-sky-50' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    {item.priority === 'Urgent' ? (
                      <AlertTriangle className="w-4 h-4 text-rose-500" />
                    ) : item.priority === 'Important' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                    ) : (
                      <Info className="w-4 h-4 text-sky-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{item.title}</h4>
                      <span className="text-[10px] text-slate-400 shrink-0 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" />
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.message}</p>
                    <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-400">
                      <span className="capitalize">{item.category}</span>
                      <span>·</span>
                      <span className={`font-medium ${item.priority === 'Urgent' ? 'text-rose-600' : item.priority === 'Important' ? 'text-amber-600' : 'text-slate-500'}`}>
                        {item.priority} Priority
                      </span>
                      {item.linkTab && (
                        <>
                          <span>·</span>
                          <span className="text-sky-600 font-medium hover:underline">View details &rarr;</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
