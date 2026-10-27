import React, { useState } from 'react';
import {
  Users,
  CheckSquare,
  FilePlus,
  Video,
  Upload,
  Calendar,
  Award,
  Sparkles,
  BookOpen,
  CheckCircle,
  Clock,
  Send,
  MessageSquare,
} from 'lucide-react';
import type {
  User,
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
} from '../../types';
import { api } from '../../api';

interface TeacherDashboardProps {
  user: User;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  allUsers: User[];
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
  onRefreshData: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  user,
  activeTab,
  onSelectTab,
  allUsers,
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
  onRefreshData,
}) => {
  // --- Modals State ---
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showRecordingModal, setShowRecordingModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedSubmissionToGrade, setSelectedSubmissionToGrade] = useState<AssignmentSubmission | null>(null);
  const [gradeMarks, setGradeMarks] = useState<number>(45);
  const [gradeFeedback, setGradeFeedback] = useState('');

  // --- Note Form State ---
  const [noteTitle, setNoteTitle] = useState('');
  const [noteSubject, setNoteSubject] = useState('Mathematics');
  const [noteChapter, setNoteChapter] = useState('Chapter 5: Vectors & Geometry');
  const [noteDesc, setNoteDesc] = useState('');
  const [noteFileName, setNoteFileName] = useState('Vectors_Summary_Handout.pdf');

  // --- Recording Form State ---
  const [recTitle, setRecTitle] = useState('');
  const [recTopic, setRecTopic] = useState('Newtonian Dynamics & Free Body Diagrams');
  const [recSubject, setRecSubject] = useState('Physics');
  const [recVideoUrl, setRecVideoUrl] = useState('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
  const [recDuration, setRecDuration] = useState('45 min');

  // --- Assignment Creation State ---
  const [asgTitle, setAsgTitle] = useState('');
  const [asgSubject, setAsgSubject] = useState('Mathematics');
  const [asgClass, setAsgClass] = useState('cls_10_a');
  const [asgDeadline, setAsgDeadline] = useState('2026-11-05T23:59');
  const [asgMarks, setAsgMarks] = useState(50);
  const [asgDesc, setAsgDesc] = useState('');
  const [asgAttachName, setAsgAttachName] = useState('Problem_Set_Nov2026.pdf');

  // --- Attendance Management State ---
  const [attDate, setAttDate] = useState('2026-10-26');
  const [attClass, setAttClass] = useState('cls_10_a');
  const studentsList = allUsers.filter((u) => u.role === 'student');
  const [attStatuses, setAttStatuses] = useState<Record<string, 'Present' | 'Absent' | 'Late' | 'Excused'>>({
    usr_student_alex: 'Present',
    usr_student_maya: 'Present',
  });
  const [attendanceSavedNotice, setAttendanceSavedNotice] = useState(false);

  // --- Project Review State ---
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projReviewStatus, setProjReviewStatus] = useState<Project['status']>('Approved');
  const [projTeacherFeedback, setProjTeacherFeedback] = useState('');
  const [projShowcaseCheck, setProjShowcaseCheck] = useState(true);

  // --- Exam Marks Entry State ---
  const [selectedExamId, setSelectedExamId] = useState(exams[0]?.id || 'exam_midterm_2026');
  const [examMarksStudentId, setExamMarksStudentId] = useState('usr_student_alex');
  const [examMarksSubject, setExamMarksSubject] = useState('Physics');
  const [examMarksVal, setExamMarksVal] = useState(94);
  const [examFeedbackVal, setExamFeedbackVal] = useState('Terrific analytical precision.');

  // Handle uploading note
  const handleUploadNote = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.uploadNote({
      title: noteTitle,
      subject: noteSubject,
      chapter: noteChapter,
      description: noteDesc,
      fileName: noteFileName,
      fileSize: '3.2 MB',
      fileType: 'application/pdf',
      classId: 'cls_10_a',
      className: 'Grade 10',
      section: 'A',
      uploadedBy: user.id,
      uploadedByName: user.name,
    });
    setShowNoteModal(false);
    setNoteTitle('');
    setNoteDesc('');
    onRefreshData();
  };

  // Handle uploading recording
  const handleUploadRecording = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.uploadRecording({
      title: recTitle,
      topic: recTopic,
      subject: recSubject,
      videoUrl: recVideoUrl,
      duration: recDuration,
      classId: 'cls_10_a',
      className: 'Grade 10',
      section: 'A',
      recordingDate: new Date().toISOString().split('T')[0],
      uploadedBy: user.id,
      uploadedByName: user.name,
    });
    setShowRecordingModal(false);
    setRecTitle('');
    onRefreshData();
  };

  // Handle creating assignment
  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.createAssignment({
      title: asgTitle,
      subject: asgSubject,
      classId: asgClass,
      className: 'Grade 10',
      section: 'A',
      deadline: new Date(asgDeadline).toISOString(),
      maxMarks: asgMarks,
      description: asgDesc,
      attachmentName: asgAttachName,
      teacherId: user.id,
      teacherName: user.name,
    });
    setShowAssignmentModal(false);
    setAsgTitle('');
    setAsgDesc('');
    onRefreshData();
  };

  // Handle grading submission
  const handleGradeSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmissionToGrade) return;
    await api.gradeSubmission(selectedSubmissionToGrade.id, gradeMarks, gradeFeedback, user.name);
    setSelectedSubmissionToGrade(null);
    setGradeFeedback('');
    onRefreshData();
  };

  // Handle saving attendance
  const handleSaveAttendance = async () => {
    const entries = studentsList.map((st) => ({
      studentId: st.id,
      studentName: st.name,
      rollNumber: st.studentInfo?.rollNumber || '10A-00',
      status: attStatuses[st.id] || 'Present',
    }));

    await api.markAttendance({
      classId: attClass,
      className: 'Grade 10',
      section: 'A',
      date: attDate,
      markedBy: user.id,
      markedByName: user.name,
      entries,
    });

    setAttendanceSavedNotice(true);
    setTimeout(() => setAttendanceSavedNotice(false), 3000);
    onRefreshData();
  };

  // Handle saving project review
  const handleSaveProjectReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;
    await api.reviewProject(selectedProject.id, {
      status: projReviewStatus,
      teacherFeedback: projTeacherFeedback,
      reviewedBy: user.name,
      showcasedInSchool: projShowcaseCheck,
    });
    setSelectedProject(null);
    onRefreshData();
  };

  // Handle saving exam marks
  const handleSaveExamMarks = async (e: React.FormEvent) => {
    e.preventDefault();
    const st = allUsers.find((u) => u.id === examMarksStudentId);
    if (!st) return;

    await api.saveExamResult({
      examId: selectedExamId,
      studentId: st.id,
      studentName: st.name,
      rollNumber: st.studentInfo?.rollNumber || '10A-14',
      classId: 'cls_10_a',
      className: 'Grade 10-A',
      subjectMarks: [
        {
          subject: examMarksSubject,
          marksObtained: examMarksVal,
          maxMarks: 100,
          grade: examMarksVal >= 90 ? 'A+' : examMarksVal >= 80 ? 'A' : 'B',
          feedback: examFeedbackVal,
        },
      ],
    });
    alert(`Saved ${examMarksVal}/100 in ${examMarksSubject} for ${st.name}!`);
    onRefreshData();
  };

  return (
    <div className="space-y-6">
      {/* Faculty Profile Banner */}
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
              <span className="text-xs font-mono font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-100">
                {user.teacherInfo?.employeeId} · Faculty Member
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Subjects: <strong className="text-slate-700">{user.teacherInfo?.subjects.join(', ')}</strong> · Assigned Classes: {user.teacherInfo?.assignedClasses.join(', ')}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowAssignmentModal(true)}
            className="px-3.5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <FilePlus className="w-3.5 h-3.5" />
            <span>Create Assignment</span>
          </button>
          <button
            onClick={() => setShowNoteModal(true)}
            className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Notes</span>
          </button>
          <button
            onClick={() => setShowRecordingModal(true)}
            className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Video className="w-3.5 h-3.5" />
            <span>Add Recording</span>
          </button>
        </div>
      </div>

      {/* OVERVIEW TAB */}
      {(activeTab === 'overview' || !activeTab) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main 2 Cols: Submissions queue, Schedule */}
          <div className="lg:col-span-2 space-y-6">
            {/* Student Submissions to Grade */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-sky-600" />
                  <h2 className="text-sm font-bold text-slate-900">Student Assignment Submissions</h2>
                </div>
                <span className="text-xs font-mono text-slate-500">
                  {submissions.filter((s) => s.status === 'Submitted').length} Pending Review
                </span>
              </div>

              <div className="space-y-3">
                {submissions.map((sub) => {
                  const asg = assignments.find((a) => a.id === sub.assignmentId);
                  const isReviewed = sub.status === 'Reviewed';
                  return (
                    <div
                      key={sub.id}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{sub.studentName}</span>
                          <span className="text-[11px] text-slate-500">· {sub.className}-{sub.section} (Roll #{sub.studentRoll})</span>
                        </div>
                        <p className="text-xs font-medium text-sky-800 mt-1">{asg?.title || 'Assignment'}</p>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1 italic">&quot;{sub.submissionText}&quot;</p>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2 font-mono">
                          <span>File: {sub.attachmentName || 'Submission.pdf'}</span>
                          <span>· Submitted: {new Date(sub.submittedAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        {isReviewed ? (
                          <div className="text-right">
                            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              Graded: {sub.marksObtained} / {asg?.maxMarks || 50} pts
                            </span>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedSubmissionToGrade(sub);
                              setGradeMarks(asg ? Math.round(asg.maxMarks * 0.9) : 45);
                            }}
                            className="px-3.5 py-1.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs transition-colors"
                          >
                            Grade &amp; Feedback
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Teaching Schedule */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <h2 className="text-sm font-bold text-slate-900 mb-3">Today&apos;s Lecture Schedule</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {timetable
                  .filter((t) => t.day === 'Monday')
                  .slice(0, 3)
                  .map((slot) => (
                    <div key={slot.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50/70">
                      <span className="text-xs font-mono font-bold text-sky-700 block">{slot.startTime} – {slot.endTime}</span>
                      <span className="text-sm font-bold text-slate-900 block mt-1">{slot.subject}</span>
                      <span className="text-xs text-slate-500">{slot.room} · Grade 10-A</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Right Col: Quick Attendance and Project Reviews */}
          <div className="space-y-6">
            {/* Quick Attendance Widget */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-900">Today&apos;s Class Attendance</h3>
                <button
                  onClick={() => onSelectTab('attendance')}
                  className="text-xs font-bold text-sky-600 hover:underline"
                >
                  Manage Sheet &rarr;
                </button>
              </div>
              <p className="text-xs text-slate-500 mb-4">Grade 10-A · {attDate}</p>

              <div className="space-y-2 mb-4">
                {studentsList.map((st) => (
                  <div key={st.id} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50">
                    <span className="font-semibold text-slate-800">{st.name}</span>
                    <div className="flex items-center gap-1">
                      {(['Present', 'Absent', 'Late'] as const).map((status) => (
                        <button
                          key={status}
                          onClick={() => setAttStatuses((prev) => ({ ...prev, [st.id]: status }))}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                            attStatuses[st.id] === status
                              ? status === 'Present'
                                ? 'bg-emerald-600 text-white'
                                : status === 'Absent'
                                ? 'bg-rose-600 text-white'
                                : 'bg-amber-600 text-white'
                              : 'bg-white text-slate-600 border border-slate-200'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {attendanceSavedNotice && (
                <div className="p-2 mb-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-xs text-center font-medium">
                  Attendance saved! Parents notified.
                </div>
              )}

              <button
                onClick={handleSaveAttendance}
                className="w-full py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
              >
                Submit Class Attendance
              </button>
            </div>

            {/* Student Innovation Projects to Review */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Student Innovation Projects</h3>
              <div className="space-y-3">
                {projects.map((proj) => (
                  <div key={proj.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-sky-700">{proj.category}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{proj.status}</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900">{proj.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{proj.description}</p>
                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-600">By {proj.studentName}</span>
                      <button
                        onClick={() => {
                          setSelectedProject(proj);
                          setProjTeacherFeedback(proj.teacherFeedback || '');
                          setProjReviewStatus(proj.status);
                        }}
                        className="text-xs text-sky-600 hover:underline font-bold"
                      >
                        Review &amp; Showcase
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ATTENDANCE TAB */}
      {activeTab === 'attendance' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-base font-bold text-slate-900">Class Attendance Register</h2>
              <p className="text-xs text-slate-500">Record and publish daily student attendance logs</p>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="date"
                value={attDate}
                onChange={(e) => setAttDate(e.target.value)}
                className="text-xs border border-slate-300 rounded-lg px-3 py-1.5 font-mono"
              />
              <button
                onClick={handleSaveAttendance}
                className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors"
              >
                Save &amp; Notify Parents
              </button>
            </div>
          </div>

          {attendanceSavedNotice && (
            <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-medium">
              Attendance records for Grade 10-A ({attDate}) have been saved. Automatic alerts sent to absent/late students&apos; parents.
            </div>
          )}

          <div className="divide-y divide-slate-100">
            {studentsList.map((st) => (
              <div key={st.id} className="py-3.5 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{st.name}</h4>
                  <p className="text-xs text-slate-400 font-mono">
                    Roll #{st.studentInfo?.rollNumber} · Parent: {st.studentInfo?.parentName}
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  {(['Present', 'Absent', 'Late', 'Excused'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => setAttStatuses((prev) => ({ ...prev, [st.id]: status }))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        attStatuses[st.id] === status
                          ? status === 'Present'
                            ? 'bg-emerald-600 text-white'
                            : status === 'Absent'
                            ? 'bg-rose-600 text-white'
                            : status === 'Late'
                            ? 'bg-amber-600 text-white'
                            : 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ASSIGNMENTS TAB */}
      {activeTab === 'assignments' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-base font-bold text-slate-900">Manage Coursework &amp; Assignments</h2>
              <p className="text-xs text-slate-500">Publish problem sets, lab guides, and grade submitted student files</p>
            </div>
            <button
              onClick={() => setShowAssignmentModal(true)}
              className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <FilePlus className="w-3.5 h-3.5" />
              <span>Create New Assignment</span>
            </button>
          </div>

          <div className="space-y-4">
            {assignments.map((asg) => (
              <div key={asg.id} className="p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-sky-700">{asg.subject}</span>
                    <span className="text-xs text-slate-400">· Max {asg.maxMarks} points</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mt-1">{asg.title}</h3>
                  <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">{asg.description}</p>
                  <p className="text-[11px] font-mono text-slate-400 mt-1">
                    Deadline: {new Date(asg.deadline).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-mono font-medium text-slate-600 block">
                    {submissions.filter((s) => s.assignmentId === asg.id).length} Submissions
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* NOTES & RECORDINGS TAB */}
      {activeTab === 'notes' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <h2 className="text-base font-bold text-slate-900">Class Study Materials &amp; Lecture Notes</h2>
                <p className="text-xs text-slate-500">Documents available to all students in Grade 10-A</p>
              </div>
              <button
                onClick={() => setShowNoteModal(true)}
                className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload New Notes</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              {notes.map((note) => (
                <div key={note.id} className="p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold text-sky-700">{note.subject} · {note.chapter}</span>
                    <h3 className="text-sm font-bold text-slate-900 mt-1">{note.title}</h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-2">{note.description}</p>
                  </div>
                  <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                    <span className="font-mono text-[11px]">{note.fileName}</span>
                    <button
                      onClick={() => api.deleteNote(note.id).then(onRefreshData)}
                      className="text-rose-600 hover:underline text-[11px] font-semibold"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <h2 className="text-base font-bold text-slate-900">Video Recordings Library</h2>
                <p className="text-xs text-slate-500">Recorded sessions accessible by students</p>
              </div>
              <button
                onClick={() => setShowRecordingModal(true)}
                className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Add Class Recording</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              {recordings.map((rec) => (
                <div key={rec.id} className="p-4 rounded-xl border border-slate-200 flex items-start gap-4">
                  <img src={rec.thumbnailUrl} alt={rec.title} className="w-28 h-20 rounded-lg object-cover" />
                  <div className="flex-1">
                    <span className="text-xs font-bold text-sky-700">{rec.subject} · {rec.topic}</span>
                    <h3 className="text-sm font-bold text-slate-900 mt-0.5">{rec.title}</h3>
                    <p className="text-[11px] text-slate-400 font-mono mt-1">Recorded: {rec.recordingDate} · Duration: {rec.duration}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* EXAMS & MARKS TAB */}
      {activeTab === 'exams' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-base font-bold text-slate-900">Examinations &amp; Grade Entry</h2>
              <p className="text-xs text-slate-500">Enter marks and subject reviews for upcoming and published examinations</p>
            </div>
          </div>

          <form onSubmit={handleSaveExamMarks} className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-4 max-w-xl">
            <h3 className="text-sm font-bold text-slate-900">Enter Student Examination Marks</h3>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Select Exam Schedule
              </label>
              <select
                value={selectedExamId}
                onChange={(e) => setSelectedExamId(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 p-2 focus:outline-none bg-white"
              >
                {exams.map((ex) => (
                  <option key={ex.id} value={ex.id}>{ex.title} ({ex.status})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Student
                </label>
                <select
                  value={examMarksStudentId}
                  onChange={(e) => setExamMarksStudentId(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 p-2 focus:outline-none bg-white"
                >
                  {studentsList.map((st) => (
                    <option key={st.id} value={st.id}>{st.name} ({st.studentInfo?.rollNumber})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Subject
                </label>
                <select
                  value={examMarksSubject}
                  onChange={(e) => setExamMarksSubject(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 p-2 focus:outline-none bg-white"
                >
                  <option value="Mathematics">Mathematics</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Computer Science">Computer Science</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Marks Obtained (out of 100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={examMarksVal}
                  onChange={(e) => setExamMarksVal(Number(e.target.value))}
                  required
                  className="w-full text-xs rounded-lg border border-slate-300 p-2 focus:outline-none font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Evaluator Remarks
                </label>
                <input
                  type="text"
                  value={examFeedbackVal}
                  onChange={(e) => setExamFeedbackVal(e.target.value)}
                  placeholder="e.g. Excellent command over concepts"
                  className="w-full text-xs rounded-lg border border-slate-300 p-2 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
            >
              Record Exam Mark
            </button>
          </form>
        </div>
      )}

      {/* GRADE SUBMISSION MODAL */}
      {selectedSubmissionToGrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 mb-1">Evaluate Assignment Submission</h3>
            <p className="text-xs text-slate-500 mb-4">
              Student: <strong>{selectedSubmissionToGrade.studentName}</strong> (Roll #{selectedSubmissionToGrade.studentRoll})
            </p>

            <form onSubmit={handleGradeSubmission} className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700">
                <span className="font-semibold block text-slate-900 mb-1">Submitted Notes:</span>
                <p className="leading-relaxed">&quot;{selectedSubmissionToGrade.submissionText}&quot;</p>
                <p className="mt-2 text-sky-700 font-mono">Attachment: {selectedSubmissionToGrade.attachmentName}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Marks Awarded (Points)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={gradeMarks}
                  onChange={(e) => setGradeMarks(Number(e.target.value))}
                  required
                  className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:border-sky-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Written Feedback to Student &amp; Parents
                </label>
                <textarea
                  value={gradeFeedback}
                  onChange={(e) => setGradeFeedback(e.target.value)}
                  rows={4}
                  placeholder="Provide constructive assessment and advice for further improvement..."
                  required
                  className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedSubmissionToGrade(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs transition-colors"
                >
                  Publish Grade &amp; Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE ASSIGNMENT MODAL */}
      {showAssignmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 mb-1">Create New Assignment</h3>
            <p className="text-xs text-slate-500 mb-4">Set assignment requirements, attachment, deadline, and total score</p>

            <form onSubmit={handleCreateAssignment} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Assignment Title
                </label>
                <input
                  type="text"
                  value={asgTitle}
                  onChange={(e) => setAsgTitle(e.target.value)}
                  placeholder="e.g. Electromagnetic Waves Problem Set"
                  required
                  className="w-full text-xs rounded-lg border border-slate-300 p-2 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Subject
                  </label>
                  <select
                    value={asgSubject}
                    onChange={(e) => setAsgSubject(e.target.value)}
                    className="w-full text-xs rounded-lg border border-slate-300 p-2 focus:outline-none bg-white"
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="Applied Science">Applied Science</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Max Marks
                  </label>
                  <input
                    type="number"
                    value={asgMarks}
                    onChange={(e) => setAsgMarks(Number(e.target.value))}
                    required
                    className="w-full text-xs rounded-lg border border-slate-300 p-2 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Submission Deadline
                </label>
                <input
                  type="datetime-local"
                  value={asgDeadline}
                  onChange={(e) => setAsgDeadline(e.target.value)}
                  required
                  className="w-full text-xs rounded-lg border border-slate-300 p-2 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Instructions &amp; Prompts
                </label>
                <textarea
                  value={asgDesc}
                  onChange={(e) => setAsgDesc(e.target.value)}
                  rows={3}
                  placeholder="Specify clear instructions and rubric expectations..."
                  required
                  className="w-full text-xs rounded-lg border border-slate-300 p-2 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Attachment File Name
                </label>
                <input
                  type="text"
                  value={asgAttachName}
                  onChange={(e) => setAsgAttachName(e.target.value)}
                  placeholder="e.g. Waves_PS_Handout.pdf"
                  className="w-full text-xs rounded-lg border border-slate-300 p-2 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAssignmentModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs transition-colors"
                >
                  Publish Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPLOAD NOTE MODAL */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 mb-1">Upload Subject Notes</h3>
            <p className="text-xs text-slate-500 mb-4">Provide title, chapter, description, and document filename</p>

            <form onSubmit={handleUploadNote} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Title</label>
                <input
                  type="text"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="e.g. Thermodynamics and Entropy Guide"
                  required
                  className="w-full text-xs rounded-lg border border-slate-300 p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Subject</label>
                  <select
                    value={noteSubject}
                    onChange={(e) => setNoteSubject(e.target.value)}
                    className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white"
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Chapter</label>
                  <input
                    type="text"
                    value={noteChapter}
                    onChange={(e) => setNoteChapter(e.target.value)}
                    required
                    className="w-full text-xs rounded-lg border border-slate-300 p-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Summary</label>
                <textarea
                  value={noteDesc}
                  onChange={(e) => setNoteDesc(e.target.value)}
                  rows={3}
                  required
                  className="w-full text-xs rounded-lg border border-slate-300 p-2"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">File Name</label>
                <input
                  type="text"
                  value={noteFileName}
                  onChange={(e) => setNoteFileName(e.target.value)}
                  required
                  className="w-full text-xs rounded-lg border border-slate-300 p-2 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowNoteModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs transition-colors"
                >
                  Upload Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPLOAD RECORDING MODAL */}
      {showRecordingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 mb-1">Add Lecture Recording</h3>
            <p className="text-xs text-slate-500 mb-4">Add a classroom video session with topic, subject, and duration</p>

            <form onSubmit={handleUploadRecording} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Lecture Title</label>
                <input
                  type="text"
                  value={recTitle}
                  onChange={(e) => setRecTitle(e.target.value)}
                  placeholder="e.g. Rotational Kinematics & Angular Momentum"
                  required
                  className="w-full text-xs rounded-lg border border-slate-300 p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Subject</label>
                  <select
                    value={recSubject}
                    onChange={(e) => setRecSubject(e.target.value)}
                    className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white"
                  >
                    <option value="Physics">Physics</option>
                    <option value="Mathematics">Mathematics</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Duration</label>
                  <input
                    type="text"
                    value={recDuration}
                    onChange={(e) => setRecDuration(e.target.value)}
                    required
                    className="w-full text-xs rounded-lg border border-slate-300 p-2 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Topic</label>
                <input
                  type="text"
                  value={recTopic}
                  onChange={(e) => setRecTopic(e.target.value)}
                  required
                  className="w-full text-xs rounded-lg border border-slate-300 p-2"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Video Stream URL</label>
                <input
                  type="url"
                  value={recVideoUrl}
                  onChange={(e) => setRecVideoUrl(e.target.value)}
                  required
                  className="w-full text-xs rounded-lg border border-slate-300 p-2 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowRecordingModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs transition-colors"
                >
                  Publish Recording
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROJECT REVIEW MODAL */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 mb-1">Review Student Project</h3>
            <p className="text-xs text-slate-500 mb-4">{selectedProject.title} by {selectedProject.studentName}</p>

            <form onSubmit={handleSaveProjectReview} className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-700 border border-slate-200">
                <p className="leading-relaxed">{selectedProject.description}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Review Status</label>
                <select
                  value={projReviewStatus}
                  onChange={(e) => setProjReviewStatus(e.target.value as any)}
                  className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white"
                >
                  <option value="Under Review">Under Review</option>
                  <option value="Approved">Approved</option>
                  <option value="Showcased">Showcased</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Teacher Feedback</label>
                <textarea
                  value={projTeacherFeedback}
                  onChange={(e) => setProjTeacherFeedback(e.target.value)}
                  rows={3}
                  required
                  placeholder="Write assessment comments..."
                  className="w-full text-xs rounded-lg border border-slate-300 p-2"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="showcaseCheck"
                  checked={projShowcaseCheck}
                  onChange={(e) => setProjShowcaseCheck(e.target.checked)}
                  className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                />
                <label htmlFor="showcaseCheck" className="text-xs text-slate-700 font-medium">
                  Approve for School-Wide Innovation Showcase
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedProject(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors"
                >
                  Save Evaluation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
