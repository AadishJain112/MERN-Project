import { useEffect, useState } from 'react';
import ActivityCard from '../../components/ActivityCard';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';

const PendingActivities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const { data } = await api.get('/teacher/activities/pending');
    setActivities(data);
  };

  useEffect(() => {
    const load = async () => {
      try {
        await refresh();
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleDecision = async (id, action) => {
    const endpoint =
      action === 'approve'
        ? `/teacher/activity/approve/${id}`
        : `/teacher/activity/reject/${id}`;
    await api.put(endpoint);
    await refresh();
  };

  if (loading) {
    return <LoadingSpinner label="Fetching pending activities..." />;
  }

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/5">
        <p className="text-xs uppercase tracking-[0.5em] text-slate-400">Pending approvals</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">Take action with confidence</h1>
        <p className="mt-2 text-sm text-slate-500">
          Review each submission and take decisive action. Students are notified instantly.
        </p>
      </div>

      {activities.length === 0 ? (
        <EmptyState title="Great work" description="No submissions require your attention." />
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <ActivityCard
              key={activity._id}
              activity={activity}
              actions={[
                <button
                  key="approve"
                  onClick={() => handleDecision(activity._id, 'approve')}
                  className="rounded-2xl bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-100"
                >
                  Approve
                </button>,
                <button
                  key="reject"
                  onClick={() => handleDecision(activity._id, 'reject')}
                  className="rounded-2xl bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-100"
                >
                  Reject
                </button>,
              ]}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingActivities;

