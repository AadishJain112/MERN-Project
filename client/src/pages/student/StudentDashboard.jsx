import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdvancedChart from '../../components/Analytics/AdvancedChart';
import LoadingSpinner from '../../components/LoadingSpinner';
import SectionCard from '../../components/layout/SectionCard';
import StatCard from '../../components/StatCard';
import { useAuthContext } from '../../context/AuthContext';
import api from '../../services/api';

const statusColor = (status) => {
  const colors = {
    approved: 'bg-green-100 text-green-800 border-green-200',
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
  };
  return colors[status] || 'bg-slate-100 text-slate-800 border-slate-200';
};

const categoryIcon = (category) => {
  const icons = {
    event: '🎉',
    achievement: '🏆',
    skill: '💼',
  };
  return icons[category] || '📝';
};

const attendanceColor = (percentage) => {
  if (percentage >= 75) return 'text-green-600';
  if (percentage >= 60) return 'text-yellow-600';
  return 'text-red-600';
};

const StudentDashboard = () => {
  const { user } = useAuthContext();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get('/student/dashboard-stats');
        setStats(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <LoadingSpinner label="Loading your dashboard..." />;
  }

  if (error || !stats) {
    return (
      <SectionCard className="text-center" padded>
        <p className="text-red-600">{error || 'Failed to load dashboard'}</p>
      </SectionCard>
    );
  }

  return (
    <div className="space-y-8">
      <WelcomeHeader user={user} />

      <StatsGrid stats={stats} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <PerformanceChartCard trend={stats.academics.performanceTrend} />
          <RecentActivitiesCard recentActivities={stats.recentActivities} />
        </div>

        <div className="space-y-6">
          <QuickActionsCard />
          <CategoryBreakdownCard byCategory={stats.activities.byCategory} />
          <AttendanceCard attendance={stats.attendance} />
          <AcademicSummaryCard academics={stats.academics} />
        </div>
      </div>

      <AchievementsCard stats={stats} />
    </div>
  );
};

const WelcomeHeader = ({ user }) => (
  <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-8 text-white shadow-2xl">
    <div className="relative z-10">
      <p className="text-sm font-medium opacity-90">Welcome back,</p>
      <h1 className="mt-2 text-4xl font-bold">{user?.name || 'Student'}</h1>
      <p className="mt-2 text-lg opacity-90">
        {user?.department || 'Department'} • {user?.batch || 'Batch'}
      </p>
      <div className="mt-6 flex flex-wrap gap-4">
        <Link
          to="/student/upload"
          className="rounded-xl bg-white/20 px-6 py-3 text-sm font-semibold backdrop-blur-sm transition hover:bg-white/30"
        >
          + Upload Activity
        </Link>
        <Link
          to="/student/profile"
          className="rounded-xl border-2 border-white/30 px-6 py-3 text-sm font-semibold backdrop-blur-sm transition hover:bg-white/10"
        >
          View Profile
        </Link>
      </div>
    </div>
    <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-white/10 to-transparent" />
  </div>
);

const StatsGrid = ({ stats }) => (
  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
    <StatCard
      title="Total Activities"
      value={stats.activities.total}
      change={`${stats.activities.approved} approved`}
      accent="primary"
    />
    <StatCard
      title="Pending Reviews"
      value={stats.activities.pending}
      change="Awaiting approval"
      accent="secondary"
    />
    <StatCard
      title="CGPA"
      value={stats.academics.cgpa > 0 ? stats.academics.cgpa.toFixed(2) : 'N/A'}
      change={`${stats.academics.totalSemesters} semesters`}
      accent="accent"
    />
    <StatCard
      title="Attendance"
      value={`${stats.attendance.percentage}%`}
      change={`${stats.attendance.totalPresent}/${stats.attendance.totalDays} days`}
      accent="primary"
    />
  </div>
);

const PerformanceChartCard = ({ trend }) => {
  if (!trend || trend.length === 0) return null;

  return (
    <SectionCard
      subtitle="Academic Performance"
      title="SGPA Trend"
      action={
        <Link to="/student/profile#academic" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
          View Details →
        </Link>
      }
    >
      <div className="h-64">
        <AdvancedChart
          type="line"
          data={{
            labels: trend.map((p) => `Sem ${p.semester}`),
            datasets: [
              {
                label: 'SGPA',
                data: trend.map((p) => p.sgpa),
                borderColor: 'rgb(99, 102, 241)',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                tension: 0.4,
              },
            ],
          }}
        />
      </div>
    </SectionCard>
  );
};

const RecentActivitiesCard = ({ recentActivities }) => (
  <SectionCard
    subtitle="Recent Activities"
    title="Latest Submissions"
    action={
      <Link to="/student/activities" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
        View All →
      </Link>
    }
  >
    {recentActivities.length === 0 ? (
      <div className="py-12 text-center">
        <p className="text-slate-500">No activities yet</p>
        <Link
          to="/student/upload"
          className="mt-4 inline-block rounded-xl bg-indigo-600 px-6 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Upload Your First Activity
        </Link>
      </div>
    ) : (
      <div className="space-y-3">
        {recentActivities.map((activity) => (
          <div
            key={activity._id}
            className="group flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition hover:border-indigo-200 hover:bg-indigo-50/50"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-2xl shadow-sm">
              {categoryIcon(activity.category)}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900">{activity.title}</h3>
              <p className="mt-1 text-sm text-slate-500">
                {new Date(activity.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusColor(activity.status)}`}>
              {activity.status}
            </span>
          </div>
        ))}
      </div>
    )}
  </SectionCard>
);

const QuickActionsCard = () => (
  <SectionCard subtitle="Quick Actions">
    <div className="mt-2 space-y-3">
      <Link
        to="/student/upload"
        className="flex items-center gap-3 rounded-xl bg-indigo-50 p-4 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
      >
        <span className="text-xl">📤</span>
        <span>Upload Activity</span>
      </Link>
      <Link
        to="/student/profile"
        className="flex items-center gap-3 rounded-xl bg-slate-50 p-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
      >
        <span className="text-xl">👤</span>
        <span>View Profile</span>
      </Link>
      <Link
        to="/student/activities"
        className="flex items-center gap-3 rounded-xl bg-slate-50 p-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
      >
        <span className="text-xl">📋</span>
        <span>All Activities</span>
      </Link>
    </div>
  </SectionCard>
);

const CategoryBreakdownCard = ({ byCategory }) => (
  <SectionCard subtitle="By Category">
    <div className="mt-2 space-y-4">
      <CategoryRow icon="🎉" label="Events" value={byCategory.event} />
      <CategoryRow icon="🏆" label="Achievements" value={byCategory.achievement} />
      <CategoryRow icon="💼" label="Skills" value={byCategory.skill} />
    </div>
  </SectionCard>
);

const CategoryRow = ({ icon, label, value }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <span className="text-2xl">{icon}</span>
      <span className="text-sm font-medium text-slate-700">{label}</span>
    </div>
    <span className="text-lg font-bold text-slate-900">{value}</span>
  </div>
);

const AttendanceCard = ({ attendance }) => {
  if (!attendance.records?.length) return null;

  return (
    <SectionCard
      subtitle="Attendance"
      action={<span className={`text-2xl font-bold ${attendanceColor(attendance.percentage)}`}>{attendance.percentage}%</span>}
    >
      <div className="space-y-2">
        {attendance.records.slice(0, 4).map((record, idx) => (
          <div key={idx} className="flex items-center justify-between text-sm">
            <span className="text-slate-600">{record.month}</span>
            <span className="font-semibold text-slate-900">
              {record.present}/{record.total}
            </span>
          </div>
        ))}
      </div>
      <Link
        to="/student/profile"
        className="mt-4 block text-center text-sm font-medium text-indigo-600 hover:text-indigo-700"
      >
        View Full Attendance →
      </Link>
    </SectionCard>
  );
};

const AcademicSummaryCard = ({ academics }) => {
  if (!academics.latestSGPA) return null;

  return (
    <SectionCard
      subtitle="Latest Semester"
      className="bg-gradient-to-br from-indigo-50 to-purple-50"
    >
      <div className="mt-1">
        <p className="text-sm text-slate-600">Semester {academics.latestSemester}</p>
        <p className="mt-2 text-4xl font-bold text-indigo-600">{academics.latestSGPA.toFixed(2)}</p>
        <p className="mt-1 text-sm text-slate-500">SGPA</p>
      </div>
      <div className="mt-6 flex items-center justify-between rounded-xl bg-white/60 p-3">
        <span className="text-sm text-slate-600">Overall CGPA</span>
        <span className="text-xl font-bold text-slate-900">{academics.cgpa.toFixed(2)}</span>
      </div>
    </SectionCard>
  );
};

const AchievementsCard = ({ stats }) => (
  <SectionCard subtitle="Achievements">
    <div className="mt-2 grid grid-cols-2 gap-4 md:grid-cols-4">
      {stats.activities.approved >= 5 && (
        <Badge icon="⭐" text="5+ Approved" color="green" />
      )}
      {stats.academics.cgpa >= 8 && (
        <Badge icon="🎓" text="High Performer" color="indigo" />
      )}
      {stats.attendance.percentage >= 75 && (
        <Badge icon="📚" text="Regular" color="blue" />
      )}
      {stats.activities.total >= 10 && (
        <Badge icon="🌟" text="Active" color="purple" />
      )}
    </div>
  </SectionCard>
);

const Badge = ({ icon, text, color }) => {
  const colors = {
    green: 'border-green-200 bg-green-50 text-green-800',
    indigo: 'border-indigo-200 bg-indigo-50 text-indigo-800',
    blue: 'border-blue-200 bg-blue-50 text-blue-800',
    purple: 'border-purple-200 bg-purple-50 text-purple-800',
  };

  return (
    <div className={`rounded-2xl border p-4 text-center ${colors[color]}`}>
      <div className="text-3xl">{icon}</div>
      <p className="mt-2 text-xs font-semibold">{text}</p>
    </div>
  );
};

export default StudentDashboard;
