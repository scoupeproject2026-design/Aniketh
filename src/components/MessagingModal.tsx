import React, { useState } from 'react';
import { X, Send, Mail, ShieldAlert, MessageSquare } from 'lucide-react';
import type { Message, User } from '../types';

interface MessagingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  messages: Message[];
  allUsers: User[];
  onSendMessage: (payload: { recipientId: string; subject: string; content: string }) => Promise<void>;
}

export const MessagingModal: React.FC<MessagingModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  messages,
  allUsers,
  onSendMessage,
}) => {
  const [activeTab, setActiveTab] = useState<'inbox' | 'compose'>('inbox');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [recipientId, setRecipientId] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);

  if (!isOpen) return null;

  // Filter possible recipients based on role policies
  // Students can message Teachers
  // Parents can message Teachers & Admin
  // Teachers can message Students, Parents, Staff
  // Principal has audit log + direct message
  const allowedRecipients = allUsers.filter((u) => {
    if (u.id === currentUser.id) return false;
    if (currentUser.role === 'student') return u.role === 'teacher';
    if (currentUser.role === 'parent') return u.role === 'teacher' || u.role === 'principal';
    if (currentUser.role === 'bus_coordinator') return u.role === 'principal' || u.role === 'parent';
    return true; // teacher & principal can message all
  });

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientId || !content.trim()) return;
    setIsSending(true);
    try {
      await onSendMessage({
        recipientId,
        subject: subject.trim() || 'School Communication',
        content: content.trim(),
      });
      setSubject('');
      setContent('');
      setActiveTab('inbox');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const isPrincipalAudit = currentUser.role === 'principal';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Top Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {isPrincipalAudit ? 'Administrative Messaging & Audit Log' : 'Internal School Messaging'}
              </h2>
              <p className="text-xs text-slate-500">
                {isPrincipalAudit
                  ? 'Official school communication records (read-only audit, logged access)'
                  : 'Direct secure communication with verified school contacts'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Audit banner for Principal */}
        {isPrincipalAudit && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 flex items-center gap-2 text-xs text-amber-800">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Administrative Policy:</strong> Messages cannot be edited or altered. All query access is securely logged in the system audit records.
            </span>
          </div>
        )}

        {/* Tab switchers */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-200">
          <button
            onClick={() => {
              setActiveTab('inbox');
              setSelectedMessage(null);
            }}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'inbox'
                ? 'border-sky-600 text-sky-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {isPrincipalAudit ? 'All School Messages' : 'Inbox & Sent'} ({messages.length})
          </button>
          {!isPrincipalAudit && (
            <button
              onClick={() => setActiveTab('compose')}
              className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === 'compose'
                  ? 'border-sky-600 text-sky-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Compose New Message
            </button>
          )}
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'compose' ? (
            <form onSubmit={handleSend} className="space-y-4 max-w-xl mx-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Select Recipient
                </label>
                <select
                  value={recipientId}
                  onChange={(e) => setRecipientId(e.target.value)}
                  required
                  className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:border-sky-500 focus:outline-none bg-white"
                >
                  <option value="">-- Choose verified contact --</option>
                  {allowedRecipients.map((rec) => (
                    <option key={rec.id} value={rec.id}>
                      {rec.name} ({rec.role.replace('_', ' ')} · {rec.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Question regarding physics syllabus"
                  required
                  className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Message Content
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={6}
                  placeholder="Write your message here..."
                  required
                  className="w-full text-xs rounded-lg border border-slate-300 p-3 focus:border-sky-500 focus:outline-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('inbox')}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSending || !recipientId}
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg flex items-center gap-2 shadow-sm disabled:opacity-50 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSending ? 'Sending...' : 'Send Message'}</span>
                </button>
              </div>
            </form>
          ) : selectedMessage ? (
            <div className="space-y-4">
              <button
                onClick={() => setSelectedMessage(null)}
                className="text-xs text-sky-600 hover:underline font-medium mb-2 flex items-center gap-1"
              >
                &larr; Back to all messages
              </button>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{selectedMessage.subject}</h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                      <span>From: <strong>{selectedMessage.senderName}</strong> ({selectedMessage.senderRole})</span>
                      <span>&rarr;</span>
                      <span>To: <strong>{selectedMessage.recipientName}</strong> ({selectedMessage.recipientRole})</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    {new Date(selectedMessage.sentAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                </div>
                <div className="mt-4 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {selectedMessage.content}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {messages.length === 0 ? (
                <div className="text-center py-16">
                  <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-700">No message records found</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Send a message to teachers or coordinators using the Compose tab.
                  </p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    onClick={() => setSelectedMessage(msg)}
                    className="p-3.5 rounded-lg border border-slate-200 hover:border-sky-300 hover:bg-sky-50/30 transition-colors cursor-pointer flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 truncate">
                          {msg.senderName === currentUser.name ? `To: ${msg.recipientName}` : `From: ${msg.senderName}`}
                        </span>
                        <span className="text-[10px] text-slate-400 capitalize">· {msg.senderRole}</span>
                        {!msg.isRead && msg.recipientId === currentUser.id && (
                          <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs font-semibold text-slate-800 mt-0.5 truncate">{msg.subject}</p>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{msg.content}</p>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 shrink-0">
                      {new Date(msg.sentAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
