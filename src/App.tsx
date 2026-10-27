import React, { useState, useEffect, useCallback } from 'react';
import type {
  User,
  UserRole,
  Bus,
  TimetableSlot,
  NoteResource,
  Recording,
  Assignment,
  AssignmentSubmission,
  AttendanceRecord,
  Exam,
  ExamResult,
  Project,
  CloudFile,
  Announcement,
  Message,
  Notification,
  ServerHealth,
  SystemAuditLog,
} from './types';
import { api } from './api';
import { Navbar } from './components/Navbar';
import { LoginScreen } from './components/LoginScreen';
import { StudentDashboard } from './components/dashboards/StudentDashboard';
import { TeacherDashboard } from './components/dashboards/TeacherDashboard';
import { ParentDashboard } from './components/dashboards/ParentDashboard';
import { PrincipalDashboard } from './components/dashboards/PrincipalDashboard';
import { BusCoordinatorDashboard } from './components/dashboards/BusCoordinatorDashboard';
import { NotificationDrawer } from './components/NotificationDrawer';
import { MessagingModal } from './components/MessagingModal';

export default function App() {
  // Current user state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // Modals state
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);

  // Application Data States
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [activeBus, setActiveBus] = useState<Bus | undefined>(undefined);
  const [isBusStale, setIsBusStale] = useState<boolean>(false);

  const [timetable, setTimetable] = useState<TimetableSlot[]>([]);
  const [notes, setNotes] = useState<NoteResource[]>([]);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [examResults, setExamResults] = useState<ExamResult[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [cloudFiles, setCloudFiles] = useState<CloudFile[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [serverHealth, setServerHealth] = useState<ServerHealth | null>(null);
  const [auditLogs, setAuditLogs] = useState<SystemAuditLog[]>([]);

  // Initial load
  const loadAllData = useCallback(async () => {
    try {
      const [
        usersData,
        busesData,
        timetableData,
        notesData,
        recordingsData,
        asgData,
        attData,
        examData,
        projData,
        storageData,
        annData,
        statusData,
      ] = await Promise.all([
        api.getUsers().catch(() => []),
        api.getBuses().catch(() => []),
        api.getTimetable().catch(() => []),
        api.getNotes().catch(() => []),
        api.getRecordings().catch(() => []),
        api.getAssignments().catch(() => ({ assignments: [], submissions: [] })),
        api.getAttendance().catch(() => []),
        api.getExams().catch(() => ({ exams: [], results: [] })),
        api.getProjects().catch(() => []),
        api.getStorage().catch(() => ({ files: [], usedBytes: 0, totalBytes: 0 })),
        api.getAnnouncements().catch(() => []),
        api.getServerStatus().catch(() => ({ health: null, auditLogs: [] })),
      ]);

      setAllUsers(usersData);
      setBuses(busesData);
      setActiveBus(busesData.find((b: Bus) => b.id === 'bus_04') || busesData[0]);
      setTimetable(timetableData);
      setNotes(notesData);
      setRecordings(recordingsData);
      setAssignments(asgData.assignments);
      setSubmissions(asgData.submissions);
      setAttendance(attData);
      setExams(examData.exams);
      setExamResults(examData.results);
      setProjects(projData);
      setCloudFiles(storageData.files);
      setAnnouncements(annData);
      if (statusData.health) {
        setServerHealth(statusData.health);
        setAuditLogs(statusData.auditLogs);
      }

      // If user is already set, load user-specific notifications and messages
      if (currentUser) {
        const notifs = await api.getNotifications(currentUser.id).catch(() => []);
        setNotifications(notifs);
        const msgs = await api.getMessages(currentUser.id, currentUser.role).catch(() => []);
        setMessages(msgs);
      } else if (usersData.length > 0) {
        // Auto sign in as Alex Rivera (student) for immediate out-of-the-box demo
        const defaultStudent = usersData.find((u: User) => u.role === 'student') || usersData[0];
        setCurrentUser(defaultStudent);
        const notifs = await api.getNotifications(defaultStudent.id).catch(() => []);
        setNotifications(notifs);
        const msgs = await api.getMessages(defaultStudent.id, defaultStudent.role).catch(() => []);
        setMessages(msgs);
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    loadAllData();
  }, []);

  // Live Bus Location Polling (polls every 3 seconds so moving bus updates appear in real time for parents/students)
  useEffect(() => {
    const busId = activeBus?.id || 'bus_04';
    const interval = setInterval(async () => {
      try {
        const res = await api.getBusStatus(busId);
        if (res && res.bus) {
          setActiveBus(res.bus);
          setIsBusStale(res.isStale);
          // Also update in buses array
          setBuses((prev) => prev.map((b) => (b.id === res.bus.id ? res.bus : b)));
        }
      } catch (err) {
        // ignore polling error
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [activeBus?.id]);

  // Handle Login
  const handleLogin = async (email: string, password?: string, role?: UserRole) => {
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      const res = await api.login(email, password, role);
      setCurrentUser(res.user);
      setActiveTab('overview');
      // Load user messages and notifications
      const notifs = await api.getNotifications(res.user.id);
      setNotifications(notifs);
      const msgs = await api.getMessages(res.user.id, res.user.role);
      setMessages(msgs);
    } catch (err: any) {
      setLoginError(err.message || 'Login failed');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Role Switch
  const handleSwitchUser = async (role: UserRole) => {
    const targetUser = allUsers.find((u) => u.role === role);
    if (targetUser) {
      setCurrentUser(targetUser);
      setActiveTab('overview');
      const notifs = await api.getNotifications(targetUser.id).catch(() => []);
      setNotifications(notifs);
      const msgs = await api.getMessages(targetUser.id, targetUser.role).catch(() => []);
      setMessages(msgs);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('overview');
  };

  // Handle Send Message
  const handleSendMessage = async (payload: { recipientId: string; subject: string; content: string }) => {
    if (!currentUser) return;
    const recipient = allUsers.find((u) => u.id === payload.recipientId);
    if (!recipient) return;

    await api.sendMessage({
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      senderAvatar: currentUser.avatar,
      recipientId: recipient.id,
      recipientName: recipient.name,
      recipientRole: recipient.role,
      subject: payload.subject,
      content: payload.content,
    });

    const updated = await api.getMessages(currentUser.id, currentUser.role);
    setMessages(updated);
  };

  // Mark all notifications read
  const handleMarkAllNotificationsRead = async () => {
    if (!currentUser) return;
    await api.markNotificationsRead(currentUser.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} isLoading={isLoggingIn} error={loginError} />;
  }

  const unreadNotifsCount = notifications.filter((n) => !n.isRead).length;
  const unreadMsgsCount = messages.filter((m) => !m.isRead && m.recipientId === currentUser.id).length;

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col antialiased">
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenMessages={() => setIsMessagesOpen(true)}
        unreadNotificationsCount={unreadNotifsCount}
        unreadMessagesCount={unreadMsgsCount}
        onSwitchUser={handleSwitchUser}
        onLogout={handleLogout}
      />

      {/* Main Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentUser.role === 'student' && (
          <StudentDashboard
            user={currentUser}
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            timetable={timetable}
            notes={notes}
            recordings={recordings}
            assignments={assignments}
            submissions={submissions}
            attendance={attendance}
            exams={exams}
            examResults={examResults}
            projects={projects}
            announcements={announcements}
            bus={activeBus}
            isBusStale={isBusStale}
            onRefreshData={loadAllData}
          />
        )}

        {currentUser.role === 'teacher' && (
          <TeacherDashboard
            user={currentUser}
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            allUsers={allUsers}
            timetable={timetable}
            notes={notes}
            recordings={recordings}
            assignments={assignments}
            submissions={submissions}
            attendance={attendance}
            exams={exams}
            examResults={examResults}
            projects={projects}
            announcements={announcements}
            onRefreshData={loadAllData}
          />
        )}

        {currentUser.role === 'parent' && (
          <ParentDashboard
            user={currentUser}
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            timetable={timetable}
            notes={notes}
            assignments={assignments}
            submissions={submissions}
            attendance={attendance}
            exams={exams}
            examResults={examResults}
            projects={projects}
            announcements={announcements}
            bus={activeBus}
            isBusStale={isBusStale}
            onOpenMessages={() => setIsMessagesOpen(true)}
          />
        )}

        {currentUser.role === 'principal' && (
          <PrincipalDashboard
            user={currentUser}
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            allUsers={allUsers}
            buses={buses}
            isBusStale={isBusStale}
            exams={exams}
            examResults={examResults}
            cloudFiles={cloudFiles}
            announcements={announcements}
            assignments={assignments}
            attendance={attendance}
            serverHealth={serverHealth}
            auditLogs={auditLogs}
            onRefreshData={loadAllData}
          />
        )}

        {currentUser.role === 'bus_coordinator' && activeBus && (
          <BusCoordinatorDashboard
            user={currentUser}
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            bus={activeBus}
            isBusStale={isBusStale}
            onRefreshData={loadAllData}
          />
        )}
      </main>

      {/* Notifications Drawer */}
      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllRead={handleMarkAllNotificationsRead}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setIsNotificationsOpen(false);
        }}
      />

      {/* Messaging Modal */}
      <MessagingModal
        isOpen={isMessagesOpen}
        onClose={() => setIsMessagesOpen(false)}
        currentUser={currentUser}
        messages={messages}
        allUsers={allUsers}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
}
