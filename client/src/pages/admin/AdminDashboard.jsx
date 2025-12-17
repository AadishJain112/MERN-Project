import { useEffect, useState } from 'react';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatCard from '../../components/StatCard';
import api from '../../services/api';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/admin/users');
        setUsers(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return <LoadingSpinner label="Preparing admin insights..." />;
  }

  if (!users.length) {
    return (
      <EmptyState
        title="No users yet"
        description="Start by inviting faculty members and student leaders."
      />
    );
  }

  const countByRole = (role) => users.filter((user) => user.role === role).length;

  const stats = [
    { title: 'Total Users', value: users.length, change: 'Platform wide', accent: 'primary' },
    { title: 'Students', value: countByRole('student'), change: 'Active learners', accent: 'accent' },
    { title: 'Teachers', value: countByRole('teacher'), change: 'Reviewers', accent: 'secondary' },
  ];

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/5">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Admin overview</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">Operational intelligence</h1>
        <p className="mt-2 text-sm text-slate-500">
          Keep track of users across roles and ensure smooth operations.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>
      <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/5">
        <p className="text-lg font-semibold text-slate-900">Recently added users</p>
        <p className="text-sm text-slate-500">Showing the 5 most recent accounts.</p>
        <div className="mt-4 divide-y divide-slate-100/80">
          {users.slice(0, 5).map((user) => (
            <div key={user._id} className="flex items-center justify-between py-3 text-sm">
              <div>
                <p className="font-semibold text-slate-800">{user.name}</p>
                <p className="text-slate-500">{user.email}</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                {user.role}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

