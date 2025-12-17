import { useEffect, useState } from 'react';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import AcademicPerformance from './AcademicPerformance';
import api from '../../services/api';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data } = await api.get('/student/profile');
        setProfile(data);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  if (loading) {
    return <LoadingSpinner label="Loading profile..." />;
  }

  if (!profile) {
    return <EmptyState title="Profile unavailable" description="Please try again later." />;
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'activities', label: 'Activities' },
    { id: 'academic', label: 'Academic Performance' },
  ];

  return (
    <div className="space-y-8">
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
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Personal details</p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {[
                { label: 'Name', value: profile.user?.name },
                { label: 'Email', value: profile.user?.email },
                { label: 'Department', value: profile.user?.department || 'Not set' },
                { label: 'Batch', value: profile.user?.batch || 'Not set' },
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
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
                Academic performance
              </p>
              {profile.academics?.length ? (
                <ul className="mt-6 space-y-3">
                  {profile.academics.map((item) => (
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
                  <EmptyState title="No records" description="Ask your faculty to add academic data." />
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/5">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Attendance snapshot</p>
              {profile.attendance?.length ? (
                <ul className="mt-6 space-y-3">
                  {profile.attendance.map((item) => (
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
                  <EmptyState title="No records" description="Attendance yet to be published." />
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {activeTab === 'activities' && (
        <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/5">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Activities</p>
          <p className="mt-4 text-sm text-slate-600">
            View your activities in the{' '}
            <a href="/student/activities" className="text-indigo-600 hover:underline">
              Activities page
            </a>
            .
          </p>
        </div>
      )}

      {activeTab === 'academic' && <AcademicPerformance />}
    </div>
  );
};

export default Profile;

