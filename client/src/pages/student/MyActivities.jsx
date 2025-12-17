// frontend/src/pages/student/MyActivities.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ActivityCard from '../../components/ActivityCard';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';

const MyActivities = () => {
  const [activities, setActivities] = useState([]);
  const [filters, setFilters] = useState({ category: '', status: '', search: '' });
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');

  const fetchActivities = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const suffix = query ? `?${query}` : '';
    const { data } = await api.get(`/student/activities${suffix}`);
    setActivities(data);
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        await fetchActivities(filters);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [filters]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearchChange = (event) => {
    setFilters((prev) => ({ ...prev, search: event.target.value }));
  };

  // Filter and sort activities
  const filteredActivities = activities
    .filter((activity) => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          activity.title.toLowerCase().includes(searchLower) ||
          activity.description?.toLowerCase().includes(searchLower)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortBy === 'oldest') {
        return new Date(a.createdAt) - new Date(b.createdAt);
      } else if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

  const stats = {
    total: activities.length,
    approved: activities.filter((a) => a.status === 'approved').length,
    pending: activities.filter((a) => a.status === 'pending').length,
    rejected: activities.filter((a) => a.status === 'rejected').length,
  };

  if (loading) {
    return <LoadingSpinner label="Loading your activities..." />;
  }

  return (
    <div className="space-y-8">
      {/* Header with Stats */}
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-indigo-50 to-purple-50 p-6 shadow-xl shadow-slate-900/5">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">My Activities</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Activity Portfolio</h1>
          <p className="mt-2 text-sm text-slate-600">
            Manage and track all your achievements, events, and skills.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-xl bg-white/60 p-4 backdrop-blur-sm">
            <p className="text-xs text-slate-600">Total</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{stats.total}</p>
          </div>
          <div className="rounded-xl bg-green-100/60 p-4 backdrop-blur-sm">
            <p className="text-xs text-green-700">Approved</p>
            <p className="mt-1 text-2xl font-bold text-green-700">{stats.approved}</p>
          </div>
          <div className="rounded-xl bg-yellow-100/60 p-4 backdrop-blur-sm">
            <p className="text-xs text-yellow-700">Pending</p>
            <p className="mt-1 text-2xl font-bold text-yellow-700">{stats.pending}</p>
          </div>
          <div className="rounded-xl bg-red-100/60 p-4 backdrop-blur-sm">
            <p className="text-xs text-red-700">Rejected</p>
            <p className="mt-1 text-2xl font-bold text-red-700">{stats.rejected}</p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/5">
        <div className="grid gap-4 md:grid-cols-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="mb-2 block text-xs font-medium text-slate-600">Search</label>
            <input
              type="text"
              value={filters.search}
              onChange={handleSearchChange}
              placeholder="Search by title or description..."
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Category Filter */}
          <div>
            <label className="mb-2 block text-xs font-medium text-slate-600">Category</label>
            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="">All Categories</option>
              <option value="event">Events</option>
              <option value="achievement">Achievements</option>
              <option value="skill">Skills</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="mb-2 block text-xs font-medium text-slate-600">Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Sort and Actions */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <label className="text-xs font-medium text-slate-600">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Title (A-Z)</option>
            </select>
          </div>
          <div className="flex gap-2">
            {(filters.category || filters.status || filters.search) && (
              <button
                onClick={() => setFilters({ category: '', status: '', search: '' })}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Clear Filters
              </button>
            )}
            <Link
              to="/student/upload"
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              + Add Activity
            </Link>
          </div>
        </div>
      </div>

      {/* Activities List */}
      {filteredActivities.length === 0 ? (
        <EmptyState
          title={activities.length === 0 ? 'No activities yet' : 'No activities match your filters'}
          description={
            activities.length === 0
              ? 'Start building your portfolio by uploading your first achievement.'
              : 'Try adjusting your search or filter criteria.'
          }
          action={
            <Link
              to="/student/upload"
              className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Upload Activity
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600">
              Showing {filteredActivities.length} of {activities.length} activities
            </p>
          </div>
          {filteredActivities.map((activity) => (
            <ActivityCard key={activity._id} activity={activity} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyActivities;
