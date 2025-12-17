import { useEffect, useState } from 'react';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';

const AcademicPerformance = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const { data } = await api.get('/student/assignment-stats');
        setStats(data);
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) {
    return <LoadingSpinner label="Loading academic performance..." />;
  }

  if (!stats || stats.overview.totalAssignments === 0) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-xl shadow-slate-900/5">
        <EmptyState
          title="No academic data yet"
          description="Join classrooms and complete assignments to see your performance statistics."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
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

      {/* Pending Assignments */}
      {stats.pendingAssignments.length > 0 && (
        <div className="rounded-3xl border border-red-200 bg-red-50/50 p-6 shadow-xl shadow-slate-900/5">
          <p className="text-xs uppercase tracking-[0.4em] text-red-500 mb-4">Pending Assignments</p>
          <div className="space-y-3">
            {stats.pendingAssignments.map((assignment, idx) => (
              <div key={idx} className="flex items-center justify-between rounded-2xl border border-red-100 bg-white p-4">
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900">{assignment.title}</h4>
                  <div className="mt-1 flex items-center gap-3 text-xs text-slate-600">
                    <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                    {assignment.isOverdue && <span className="rounded bg-red-100 px-2 py-0.5 font-semibold text-red-700">OVERDUE</span>}
                  </div>
                </div>
                <p className="text-sm font-semibold text-slate-700">{assignment.maxPoints} pts</p>
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

export default AcademicPerformance;

