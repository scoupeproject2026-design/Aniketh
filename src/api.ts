import type {
  User,
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

const API_BASE = '/api';

export const api = {
  // --- AUTH ---
  async login(email?: string, password?: string, role?: string): Promise<{ user: User; token: string }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Login failed' }));
      throw new Error(err.error || 'Login failed');
    }
    return res.json();
  },

  async getUsers(): Promise<User[]> {
    const res = await fetch(`${API_BASE}/auth/users`);
    const data = await res.json();
    return data.users;
  },

  async createUser(payload: Partial<User>): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to create user');
    const data = await res.json();
    return data.user;
  },

  async updateUser(id: string, payload: Partial<User>): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to update user');
    const data = await res.json();
    return data.user;
  },

  // --- BUS TRACKING ---
  async getBuses(): Promise<Bus[]> {
    const res = await fetch(`${API_BASE}/bus-tracking/buses`);
    const data = await res.json();
    return data.buses;
  },

  async getBusStatus(busId: string): Promise<{ bus: Bus; isStale: boolean }> {
    const res = await fetch(`${API_BASE}/bus-tracking/status/${busId}`);
    if (!res.ok) throw new Error('Bus status query failed');
    return res.json();
  },

  async setBusSession(busId: string, action: 'start' | 'stop', coordinatorId?: string, coordinatorName?: string): Promise<Bus> {
    const res = await fetch(`${API_BASE}/bus-tracking/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ busId, action, coordinatorId, coordinatorName }),
    });
    if (!res.ok) throw new Error('Failed to toggle tracking session');
    const data = await res.json();
    return data.bus;
  },

  async updateBusLocation(payload: {
    busId: string;
    lat: number;
    lng: number;
    speed?: number;
    heading?: number;
    accuracy?: number;
    sessionMode?: 'gps_live' | 'simulator_demo';
    nextStopId?: string;
    etaMinutes?: number | null;
    coordinatorName?: string;
  }): Promise<{ success: boolean; bus: Bus }> {
    const res = await fetch(`${API_BASE}/bus-tracking/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to broadcast location update');
    return res.json();
  },

  // --- TIMETABLE ---
  async getTimetable(classId?: string): Promise<TimetableSlot[]> {
    const query = classId ? `?classId=${encodeURIComponent(classId)}` : '';
    const res = await fetch(`${API_BASE}/timetable${query}`);
    const data = await res.json();
    return data.timetable;
  },

  async addTimetableSlot(slot: Omit<TimetableSlot, 'id'>): Promise<TimetableSlot> {
    const res = await fetch(`${API_BASE}/timetable`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slot),
    });
    const data = await res.json();
    return data.slot;
  },

  // --- NOTES & MATERIALS ---
  async getNotes(classId?: string, subject?: string): Promise<NoteResource[]> {
    const params = new URLSearchParams();
    if (classId) params.append('classId', classId);
    if (subject) params.append('subject', subject);
    const res = await fetch(`${API_BASE}/notes?${params.toString()}`);
    const data = await res.json();
    return data.notes;
  },

  async uploadNote(payload: Partial<NoteResource>): Promise<NoteResource> {
    const res = await fetch(`${API_BASE}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    return data.note;
  },

  async deleteNote(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/notes/${id}`, { method: 'DELETE' });
    return res.ok;
  },

  // --- RECORDINGS ---
  async getRecordings(classId?: string, subject?: string): Promise<Recording[]> {
    const params = new URLSearchParams();
    if (classId) params.append('classId', classId);
    if (subject) params.append('subject', subject);
    const res = await fetch(`${API_BASE}/recordings?${params.toString()}`);
    const data = await res.json();
    return data.recordings;
  },

  async uploadRecording(payload: Partial<Recording>): Promise<Recording> {
    const res = await fetch(`${API_BASE}/recordings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    return data.recording;
  },

  // --- ASSIGNMENTS & SUBMISSIONS ---
  async getAssignments(classId?: string): Promise<{ assignments: Assignment[]; submissions: AssignmentSubmission[] }> {
    const query = classId ? `?classId=${encodeURIComponent(classId)}` : '';
    const res = await fetch(`${API_BASE}/assignments${query}`);
    return res.json();
  },

  async createAssignment(payload: Partial<Assignment>): Promise<Assignment> {
    const res = await fetch(`${API_BASE}/assignments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    return data.assignment;
  },

  async submitAssignment(assignmentId: string, payload: Partial<AssignmentSubmission>): Promise<AssignmentSubmission> {
    const res = await fetch(`${API_BASE}/assignments/${assignmentId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    return data.submission;
  },

  async gradeSubmission(submissionId: string, marksObtained: number, feedback: string, teacherName: string): Promise<AssignmentSubmission> {
    const res = await fetch(`${API_BASE}/assignments/grade`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ submissionId, marksObtained, feedback, teacherName }),
    });
    const data = await res.json();
    return data.submission;
  },

  // --- ATTENDANCE ---
  async getAttendance(classId?: string, date?: string): Promise<AttendanceRecord[]> {
    const params = new URLSearchParams();
    if (classId) params.append('classId', classId);
    if (date) params.append('date', date);
    const res = await fetch(`${API_BASE}/attendance?${params.toString()}`);
    const data = await res.json();
    return data.records;
  },

  async markAttendance(payload: Partial<AttendanceRecord>): Promise<AttendanceRecord> {
    const res = await fetch(`${API_BASE}/attendance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    return data.record;
  },

  // --- EXAMS & RESULTS ---
  async getExams(): Promise<{ exams: Exam[]; results: ExamResult[] }> {
    const res = await fetch(`${API_BASE}/exams`);
    return res.json();
  },

  async createExam(payload: Partial<Exam>): Promise<Exam> {
    const res = await fetch(`${API_BASE}/exams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    return data.exam;
  },

  async publishExam(examId: string, staffName: string): Promise<Exam> {
    const res = await fetch(`${API_BASE}/exams/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ examId, staffName }),
    });
    const data = await res.json();
    return data.exam;
  },

  async saveExamResult(payload: Partial<ExamResult>): Promise<ExamResult> {
    const res = await fetch(`${API_BASE}/exams/results`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    return data.result;
  },

  // --- PROJECTS & INNOVATIONS ---
  async getProjects(): Promise<Project[]> {
    const res = await fetch(`${API_BASE}/projects`);
    const data = await res.json();
    return data.projects;
  },

  async submitProject(payload: Partial<Project>): Promise<Project> {
    const res = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    return data.project;
  },

  async reviewProject(id: string, payload: Partial<Project>): Promise<Project> {
    const res = await fetch(`${API_BASE}/projects/${id}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    return data.project;
  },

  async likeProject(id: string): Promise<number> {
    const res = await fetch(`${API_BASE}/projects/${id}/like`, { method: 'POST' });
    const data = await res.json();
    return data.likes;
  },

  // --- CLOUD STORAGE ---
  async getStorage(): Promise<{ files: CloudFile[]; usedBytes: number; totalBytes: number }> {
    const res = await fetch(`${API_BASE}/storage`);
    return res.json();
  },

  async uploadStorageFile(payload: Partial<CloudFile>): Promise<CloudFile> {
    const res = await fetch(`${API_BASE}/storage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    return data.file;
  },

  async deleteStorageFile(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/storage/${id}`, { method: 'DELETE' });
    return res.ok;
  },

  // --- ANNOUNCEMENTS ---
  async getAnnouncements(): Promise<Announcement[]> {
    const res = await fetch(`${API_BASE}/announcements`);
    const data = await res.json();
    return data.announcements;
  },

  async createAnnouncement(payload: Partial<Announcement>): Promise<Announcement> {
    const res = await fetch(`${API_BASE}/announcements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    return data.announcement;
  },

  // --- MESSAGES ---
  async getMessages(userId: string, role: string): Promise<Message[]> {
    const res = await fetch(`${API_BASE}/messages?userId=${encodeURIComponent(userId)}&role=${encodeURIComponent(role)}`);
    const data = await res.json();
    return data.messages;
  },

  async sendMessage(payload: Partial<Message>): Promise<Message> {
    const res = await fetch(`${API_BASE}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    return data.message;
  },

  async markMessageRead(id: string): Promise<void> {
    await fetch(`${API_BASE}/messages/${id}/read`, { method: 'POST' });
  },

  // --- NOTIFICATIONS ---
  async getNotifications(userId: string): Promise<Notification[]> {
    const res = await fetch(`${API_BASE}/notifications?userId=${encodeURIComponent(userId)}`);
    const data = await res.json();
    return data.notifications;
  },

  async markNotificationsRead(userId?: string, notificationId?: string): Promise<void> {
    await fetch(`${API_BASE}/notifications/mark-read`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, notificationId }),
    });
  },

  // --- SERVER & AUDIT ---
  async getServerStatus(): Promise<{ health: ServerHealth; auditLogs: SystemAuditLog[] }> {
    const res = await fetch(`${API_BASE}/admin/server-status`);
    return res.json();
  },

  async triggerBackup(): Promise<{ success: boolean; backupId: string; timestamp: string }> {
    const res = await fetch(`${API_BASE}/admin/trigger-backup`, { method: 'POST' });
    return res.json();
  },
};
