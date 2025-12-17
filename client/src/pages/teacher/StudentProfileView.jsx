import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import SectionCard from '../../components/layout/SectionCard';
import api from '../../services/api';

const StudentProfileView = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [profileRes, statsRes] = await Promise.all([
          api.get(`/teacher/student/${studentId}/profile`),
          api.get(`/teacher/student/${studentId}/assignment-stats`),
        ]);
        setStudent(profileRes.data);
        setStats(statsRes.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load student profile');
        console.error('Error loading student profile:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [studentId]);

  if (loading) {
    return <LoadingSpinner label="Loading student profile..." />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <button onClick={() => navigate('/teacher')} className="text-blue-600 hover:text-blue-700 font-medium">
          ← Back to Dashboard
        </button>
        <EmptyState title="Access Denied" description={error} />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="space-y-6">
        <button onClick={() => navigate('/teacher')} className="text-blue-600 hover:text-blue-700 font-medium">
          ← Back to Dashboard
        </button>
        <EmptyState title="Student not found" description="The student profile you're looking for doesn't exist." />
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'academic', label: 'Academic Performance' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <button onClick={() => navigate('/teacher')} className="mb-3 text-blue-600 hover:text-blue-700 font-medium">
          ← Back to Dashboard
        </button>
        <h1 className="text-3xl font-semibold text-slate-900">{student.user?.name}</h1>
        <p className="mt-1 text-slate-600">{student.user?.email}</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <>
          <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/5">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Personal Details</p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {[
                { label: 'Name', value: student.user?.name },
                { label: 'Email', value: student.user?.email },
                { label: 'Department', value: student.user?.department || 'Not set' },
                { label: 'Batch', value: student.user?.batch || 'Not set' },
                { label: 'Roll Number', value: student.user?.rollNumber || 'Not set' },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{item.label}</p>
                  <p className="mt-2 text-base font-semibold text-slate-900">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/5">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Academic Records</p>
              {student.academics?.length ? (
                <ul className="mt-6 space-y-3">
                  {student.academics.map((item) => (
                    <li
                      key={item._id}
                      className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm"
                    >
                      <span className="font-semibold text-slate-700">{item.semester}</span>
                      <span className="text-lg font-bold text-indigo-600">{item.cgpa}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="mt-6">
                  <p className="text-sm text-slate-500">No academic records available</p>
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/5">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Attendance</p>
              {student.attendance?.length ? (
                <ul className="mt-6 space-y-3">
                  {student.attendance.map((item) => (
                    <li
                      key={item._id}
                      className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm"
                    >
                      <span className="font-semibold text-slate-700">{item.month}</span>
                      <span className="text-lg font-bold text-violet-600">
                        {item.present}/{item.total} days
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="mt-6">
                  <p className="text-sm text-slate-500">No attendance records available</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {activeTab === 'academic' && stats && (
        <>
          {/* Overview Statistics */}
          <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/5">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400 mb-4">Assignment Overview</p>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Total Assignments" value={stats.overview.totalAssignments} color="indigo" />
              <StatCard label="Submitted" value={stats.overview.totalSubmissions} color="green" />
              <StatCard label="Submission Rate" value={`${stats.overview.submissionRate}%`} color="blue" />
              <StatCard label="Pending" value={stats.overview.pendingAssignments} color="yellow" />
            </div>
          </div>

          {/* Submission Statistics */}
          <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/5">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400 mb-4">Submission Details</p>
            <div className="grid gap-4 md:grid-cols-3">
              <StatCard label="On Time" value={stats.overview.onTimeSubmissions} color="green" />
              <StatCard label="Late Submissions" value={stats.overview.lateSubmissions} color="red" />
              <StatCard label="Classrooms Enrolled" value={stats.overview.totalClassrooms} color="purple" />
            </div>
          </div>

          {/* Performance Statistics */}
          {stats.performance.totalGraded > 0 && (
            <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/5">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400 mb-4">Grade Performance</p>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard label="Average Score" value={`${stats.performance.averagePercentage}%`} color="blue" size="large" />
                <StatCard label="Peak Score" value={`${stats.performance.peakScore}%`} color="green" />
                <StatCard label="Lowest Score" value={`${stats.performance.lowestScore}%`} color="red" />
                <StatCard label="Graded Assignments" value={stats.performance.totalGraded} color="indigo" />
              </div>
            </div>
          )}

          {/* Grade Distribution */}
          {stats.performance.totalGraded > 0 && (
            <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/5">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400 mb-4">Grade Distribution</p>
              <div className="grid gap-4 md:grid-cols-3">
                <GradeDistributionCard label="Above 80%" value={stats.performance.gradesAbove80} total={stats.performance.totalGraded} color="green" />
                <GradeDistributionCard label="60% - 80%" value={stats.performance.gradesAbove60} total={stats.performance.totalGraded} color="yellow" />
                <GradeDistributionCard label="Below 60%" value={stats.performance.gradesBelow60} total={stats.performance.totalGraded} color="red" />
              </div>
            </div>
          )}

          {/* Performance Chart */}
          {stats.gradesByAssignment.length > 0 && (
            <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/5">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400 mb-4">Performance Trend</p>
              <PerformanceChart grades={stats.gradesByAssignment.slice(0, 10).reverse()} />
            </div>
          )}

          {/* Recent Submissions */}
          {stats.recentSubmissions.length > 0 && (
            <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/5">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400 mb-4">Recent Submissions</p>
              <div className="space-y-3">
                {stats.recentSubmissions.map((submission, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900">{submission.title}</h4>
                      <div className="mt-1 flex items-center gap-3 text-xs text-slate-600">
                        <span>{new Date(submission.submittedAt).toLocaleDateString()}</span>
                        {submission.isLate && <span className="rounded bg-red-100 px-2 py-0.5 font-semibold text-red-700">LATE</span>}
                      </div>
                    </div>
                    {submission.graded ? (
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">
                          {submission.grade}/{submission.maxPoints}
                        </p>
                        <p className="text-xs text-slate-500">
                          {Math.round((submission.grade / submission.maxPoints) * 100)}%
                        </p>
                      </div>
                    ) : (
                      <span className="rounded-lg bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">Pending Grade</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Grades Table */}
          {stats.gradesByAssignment.length > 0 && (
            <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/5">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400 mb-4">All Graded Assignments</p>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 text-left">
                      <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-slate-600">Assignment</th>
                      <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-slate-600">Date</th>
                      <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-slate-600">Grade</th>
                      <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-slate-600">Score</th>
                      <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-slate-600">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stats.gradesByAssignment.map((grade, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-3 pr-4">
                          <p className="font-semibold text-slate-900">{grade.title}</p>
                          {grade.feedback && <p className="mt-1 text-xs text-slate-500">{grade.feedback}</p>}
                        </td>
                        <td className="py-3 text-sm text-slate-600">
                          {new Date(grade.submittedAt).toLocaleDateString()}
                        </td>
                        <td className="py-3">
                          <span className={`inline-block rounded-lg px-3 py-1 text-sm font-bold ${getGradeColor(grade.percentage)}`}>
                            {grade.percentage}%
                          </span>
                        </td>
                        <td className="py-3 text-sm font-semibold text-slate-700">
                          {grade.grade}/{grade.maxPoints}
                        </td>
                        <td className="py-3">
                          {grade.isLate ? (
                            <span className="rounded bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">Late</span>
                          ) : (
                            <span className="rounded bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">On Time</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const StatCard = ({ label, value, color, size = 'normal' }) => {
  const colors = {
    indigo: 'text-indigo-600',
    green: 'text-green-600',
    blue: 'text-blue-600',
    yellow: 'text-yellow-600',
    red: 'text-red-600',
    purple: 'text-purple-600',
  };

  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{label}</p>
      <p className={`mt-2 font-bold ${colors[color]} ${size === 'large' ? 'text-3xl' : 'text-2xl'}`}>{value}</p>
    </div>
  );
};

const GradeDistributionCard = ({ label, value, total, color }) => {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
  const colors = {
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
  };

  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <div className={`h-full ${colors[color]}`} style={{ width: `${percentage}%` }} />
      </div>
      <p className="mt-1 text-xs text-slate-500">{percentage}% of total</p>
    </div>
  );
};

const PerformanceChart = ({ grades }) => {
  const maxPercentage = 100;
  const maxHeight = 200;

  return (
    <div className="mt-4">
      <div className="flex items-end justify-around gap-2" style={{ height: maxHeight }}>
        {grades.map((grade, idx) => {
          const height = (grade.percentage / maxPercentage) * maxHeight;
          const color = grade.percentage >= 80 ? 'bg-green-500' : grade.percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500';
          
          return (
            <div key={idx} className="flex flex-1 flex-col items-center justify-end">
              <div className="relative w-full">
                <div
                  className={`${color} w-full rounded-t-lg transition-all hover:opacity-80`}
                  style={{ height: `${height}px` }}
                  title={`${grade.title}: ${grade.percentage}%`}
                />
              </div>
              <p className="mt-2 text-xs text-slate-500 text-center truncate w-full" title={grade.title}>
                {grade.title.length > 10 ? `${grade.title.substring(0, 10)}...` : grade.title}
              </p>
              <p className="text-xs font-semibold text-slate-700">{grade.percentage}%</p>
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex items-center justify-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-green-500" />
          <span className="text-slate-600">80%+</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-yellow-500" />
          <span className="text-slate-600">60-80%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-red-500" />
          <span className="text-slate-600">&lt;60%</span>
        </div>
      </div>
    </div>
  );
};

const getGradeColor = (percentage) => {
  if (percentage >= 80) return 'bg-green-100 text-green-800';
  if (percentage >= 60) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
};

export default StudentProfileView;
