export type UserRole = 'student' | 'teacher' | 'parent' | 'principal' | 'bus_coordinator';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  phone: string;
  studentInfo?: {
    classId: string;
    className: string;
    section: string;
    rollNumber: string;
    busId?: string;
    parentId?: string;
    parentName?: string;
  };
  teacherInfo?: {
    employeeId: string;
    subjects: string[];
    assignedClasses: string[];
  };
  parentInfo?: {
    children: {
      studentId: string;
      name: string;
      className: string;
      section: string;
      rollNumber: string;
      busId?: string;
      avatar: string;
    }[];
  };
  coordinatorInfo?: {
    busId: string;
    busNumber: string;
    routeName: string;
    licenseNumber: string;
  };
  principalInfo?: {
    department: string;
    officeNumber: string;
  };
  status: 'active' | 'pending' | 'suspended';
  lastLogin?: string;
}

export interface BusRouteStop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  scheduledTime: string;
  order: number;
}

export interface Bus {
  id: string;
  number: string;
  licensePlate: string;
  driverName: string;
  driverPhone: string;
  coordinatorId: string;
  coordinatorName: string;
  routeName: string;
  capacity: number;
  studentsCount: number;
  status: 'idle' | 'tracking_live' | 'completed' | 'offline';
  currentLocation?: {
    lat: number;
    lng: number;
    speed: number;
    heading: number;
    accuracy: number;
    updatedAt: string;
    isLive: boolean;
    sessionMode: 'gps_live' | 'simulator_demo';
  };
  activeSessionId?: string;
  stops: BusRouteStop[];
  nextStopId?: string;
  etaMinutes?: number | null;
}

export interface TimetableSlot {
  id: string;
  classId: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  startTime: string;
  endTime: string;
  subject: string;
  teacherName: string;
  room: string;
}

export interface NoteResource {
  id: string;
  title: string;
  description: string;
  classId: string;
  className: string;
  section: string;
  subject: string;
  chapter: string;
  topic: string;
  fileUrl: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  uploadedBy: string;
  uploadedByName: string;
  uploadedAt: string;
}

export interface Recording {
  id: string;
  title: string;
  topic: string;
  subject: string;
  classId: string;
  className: string;
  section: string;
  recordingDate: string;
  duration: string;
  videoUrl: string;
  thumbnailUrl: string;
  uploadedBy: string;
  uploadedByName: string;
  notesUrl?: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  subject: string;
  classId: string;
  className: string;
  section: string;
  deadline: string;
  maxMarks: number;
  teacherId: string;
  teacherName: string;
  createdAt: string;
  attachmentName?: string;
  attachmentUrl?: string;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  studentRoll: string;
  className: string;
  section: string;
  submissionText: string;
  submittedAt: string;
  attachmentName?: string;
  attachmentUrl?: string;
  status: 'Not Started' | 'In Progress' | 'Submitted' | 'Reviewed' | 'Overdue';
  marksObtained?: number;
  feedback?: string;
  reviewedAt?: string;
  reviewedByName?: string;
}

export interface AttendanceEntry {
  studentId: string;
  studentName: string;
  rollNumber: string;
  status: 'Present' | 'Absent' | 'Late' | 'Excused';
  notes?: string;
}

export interface AttendanceRecord {
  id: string;
  classId: string;
  className: string;
  section: string;
  date: string;
  markedBy: string;
  markedByName: string;
  entries: AttendanceEntry[];
}

export interface ExamScheduleItem {
  subject: string;
  date: string;
  time: string;
  room: string;
  maxMarks: number;
}

export interface Exam {
  id: string;
  title: string;
  classId: string;
  className: string;
  startDate: string;
  endDate: string;
  status: 'Scheduled' | 'Grading' | 'Published';
  publishedAt?: string;
  schedule: ExamScheduleItem[];
}

export interface SubjectMark {
  subject: string;
  marksObtained: number;
  maxMarks: number;
  grade: string;
  feedback?: string;
}

export interface ExamResult {
  id: string;
  examId: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  classId: string;
  className: string;
  subjectMarks: SubjectMark[];
  totalObtained: number;
  totalMax: number;
  percentage: number;
  overallGrade: string;
  rank?: number;
  isPublished: boolean;
}

export interface Project {
  id: string;
  title: string;
  category: 'Robotics & AI' | 'Environmental Science' | 'Software & Web' | 'Creative Arts' | 'Social Innovation';
  description: string;
  studentId: string;
  studentName: string;
  className: string;
  submittedAt: string;
  attachmentName?: string;
  attachmentUrl?: string;
  status: 'Submitted' | 'Under Review' | 'Approved' | 'Showcased';
  teacherFeedback?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  showcasedInSchool: boolean;
  likes: number;
}

export interface CloudFile {
  id: string;
  name: string;
  folder: 'Curriculum' | 'Administration' | 'Staff Resources' | 'Student Portfolios' | 'General';
  size: string;
  sizeBytes: number;
  fileType: string;
  uploadedBy: string;
  uploadedByName: string;
  uploadedByRole: UserRole;
  uploadedAt: string;
  permission: 'Public' | 'Staff Only' | 'Class Only' | 'Private';
  fileUrl: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  audience: 'All School' | 'Students' | 'Teachers' | 'Parents' | 'Grade 10';
  priority: 'Normal' | 'Important' | 'Urgent';
  authorId: string;
  authorName: string;
  authorRole: string;
  createdAt: string;
  attachmentName?: string;
  pinned: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  senderAvatar: string;
  recipientId: string;
  recipientName: string;
  recipientRole: UserRole;
  subject: string;
  content: string;
  sentAt: string;
  isRead: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  priority: 'Normal' | 'Important' | 'Urgent';
  category: 'assignment' | 'attendance' | 'bus' | 'exam' | 'system' | 'message';
  timestamp: string;
  isRead: boolean;
  linkTab?: string;
}

export interface SystemAuditLog {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: string;
  action: string;
  category: 'auth' | 'admin' | 'exam' | 'tracking' | 'storage' | 'security';
  status: 'success' | 'warning' | 'info';
  ipAddress: string;
  details: string;
}

export interface ServerHealth {
  status: 'healthy' | 'degraded' | 'maintenance';
  uptimeSeconds: number;
  uptimeFormatted: string;
  dbLatencyMs: number;
  storageUsedBytes: number;
  storageTotalBytes: number;
  storageUsagePercent: number;
  activeUsersCount: number;
  activeTrackingSessions: number;
  lastBackupTimestamp: string;
  totalDbRecords: number;
  nodeVersion: string;
  environment: string;
}
