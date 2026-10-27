import React, { useState } from 'react';
import {
  Calendar,
  BookOpen,
  Video,
  FileCheck,
  CheckCircle,
  Clock,
  Navigation,
  Sparkles,
  Download,
  Upload,
  User,
  Heart,
  ExternalLink,
  ChevronRight,
  Send,
} from 'lucide-react';
import type {
  User as UserType,
  TimetableSlot,
  NoteResource,
  Recording,
  Assignment,
  AssignmentSubmission,
  AttendanceRecord,
  Exam,
  ExamResult,
  Project,
  Announcement,
  Bus,
} from '../../types';
import { BusMap } from '../BusMap';
import { api } from '../../api';

interface StudentDashboardProps {
  user: UserType;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  timetable: TimetableSlot[];
  notes: NoteResource[];
  recordings: Recording[];
  assignments: Assignment[];
  submissions: AssignmentSubmission[];
  attendance: AttendanceRecord[];
  exams: Exam[];
  examResults: ExamResult[];
  projects: Project[];
  announcements: Announcement[];
  bus?: Bus;
  isBusStale?: boolean;
  onRefreshData: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  user,
  activeTab,
  onSelectTab,
  timetable,
  notes,
  recordings,
  assignments,
  submissions,
  attendance,
  exams,
  examResults,
  projects,
  announcements,
  bus,
  isBusStale,
  onRefreshData,
}) => {
  // Local state for assignments submission modal / form
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Local state for project submission
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [projTitle, setProjTitle] = useState('');
  const [projCategory, setProjCategory] = useState<Project['category']>('Robotics & AI');
  const [projDesc, setProjDesc] = useState('');
  const [projDocName, setProjDocName] = useState('');

  // Active recording playing
  const [activeVideo, setActiveVideo] = useState<Recording | null>(null);

  // Search filter for notes
  const [notesFilter, setNotesFilter] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('All');

  // Days filter for schedule
  const [selectedDay, setSelectedDay] = useState<TimetableSlot['day']>('Monday');

  // Compute attendance stats
  let totalDaysCount = 0;
  let presentDaysCount = 0;
  attendance.forEach((rec) => {
    const entry = rec.entries.find((e) => e.studentId === user.id);
    if (entry) {
      totalDaysCount++;
      if (entry.status === 'Present' || entry.status === 'Late') presentDaysCount++;
    }
  });
  const attendanceRate = totalDaysCount > 0 ? Math.round((presentDaysCount / totalDaysCount) * 100) : 98;

  // Filter student submissions
  const studentSubmissionsMap = new Map(submissions.filter((s) => s.studentId === user.id).map((s) => [s.assignmentId, s]));

  // Handle assignment submission
  const handleSubmitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment) return;
    setIsSubmitting(true);
    try {
      await api.submitAssignment(selectedAssignment.id, {
        studentId: user.id,
        studentName: user.name,
        studentRoll: user.studentInfo?.rollNumber || '10A-14',
        className: user.studentInfo?.className || 'Grade 10',
        section: user.studentInfo?.section || 'A',
        submissionText,
        attachmentName: attachmentName || `${user.name.replace(' ', '_')}_Submission.pdf`,
      });
      setSelectedAssignment(null);
      setSubmissionText('');
      setAttachmentName('');
      onRefreshData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle project submission
  const handleSubmitProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projTitle.trim() || !projDesc.trim()) return;
    try {
      await api.submitProject({
        title: projTitle,
        category: projCategory,
        description: projDesc,
        studentId: user.id,
        studentName: user.name,
        className: `${user.studentInfo?.className}-${user.studentInfo?.section}`,
        attachmentName: projDocName || 'Project_Documentation.pdf',
      });
      setShowProjectModal(false);
      setProjTitle('');
      setProjDesc('');
      setProjDocName('');
      onRefreshData();
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered notes
  const filteredNotes = notes.filter((n) => {
    const matchesSubject = selectedSubjectFilter === 'All' || n.subject === selectedSubjectFilter;
    const matchesSearch =
      n.title.toLowerCase().includes(notesFilter.toLowerCase()) ||
      n.description.toLowerCase().includes(notesFilter.toLowerCase()) ||
      n.chapter.toLowerCase().includes(notesFilter.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  // Unique subjects
  const subjectsList = Array.from(new Set(notes.map((n) => n.subject)));

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
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
              <span className="text-xs font-mono font-semibold px-2 py-0.5 bg-sky-50 text-sky-700 rounded-md border border-sky-100">
                {user.studentInfo?.className}-{user.studentInfo?.section} · Roll #{user.studentInfo?.rollNumber}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Academic Term 2026–2027 · Parent Linked: <span className="font-medium text-slate-700">{user.studentInfo?.parentName}</span>
            </p>
          </div>
        </div>

        {/* Quick Stat Badges */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2 text-center">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Attendance</span>
            <span className="text-lg font-bold font-mono text-emerald-600">{attendanceRate}%</span>
          </div>
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2 text-center">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Assignments</span>
            <span className="text-lg font-bold font-mono text-sky-600">
              {assignments.length - studentSubmissionsMap.size} Pending
            </span>
          </div>
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2 text-center">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">GPA / Grade</span>
            <span className="text-lg font-bold font-mono text-slate-900">
              {examResults[0]?.overallGrade || 'A+'} ({examResults[0]?.percentage || 92.8}%)
            </span>
          </div>
        </div>
      </div>

      {/* OVERVIEW TAB */}
      {(activeTab === 'overview' || !activeTab) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1 & 2: Daily schedule, pending homework, announcements */}
          <div className="lg:col-span-2 space-y-6">
            {/* Today's Schedule Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-sky-600" />
                  <h2 className="text-sm font-bold text-slate-900">Today&apos;s Class Timetable (Monday)</h2>
                </div>
                <button
                  onClick={() => onSelectTab('timetable')}
                  className="text-xs font-semibold text-sky-600 hover:underline flex items-center gap-1"
                >
                  Full Weekly Schedule &rarr;
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {timetable
                  .filter((t) => t.day === 'Monday')
                  .slice(0, 4)
                  .map((slot) => (
                    <div key={slot.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50/60 flex items-start justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">{slot.subject}</span>
                        <span className="text-xs text-slate-500">{slot.teacherName} · {slot.room}</span>
                      </div>
                      <span className="text-[11px] font-mono font-medium text-sky-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {slot.startTime}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Pending Assignments */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-amber-600" />
                  <h2 className="text-sm font-bold text-slate-900">Pending Homework & Deadlines</h2>
                </div>
                <button
                  onClick={() => onSelectTab('assignments')}
                  className="text-xs font-semibold text-sky-600 hover:underline"
                >
                  View All ({assignments.length}) &rarr;
                </button>
              </div>

              <div className="space-y-3">
                {assignments.map((asg) => {
                  const sub = studentSubmissionsMap.get(asg.id);
                  const isSubmitted = sub && sub.status !== 'In Progress';
                  return (
                    <div
                      key={asg.id}
                      className="p-3.5 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{asg.title}</span>
                          <span className="text-[11px] text-slate-400">· {asg.subject}</span>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{asg.description}</p>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1.5 font-mono">
                          <span>Due: {new Date(asg.deadline).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                          <span>· Max: {asg.maxMarks} pts</span>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        {isSubmitted ? (
                          <div className="text-right">
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                              <CheckCircle className="w-3.5 h-3.5" />
                              {sub.status === 'Reviewed' ? `${sub.marksObtained}/${asg.maxMarks} pts` : 'Submitted'}
                            </span>
                          </div>
                        ) : (
                          <button
                            onClick={() => setSelectedAssignment(asg)}
                            className="px-3 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Submit Work</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* School Announcements */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <h2 className="text-sm font-bold text-slate-900 mb-3">Recent School Announcements</h2>
              <div className="divide-y divide-slate-100">
                {announcements.slice(0, 3).map((ann) => (
                  <div key={ann.id} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-xs font-bold text-slate-900">{ann.title}</h3>
                      <span className="text-[10px] font-mono text-slate-400">
                        {new Date(ann.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{ann.content}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">Author: {ann.authorName} ({ann.authorRole})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Column 3: Live Bus card & Academic result preview */}
          <div className="space-y-6">
            {/* Live Bus Tracking Card */}
            {bus && (
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-sky-600" />
                    <h3 className="text-sm font-bold text-slate-900">Your School Bus ({bus.number})</h3>
                  </div>
                  <button
                    onClick={() => onSelectTab('bus')}
                    className="text-xs font-semibold text-sky-600 hover:underline"
                  >
                    Open Live Tracker &rarr;
                  </button>
                </div>

                <div className="mb-3">
                  <BusMap bus={bus} isStale={isBusStale} height="220px" />
                </div>

                <div className="text-xs space-y-1.5 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Route:</span>
                    <span className="font-semibold text-slate-800">{bus.routeName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Coordinator:</span>
                    <span className="font-medium text-slate-800">{bus.coordinatorName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">ETA to Stop:</span>
                    <span className="font-bold text-sky-700">
                      {bus.status === 'tracking_live' && !isBusStale ? `${bus.etaMinutes || 8} minutes` : 'Bus Idle'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Official Report Card preview */}
            {examResults.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-900">Midterm Examination Result</h3>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Grade {examResults[0].overallGrade}
                  </span>
                </div>
                <div className="space-y-2 mb-4">
                  {examResults[0].subjectMarks.map((sm) => (
                    <div key={sm.subject} className="flex items-center justify-between text-xs py-1 border-b border-slate-50">
                      <span className="text-slate-600">{sm.subject}</span>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="font-bold text-slate-900">{sm.marksObtained}/{sm.maxMarks}</span>
                        <span className="text-[11px] font-semibold text-sky-600">({sm.grade})</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 bg-sky-50/50 rounded-lg border border-sky-100 flex items-center justify-between text-xs font-mono">
                  <span className="font-medium text-slate-600">Total Score:</span>
                  <span className="font-bold text-sky-800">
                    {examResults[0].totalObtained} / {examResults[0].totalMax} ({examResults[0].percentage}%) · Rank #{examResults[0].rank}
                  </span>
                </div>
              </div>
            )}

            {/* Quick Action: Innovation Projects */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-5 text-white shadow-xs">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold">Innovation & Science Showcase</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Have an invention, robotics build, or environmental project? Submit it to have it reviewed and displayed in the school showcase!
              </p>
              <button
                onClick={() => setShowProjectModal(true)}
                className="w-full py-2 bg-sky-500 hover:bg-sky-400 text-white rounded-lg text-xs font-bold transition-colors"
              >
                Submit New Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TIMETABLE TAB */}
      {activeTab === 'timetable' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-base font-bold text-slate-900">Grade 10-A Weekly Class Timetable</h2>
              <p className="text-xs text-slate-500">Room 304 · Academic Schedule 2026</p>
            </div>
            {/* Day Selector Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              {(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as TimetableSlot['day'][]).map((day) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    selectedDay === day ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 divide-y divide-slate-100">
            {timetable
              .filter((slot) => slot.day === selectedDay)
              .map((slot) => (
                <div key={slot.id} className="py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-mono font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded border border-sky-100">
                      {slot.startTime} – {slot.endTime}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{slot.subject}</h3>
                      <p className="text-xs text-slate-500">{slot.teacherName} · {slot.room}</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-slate-400 font-mono">{slot.room}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* LEARNING MATERIALS & NOTES TAB */}
      {activeTab === 'notes' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <h2 className="text-base font-bold text-slate-900">Subject Notes & Educational Resources</h2>
                <p className="text-xs text-slate-500">Official syllabus notes uploaded by your course instructors</p>
              </div>

              {/* Search & Subject filter */}
              <div className="flex items-center gap-2">
                <select
                  value={selectedSubjectFilter}
                  onChange={(e) => setSelectedSubjectFilter(e.target.value)}
                  className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none"
                >
                  <option value="All">All Subjects</option>
                  {subjectsList.map((subj) => (
                    <option key={subj} value={subj}>{subj}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Search chapter or topic..."
                  value={notesFilter}
                  onChange={(e) => setNotesFilter(e.target.value)}
                  className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              {filteredNotes.map((note) => (
                <div key={note.id} className="p-4 rounded-xl border border-slate-200 hover:border-sky-300 transition-colors flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                      <span className="font-bold text-sky-700">{note.subject}</span>
                      <span>{note.chapter}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{note.title}</h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-2">{note.description}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-mono text-[11px]">{note.fileName} ({note.fileSize})</span>
                    <a
                      href={note.fileUrl}
                      download={note.fileName}
                      className="px-2.5 py-1 text-xs font-semibold text-sky-700 hover:bg-sky-50 rounded flex items-center gap-1 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recorded Lessons Video Library */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 mb-1">Recorded Video Lessons</h2>
            <p className="text-xs text-slate-500 mb-4">Watch classroom lectures and experiment demonstrations on demand</p>

            {activeVideo && (
              <div className="mb-6 p-4 rounded-xl bg-slate-900 text-white">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                  <div>
                    <span className="text-xs font-bold text-sky-400">{activeVideo.subject} · {activeVideo.topic}</span>
                    <h3 className="text-base font-bold">{activeVideo.title}</h3>
                  </div>
                  <button onClick={() => setActiveVideo(null)} className="text-xs text-slate-400 hover:text-white">
                    Close Player
                  </button>
                </div>
                <div className="aspect-video w-full rounded-lg overflow-hidden bg-black flex items-center justify-center">
                  <video controls className="w-full h-full" src={activeVideo.videoUrl} autoPlay poster={activeVideo.thumbnailUrl}>
                    Your browser does not support HTML5 video.
                  </video>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recordings.map((rec) => (
                <div key={rec.id} className="rounded-xl border border-slate-200 overflow-hidden flex flex-col">
                  <div className="relative aspect-video bg-slate-100">
                    <img src={rec.thumbnailUrl} alt={rec.title} className="w-full h-full object-cover" />
                    <button
                      onClick={() => setActiveVideo(rec)}
                      className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-white/90 text-slate-900 flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                    >
                      <Video className="w-5 h-5 fill-slate-900 text-slate-900 ml-0.5" />
                    </button>
                    <span className="absolute bottom-2 right-2 bg-slate-900/80 text-white text-[10px] font-mono font-bold px-1.5 py-0.5 rounded">
                      {rec.duration}
                    </span>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-sky-700">{rec.subject} · {rec.topic}</span>
                      <h4 className="text-xs font-bold text-slate-900 mt-0.5">{rec.title}</h4>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Instructor: {rec.uploadedByName}</span>
                      <span>{rec.recordingDate}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ASSIGNMENTS TAB */}
      {activeTab === 'assignments' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-base font-bold text-slate-900">Homework & Assignment Submissions</h2>
              <p className="text-xs text-slate-500">Submit homework files, view deadlines, and check teacher feedback</p>
            </div>
          </div>

          <div className="space-y-4">
            {assignments.map((asg) => {
              const sub = studentSubmissionsMap.get(asg.id);
              const isReviewed = sub?.status === 'Reviewed';
              return (
                <div key={asg.id} className="p-5 rounded-xl border border-slate-200 bg-white space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-sky-700">{asg.subject}</span>
                        <span className="text-xs text-slate-400">· Posted by {asg.teacherName}</span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 mt-1">{asg.title}</h3>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{asg.description}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono font-bold text-slate-700">Max Marks: {asg.maxMarks}</span>
                      <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                        Due: {new Date(asg.deadline).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </p>
                    </div>
                  </div>

                  {/* Submission status or Review */}
                  <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {sub ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                            isReviewed ? 'bg-emerald-50 text-emerald-700' : 'bg-sky-50 text-sky-700'
                          }`}>
                            Status: {sub.status}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            Submitted: {new Date(sub.submittedAt).toLocaleDateString()}
                          </span>
                        </div>
                        {isReviewed && (
                          <div className="p-2.5 bg-emerald-50/50 rounded-lg border border-emerald-100 text-xs">
                            <p className="font-bold text-emerald-900">
                              Grade Awarded: {sub.marksObtained} / {asg.maxMarks} pts
                            </p>
                            <p className="text-emerald-800 mt-0.5 italic">&quot;{sub.feedback}&quot;</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-amber-700 font-medium">Pending submission</span>
                    )}

                    {!sub && (
                      <button
                        onClick={() => setSelectedAssignment(asg)}
                        className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg flex items-center gap-1.5 self-end sm:self-auto transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Submit Work</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* BUS TRACKER TAB */}
      {activeTab === 'bus' && bus && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900">{bus.number} · Live Transport Tracker</h2>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    bus.status === 'tracking_live' && !isBusStale ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {bus.status === 'tracking_live' && !isBusStale ? 'BROADCASTING LIVE' : 'IDLE / OFFLINE'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{bus.routeName} · Driver: {bus.driverName} ({bus.driverPhone})</p>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-slate-500">Coordinator:</span>
                <span className="font-bold text-slate-800">{bus.coordinatorName}</span>
              </div>
            </div>

            <div className="mt-4">
              <BusMap bus={bus} isStale={isBusStale} height="480px" />
            </div>

            {/* Stops Timeline */}
            <div className="mt-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Route Stops & Timetable</h3>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                {bus.stops.map((stop, idx) => (
                  <div
                    key={stop.id}
                    className={`p-3 rounded-lg border text-xs ${
                      bus.nextStopId === stop.id
                        ? 'border-amber-300 bg-amber-50/60 ring-2 ring-amber-100'
                        : 'border-slate-200 bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900">Stop #{idx + 1}</span>
                      <span className="font-mono text-slate-500 font-semibold">{stop.scheduledTime}</span>
                    </div>
                    <p className="text-slate-700 font-medium truncate">{stop.name}</p>
                    {bus.nextStopId === stop.id && (
                      <span className="text-[10px] font-bold text-amber-700 mt-1 block">Next Stop</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PROJECTS TAB */}
      {activeTab === 'projects' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <h2 className="text-base font-bold text-slate-900">Projects & Innovation Showcase</h2>
                <p className="text-xs text-slate-500">Student research, robotics prototypes, and creative achievements</p>
              </div>
              <button
                onClick={() => setShowProjectModal(true)}
                className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Submit New Project</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              {projects.map((proj) => (
                <div key={proj.id} className="p-5 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-bold text-sky-700">{proj.category}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        proj.status === 'Showcased' ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {proj.status}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{proj.title}</h3>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">{proj.description}</p>
                    {proj.teacherFeedback && (
                      <div className="mt-3 p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                        <span className="font-semibold text-slate-700">Teacher Feedback:</span>
                        <p className="text-slate-600 italic mt-0.5">&quot;{proj.teacherFeedback}&quot;</p>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>By {proj.studentName} ({proj.className})</span>
                    <button
                      onClick={() => api.likeProject(proj.id).then(onRefreshData)}
                      className="flex items-center gap-1 text-rose-600 hover:text-rose-700 font-medium"
                    >
                      <Heart className="w-3.5 h-3.5 fill-rose-600" />
                      <span className="font-mono">{proj.likes}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUBMISSION MODAL */}
      {selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 mb-1">Submit Assignment</h3>
            <p className="text-xs text-slate-500 mb-4">{selectedAssignment.title} ({selectedAssignment.subject})</p>

            <form onSubmit={handleSubmitAssignment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Submission Notes / Text
                </label>
                <textarea
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  placeholder="Provide any explanations, answers, or comments for the teacher..."
                  rows={4}
                  required
                  className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Attach Document / File Name
                </label>
                <input
                  type="text"
                  value={attachmentName}
                  onChange={(e) => setAttachmentName(e.target.value)}
                  placeholder="e.g. AlexRivera_Calculus_Homework.pdf"
                  className="w-full text-xs rounded-lg border border-slate-300 p-2 focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedAssignment(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs transition-colors"
                >
                  {isSubmitting ? 'Uploading...' : 'Submit to Teacher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROJECT SUBMIT MODAL */}
      {showProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 mb-1">Submit Innovation Project</h3>
            <p className="text-xs text-slate-500 mb-4">Share your technical or creative project for review and school showcase</p>

            <form onSubmit={handleSubmitProject} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Project Title
                </label>
                <input
                  type="text"
                  value={projTitle}
                  onChange={(e) => setProjTitle(e.target.value)}
                  placeholder="e.g. Smart IoT Soil Moisture Sensor"
                  required
                  className="w-full text-xs rounded-lg border border-slate-300 p-2 focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Category
                </label>
                <select
                  value={projCategory}
                  onChange={(e) => setProjCategory(e.target.value as any)}
                  className="w-full text-xs rounded-lg border border-slate-300 p-2 focus:border-sky-500 focus:outline-none bg-white"
                >
                  <option value="Robotics & AI">Robotics & AI</option>
                  <option value="Environmental Science">Environmental Science</option>
                  <option value="Software & Web">Software & Web</option>
                  <option value="Creative Arts">Creative Arts</option>
                  <option value="Social Innovation">Social Innovation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Summary / Description
                </label>
                <textarea
                  value={projDesc}
                  onChange={(e) => setProjDesc(e.target.value)}
                  rows={4}
                  placeholder="Explain your motivation, methodology, findings, and innovation..."
                  required
                  className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Documentation File Name
                </label>
                <input
                  type="text"
                  value={projDocName}
                  onChange={(e) => setProjDocName(e.target.value)}
                  placeholder="e.g. Sensor_Prototype_Report.pdf"
                  className="w-full text-xs rounded-lg border border-slate-300 p-2 focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProjectModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs transition-colors"
                >
                  Submit Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
