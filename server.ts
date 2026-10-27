import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import JSZip from 'jszip';
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
  SystemAuditLog,
  ServerHealth,
} from './src/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'scope_db.json');
const SERVER_START_TIME = Date.now();

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface DatabaseSchema {
  users: User[];
  buses: Bus[];
  timetables: TimetableSlot[];
  notes: NoteResource[];
  recordings: Recording[];
  assignments: Assignment[];
  submissions: AssignmentSubmission[];
  attendance: AttendanceRecord[];
  exams: Exam[];
  examResults: ExamResult[];
  projects: Project[];
  cloudFiles: CloudFile[];
  announcements: Announcement[];
  messages: Message[];
  notifications: Notification[];
  auditLogs: SystemAuditLog[];
}

function getInitialDatabase(): DatabaseSchema {
  return {
    users: [
      {
        id: 'usr_student_alex',
        name: 'Alex Rivera',
        email: 'alex.student@scope.edu',
        role: 'student',
        avatar: '/src/assets/images/avatar_student_alex_1793076912128.jpg',
        phone: '+1 (555) 234-8901',
        status: 'active',
        lastLogin: '2026-10-26T21:40:00Z',
        studentInfo: {
          classId: 'cls_10_a',
          className: 'Grade 10',
          section: 'A',
          rollNumber: '10A-14',
          busId: 'bus_04',
          parentId: 'usr_parent_marcus',
          parentName: 'Marcus Rivera',
        },
      },
      {
        id: 'usr_teacher_sarah',
        name: 'Sarah Jenkins',
        email: 'sarah.teacher@scope.edu',
        role: 'teacher',
        avatar: '/src/assets/images/avatar_teacher_sarah_1793076912311.jpg',
        phone: '+1 (555) 345-6789',
        status: 'active',
        lastLogin: '2026-10-26T21:45:00Z',
        teacherInfo: {
          employeeId: 'TCH-802',
          subjects: ['Mathematics', 'Physics', 'Applied Science'],
          assignedClasses: ['Grade 10-A', 'Grade 10-B', 'Grade 11-A'],
        },
      },
      {
        id: 'usr_parent_marcus',
        name: 'Marcus Rivera',
        email: 'marcus.parent@scope.edu',
        role: 'parent',
        avatar: '/src/assets/images/avatar_parent_marcus_1793076912210.jpg',
        phone: '+1 (555) 987-6543',
        status: 'active',
        lastLogin: '2026-10-26T21:30:00Z',
        parentInfo: {
          children: [
            {
              studentId: 'usr_student_alex',
              name: 'Alex Rivera',
              className: 'Grade 10',
              section: 'A',
              rollNumber: '10A-14',
              busId: 'bus_04',
              avatar: '/src/assets/images/avatar_student_alex_1793076912128.jpg',
            },
            {
              studentId: 'usr_student_maya',
              name: 'Maya Rivera',
              className: 'Grade 8',
              section: 'B',
              rollNumber: '08B-07',
              busId: 'bus_04',
              avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=250&q=80',
            },
          ],
        },
      },
      {
        id: 'usr_principal_eleanor',
        name: 'Dr. Eleanor Vance',
        email: 'eleanor.principal@scope.edu',
        role: 'principal',
        avatar: '/src/assets/images/avatar_principal_eleanor_1793076913428.jpg',
        phone: '+1 (555) 123-4567',
        status: 'active',
        lastLogin: '2026-10-26T21:50:00Z',
        principalInfo: {
          department: 'Executive Leadership & Administration',
          officeNumber: 'Admin Wing Suite 101',
        },
      },
      {
        id: 'usr_coordinator_david',
        name: 'David Miller',
        email: 'david.bus@scope.edu',
        role: 'bus_coordinator',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
        phone: '+1 (555) 678-9012',
        status: 'active',
        lastLogin: '2026-10-26T21:48:00Z',
        coordinatorInfo: {
          busId: 'bus_04',
          busNumber: 'Bus 04',
          routeName: 'Route 4 - North Hills & Pinehurst',
          licenseNumber: 'CDL-CA-89210',
        },
      },
    ],
    buses: [
      {
        id: 'bus_04',
        number: 'Bus 04',
        licensePlate: '7XYZ892',
        driverName: 'Robert Campbell',
        driverPhone: '+1 (555) 432-1098',
        coordinatorId: 'usr_coordinator_david',
        coordinatorName: 'David Miller',
        routeName: 'Route 4 - North Hills & Pinehurst',
        capacity: 44,
        studentsCount: 38,
        status: 'tracking_live',
        currentLocation: {
          lat: 37.7745,
          lng: -122.4112,
          speed: 34,
          heading: 135,
          accuracy: 5,
          updatedAt: new Date().toISOString(),
          isLive: true,
          sessionMode: 'gps_live',
        },
        activeSessionId: 'sess_bus4_active',
        nextStopId: 'stop_4_3',
        etaMinutes: 8,
        stops: [
          {
            id: 'stop_4_1',
            name: 'North Hills Terminal & Transit Hub',
            lat: 37.7885,
            lng: -122.4285,
            scheduledTime: '07:15 AM',
            order: 1,
          },
          {
            id: 'stop_4_2',
            name: 'Oak Ridge Plaza & Highland Ave',
            lat: 37.7812,
            lng: -122.4190,
            scheduledTime: '07:28 AM',
            order: 2,
          },
          {
            id: 'stop_4_3',
            name: 'Pinehurst Commons & 14th St',
            lat: 37.7740,
            lng: -122.4085,
            scheduledTime: '07:40 AM',
            order: 3,
          },
          {
            id: 'stop_4_4',
            name: 'Meadowbrook Park West Gate',
            lat: 37.7680,
            lng: -122.4010,
            scheduledTime: '07:48 AM',
            order: 4,
          },
          {
            id: 'stop_4_5',
            name: 'S.C.O.P.E. Central Campus Main Gate',
            lat: 37.7620,
            lng: -122.3940,
            scheduledTime: '07:55 AM',
            order: 5,
          },
        ],
      },
      {
        id: 'bus_02',
        number: 'Bus 02',
        licensePlate: '4KMN319',
        driverName: 'Arthur Vance',
        driverPhone: '+1 (555) 765-4321',
        coordinatorId: 'usr_coordinator_pending',
        coordinatorName: 'Transit Operations',
        routeName: 'Route 2 - Bayside & Harbor Boulevard',
        capacity: 40,
        studentsCount: 32,
        status: 'idle',
        stops: [
          {
            id: 'stop_2_1',
            name: 'Harbor Marina View',
            lat: 37.8020,
            lng: -122.4050,
            scheduledTime: '07:10 AM',
            order: 1,
          },
          {
            id: 'stop_2_2',
            name: 'Bayview Station South',
            lat: 37.7850,
            lng: -122.3920,
            scheduledTime: '07:30 AM',
            order: 2,
          },
          {
            id: 'stop_2_3',
            name: 'S.C.O.P.E. Central Campus Main Gate',
            lat: 37.7620,
            lng: -122.3940,
            scheduledTime: '07:55 AM',
            order: 3,
          },
        ],
      },
    ],
    timetables: [
      { id: 'tt_1', classId: 'cls_10_a', day: 'Monday', startTime: '08:00 AM', endTime: '08:50 AM', subject: 'Mathematics', teacherName: 'Sarah Jenkins', room: 'Room 304' },
      { id: 'tt_2', classId: 'cls_10_a', day: 'Monday', startTime: '09:00 AM', endTime: '09:50 AM', subject: 'Physics', teacherName: 'Sarah Jenkins', room: 'Physics Lab A' },
      { id: 'tt_3', classId: 'cls_10_a', day: 'Monday', startTime: '10:05 AM', endTime: '10:55 AM', subject: 'English Literature', teacherName: 'Prof. David Miller', room: 'Room 201' },
      { id: 'tt_4', classId: 'cls_10_a', day: 'Monday', startTime: '11:05 AM', endTime: '11:55 AM', subject: 'Computer Science', teacherName: 'Elena Rostova', room: 'Tech Lab 2' },
      { id: 'tt_5', classId: 'cls_10_a', day: 'Monday', startTime: '01:00 PM', endTime: '01:50 PM', subject: 'Chemistry', teacherName: 'Dr. Marcus Wong', room: 'Chem Lab B' },
      { id: 'tt_6', classId: 'cls_10_a', day: 'Tuesday', startTime: '08:00 AM', endTime: '08:50 AM', subject: 'Physics', teacherName: 'Sarah Jenkins', room: 'Physics Lab A' },
      { id: 'tt_7', classId: 'cls_10_a', day: 'Tuesday', startTime: '09:00 AM', endTime: '09:50 AM', subject: 'Mathematics', teacherName: 'Sarah Jenkins', room: 'Room 304' },
      { id: 'tt_8', classId: 'cls_10_a', day: 'Tuesday', startTime: '10:05 AM', endTime: '10:55 AM', subject: 'World History', teacherName: 'Rachel Adams', room: 'Room 108' },
      { id: 'tt_9', classId: 'cls_10_a', day: 'Tuesday', startTime: '11:05 AM', endTime: '11:55 AM', subject: 'Biology', teacherName: 'Dr. Gregory House', room: 'Bio Lab 1' },
      { id: 'tt_10', classId: 'cls_10_a', day: 'Wednesday', startTime: '08:00 AM', endTime: '08:50 AM', subject: 'Mathematics', teacherName: 'Sarah Jenkins', room: 'Room 304' },
      { id: 'tt_11', classId: 'cls_10_a', day: 'Wednesday', startTime: '09:00 AM', endTime: '09:50 AM', subject: 'Computer Science', teacherName: 'Elena Rostova', room: 'Tech Lab 2' },
      { id: 'tt_12', classId: 'cls_10_a', day: 'Wednesday', startTime: '10:05 AM', endTime: '10:55 AM', subject: 'Physical Education', teacherName: 'Coach Taylor', room: 'Field 1' },
      { id: 'tt_13', classId: 'cls_10_a', day: 'Thursday', startTime: '08:00 AM', endTime: '08:50 AM', subject: 'Chemistry', teacherName: 'Dr. Marcus Wong', room: 'Chem Lab B' },
      { id: 'tt_14', classId: 'cls_10_a', day: 'Thursday', startTime: '09:00 AM', endTime: '09:50 AM', subject: 'Physics', teacherName: 'Sarah Jenkins', room: 'Physics Lab A' },
      { id: 'tt_15', classId: 'cls_10_a', day: 'Friday', startTime: '08:00 AM', endTime: '08:50 AM', subject: 'English Literature', teacherName: 'Prof. David Miller', room: 'Room 201' },
      { id: 'tt_16', classId: 'cls_10_a', day: 'Friday', startTime: '09:00 AM', endTime: '09:50 AM', subject: 'Robotics Workshop', teacherName: 'Elena Rostova', room: 'Maker Studio' },
    ],
    notes: [
      {
        id: 'note_1',
        title: 'Newtonian Mechanics & Force Diagrams',
        description: 'Comprehensive study notes on vector resolution, free-body diagrams, and friction coefficients.',
        classId: 'cls_10_a',
        className: 'Grade 10',
        section: 'A',
        subject: 'Physics',
        chapter: 'Chapter 4',
        topic: 'Laws of Motion',
        fileUrl: '#',
        fileName: 'Physics_Ch4_Mechanics_Notes.pdf',
        fileSize: '3.4 MB',
        fileType: 'application/pdf',
        uploadedBy: 'usr_teacher_sarah',
        uploadedByName: 'Sarah Jenkins',
        uploadedAt: '2026-10-22T14:30:00Z',
      },
      {
        id: 'note_2',
        title: 'Differential Calculus & Chain Rule Guide',
        description: 'Step-by-step worked examples on derivative rules, tangent slopes, and rate of change problems.',
        classId: 'cls_10_a',
        className: 'Grade 10',
        section: 'A',
        subject: 'Mathematics',
        chapter: 'Chapter 7',
        topic: 'Differentiation Fundamentals',
        fileUrl: '#',
        fileName: 'Math_Grade10_Calculus_CheatSheet.pdf',
        fileSize: '2.1 MB',
        fileType: 'application/pdf',
        uploadedBy: 'usr_teacher_sarah',
        uploadedByName: 'Sarah Jenkins',
        uploadedAt: '2026-10-24T10:15:00Z',
      },
      {
        id: 'note_3',
        title: 'Chemical Equilibrium & Le Chatelier Principle',
        description: 'Reaction quotients, reversible reactions, and equilibrium constant computations.',
        classId: 'cls_10_a',
        className: 'Grade 10',
        section: 'A',
        subject: 'Chemistry',
        chapter: 'Chapter 5',
        topic: 'Dynamic Equilibrium',
        fileUrl: '#',
        fileName: 'Chemistry_Equilibrium_Slides.pdf',
        fileSize: '4.8 MB',
        fileType: 'application/pdf',
        uploadedBy: 'usr_teacher_sarah',
        uploadedByName: 'Sarah Jenkins',
        uploadedAt: '2026-10-18T09:00:00Z',
      },
    ],
    recordings: [
      {
        id: 'rec_1',
        title: 'Wave Optics & Double Slit Diffraction Experiment',
        topic: 'Constructive vs Destructive Interference Demonstration',
        subject: 'Physics',
        classId: 'cls_10_a',
        className: 'Grade 10',
        section: 'A',
        recordingDate: '2026-10-24',
        duration: '42 min',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80',
        uploadedBy: 'usr_teacher_sarah',
        uploadedByName: 'Sarah Jenkins',
        notesUrl: '#',
      },
      {
        id: 'rec_2',
        title: 'Optimization Problems & Practical Applications',
        topic: 'Maximizing Area & Minimizing Cost using Derivatives',
        subject: 'Mathematics',
        classId: 'cls_10_a',
        className: 'Grade 10',
        section: 'A',
        recordingDate: '2026-10-21',
        duration: '50 min',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80',
        uploadedBy: 'usr_teacher_sarah',
        uploadedByName: 'Sarah Jenkins',
      },
    ],
    assignments: [
      {
        id: 'asg_1',
        title: 'Calculus Problem Set: Rates of Change & Tangents',
        description: 'Complete problems 1 through 15 on page 142. Show all algebraic steps clearly and plot tangents for items 7 and 12.',
        subject: 'Mathematics',
        classId: 'cls_10_a',
        className: 'Grade 10',
        section: 'A',
        deadline: '2026-10-30T23:59:00Z',
        maxMarks: 50,
        teacherId: 'usr_teacher_sarah',
        teacherName: 'Sarah Jenkins',
        createdAt: '2026-10-23T10:00:00Z',
        attachmentName: 'Calculus_PS_Oct2026.pdf',
        attachmentUrl: '#',
      },
      {
        id: 'asg_2',
        title: 'Lab Report: Inclined Plane Friction Analysis',
        description: 'Submit your formal write-up with experimental data, regression fit, uncertainty calculations, and theoretical comparison.',
        subject: 'Physics',
        classId: 'cls_10_a',
        className: 'Grade 10',
        section: 'A',
        deadline: '2026-10-25T17:00:00Z',
        maxMarks: 50,
        teacherId: 'usr_teacher_sarah',
        teacherName: 'Sarah Jenkins',
        createdAt: '2026-10-18T09:00:00Z',
        attachmentName: 'LabRubric_Friction_Inclined.pdf',
        attachmentUrl: '#',
      },
      {
        id: 'asg_3',
        title: 'Organic Chemistry: Functional Groups Synthesis Map',
        description: 'Draw chemical flowcharts showing conversions between alcohols, aldehydes, ketones, and carboxylic acids.',
        subject: 'Chemistry',
        classId: 'cls_10_a',
        className: 'Grade 10',
        section: 'A',
        deadline: '2026-11-04T18:00:00Z',
        maxMarks: 40,
        teacherId: 'usr_teacher_sarah',
        teacherName: 'Sarah Jenkins',
        createdAt: '2026-10-25T11:00:00Z',
      },
    ],
    submissions: [
      {
        id: 'sub_1',
        assignmentId: 'asg_2',
        studentId: 'usr_student_alex',
        studentName: 'Alex Rivera',
        studentRoll: '10A-14',
        className: 'Grade 10',
        section: 'A',
        submissionText: 'Attached is my formal lab report containing data tables from 5 separate trial angles and error propagation analysis.',
        submittedAt: '2026-10-24T16:20:00Z',
        attachmentName: 'AlexRivera_Physics_Lab_Friction.pdf',
        attachmentUrl: '#',
        status: 'Reviewed',
        marksObtained: 48,
        feedback: 'Exemplary data analysis and rigorous discussion of dynamic friction discrepancies. Well done, Alex!',
        reviewedAt: '2026-10-25T12:00:00Z',
        reviewedByName: 'Sarah Jenkins',
      },
      {
        id: 'sub_2',
        assignmentId: 'asg_1',
        studentId: 'usr_student_alex',
        studentName: 'Alex Rivera',
        studentRoll: '10A-14',
        className: 'Grade 10',
        section: 'A',
        submissionText: '',
        submittedAt: '',
        status: 'In Progress',
      },
    ],
    attendance: [
      {
        id: 'att_2026_10_26',
        classId: 'cls_10_a',
        className: 'Grade 10',
        section: 'A',
        date: '2026-10-26',
        markedBy: 'usr_teacher_sarah',
        markedByName: 'Sarah Jenkins',
        entries: [
          { studentId: 'usr_student_alex', studentName: 'Alex Rivera', rollNumber: '10A-14', status: 'Present' },
          { studentId: 'usr_student_sam', studentName: 'Samantha Green', rollNumber: '10A-01', status: 'Present' },
          { studentId: 'usr_student_liam', studentName: 'Liam Chen', rollNumber: '10A-02', status: 'Late', notes: 'Arrived at 8:15 AM due to traffic' },
          { studentId: 'usr_student_noah', studentName: 'Noah Patel', rollNumber: '10A-03', status: 'Absent', notes: 'Medical leave approved' },
        ],
      },
      {
        id: 'att_2026_10_25',
        classId: 'cls_10_a',
        className: 'Grade 10',
        section: 'A',
        date: '2026-10-25',
        markedBy: 'usr_teacher_sarah',
        markedByName: 'Sarah Jenkins',
        entries: [
          { studentId: 'usr_student_alex', studentName: 'Alex Rivera', rollNumber: '10A-14', status: 'Present' },
          { studentId: 'usr_student_sam', studentName: 'Samantha Green', rollNumber: '10A-01', status: 'Present' },
          { studentId: 'usr_student_liam', studentName: 'Liam Chen', rollNumber: '10A-02', status: 'Present' },
          { studentId: 'usr_student_noah', studentName: 'Noah Patel', rollNumber: '10A-03', status: 'Present' },
        ],
      },
      {
        id: 'att_2026_10_24',
        classId: 'cls_10_a',
        className: 'Grade 10',
        section: 'A',
        date: '2026-10-24',
        markedBy: 'usr_teacher_sarah',
        markedByName: 'Sarah Jenkins',
        entries: [
          { studentId: 'usr_student_alex', studentName: 'Alex Rivera', rollNumber: '10A-14', status: 'Present' },
          { studentId: 'usr_student_sam', studentName: 'Samantha Green', rollNumber: '10A-01', status: 'Present' },
          { studentId: 'usr_student_liam', studentName: 'Liam Chen', rollNumber: '10A-02', status: 'Present' },
          { studentId: 'usr_student_noah', studentName: 'Noah Patel', rollNumber: '10A-03', status: 'Present' },
        ],
      },
    ],
    exams: [
      {
        id: 'exam_midterm_2026',
        title: 'Autumn Midterm Examination 2026',
        classId: 'cls_10_a',
        className: 'Grade 10',
        startDate: '2026-10-12',
        endDate: '2026-10-19',
        status: 'Published',
        publishedAt: '2026-10-22T08:00:00Z',
        schedule: [
          { subject: 'Mathematics', date: '2026-10-12', time: '09:00 AM - 11:30 AM', room: 'Hall A', maxMarks: 100 },
          { subject: 'Physics', date: '2026-10-14', time: '09:00 AM - 11:30 AM', room: 'Hall A', maxMarks: 100 },
          { subject: 'Chemistry', date: '2026-10-16', time: '09:00 AM - 11:30 AM', room: 'Hall B', maxMarks: 100 },
          { subject: 'English Literature', date: '2026-10-19', time: '09:00 AM - 11:30 AM', room: 'Hall A', maxMarks: 100 },
        ],
      },
      {
        id: 'exam_finals_2026',
        title: 'Annual Finals & Board Preparatory Exam 2026',
        classId: 'cls_10_a',
        className: 'Grade 10',
        startDate: '2026-12-08',
        endDate: '2026-12-18',
        status: 'Scheduled',
        schedule: [
          { subject: 'Mathematics', date: '2026-12-08', time: '09:00 AM - 12:00 PM', room: 'Main Auditorium', maxMarks: 100 },
          { subject: 'Physics', date: '2026-12-10', time: '09:00 AM - 12:00 PM', room: 'Main Auditorium', maxMarks: 100 },
          { subject: 'Chemistry', date: '2026-12-12', time: '09:00 AM - 12:00 PM', room: 'Main Auditorium', maxMarks: 100 },
          { subject: 'Computer Science', date: '2026-12-15', time: '09:00 AM - 12:00 PM', room: 'Computer Center', maxMarks: 100 },
          { subject: 'English Literature', date: '2026-12-18', time: '09:00 AM - 12:00 PM', room: 'Main Auditorium', maxMarks: 100 },
        ],
      },
    ],
    examResults: [
      {
        id: 'res_alex_midterm',
        examId: 'exam_midterm_2026',
        studentId: 'usr_student_alex',
        studentName: 'Alex Rivera',
        rollNumber: '10A-14',
        classId: 'cls_10_a',
        className: 'Grade 10-A',
        subjectMarks: [
          { subject: 'Mathematics', marksObtained: 96, maxMarks: 100, grade: 'A+', feedback: 'Flawless execution in algebraic geometry & series.' },
          { subject: 'Physics', marksObtained: 92, maxMarks: 100, grade: 'A', feedback: 'Great conceptual clarity on vectors and dynamics.' },
          { subject: 'Chemistry', marksObtained: 89, maxMarks: 100, grade: 'A', feedback: 'Good grasp of stoichiometry; review reaction kinetics.' },
          { subject: 'English Literature', marksObtained: 94, maxMarks: 100, grade: 'A+', feedback: 'Thoughtful comparative essay and text analysis.' },
        ],
        totalObtained: 371,
        totalMax: 400,
        percentage: 92.75,
        overallGrade: 'A+',
        rank: 2,
        isPublished: true,
      },
    ],
    projects: [
      {
        id: 'proj_1',
        title: 'Autonomous Solar-Powered Quadcopter for Campus Air Quality Monitoring',
        category: 'Robotics & AI',
        description: 'Engineered an unmanned aerial system with onboard ESP32, optical flow camera, and PM2.5 sensors providing live spatial telemetry to school servers.',
        studentId: 'usr_student_alex',
        studentName: 'Alex Rivera',
        className: 'Grade 10-A',
        submittedAt: '2026-10-15T10:00:00Z',
        attachmentName: 'Quadcopter_Technical_Paper_v2.pdf',
        attachmentUrl: '#',
        status: 'Showcased',
        teacherFeedback: 'Outstanding technical depth, excellent hardware assembly, and reliable flight stability logs.',
        reviewedBy: 'Sarah Jenkins',
        reviewedAt: '2026-10-18T16:00:00Z',
        showcasedInSchool: true,
        likes: 38,
      },
      {
        id: 'proj_2',
        title: 'Zero-Waste Bioplastic Packaging from Brown Algae Biomass',
        category: 'Environmental Science',
        description: 'Developed compostable polymer films capable of degrading completely within 21 days in ordinary soil conditions.',
        studentId: 'usr_student_maya',
        studentName: 'Maya Rivera',
        className: 'Grade 8-B',
        submittedAt: '2026-10-19T14:30:00Z',
        attachmentName: 'Algae_Bioplastic_LabReport.pdf',
        status: 'Approved',
        teacherFeedback: 'Commendable initiative with high environmental promise.',
        reviewedBy: 'Dr. Marcus Wong',
        reviewedAt: '2026-10-21T11:00:00Z',
        showcasedInSchool: true,
        likes: 24,
      },
    ],
    cloudFiles: [
      {
        id: 'file_1',
        name: 'Curriculum_Framework_Grade10_2026.pdf',
        folder: 'Curriculum',
        size: '12.4 MB',
        sizeBytes: 13002342,
        fileType: 'application/pdf',
        uploadedBy: 'usr_principal_eleanor',
        uploadedByName: 'Dr. Eleanor Vance',
        uploadedByRole: 'principal',
        uploadedAt: '2026-09-01T08:00:00Z',
        permission: 'Public',
        fileUrl: '#',
      },
      {
        id: 'file_2',
        name: 'School_Safety_Disaster_Management_Protocol.pdf',
        folder: 'Administration',
        size: '5.1 MB',
        sizeBytes: 5347737,
        fileType: 'application/pdf',
        uploadedBy: 'usr_principal_eleanor',
        uploadedByName: 'Dr. Eleanor Vance',
        uploadedByRole: 'principal',
        uploadedAt: '2026-09-10T11:30:00Z',
        permission: 'Staff Only',
        fileUrl: '#',
      },
      {
        id: 'file_3',
        name: 'Physics_Advanced_Experiments_Manual.pdf',
        folder: 'Staff Resources',
        size: '8.7 MB',
        sizeBytes: 9122611,
        fileType: 'application/pdf',
        uploadedBy: 'usr_teacher_sarah',
        uploadedByName: 'Sarah Jenkins',
        uploadedByRole: 'teacher',
        uploadedAt: '2026-09-15T14:00:00Z',
        permission: 'Class Only',
        fileUrl: '#',
      },
    ],
    announcements: [
      {
        id: 'ann_1',
        title: 'Annual S.C.O.P.E. Science & Technology Innovation Showcase',
        content: 'We invite all students from Grades 7 through 12 to submit their laboratory, robotics, or environmental innovation projects by November 15. Selected projects will be exhibited in the central courtyard during Open School Day.',
        audience: 'All School',
        priority: 'Important',
        authorId: 'usr_principal_eleanor',
        authorName: 'Dr. Eleanor Vance',
        authorRole: 'Head of School',
        createdAt: '2026-10-25T09:00:00Z',
        pinned: true,
      },
      {
        id: 'ann_2',
        title: 'Term 1 Parent-Teacher Conference Schedule',
        content: 'Individual academic review sessions will take place on Saturday, November 7 from 9:00 AM to 3:00 PM. Parents can review mid-term grade sheets and schedule 15-minute consultations through their parent dashboard.',
        audience: 'Parents',
        priority: 'Important',
        authorId: 'usr_principal_eleanor',
        authorName: 'Dr. Eleanor Vance',
        authorRole: 'Head of School',
        createdAt: '2026-10-24T14:00:00Z',
        pinned: true,
      },
      {
        id: 'ann_3',
        title: 'Mathematics Olympiad Selection Trials',
        content: 'Registration is now open for students interested in representing S.C.O.P.E. at the regional mathematics championship. The first diagnostic round takes place this Friday in Room 304.',
        audience: 'Students',
        priority: 'Normal',
        authorId: 'usr_teacher_sarah',
        authorName: 'Sarah Jenkins',
        authorRole: 'Mathematics Dept Chair',
        createdAt: '2026-10-23T11:30:00Z',
        pinned: false,
      },
    ],
    messages: [
      {
        id: 'msg_1',
        senderId: 'usr_parent_marcus',
        senderName: 'Marcus Rivera',
        senderRole: 'parent',
        senderAvatar: '/src/assets/images/avatar_parent_marcus_1793076912210.jpg',
        recipientId: 'usr_teacher_sarah',
        recipientName: 'Sarah Jenkins',
        recipientRole: 'teacher',
        subject: "Alex's Calculus Progress & Math Olympiad",
        content: 'Hello Ms. Jenkins, thank you for the helpful comments on Alex\'s midterm test. He expressed keen interest in the upcoming Olympiad trials and we want to ensure he balances it well with physics lab reports.',
        sentAt: '2026-10-25T18:20:00Z',
        isRead: true,
      },
      {
        id: 'msg_2',
        senderId: 'usr_teacher_sarah',
        senderName: 'Sarah Jenkins',
        senderRole: 'teacher',
        senderAvatar: '/src/assets/images/avatar_teacher_sarah_1793076912311.jpg',
        recipientId: 'usr_parent_marcus',
        recipientName: 'Marcus Rivera',
        recipientRole: 'parent',
        subject: 'Re: Alex\'s Calculus Progress & Math Olympiad',
        content: 'Good evening Mr. Rivera! Alex has an innate aptitude for analytical reasoning and problem-solving. The Olympiad prep will reinforce his university preparatory trajectory. I will provide curated practice material.',
        sentAt: '2026-10-25T19:05:00Z',
        isRead: true,
      },
      {
        id: 'msg_3',
        senderId: 'usr_student_alex',
        senderName: 'Alex Rivera',
        senderRole: 'student',
        senderAvatar: '/src/assets/images/avatar_student_alex_1793076912128.jpg',
        recipientId: 'usr_teacher_sarah',
        recipientName: 'Sarah Jenkins',
        recipientRole: 'teacher',
        subject: 'Clarification on Question 12 of Problem Set',
        content: 'Dear Ms. Jenkins, when computing the slope of the normal to the curve y = 3x^2 - 4x at x = 2, should we express the perpendicular gradient in fractional or decimal form?',
        sentAt: '2026-10-26T16:15:00Z',
        isRead: false,
      },
    ],
    notifications: [
      {
        id: 'notif_1',
        userId: 'usr_student_alex',
        title: 'New Grade Published',
        message: 'Your Physics Lab Report on Inclined Plane Friction has been graded: 48/50 (A+).',
        priority: 'Important',
        category: 'assignment',
        timestamp: '2026-10-25T12:01:00Z',
        isRead: false,
        linkTab: 'assignments',
      },
      {
        id: 'notif_2',
        userId: 'usr_student_alex',
        title: 'Live Bus Tracking Started',
        message: 'Bus 04 coordinator David Miller started broadcasting GPS updates for Route 4.',
        priority: 'Normal',
        category: 'bus',
        timestamp: '2026-10-26T07:15:00Z',
        isRead: true,
        linkTab: 'bus',
      },
      {
        id: 'notif_3',
        userId: 'usr_parent_marcus',
        title: 'Attendance Confirmed',
        message: 'Alex Rivera was marked Present for Grade 10-A on Monday, Oct 26.',
        priority: 'Normal',
        category: 'attendance',
        timestamp: '2026-10-26T08:15:00Z',
        isRead: true,
        linkTab: 'attendance',
      },
      {
        id: 'notif_4',
        userId: 'usr_parent_marcus',
        title: 'Bus 04 Approaching Stop',
        message: 'Bus 04 is 8 minutes away from Pinehurst Commons & 14th St.',
        priority: 'Important',
        category: 'bus',
        timestamp: '2026-10-26T07:32:00Z',
        isRead: false,
        linkTab: 'bus',
      },
    ],
    auditLogs: [
      {
        id: 'log_1',
        timestamp: '2026-10-26T21:40:00Z',
        actorName: 'Alex Rivera',
        actorRole: 'student',
        action: 'USER_LOGIN',
        category: 'auth',
        status: 'success',
        ipAddress: '192.168.1.104',
        details: 'Successful portal authentication from mobile client.',
      },
      {
        id: 'log_2',
        timestamp: '2026-10-26T21:48:00Z',
        actorName: 'David Miller',
        actorRole: 'bus_coordinator',
        action: 'BUS_TRACKING_START',
        category: 'tracking',
        status: 'success',
        ipAddress: '172.56.21.8',
        details: 'Live GPS broadcasting session initiated for Bus 04 (Route 4).',
      },
      {
        id: 'log_3',
        timestamp: '2026-10-25T12:00:00Z',
        actorName: 'Sarah Jenkins',
        actorRole: 'teacher',
        action: 'SUBMISSION_GRADED',
        category: 'exam',
        status: 'success',
        ipAddress: '192.168.1.55',
        details: 'Evaluated submission for Alex Rivera: 48/50 on Physics Lab Report.',
      },
      {
        id: 'log_4',
        timestamp: '2026-10-22T08:00:00Z',
        actorName: 'Dr. Eleanor Vance',
        actorRole: 'principal',
        action: 'EXAM_RESULTS_PUBLISHED',
        category: 'admin',
        status: 'success',
        ipAddress: '192.168.1.10',
        details: 'Published Autumn Midterm Examination 2026 results for Grade 10-A.',
      },
    ],
  };
}

// Load or initialize DB
function loadDB(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error loading DB file, falling back to initial seed:', err);
  }
  const initial = getInitialDatabase();
  saveDB(initial);
  return initial;
}

function saveDB(data: DatabaseSchema): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save DB:', err);
  }
}

let db = loadDB();

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '25mb' }));

  // Helper log function
  function logAction(actorName: string, actorRole: string, action: string, category: SystemAuditLog['category'], details: string) {
    const entry: SystemAuditLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      actorName,
      actorRole,
      action,
      category,
      status: 'success',
      ipAddress: '127.0.0.1',
      details,
    };
    db.auditLogs.unshift(entry);
    if (db.auditLogs.length > 200) db.auditLogs.pop();
    saveDB(db);
  }

  // Helper notify function
  function createNotification(userId: string, title: string, message: string, priority: Notification['priority'], category: Notification['category'], linkTab?: string) {
    const notif: Notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      userId,
      title,
      message,
      priority,
      category,
      timestamp: new Date().toISOString(),
      isRead: false,
      linkTab,
    };
    db.notifications.unshift(notif);
    saveDB(db);
    return notif;
  }

  // --- AUTH & USER APIS ---
  app.post('/api/auth/login', (req, res) => {
    const { email, password, role } = req.body;
    let user = db.users.find((u) => u.email.toLowerCase() === (email || '').toLowerCase());
    if (!user && role) {
      user = db.users.find((u) => u.role === role);
    }
    if (!user) {
      return res.status(401).json({ error: 'Invalid user credentials.' });
    }
    user.lastLogin = new Date().toISOString();
    logAction(user.name, user.role, 'USER_LOGIN', 'auth', `User logged in as ${user.role} (${user.email})`);
    res.json({ user, token: `token_${user.id}_${Date.now()}` });
  });

  app.get('/api/auth/users', (req, res) => {
    res.json({ users: db.users });
  });

  app.post('/api/auth/users', (req, res) => {
    const { name, email, role, phone, studentInfo, teacherInfo, coordinatorInfo, parentInfo } = req.body;
    if (!name || !email || !role) {
      return res.status(400).json({ error: 'Name, email, and role are required.' });
    }
    const newUser: User = {
      id: `usr_${role}_${Date.now()}`,
      name,
      email,
      role,
      phone: phone || '',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      status: 'active',
      lastLogin: new Date().toISOString(),
      studentInfo,
      teacherInfo,
      coordinatorInfo,
      parentInfo,
    };
    db.users.push(newUser);
    logAction('Administrator', 'principal', 'USER_CREATED', 'admin', `Created new user ${name} (${role})`);
    saveDB(db);
    res.status(201).json({ user: newUser });
  });

  app.put('/api/auth/users/:id', (req, res) => {
    const { id } = req.params;
    const index = db.users.findIndex((u) => u.id === id);
    if (index === -1) return res.status(404).json({ error: 'User not found' });
    db.users[index] = { ...db.users[index], ...req.body };
    logAction(db.users[index].name, db.users[index].role, 'USER_PROFILE_UPDATED', 'auth', 'Profile updated');
    saveDB(db);
    res.json({ user: db.users[index] });
  });

  // --- BUS TRACKING APIS ---
  app.get('/api/bus-tracking/buses', (req, res) => {
    res.json({ buses: db.buses });
  });

  app.get('/api/bus-tracking/status/:busId', (req, res) => {
    const { busId } = req.params;
    const bus = db.buses.find((b) => b.id === busId);
    if (!bus) return res.status(404).json({ error: 'Bus not found' });

    // Check if location is stale (> 3 minutes without update during active session)
    let isStale = false;
    if (bus.status === 'tracking_live' && bus.currentLocation) {
      const diffMs = Date.now() - new Date(bus.currentLocation.updatedAt).getTime();
      if (diffMs > 180000) {
        isStale = true;
      }
    }

    res.json({ bus, isStale });
  });

  app.post('/api/bus-tracking/session', (req, res) => {
    const { busId, action, coordinatorId, coordinatorName } = req.body;
    const bus = db.buses.find((b) => b.id === busId);
    if (!bus) return res.status(404).json({ error: 'Bus not found' });

    if (action === 'start') {
      bus.status = 'tracking_live';
      bus.activeSessionId = `sess_${busId}_${Date.now()}`;
      if (!bus.currentLocation) {
        bus.currentLocation = {
          lat: bus.stops[0]?.lat || 37.7885,
          lng: bus.stops[0]?.lng || -122.4285,
          speed: 0,
          heading: 0,
          accuracy: 5,
          updatedAt: new Date().toISOString(),
          isLive: true,
          sessionMode: 'gps_live',
        };
      } else {
        bus.currentLocation.isLive = true;
        bus.currentLocation.updatedAt = new Date().toISOString();
      }
      logAction(coordinatorName || 'Coordinator', 'bus_coordinator', 'BUS_TRACKING_START', 'tracking', `Live tracking started for ${bus.number} (${bus.routeName})`);

      // Notify parents linked to this bus
      db.users.filter((u) => u.role === 'parent').forEach((parent) => {
        const hasChildOnBus = parent.parentInfo?.children.some((c) => c.busId === busId);
        if (hasChildOnBus) {
          createNotification(parent.id, `Bus ${bus.number} En Route`, `Coordinator has started live tracking for ${bus.routeName}. Tap to view live bus position.`, 'Important', 'bus', 'bus');
        }
      });
    } else {
      bus.status = 'idle';
      bus.activeSessionId = undefined;
      if (bus.currentLocation) {
        bus.currentLocation.isLive = false;
        bus.currentLocation.updatedAt = new Date().toISOString();
      }
      logAction(coordinatorName || 'Coordinator', 'bus_coordinator', 'BUS_TRACKING_STOP', 'tracking', `Live tracking stopped for ${bus.number}`);
    }
    saveDB(db);
    res.json({ bus });
  });

  app.post('/api/bus-tracking/update', (req, res) => {
    const { busId, lat, lng, speed, heading, accuracy, sessionMode, nextStopId, etaMinutes, coordinatorName } = req.body;
    const bus = db.buses.find((b) => b.id === busId);
    if (!bus) return res.status(404).json({ error: 'Bus not found' });

    bus.status = 'tracking_live';
    bus.currentLocation = {
      lat: Number(lat),
      lng: Number(lng),
      speed: Number(speed) || 0,
      heading: Number(heading) || 0,
      accuracy: Number(accuracy) || 5,
      updatedAt: new Date().toISOString(),
      isLive: true,
      sessionMode: sessionMode || 'gps_live',
    };
    if (nextStopId) bus.nextStopId = nextStopId;
    if (typeof etaMinutes === 'number') bus.etaMinutes = etaMinutes;

    saveDB(db);
    res.json({ success: true, bus });
  });

  // --- TIMETABLE APIS ---
  app.get('/api/timetable', (req, res) => {
    const { classId } = req.query;
    if (classId) {
      return res.json({ timetable: db.timetables.filter((t) => t.classId === classId) });
    }
    res.json({ timetable: db.timetables });
  });

  app.post('/api/timetable', (req, res) => {
    const slot: TimetableSlot = {
      id: `tt_${Date.now()}`,
      ...req.body,
    };
    db.timetables.push(slot);
    logAction('Administrator', 'principal', 'TIMETABLE_SLOT_ADDED', 'admin', `Added ${slot.subject} slot for ${slot.classId}`);
    saveDB(db);
    res.status(201).json({ slot });
  });

  // --- NOTES & LEARNING RESOURCES APIS ---
  app.get('/api/notes', (req, res) => {
    const { classId, subject } = req.query;
    let list = db.notes;
    if (classId) list = list.filter((n) => n.classId === classId);
    if (subject) list = list.filter((n) => n.subject.toLowerCase() === String(subject).toLowerCase());
    res.json({ notes: list });
  });

  app.post('/api/notes', (req, res) => {
    const { title, description, classId, className, section, subject, chapter, topic, fileName, fileSize, fileType, fileUrl, uploadedBy, uploadedByName } = req.body;
    const newNote: NoteResource = {
      id: `note_${Date.now()}`,
      title,
      description,
      classId: classId || 'cls_10_a',
      className: className || 'Grade 10',
      section: section || 'A',
      subject,
      chapter: chapter || 'Unit Study',
      topic: topic || 'Core Topics',
      fileUrl: fileUrl || '#',
      fileName: fileName || 'Document.pdf',
      fileSize: fileSize || '2.5 MB',
      fileType: fileType || 'application/pdf',
      uploadedBy,
      uploadedByName,
      uploadedAt: new Date().toISOString(),
    };
    db.notes.unshift(newNote);
    logAction(uploadedByName || 'Teacher', 'teacher', 'NOTE_UPLOADED', 'storage', `Uploaded notes: ${title} (${subject})`);

    // Notify students
    db.users.filter((u) => u.role === 'student' && u.studentInfo?.classId === classId).forEach((s) => {
      createNotification(s.id, `New Study Material: ${subject}`, `${uploadedByName} uploaded "${title}" for ${chapter}.`, 'Normal', 'system', 'notes');
    });

    saveDB(db);
    res.status(201).json({ note: newNote });
  });

  app.delete('/api/notes/:id', (req, res) => {
    const { id } = req.params;
    db.notes = db.notes.filter((n) => n.id !== id);
    saveDB(db);
    res.json({ success: true });
  });

  // --- RECORDINGS APIS ---
  app.get('/api/recordings', (req, res) => {
    const { classId, subject } = req.query;
    let list = db.recordings;
    if (classId) list = list.filter((r) => r.classId === classId);
    if (subject) list = list.filter((r) => r.subject.toLowerCase() === String(subject).toLowerCase());
    res.json({ recordings: list });
  });

  app.post('/api/recordings', (req, res) => {
    const { title, topic, subject, classId, className, section, recordingDate, duration, videoUrl, thumbnailUrl, uploadedBy, uploadedByName } = req.body;
    const newRec: Recording = {
      id: `rec_${Date.now()}`,
      title,
      topic,
      subject,
      classId: classId || 'cls_10_a',
      className: className || 'Grade 10',
      section: section || 'A',
      recordingDate: recordingDate || new Date().toISOString().split('T')[0],
      duration: duration || '45 min',
      videoUrl: videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      thumbnailUrl: thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80',
      uploadedBy,
      uploadedByName,
    };
    db.recordings.unshift(newRec);
    logAction(uploadedByName || 'Teacher', 'teacher', 'RECORDING_UPLOADED', 'storage', `Added lesson recording: ${title}`);
    saveDB(db);
    res.status(201).json({ recording: newRec });
  });

  // --- ASSIGNMENTS & SUBMISSIONS APIS ---
  app.get('/api/assignments', (req, res) => {
    const { classId } = req.query;
    let list = db.assignments;
    if (classId) list = list.filter((a) => a.classId === classId);
    res.json({ assignments: list, submissions: db.submissions });
  });

  app.post('/api/assignments', (req, res) => {
    const { title, description, subject, classId, className, section, deadline, maxMarks, teacherId, teacherName, attachmentName } = req.body;
    const newAsg: Assignment = {
      id: `asg_${Date.now()}`,
      title,
      description,
      subject,
      classId: classId || 'cls_10_a',
      className: className || 'Grade 10',
      section: section || 'A',
      deadline,
      maxMarks: Number(maxMarks) || 100,
      teacherId,
      teacherName,
      createdAt: new Date().toISOString(),
      attachmentName,
    };
    db.assignments.unshift(newAsg);
    logAction(teacherName || 'Teacher', 'teacher', 'ASSIGNMENT_CREATED', 'exam', `Published assignment: ${title} (${subject})`);

    // Notify class students & parents
    db.users.filter((u) => u.role === 'student' && u.studentInfo?.classId === (classId || 'cls_10_a')).forEach((s) => {
      createNotification(s.id, `New Assignment: ${title}`, `${subject} assignment due by ${new Date(deadline).toLocaleDateString()}.`, 'Important', 'assignment', 'assignments');
    });

    saveDB(db);
    res.status(201).json({ assignment: newAsg });
  });

  app.post('/api/assignments/:id/submit', (req, res) => {
    const { id } = req.params;
    const { studentId, studentName, studentRoll, className, section, submissionText, attachmentName } = req.body;

    const existingIndex = db.submissions.findIndex((s) => s.assignmentId === id && s.studentId === studentId);
    const sub: AssignmentSubmission = {
      id: existingIndex !== -1 ? db.submissions[existingIndex].id : `sub_${Date.now()}`,
      assignmentId: id,
      studentId,
      studentName,
      studentRoll,
      className,
      section,
      submissionText: submissionText || '',
      submittedAt: new Date().toISOString(),
      attachmentName: attachmentName || 'Assignment_Submission.pdf',
      status: 'Submitted',
    };

    if (existingIndex !== -1) {
      db.submissions[existingIndex] = { ...db.submissions[existingIndex], ...sub };
    } else {
      db.submissions.unshift(sub);
    }

    logAction(studentName, 'student', 'ASSIGNMENT_SUBMITTED', 'exam', `Submitted work for assignment ${id}`);
    saveDB(db);
    res.json({ submission: sub });
  });

  app.post('/api/assignments/grade', (req, res) => {
    const { submissionId, marksObtained, feedback, teacherName } = req.body;
    const sub = db.submissions.find((s) => s.id === submissionId);
    if (!sub) return res.status(404).json({ error: 'Submission not found' });

    sub.marksObtained = Number(marksObtained);
    sub.feedback = feedback;
    sub.status = 'Reviewed';
    sub.reviewedAt = new Date().toISOString();
    sub.reviewedByName = teacherName;

    logAction(teacherName || 'Teacher', 'teacher', 'ASSIGNMENT_GRADED', 'exam', `Graded submission for ${sub.studentName} with ${marksObtained} marks.`);

    // Notify student & linked parent
    createNotification(sub.studentId, 'Assignment Graded', `Your submission has been reviewed by ${teacherName}. Marks: ${marksObtained}`, 'Important', 'assignment', 'assignments');
    const studentUser = db.users.find((u) => u.id === sub.studentId);
    if (studentUser?.studentInfo?.parentId) {
      createNotification(studentUser.studentInfo.parentId, `${studentUser.name}'s Assignment Graded`, `Marks published for ${sub.studentName}: ${marksObtained}. Feedback available in portal.`, 'Normal', 'assignment', 'academics');
    }

    saveDB(db);
    res.json({ submission: sub });
  });

  // --- ATTENDANCE APIS ---
  app.get('/api/attendance', (req, res) => {
    const { classId, date } = req.query;
    let list = db.attendance;
    if (classId) list = list.filter((a) => a.classId === classId);
    if (date) list = list.filter((a) => a.date === date);
    res.json({ records: list });
  });

  app.post('/api/attendance', (req, res) => {
    const { classId, className, section, date, markedBy, markedByName, entries } = req.body;
    const existingIndex = db.attendance.findIndex((a) => a.classId === classId && a.date === date);

    const record: AttendanceRecord = {
      id: existingIndex !== -1 ? db.attendance[existingIndex].id : `att_${date}_${classId}`,
      classId,
      className,
      section,
      date,
      markedBy,
      markedByName,
      entries,
    };

    if (existingIndex !== -1) {
      db.attendance[existingIndex] = record;
    } else {
      db.attendance.unshift(record);
    }

    logAction(markedByName || 'Teacher', 'teacher', 'ATTENDANCE_RECORDED', 'admin', `Marked attendance for ${className}-${section} on ${date}`);

    // Notify absent/late parents
    entries.forEach((e: AttendanceRecord['entries'][0]) => {
      if (e.status === 'Absent' || e.status === 'Late') {
        const student = db.users.find((u) => u.id === e.studentId);
        if (student?.studentInfo?.parentId) {
          createNotification(student.studentInfo.parentId, `Attendance Notice: ${student.name}`, `${student.name} was marked ${e.status} on ${date}. ${e.notes || ''}`, 'Urgent', 'attendance', 'attendance');
        }
      }
    });

    saveDB(db);
    res.status(201).json({ record });
  });

  // --- EXAMINATIONS & RESULTS APIS ---
  app.get('/api/exams', (req, res) => {
    res.json({ exams: db.exams, results: db.examResults });
  });

  app.post('/api/exams', (req, res) => {
    const { title, classId, className, startDate, endDate, schedule } = req.body;
    const newExam: Exam = {
      id: `exam_${Date.now()}`,
      title,
      classId: classId || 'cls_10_a',
      className: className || 'Grade 10',
      startDate,
      endDate,
      status: 'Scheduled',
      schedule: schedule || [],
    };
    db.exams.unshift(newExam);
    logAction('Administrator', 'principal', 'EXAM_SCHEDULED', 'exam', `Scheduled examination: ${title}`);
    saveDB(db);
    res.status(201).json({ exam: newExam });
  });

  app.post('/api/exams/publish', (req, res) => {
    const { examId, staffName } = req.body;
    const exam = db.exams.find((e) => e.id === examId);
    if (!exam) return res.status(404).json({ error: 'Exam not found' });

    exam.status = 'Published';
    exam.publishedAt = new Date().toISOString();

    // Mark results published
    db.examResults.filter((r) => r.examId === examId).forEach((r) => {
      r.isPublished = true;
      createNotification(r.studentId, 'Official Exam Results Published', `Results for ${exam.title} have been released. Total: ${r.totalObtained}/${r.totalMax} (${r.percentage}%).`, 'Important', 'exam', 'results');
      const student = db.users.find((u) => u.id === r.studentId);
      if (student?.studentInfo?.parentId) {
        createNotification(student.studentInfo.parentId, `Official Exam Results: ${student.name}`, `Results for ${student.name} in ${exam.title} are now accessible in your parent portal.`, 'Important', 'exam', 'academics');
      }
    });

    logAction(staffName || 'Administrator', 'principal', 'EXAM_RESULTS_PUBLISHED', 'exam', `Published results for ${exam.title}`);
    saveDB(db);
    res.json({ exam });
  });

  app.post('/api/exams/results', (req, res) => {
    const { examId, studentId, studentName, rollNumber, classId, className, subjectMarks } = req.body;
    const totalObtained = subjectMarks.reduce((sum: number, s: any) => sum + Number(s.marksObtained), 0);
    const totalMax = subjectMarks.reduce((sum: number, s: any) => sum + Number(s.maxMarks), 0);
    const percentage = totalMax > 0 ? Number(((totalObtained / totalMax) * 100).toFixed(2)) : 0;

    let overallGrade = 'A';
    if (percentage >= 90) overallGrade = 'A+';
    else if (percentage >= 80) overallGrade = 'A';
    else if (percentage >= 70) overallGrade = 'B';
    else if (percentage >= 60) overallGrade = 'C';
    else overallGrade = 'D';

    const existingIndex = db.examResults.findIndex((r) => r.examId === examId && r.studentId === studentId);
    const result: ExamResult = {
      id: existingIndex !== -1 ? db.examResults[existingIndex].id : `res_${Date.now()}`,
      examId,
      studentId,
      studentName,
      rollNumber,
      classId,
      className,
      subjectMarks,
      totalObtained,
      totalMax,
      percentage,
      overallGrade,
      isPublished: true,
    };

    if (existingIndex !== -1) {
      db.examResults[existingIndex] = result;
    } else {
      db.examResults.unshift(result);
    }

    saveDB(db);
    res.json({ result });
  });

  // --- PROJECTS & INNOVATIONS APIS ---
  app.get('/api/projects', (req, res) => {
    res.json({ projects: db.projects });
  });

  app.post('/api/projects', (req, res) => {
    const { title, category, description, studentId, studentName, className, attachmentName } = req.body;
    const project: Project = {
      id: `proj_${Date.now()}`,
      title,
      category,
      description,
      studentId,
      studentName,
      className: className || 'Grade 10-A',
      submittedAt: new Date().toISOString(),
      attachmentName: attachmentName || 'Project_Documentation.pdf',
      attachmentUrl: '#',
      status: 'Submitted',
      showcasedInSchool: false,
      likes: 1,
    };
    db.projects.unshift(project);
    logAction(studentName, 'student', 'PROJECT_SUBMITTED', 'storage', `Submitted innovation project: ${title}`);
    saveDB(db);
    res.status(201).json({ project });
  });

  app.post('/api/projects/:id/review', (req, res) => {
    const { id } = req.params;
    const { status, teacherFeedback, reviewedBy, showcasedInSchool } = req.body;
    const project = db.projects.find((p) => p.id === id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    if (status) project.status = status;
    if (teacherFeedback) project.teacherFeedback = teacherFeedback;
    if (reviewedBy) project.reviewedBy = reviewedBy;
    project.reviewedAt = new Date().toISOString();
    if (typeof showcasedInSchool === 'boolean') project.showcasedInSchool = showcasedInSchool;

    logAction(reviewedBy || 'Teacher', 'teacher', 'PROJECT_REVIEWED', 'admin', `Reviewed project ${project.title}: ${status}`);

    createNotification(project.studentId, 'Project Feedback Available', `Your project "${project.title}" was reviewed. Status: ${project.status}`, 'Normal', 'system', 'projects');

    saveDB(db);
    res.json({ project });
  });

  app.post('/api/projects/:id/like', (req, res) => {
    const { id } = req.params;
    const proj = db.projects.find((p) => p.id === id);
    if (!proj) return res.status(404).json({ error: 'Project not found' });
    proj.likes += 1;
    saveDB(db);
    res.json({ likes: proj.likes });
  });

  // --- CLOUD STORAGE APIS ---
  app.get('/api/storage', (req, res) => {
    const usedBytes = db.cloudFiles.reduce((acc, f) => acc + f.sizeBytes, 0);
    res.json({ files: db.cloudFiles, usedBytes, totalBytes: 5368709120 }); // 5 GB quota
  });

  app.post('/api/storage', (req, res) => {
    const { name, folder, fileType, sizeBytes, uploadedBy, uploadedByName, uploadedByRole, permission, fileUrl } = req.body;
    const bytes = Number(sizeBytes) || 1048576;
    const sizeStr = bytes > 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;

    const file: CloudFile = {
      id: `file_${Date.now()}`,
      name: name || 'Document.pdf',
      folder: folder || 'General',
      size: sizeStr,
      sizeBytes: bytes,
      fileType: fileType || 'application/pdf',
      uploadedBy,
      uploadedByName,
      uploadedByRole,
      uploadedAt: new Date().toISOString(),
      permission: permission || 'Public',
      fileUrl: fileUrl || '#',
    };
    db.cloudFiles.unshift(file);
    logAction(uploadedByName || 'User', uploadedByRole || 'student', 'CLOUD_FILE_UPLOADED', 'storage', `Uploaded file: ${file.name} to ${file.folder}`);
    saveDB(db);
    res.status(201).json({ file });
  });

  app.delete('/api/storage/:id', (req, res) => {
    const { id } = req.params;
    const file = db.cloudFiles.find((f) => f.id === id);
    if (file) {
      logAction('User', file.uploadedByRole, 'CLOUD_FILE_DELETED', 'storage', `Deleted file: ${file.name}`);
    }
    db.cloudFiles = db.cloudFiles.filter((f) => f.id !== id);
    saveDB(db);
    res.json({ success: true });
  });

  // --- ANNOUNCEMENTS APIS ---
  app.get('/api/announcements', (req, res) => {
    res.json({ announcements: db.announcements });
  });

  app.post('/api/announcements', (req, res) => {
    const { title, content, audience, priority, authorId, authorName, authorRole, pinned } = req.body;
    const announcement: Announcement = {
      id: `ann_${Date.now()}`,
      title,
      content,
      audience: audience || 'All School',
      priority: priority || 'Normal',
      authorId,
      authorName,
      authorRole,
      createdAt: new Date().toISOString(),
      pinned: !!pinned,
    };
    db.announcements.unshift(announcement);
    logAction(authorName, authorRole, 'ANNOUNCEMENT_PUBLISHED', 'admin', `Published announcement: ${title} (${audience})`);

    // Broadcast notifications to relevant users
    db.users.forEach((u) => {
      let matches = false;
      if (audience === 'All School') matches = true;
      else if (audience === 'Parents' && u.role === 'parent') matches = true;
      else if (audience === 'Teachers' && u.role === 'teacher') matches = true;
      else if (audience === 'Students' && u.role === 'student') matches = true;
      if (matches) {
        createNotification(u.id, title, content.slice(0, 100) + '...', priority, 'system', 'announcements');
      }
    });

    saveDB(db);
    res.status(201).json({ announcement });
  });

  // --- MESSAGING APIS ---
  app.get('/api/messages', (req, res) => {
    const { userId, role } = req.query;
    // For normal users, only return their conversations
    if (role === 'principal') {
      // Principal can view messages for administrative audit (read-only audit view)
      return res.json({ messages: db.messages });
    }
    const userMsgs = db.messages.filter((m) => m.senderId === userId || m.recipientId === userId);
    res.json({ messages: userMsgs });
  });

  app.post('/api/messages', (req, res) => {
    const { senderId, senderName, senderRole, senderAvatar, recipientId, recipientName, recipientRole, subject, content } = req.body;
    const msg: Message = {
      id: `msg_${Date.now()}`,
      senderId,
      senderName,
      senderRole,
      senderAvatar: senderAvatar || '',
      recipientId,
      recipientName,
      recipientRole,
      subject: subject || 'Message',
      content,
      sentAt: new Date().toISOString(),
      isRead: false,
    };
    db.messages.unshift(msg);
    logAction(senderName, senderRole, 'MESSAGE_SENT', 'security', `Sent message to ${recipientName} (${subject})`);

    createNotification(recipientId, `Message from ${senderName}`, subject, 'Normal', 'message', 'messages');

    saveDB(db);
    res.status(201).json({ message: msg });
  });

  app.post('/api/messages/:id/read', (req, res) => {
    const { id } = req.params;
    const msg = db.messages.find((m) => m.id === id);
    if (msg) {
      msg.isRead = true;
      saveDB(db);
    }
    res.json({ success: true });
  });

  // --- NOTIFICATIONS APIS ---
  app.get('/api/notifications', (req, res) => {
    const { userId } = req.query;
    const notifs = db.notifications.filter((n) => n.userId === userId);
    res.json({ notifications: notifs });
  });

  app.post('/api/notifications/mark-read', (req, res) => {
    const { notificationId, userId } = req.body;
    if (notificationId) {
      const n = db.notifications.find((item) => item.id === notificationId);
      if (n) n.isRead = true;
    } else if (userId) {
      db.notifications.filter((n) => n.userId === userId).forEach((n) => (n.isRead = true));
    }
    saveDB(db);
    res.json({ success: true });
  });

  // --- SERVER STATUS & ADMIN METRICS APIS ---
  app.get('/api/admin/server-status', (req, res) => {
    const uptimeSeconds = Math.floor((Date.now() - SERVER_START_TIME) / 1000);
    const hours = Math.floor(uptimeSeconds / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = uptimeSeconds % 60;
    const uptimeFormatted = `${hours}h ${minutes}m ${seconds}s`;

    const storageUsedBytes = db.cloudFiles.reduce((sum, f) => sum + f.sizeBytes, 0);
    const storageTotalBytes = 5368709120; // 5 GB
    const storageUsagePercent = Number(((storageUsedBytes / storageTotalBytes) * 100).toFixed(1));

    const activeTrackingSessions = db.buses.filter((b) => b.status === 'tracking_live').length;
    const activeUsersCount = db.users.filter((u) => u.status === 'active').length;
    const totalDbRecords = db.users.length + db.timetables.length + db.notes.length + db.recordings.length + db.assignments.length + db.submissions.length + db.attendance.length + db.exams.length + db.examResults.length + db.projects.length + db.cloudFiles.length + db.announcements.length + db.messages.length + db.notifications.length + db.auditLogs.length;

    const health: ServerHealth = {
      status: 'healthy',
      uptimeSeconds,
      uptimeFormatted,
      dbLatencyMs: Math.floor(Math.random() * 4) + 2, // 2-5ms local latency
      storageUsedBytes,
      storageTotalBytes,
      storageUsagePercent,
      activeUsersCount,
      activeTrackingSessions,
      lastBackupTimestamp: '2026-10-26T18:00:00Z',
      totalDbRecords,
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || 'development',
    };

    res.json({
      health,
      auditLogs: db.auditLogs.slice(0, 50),
    });
  });

  app.post('/api/admin/trigger-backup', (req, res) => {
    const backupId = `bkp_${Date.now()}`;
    const backupPath = path.join(DATA_DIR, `scope_backup_${Date.now()}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(db, null, 2), 'utf-8');
    logAction('Administrator', 'principal', 'DATABASE_BACKUP_CREATED', 'admin', `Created snapshot backup: ${backupId}`);
    res.json({ success: true, backupId, timestamp: new Date().toISOString() });
  });

  // --- PROJECT EXPORT ZIP DOWNLOAD API ---
  app.get('/api/export/download-zip', async (req, res) => {
    try {
      const zip = new JSZip();

      function addDirectoryToZip(dirPath: string, zipFolder: JSZip) {
        const entries = fs.readdirSync(dirPath);
        for (const entry of entries) {
          if (entry === 'node_modules' || entry === '.git' || entry === 'dist' || entry === '.aistudio') {
            continue;
          }
          const fullPath = path.join(dirPath, entry);
          const stat = fs.statSync(fullPath);
          if (stat.isDirectory()) {
            const nested = zipFolder.folder(entry);
            if (nested) {
              addDirectoryToZip(fullPath, nested);
            }
          } else {
            const content = fs.readFileSync(fullPath);
            zipFolder.file(entry, content);
          }
        }
      }

      addDirectoryToZip(__dirname, zip);
      const zipBuffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });

      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename="scope-school-platform.zip"');
      res.setHeader('Content-Length', zipBuffer.length);
      res.send(zipBuffer);
    } catch (err: any) {
      console.error('Failed to create zip download:', err);
      res.status(500).json({ error: 'Failed to create zip package' });
    }
  });

  // --- VITE DEV OR PRODUCTION STATIC SERVING ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`S.C.O.P.E. backend server active at http://0.0.0.0:${PORT}`);
  });
}

startServer();
