import React, { useState } from 'react';
import {
  Users,
  ShieldCheck,
  Server,
  Activity,
  HardDrive,
  Database,
  Bus as BusIcon,
  Calendar,
  Award,
  Bell,
  Folder,
  FileText,
  Plus,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Lock,
  ExternalLink,
} from 'lucide-react';
import type {
  User,
  Bus,
  TimetableSlot,
  Exam,
  ExamResult,
  CloudFile,
  Announcement,
  SystemAuditLog,
  ServerHealth,
  Assignment,
  AttendanceRecord,
} from '../../types';
import { BusMap } from '../BusMap';
import { api } from '../../api';

interface PrincipalDashboardProps {
  user: User;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  allUsers: User[];
  buses: Bus[];
  isBusStale?: boolean;
  exams: Exam[];
  examResults: ExamResult[];
  cloudFiles: CloudFile[];
  announcements: Announcement[];
  assignments: Assignment[];
  attendance: AttendanceRecord[];
  serverHealth: ServerHealth | null;
  auditLogs: SystemAuditLog[];
  onRefreshData: () => void;
}

export const PrincipalDashboard: React.FC<PrincipalDashboardProps> = ({
  user,
  activeTab,
  onSelectTab,
  allUsers,
  buses,
  isBusStale,
  exams,
  examResults,
  cloudFiles,
  announcements,
  assignments,
  attendance,
  serverHealth,
  auditLogs,
  onRefreshData,
}) => {
  // New User Registration Modal
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<User['role']>('student');
  const [newUserPhone, setNewUserPhone] = useState('');

  // New Announcement Modal
  const [showAnnModal, setShowAnnModal] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annAudience, setAnnAudience] = useState<Announcement['audience']>('All School');
  const [annPriority, setAnnPriority] = useState<Announcement['priority']>('Important');
  const [annPinned, setAnnPinned] = useState(true);

  // Backup loading indicator
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupSuccessMessage, setBackupSuccessMessage] = useState<string | null>(null);

  // Cloud File Upload State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [fileName, setFileName] = useState('');
  const [fileFolder, setFileFolder] = useState<CloudFile['folder']>('Curriculum');
  const [filePermission, setFilePermission] = useState<CloudFile['permission']>('Public');

  // Handle Create User
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.createUser({
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      phone: newUserPhone,
    });
    setShowNewUserModal(false);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPhone('');
    onRefreshData();
  };

  // Handle Publish Announcement
  const handlePublishAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.createAnnouncement({
      title: annTitle,
      content: annContent,
      audience: annAudience,
      priority: annPriority,
      authorId: user.id,
      authorName: user.name,
      authorRole: 'Head of School',
      pinned: annPinned,
    });
    setShowAnnModal(false);
    setAnnTitle('');
    setAnnContent('');
    onRefreshData();
  };

  // Handle Trigger Backup
  const handleTriggerBackup = async () => {
    setIsBackingUp(true);
    try {
      const res = await api.triggerBackup();
      setBackupSuccessMessage(`Snapshot backup ${res.backupId} saved successfully.`);
      setTimeout(() => setBackupSuccessMessage(null), 4000);
      onRefreshData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsBackingUp(false);
    }
  };

  // Handle Publish Exam Results
  const handlePublishExam = async (examId: string) => {
    await api.publishExam(examId, user.name);
    alert('Exam results approved and published to student and parent portals.');
    onRefreshData();
  };

  // Handle Cloud File Upload
  const handleUploadCloudFile = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.uploadStorageFile({
      name: fileName || 'School_Document.pdf',
      folder: fileFolder,
      permission: filePermission,
      sizeBytes: 4200000,
      uploadedBy: user.id,
      uploadedByName: user.name,
      uploadedByRole: 'principal',
    });
    setShowUploadModal(false);
    setFileName('');
    onRefreshData();
  };

  return (
    <div className="space-y-6">
      {/* Principal Welcome Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-16 h-16 rounded-xl object-cover border border-slate-200 shadow-xs"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{user.name}</h1>
              <span className="text-xs font-semibold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100">
                Principal &amp; Head of Institution
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Executive Governance · {user.principalInfo?.department} ({user.principalInfo?.officeNumber})
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowAnnModal(true)}
            className="px-3.5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Post School Notice</span>
          </button>
          <button
            onClick={() => setShowNewUserModal(true)}
            className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Register Account</span>
          </button>
          <button
            onClick={() => onSelectTab('server')}
            className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Server className="w-3.5 h-3.5" />
            <span>Server Health</span>
          </button>
        </div>
      </div>

      {/* OVERVIEW TAB */}
      {(activeTab === 'overview' || !activeTab) && (
        <div className="space-y-6">
          {/* Institutional KPI Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Total Active Users</span>
                <Users className="w-4 h-4 text-sky-600" />
              </div>
              <p className="text-2xl font-bold font-mono text-slate-900">{allUsers.length}</p>
              <span className="text-[11px] text-slate-400 mt-1 block">Students, Faculty, Parents &amp; Staff</span>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Active Bus Routes</span>
                <BusIcon className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-bold font-mono text-slate-900">
                {buses.filter((b) => b.status === 'tracking_live').length} / {buses.length} Live
              </p>
              <span className="text-[11px] text-slate-400 mt-1 block">GPS broadcasting sessions</span>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Average Attendance</span>
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-bold font-mono text-emerald-700">96.4%</p>
              <span className="text-[11px] text-slate-400 mt-1 block">Term-to-date institution rate</span>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Server Uptime &amp; DB</span>
                <Activity className="w-4 h-4 text-indigo-600" />
              </div>
              <p className="text-2xl font-bold font-mono text-slate-900">
                {serverHealth ? `${serverHealth.dbLatencyMs}ms` : '3ms'}
              </p>
              <span className="text-[11px] text-slate-400 mt-1 block">Sub-5ms query response</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Exam approvals, Bus Fleet Status, Notices */}
            <div className="lg:col-span-2 space-y-6">
              {/* Examination Board Publishing Queue */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-indigo-600" />
                    <h2 className="text-sm font-bold text-slate-900">Academic Examinations &amp; Results Approval</h2>
                  </div>
                  <button
                    onClick={() => onSelectTab('academics')}
                    className="text-xs font-bold text-sky-600 hover:underline"
                  >
                    Manage Exams &rarr;
                  </button>
                </div>

                <div className="space-y-3">
                  {exams.map((ex) => (
                    <div
                      key={ex.id}
                      className="p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/40"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{ex.title}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            ex.status === 'Published'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {ex.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {ex.className} · Schedule: {ex.startDate} through {ex.endDate} ({ex.schedule.length} Papers)
                        </p>
                      </div>

                      <div className="shrink-0">
                        {ex.status === 'Published' ? (
                          <span className="text-xs font-mono font-medium text-slate-500">
                            Published {new Date(ex.publishedAt || '').toLocaleDateString()}
                          </span>
                        ) : (
                          <button
                            onClick={() => handlePublishExam(ex.id)}
                            className="px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
                          >
                            Approve &amp; Publish Results
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bus Fleet Monitoring Preview */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <BusIcon className="w-4 h-4 text-sky-600" />
                    <h2 className="text-sm font-bold text-slate-900">School Bus Transport Fleet</h2>
                  </div>
                  <button
                    onClick={() => onSelectTab('transport')}
                    className="text-xs font-bold text-sky-600 hover:underline"
                  >
                    View Fleet Dispatch &rarr;
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {buses.map((b) => (
                    <div key={b.id} className="p-3.5 rounded-xl border border-slate-200 bg-white">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{b.number}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          b.status === 'tracking_live' && !isBusStale ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {b.status === 'tracking_live' && !isBusStale ? 'LIVE' : 'IDLE'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{b.routeName}</p>
                      <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between font-mono">
                        <span>Coord: {b.coordinatorName}</span>
                        <span>{b.studentsCount}/{b.capacity} Students</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Col: Announcements & Quick Audit Preview */}
            <div className="space-y-6">
              {/* Published Announcements */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-900">School Announcements</h3>
                  <button
                    onClick={() => setShowAnnModal(true)}
                    className="text-xs font-bold text-sky-600 hover:underline"
                  >
                    + New
                  </button>
                </div>
                <div className="space-y-3">
                  {announcements.map((ann) => (
                    <div key={ann.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-slate-900">{ann.title}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(ann.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 line-clamp-2">{ann.content}</p>
                      <span className="text-[10px] text-sky-700 font-semibold mt-1 block">Audience: {ann.audience}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Security & Activity Audit */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-900">Security Audit Log</h3>
                  <button
                    onClick={() => onSelectTab('server')}
                    className="text-xs font-bold text-sky-600 hover:underline"
                  >
                    Full Logs &rarr;
                  </button>
                </div>
                <div className="space-y-2 text-xs">
                  {auditLogs.slice(0, 4).map((log) => (
                    <div key={log.id} className="p-2.5 rounded bg-slate-50 border border-slate-100">
                      <div className="flex items-center justify-between font-mono text-[10px] text-slate-400 mb-0.5">
                        <span className="font-bold text-slate-700">{log.action}</span>
                        <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-slate-600 text-[11px] leading-snug">{log.details}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">Actor: {log.actorName} ({log.actorRole})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ACCOUNTS & ROLES TAB */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-base font-bold text-slate-900">Manage Accounts &amp; Access Roles</h2>
              <p className="text-xs text-slate-500">Configure role permissions, parent-child links, and faculty assignments</p>
            </div>
            <button
              onClick={() => setShowNewUserModal(true)}
              className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Account</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-y border-slate-200">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Associated Entity</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Last Login</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-normal">
                {allUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 flex items-center gap-3">
                      <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                      <div>
                        <span className="font-bold text-slate-900 block">{u.name}</span>
                        <span className="text-slate-400 font-mono text-[11px]">{u.email}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 capitalize font-semibold text-slate-700">
                      {u.role.replace('_', ' ')}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {u.role === 'student' && `${u.studentInfo?.className}-${u.studentInfo?.section} · Roll #${u.studentInfo?.rollNumber}`}
                      {u.role === 'teacher' && `${u.teacherInfo?.employeeId} (${u.teacherInfo?.subjects.join(', ')})`}
                      {u.role === 'parent' && `Children: ${u.parentInfo?.children.map((c) => c.name).join(', ')}`}
                      {u.role === 'bus_coordinator' && `${u.coordinatorInfo?.busNumber} · ${u.coordinatorInfo?.routeName}`}
                      {u.role === 'principal' && 'Executive Administration'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">{u.phone}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                      {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Active'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TRANSPORT & FLEET TAB */}
      {activeTab === 'transport' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 mb-1">Central Bus Dispatch &amp; Live Tracking Telemetry</h2>
            <p className="text-xs text-slate-500 mb-4">Live positions broadcasted by authorized bus coordinators via GPS</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {buses.map((b) => (
                <div key={b.id} className="space-y-3 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{b.number} · {b.routeName}</h3>
                      <p className="text-xs text-slate-500">Coordinator: {b.coordinatorName} · Driver: {b.driverName}</p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                      b.status === 'tracking_live' && !isBusStale ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {b.status === 'tracking_live' && !isBusStale ? 'LIVE' : 'IDLE'}
                    </span>
                  </div>
                  <BusMap bus={b} isStale={isBusStale} height="320px" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CLOUD STORAGE TAB */}
      {activeTab === 'storage' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-base font-bold text-slate-900">S.C.O.P.E. Protected Cloud Drive</h2>
              <p className="text-xs text-slate-500">Manage curriculum manuals, administrative directives, and quotas</p>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Upload Document</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {cloudFiles.map((file) => (
              <div key={file.id} className="p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-sky-700 flex items-center gap-1">
                      <Folder className="w-3.5 h-3.5" />
                      {file.folder}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{file.permission}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 mt-1 line-clamp-1">{file.name}</h4>
                  <p className="text-[11px] text-slate-400 mt-1 font-mono">
                    Size: {file.size} · Uploaded by {file.uploadedByName}
                  </p>
                </div>
                <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400 font-mono">
                    {new Date(file.uploadedAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => api.deleteStorageFile(file.id).then(onRefreshData)}
                    className="text-rose-600 hover:underline text-[11px] font-semibold"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SERVER STATUS & AUDIT TAB */}
      {activeTab === 'server' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900">School Server &amp; System Infrastructure Status</h2>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    OPERATIONAL (HEALTHY)
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Real-time health, database query latency, and disaster recovery snapshot backups</p>
              </div>

              <button
                onClick={handleTriggerBackup}
                disabled={isBackingUp}
                className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isBackingUp ? 'animate-spin' : ''}`} />
                <span>{isBackingUp ? 'Creating Snapshot...' : 'Run Snapshot Backup Now'}</span>
              </button>
            </div>

            {backupSuccessMessage && (
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-medium">
                {backupSuccessMessage}
              </div>
            )}

            {serverHealth && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Service Uptime</span>
                  <span className="text-xl font-bold font-mono text-slate-900 mt-1 block">{serverHealth.uptimeFormatted}</span>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Zero unexpected restarts</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">DB Query Latency</span>
                  <span className="text-xl font-bold font-mono text-emerald-600 mt-1 block">{serverHealth.dbLatencyMs} ms</span>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">PostgreSQL / JSON engine</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Protected Cloud Storage</span>
                  <span className="text-xl font-bold font-mono text-slate-900 mt-1 block">
                    {(serverHealth.storageUsedBytes / 1048576).toFixed(1)} MB / 5.0 GB
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">{serverHealth.storageUsagePercent}% quota utilized</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Total Database Records</span>
                  <span className="text-xl font-bold font-mono text-slate-900 mt-1 block">{serverHealth.totalDbRecords}</span>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Indexed relational rows</span>
                </div>
              </div>
            )}

            {/* Audit Logs Table */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">System Security &amp; Activity Audit Logs</h3>
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Timestamp</th>
                      <th className="py-2.5 px-3">Actor</th>
                      <th className="py-2.5 px-3">Role</th>
                      <th className="py-2.5 px-3">Action</th>
                      <th className="py-2.5 px-3">Details</th>
                      <th className="py-2.5 px-3">IP Address</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-normal">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/70">
                        <td className="py-2 px-3 text-slate-400 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </td>
                        <td className="py-2 px-3 text-slate-800 font-sans font-bold">{log.actorName}</td>
                        <td className="py-2 px-3 capitalize text-slate-600">{log.actorRole}</td>
                        <td className="py-2 px-3 font-bold text-sky-700">{log.action}</td>
                        <td className="py-2 px-3 text-slate-600 font-sans max-w-xs truncate">{log.details}</td>
                        <td className="py-2 px-3 text-slate-400">{log.ipAddress}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REGISTER NEW USER MODAL */}
      {showNewUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 mb-1">Register New Account</h3>
            <p className="text-xs text-slate-500 mb-4">Create verified credentials for student, faculty, parent, or coordinator</p>

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Full Name</label>
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  required
                  placeholder="e.g. Liam Henderson"
                  className="w-full text-xs rounded-lg border border-slate-300 p-2 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Email Address</label>
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  required
                  placeholder="e.g. liam.student@scope.edu"
                  className="w-full text-xs rounded-lg border border-slate-300 p-2 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Role</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as any)}
                    className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white"
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher / Faculty</option>
                    <option value="parent">Parent</option>
                    <option value="bus_coordinator">Bus Coordinator</option>
                    <option value="principal">Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Phone</label>
                  <input
                    type="text"
                    value={newUserPhone}
                    onChange={(e) => setNewUserPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full text-xs rounded-lg border border-slate-300 p-2"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowNewUserModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs transition-colors"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POST ANNOUNCEMENT MODAL */}
      {showAnnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 mb-1">Post Official School Notice</h3>
            <p className="text-xs text-slate-500 mb-4">Publish notices across the entire school or targeted user groups</p>

            <form onSubmit={handlePublishAnnouncement} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Notice Title</label>
                <input
                  type="text"
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  required
                  placeholder="e.g. Schedule for Winter Break & Exam Preparation"
                  className="w-full text-xs rounded-lg border border-slate-300 p-2 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Target Audience</label>
                  <select
                    value={annAudience}
                    onChange={(e) => setAnnAudience(e.target.value as any)}
                    className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white"
                  >
                    <option value="All School">All School</option>
                    <option value="Parents">Parents Only</option>
                    <option value="Teachers">Teachers Only</option>
                    <option value="Students">Students Only</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Priority</label>
                  <select
                    value={annPriority}
                    onChange={(e) => setAnnPriority(e.target.value as any)}
                    className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Important">Important</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Announcement Body</label>
                <textarea
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  rows={4}
                  required
                  placeholder="Enter the official school communique..."
                  className="w-full text-xs rounded-lg border border-slate-300 p-2 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="pinCheck"
                  checked={annPinned}
                  onChange={(e) => setAnnPinned(e.target.checked)}
                  className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                />
                <label htmlFor="pinCheck" className="text-xs text-slate-700 font-medium">
                  Pin to top of dashboards
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAnnModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs transition-colors"
                >
                  Publish Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CLOUD UPLOAD MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 mb-1">Upload to Cloud Storage</h3>
            <p className="text-xs text-slate-500 mb-4">Store academic curriculum, policies, or staff resources</p>

            <form onSubmit={handleUploadCloudFile} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">File Name</label>
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  required
                  placeholder="e.g. School_Code_of_Conduct_2026.pdf"
                  className="w-full text-xs rounded-lg border border-slate-300 p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Folder</label>
                  <select
                    value={fileFolder}
                    onChange={(e) => setFileFolder(e.target.value as any)}
                    className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white"
                  >
                    <option value="Curriculum">Curriculum</option>
                    <option value="Administration">Administration</option>
                    <option value="Staff Resources">Staff Resources</option>
                    <option value="Student Portfolios">Student Portfolios</option>
                    <option value="General">General</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Access Rights</label>
                  <select
                    value={filePermission}
                    onChange={(e) => setFilePermission(e.target.value as any)}
                    className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white"
                  >
                    <option value="Public">Public (All)</option>
                    <option value="Staff Only">Staff Only</option>
                    <option value="Class Only">Class Only</option>
                    <option value="Private">Private Admin</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs transition-colors"
                >
                  Upload File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
