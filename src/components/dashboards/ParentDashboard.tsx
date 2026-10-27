import React, { useState } from 'react';
import {
  Users,
  Calendar,
  CheckCircle,
  FileCheck,
  AlertCircle,
  Navigation,
  BookOpen,
  Award,
  Clock,
  Sparkles,
  ChevronRight,
  MessageSquare,
} from 'lucide-react';
import type {
  User,
  TimetableSlot,
  NoteResource,
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

interface ParentDashboardProps {
  user: User;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  timetable: TimetableSlot[];
  notes: NoteResource[];
  assignments: Assignment[];
  submissions: AssignmentSubmission[];
  attendance: AttendanceRecord[];
  exams: Exam[];
  examResults: ExamResult[];
  projects: Project[];
  announcements: Announcement[];
  bus?: Bus;
  isBusStale?: boolean;
  onOpenMessages: () => void;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({
  user,
  activeTab,
  onSelectTab,
  timetable,
  notes,
  assignments,
  submissions,
  attendance,
  exams,
  examResults,
  projects,
  announcements,
  bus,
  isBusStale,
  onOpenMessages,
}) => {
  const children = user.parentInfo?.children || [];
  // Active child state (multi-child switcher)
  const [selectedChildId, setSelectedChildId] = useState<string>(children[0]?.studentId || 'usr_student_alex');

  const activeChild = children.find((c) => c.studentId === selectedChildId) || children[0];

  // Attendance stats for selected child
  let totalDaysCount = 0;
  let presentDaysCount = 0;
  attendance.forEach((rec) => {
    const entry = rec.entries.find((e) => e.studentId === selectedChildId);
    if (entry) {
      totalDaysCount++;
      if (entry.status === 'Present' || entry.status === 'Late') presentDaysCount++;
    }
  });
  const attendancePercent = totalDaysCount > 0 ? Math.round((presentDaysCount / totalDaysCount) * 100) : 98;

  // Filter child submissions & results
  const childSubmissions = submissions.filter((s) => s.studentId === selectedChildId);
  const childResults = examResults.filter((r) => r.studentId === selectedChildId && r.isPublished);
  const childProjects = projects.filter((p) => p.studentId === selectedChildId);

  return (
    <div className="space-y-6">
      {/* Parent Header & Child Switcher */}
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
              <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md border border-slate-200">
                Authorized Parent / Guardian
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Family Portal · Secure Academic Monitoring &amp; Transport Supervision
            </p>
          </div>
        </div>

        {/* Secure Multi-Child Switcher */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-xl">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-2">
            Select Child:
          </span>
          {children.map((child) => (
            <button
              key={child.studentId}
              onClick={() => setSelectedChildId(child.studentId)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedChildId === child.studentId
                  ? 'bg-white text-sky-800 shadow-xs ring-1 ring-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <img src={child.avatar} alt={child.name} className="w-5 h-5 rounded-full object-cover" />
              <span>{child.name}</span>
              <span className="text-[10px] font-mono text-slate-400">({child.className}-{child.section})</span>
            </button>
          ))}
        </div>
      </div>

      {/* OVERVIEW TAB */}
      {(activeTab === 'overview' || !activeTab) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main 2 Cols: Live Bus alert, Academic progress, Attendance */}
          <div className="lg:col-span-2 space-y-6">
            {/* Live Transport Alert Strip */}
            {bus && (
              <div className="bg-gradient-to-r from-sky-900 to-slate-900 rounded-xl p-5 text-white shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${bus.status === 'tracking_live' && !isBusStale ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
                    <span className="text-xs font-bold text-sky-300 uppercase tracking-wider">
                      {bus.status === 'tracking_live' && !isBusStale ? 'Live Bus Movement Active' : 'Bus Idle / Outside Run Hours'}
                    </span>
                  </div>
                  <h3 className="text-base font-bold mt-1">{bus.number} · {bus.routeName}</h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Assigned coordinator: {bus.coordinatorName} · Next stop: {bus.stops.find((s) => s.id === bus.nextStopId)?.name || 'Pinehurst Commons'}
                  </p>
                </div>
                <div className="shrink-0 flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs text-slate-300 block">Estimated Arrival</span>
                    <span className="text-lg font-bold font-mono text-amber-300">
                      {bus.status === 'tracking_live' && !isBusStale ? `${bus.etaMinutes || 8} min` : 'Scheduled'}
                    </span>
                  </div>
                  <button
                    onClick={() => onSelectTab('bus')}
                    className="px-4 py-2 text-xs font-bold bg-sky-500 hover:bg-sky-400 text-white rounded-lg transition-colors whitespace-nowrap"
                  >
                    Open Live Map
                  </button>
                </div>
              </div>
            )}

            {/* Academic Snapshot & Teacher Evaluations */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-sky-600" />
                  <h2 className="text-sm font-bold text-slate-900">
                    {activeChild.name}&apos;s Academic Performance &amp; Evaluation
                  </h2>
                </div>
                <button
                  onClick={() => onSelectTab('academics')}
                  className="text-xs font-bold text-sky-600 hover:underline"
                >
                  View Details &rarr;
                </button>
              </div>

              {childResults.length > 0 ? (
                <div className="space-y-4">
                  <div className="p-3.5 bg-sky-50/60 rounded-xl border border-sky-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-sky-900 block">{childResults[0].className} Autumn Midterm</span>
                      <span className="text-xs text-sky-700">Official Exam Board Published Result</span>
                    </div>
                    <div className="flex items-center gap-3 font-mono">
                      <div className="text-right">
                        <span className="text-xs text-slate-500 block">Class Rank</span>
                        <span className="text-sm font-bold text-slate-900">#{childResults[0].rank}</span>
                      </div>
                      <div className="text-right pl-3 border-l border-sky-200">
                        <span className="text-xs text-slate-500 block">Overall Grade</span>
                        <span className="text-sm font-bold text-emerald-700">{childResults[0].overallGrade} ({childResults[0].percentage}%)</span>
                      </div>
                    </div>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {childResults[0].subjectMarks.map((sm) => (
                      <div key={sm.subject} className="py-2.5 flex items-start justify-between gap-4">
                        <div>
                          <span className="text-xs font-bold text-slate-900">{sm.subject}</span>
                          {sm.feedback && (
                            <p className="text-xs text-slate-500 italic mt-0.5">&quot;{sm.feedback}&quot;</p>
                          )}
                        </div>
                        <div className="text-right font-mono shrink-0">
                          <span className="text-xs font-bold text-slate-900">{sm.marksObtained}/{sm.maxMarks}</span>
                          <span className="text-[11px] font-semibold text-emerald-600 ml-1.5">({sm.grade})</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 py-6 text-center">
                  Exam report cards will appear here once officially approved by the school board.
                </p>
              )}
            </div>

            {/* Homework & Deadlines */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <h2 className="text-sm font-bold text-slate-900 mb-3">Homework &amp; Assignments</h2>
              <div className="space-y-3">
                {assignments.map((asg) => {
                  const sub = childSubmissions.find((s) => s.assignmentId === asg.id);
                  return (
                    <div key={asg.id} className="p-3.5 rounded-lg border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-900">{asg.title}</span>
                        <span className="text-[11px] text-slate-400 block">{asg.subject} · Due: {new Date(asg.deadline).toLocaleDateString()}</span>
                      </div>
                      <div>
                        {sub?.status === 'Reviewed' ? (
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            Graded: {sub.marksObtained}/{asg.maxMarks} pts
                          </span>
                        ) : sub ? (
                          <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
                            Submitted
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                            In Progress
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Col: Live Bus Mini-Map, Attendance, Message Teacher */}
          <div className="space-y-6">
            {/* Live Bus Tracking Mini-Map */}
            {bus && (
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-900">Child&apos;s School Bus ({bus.number})</h3>
                  <button
                    onClick={() => onSelectTab('bus')}
                    className="text-xs font-bold text-sky-600 hover:underline"
                  >
                    Expand Map &rarr;
                  </button>
                </div>
                <BusMap bus={bus} isStale={isBusStale} height="230px" />
                <div className="mt-3 text-xs space-y-1 bg-slate-50 p-2.5 rounded-lg text-slate-600">
                  <div className="flex justify-between">
                    <span>Route:</span>
                    <span className="font-semibold text-slate-900">{bus.routeName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Speed:</span>
                    <span className="font-mono">{bus.currentLocation?.speed || 0} km/h</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Driver Contact:</span>
                    <span className="font-mono">{bus.driverPhone}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Attendance Record */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-900">Attendance Summary</h3>
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  {attendancePercent}% Present
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-3">
                {activeChild.name} has attended {presentDaysCount} of {totalDaysCount || 3} recorded sessions this term.
              </p>

              <div className="space-y-1.5">
                {attendance.map((rec) => {
                  const entry = rec.entries.find((e) => e.studentId === selectedChildId);
                  return (
                    <div key={rec.id} className="flex items-center justify-between text-xs p-2 rounded bg-slate-50">
                      <span className="font-mono text-slate-600">{rec.date}</span>
                      <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                        entry?.status === 'Present'
                          ? 'bg-emerald-100 text-emerald-800'
                          : entry?.status === 'Late'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {entry?.status || 'Present'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Direct Message Teacher CTA */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-4 h-4 text-sky-600" />
                <h3 className="text-sm font-bold text-slate-900">Teacher Communication</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Have questions regarding {activeChild.name}&apos;s progress or assignments? Send a direct message to teachers.
              </p>
              <button
                onClick={onOpenMessages}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors"
              >
                Message Course Instructor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LIVE BUS TRACKER FULL TAB */}
      {activeTab === 'bus' && bus && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900">Live School Bus Tracker · {bus.number}</h2>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    bus.status === 'tracking_live' && !isBusStale ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {bus.status === 'tracking_live' && !isBusStale ? 'BROADCASTING GPS LIVE' : 'OFFLINE / NOT TRACKING'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {bus.routeName} · Coordinator: {bus.coordinatorName} · Driver: {bus.driverName} ({bus.driverPhone})
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Estimated Arrival</span>
                  <span className="text-base font-mono font-bold text-sky-700">
                    {bus.status === 'tracking_live' && !isBusStale ? `${bus.etaMinutes || 8} min` : 'Unavailable'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <BusMap bus={bus} isStale={isBusStale} height="500px" />
            </div>

            {/* Stops Timetable */}
            <div className="mt-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Planned Route Stops &amp; ETA</h3>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                {bus.stops.map((stop, i) => (
                  <div
                    key={stop.id}
                    className={`p-3 rounded-lg border text-xs ${
                      bus.nextStopId === stop.id
                        ? 'border-amber-400 bg-amber-50 ring-2 ring-amber-200'
                        : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900">Stop #{i + 1}</span>
                      <span className="font-mono text-slate-500 font-semibold">{stop.scheduledTime}</span>
                    </div>
                    <p className="text-slate-700 font-medium truncate">{stop.name}</p>
                    {bus.nextStopId === stop.id && (
                      <span className="text-[10px] font-bold text-amber-700 mt-1 block">Next Approaching</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ACADEMICS TAB */}
      {activeTab === 'academics' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-base font-bold text-slate-900">{activeChild.name}&apos;s Academic Record</h2>
              <p className="text-xs text-slate-500">Official grades, teacher evaluations, and term rankings</p>
            </div>
          </div>

          {childResults.map((res) => (
            <div key={res.id} className="p-5 rounded-xl border border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Autumn Term 2026 Examination</h3>
                  <p className="text-xs text-slate-500 font-mono">Roll #{res.rollNumber} · Class Rank: #{res.rank}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-md border border-emerald-200">
                    Grade {res.overallGrade} · {res.percentage}% Total
                  </span>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {res.subjectMarks.map((sm) => (
                  <div key={sm.subject} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold text-slate-900">{sm.subject}</span>
                      {sm.feedback && <p className="text-xs text-slate-500 italic mt-0.5">&quot;{sm.feedback}&quot;</p>}
                    </div>
                    <div className="font-mono text-xs text-right">
                      <span className="font-bold text-slate-900">{sm.marksObtained} / {sm.maxMarks}</span>
                      <span className="text-sky-700 font-bold ml-2">({sm.grade})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ANNOUNCEMENTS TAB */}
      {activeTab === 'announcements' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-200">School Notices &amp; Parent Communications</h2>
          <div className="divide-y divide-slate-100">
            {announcements.map((ann) => (
              <div key={ann.id} className="py-4 first:pt-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">{ann.title}</h3>
                  <span className="text-xs font-mono text-slate-400">
                    {new Date(ann.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{ann.content}</p>
                <div className="mt-2 text-[11px] text-slate-400">
                  <span>Author: {ann.authorName} ({ann.authorRole})</span>
                  <span className="mx-2">·</span>
                  <span>Target: {ann.audience}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
