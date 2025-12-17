// frontend/src/pages/admin/Analytics.jsx
import { useEffect, useState } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';
import AdvancedChart from '../../components/Analytics/AdvancedChart';
import StatCard from '../../components/StatCard';
import api from '../../services/api';

const Analytics = () => {
  const [overview, setOverview] = useState(null);
  const [activityData, setActivityData] = useState(null);
  const [academicData, setAcademicData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [activityPeriod, setActivityPeriod] = useState('30');
  const [refreshing, setRefreshing] = useState(false);
  const [academicFilters, setAcademicFilters] = useState({
    department: 'all',
    batch: 'all',
    semesterRange: 'all',
  });

  const loadData = async () => {
    try {
      setRefreshing(true);
      const [overviewRes, activityRes, academicRes, userRes] = await Promise.all([
        api.get('/analytics/overview'),
        api.get(`/analytics/activities?period=${activityPeriod}`),
        api.get('/analytics/academics'),
        api.get('/analytics/users'),
      ]);
      setOverview(overviewRes.data);
      setActivityData(activityRes.data);
      setAcademicData(academicRes.data);
      setUserData(userRes.data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeTab === 'activities' && activityPeriod) {
      const loadActivityData = async () => {
        try {
          setRefreshing(true);
          const { data } = await api.get(`/analytics/activities?period=${activityPeriod}`);
          setActivityData(data);
        } catch (error) {
          console.error('Error loading activity data:', error);
        } finally {
          setRefreshing(false);
        }
      };
      loadActivityData();
    }
  }, [activityPeriod, activeTab]);

  if (loading) {
    return <LoadingSpinner label="Loading analytics..." />;
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'activities', label: 'Activities' },
    { id: 'academics', label: 'Academics' },
    { id: 'users', label: 'Users' },
  ];

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/5">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Advanced Analytics</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">Data Intelligence Center</h1>
        <p className="mt-2 text-sm text-slate-500">
          Comprehensive insights and trends across all platform metrics.
        </p>
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

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              onClick={loadData}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Refresh All Data
            </button>
          </div>
          {overview ? (
            <>
          <div className="grid gap-6 md:grid-cols-4">
            <StatCard
              title="Total Users"
              value={overview.users.total}
              change={`${overview.users.students} students, ${overview.users.teachers} teachers`}
              accent="primary"
            />
            <StatCard
              title="Activities"
              value={overview.activities.total}
              change={`${overview.activities.approved} approved`}
              accent="accent"
            />
            <StatCard
              title="Academic Records"
              value={overview.academics.totalRecords}
              change="All semesters"
              accent="secondary"
            />
            <StatCard
              title="Unread Notifications"
              value={overview.notifications.unread}
              change="Pending alerts"
              accent="primary"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/5">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Activity Status</p>
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Approved</span>
                  <span className="text-lg font-bold text-green-600">
                    {overview.activities.approved}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Pending</span>
                  <span className="text-lg font-bold text-yellow-600">
                    {overview.activities.pending}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Rejected</span>
                  <span className="text-lg font-bold text-red-600">
                    {overview.activities.rejected}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/5">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400">User Distribution</p>
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Students</span>
                  <span className="text-lg font-bold text-indigo-600">
                    {overview.users.students}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Teachers</span>
                  <span className="text-lg font-bold text-sky-600">{overview.users.teachers}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Admins</span>
                  <span className="text-lg font-bold text-amber-600">
                    {overview.users.admins}
                  </span>
                </div>
              </div>
            </div>
          </div>
            </>
          ) : (
            <div className="flex h-64 items-center justify-center text-slate-500">
              Failed to load overview data
            </div>
          )}
        </div>
      )}

      {/* Activities Tab */}
      {activeTab === 'activities' && (
        <div className="space-y-6">
          {refreshing ? (
            <LoadingSpinner label="Loading activity data..." />
          ) : activityData ? (
            <>
              {/* Period Selector and Stats */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-slate-700">Period:</label>
                  <select
                    value={activityPeriod}
                    onChange={(e) => setActivityPeriod(e.target.value)}
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="7">Last 7 days</option>
                    <option value="30">Last 30 days</option>
                    <option value="90">Last 90 days</option>
                    <option value="365">Last year</option>
                  </select>
                </div>
                <button
                  onClick={async () => {
                    try {
                      setRefreshing(true);
                      const { data } = await api.get(`/analytics/activities?period=${activityPeriod}`);
                      setActivityData(data);
                    } catch (error) {
                      console.error('Error refreshing activity data:', error);
                    } finally {
                      setRefreshing(false);
                    }
                  }}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                >
                  Refresh
                </button>
              </div>

              {/* Activity Summary Cards */}
              <div className="grid gap-6 md:grid-cols-4">
                <StatCard
                  title="Total Activities"
                  value={activityData.trends?.reduce((sum, t) => sum + t.count, 0) || 0}
                  accent="primary"
                />
                <StatCard
                  title="Approved"
                  value={activityData.trends?.reduce((sum, t) => sum + t.approved, 0) || 0}
                  accent="accent"
                />
                <StatCard
                  title="Pending"
                  value={activityData.trends?.reduce((sum, t) => sum + t.pending, 0) || 0}
                  accent="secondary"
                />
                <StatCard
                  title="Categories"
                  value={activityData.byCategory?.length || 0}
                  accent="primary"
                />
              </div>

              {/* Charts */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/5">
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Activity Trends</p>
                  <p className="mt-1 text-sm text-slate-500">Activity submissions over time</p>
                  <div className="mt-6">
                    {activityData.trends && activityData.trends.length > 0 ? (
                      <AdvancedChart
                        type="line"
                        data={{
                          labels: activityData.trends.map((t) => {
                            const date = new Date(t._id);
                            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                          }),
                          datasets: [
                            {
                              label: 'Total',
                              data: activityData.trends.map((t) => t.count),
                              borderColor: 'rgb(99, 102, 241)',
                              backgroundColor: 'rgba(99, 102, 241, 0.1)',
                              tension: 0.4,
                            },
                            {
                              label: 'Approved',
                              data: activityData.trends.map((t) => t.approved),
                              borderColor: 'rgb(34, 197, 94)',
                              backgroundColor: 'rgba(34, 197, 94, 0.1)',
                              tension: 0.4,
                            },
                            {
                              label: 'Pending',
                              data: activityData.trends.map((t) => t.pending),
                              borderColor: 'rgb(251, 191, 36)',
                              backgroundColor: 'rgba(251, 191, 36, 0.1)',
                              tension: 0.4,
                            },
                          ],
                        }}
                      />
                    ) : (
                      <div className="flex h-64 items-center justify-center text-slate-500">
                        No activity data available for this period
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/5">
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-400">By Category</p>
                  <p className="mt-1 text-sm text-slate-500">Distribution of activities by category</p>
                  <div className="mt-6">
                    {activityData.byCategory && activityData.byCategory.length > 0 ? (
                      <AdvancedChart
                        type="doughnut"
                        data={{
                          labels: activityData.byCategory.map((c) => c._id || 'Uncategorized'),
                          datasets: [
                            {
                              data: activityData.byCategory.map((c) => c.count),
                              backgroundColor: [
                                'rgba(99, 102, 241, 0.8)',
                                'rgba(34, 197, 94, 0.8)',
                                'rgba(251, 191, 36, 0.8)',
                                'rgba(239, 68, 68, 0.8)',
                                'rgba(168, 85, 247, 0.8)',
                                'rgba(236, 72, 153, 0.8)',
                              ],
                            },
                          ],
                        }}
                      />
                    ) : (
                      <div className="flex h-64 items-center justify-center text-slate-500">
                        No category data available
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Activity Status Breakdown */}
              {activityData.byStatus && activityData.byStatus.length > 0 && (
                <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/5">
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Activity Status Breakdown</p>
                  <div className="mt-6">
                    <div className="grid gap-4 md:grid-cols-3">
                      {activityData.byStatus.map((status) => (
                        <div
                          key={status._id}
                          className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                        >
                          <p className="text-sm font-medium text-slate-600 capitalize">{status._id}</p>
                          <p className="mt-2 text-2xl font-bold text-slate-900">{status.count}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Category Details */}
              {activityData.byCategory && activityData.byCategory.length > 0 && (
                <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/5">
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Category Details</p>
                  <div className="mt-6">
                    <div className="space-y-3">
                      {activityData.byCategory.map((category) => (
                        <div
                          key={category._id}
                          className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4"
                        >
                          <div>
                            <p className="font-semibold text-slate-800">
                              {category._id || 'Uncategorized'}
                            </p>
                            <p className="text-sm text-slate-500">
                              {category.approved || 0} approved
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-indigo-600">{category.count}</p>
                            <p className="text-xs text-slate-500">total</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex h-64 items-center justify-center text-slate-500">
              Failed to load activity data
            </div>
          )}
        </div>
      )}

      {/* Academics Tab */}
      {activeTab === 'academics' && (
        <div className="space-y-6">
          {/* Filters and Refresh */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-slate-700">Department:</label>
                <select
                  value={academicFilters.department}
                  onChange={(e) =>
                    setAcademicFilters({ ...academicFilters, department: e.target.value })
                  }
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Departments</option>
                  {academicData?.byDepartment?.map((dept) => (
                    <option key={dept._id} value={dept._id}>
                      {dept._id || 'Unassigned'}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-slate-700">Batch:</label>
                <select
                  value={academicFilters.batch}
                  onChange={(e) =>
                    setAcademicFilters({ ...academicFilters, batch: e.target.value })
                  }
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Batches</option>
                  {academicData?.byBatch?.map((batch) => (
                    <option key={batch._id} value={batch._id}>
                      {batch._id || 'Unassigned'}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-slate-700">Semester:</label>
                <select
                  value={academicFilters.semesterRange}
                  onChange={(e) =>
                    setAcademicFilters({ ...academicFilters, semesterRange: e.target.value })
                  }
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Semesters</option>
                  {academicData?.bySemester?.map((sem) => (
                    <option key={sem._id} value={sem._id}>
                      Semester {sem._id}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              onClick={async () => {
                try {
                  setRefreshing(true);
                  const { data } = await api.get('/analytics/academics');
                  setAcademicData(data);
                } catch (error) {
                  console.error('Error refreshing academic data:', error);
                } finally {
                  setRefreshing(false);
                }
              }}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Refresh
            </button>
          </div>
          {refreshing ? (
            <LoadingSpinner label="Loading academic data..." />
          ) : academicData ? (
            <>
              {/* Summary Cards */}
              <div className="grid gap-6 md:grid-cols-4">
                <StatCard
                  title="Total Records"
                  value={academicData.overall?.totalRecords || 0}
                  change={`${academicData.overall?.totalStudents || 0} students`}
                  accent="primary"
                />
                <StatCard
                  title="Average SGPA"
                  value={academicData.overall?.avgSGPA?.toFixed(2) || '0.00'}
                  accent="accent"
                />
                <StatCard
                  title="Average CGPA"
                  value={academicData.overall?.avgCGPA?.toFixed(2) || '0.00'}
                  accent="secondary"
                />
                <StatCard
                  title="Excellent (9+)"
                  value={academicData.overall?.distribution?.excellent || 0}
                  change={`${academicData.overall?.totalRecords > 0 
                    ? ((academicData.overall.distribution.excellent / academicData.overall.totalRecords) * 100).toFixed(1) 
                    : 0}%`}
                  accent="primary"
                />
              </div>

              {/* Grade Distribution Cards */}
              <div className="grid gap-6 md:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-sm font-medium text-slate-600">Good (8-9)</p>
                  <p className="mt-2 text-2xl font-bold text-indigo-600">
                    {academicData.overall?.distribution?.good || 0}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {academicData.overall?.totalRecords > 0 
                      ? ((academicData.overall.distribution.good / academicData.overall.totalRecords) * 100).toFixed(1) 
                      : 0}%
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-sm font-medium text-slate-600">Average (7-8)</p>
                  <p className="mt-2 text-2xl font-bold text-amber-600">
                    {academicData.overall?.distribution?.average || 0}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {academicData.overall?.totalRecords > 0 
                      ? ((academicData.overall.distribution.average / academicData.overall.totalRecords) * 100).toFixed(1) 
                      : 0}%
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-sm font-medium text-slate-600">Below Average (&lt;7)</p>
                  <p className="mt-2 text-2xl font-bold text-rose-600">
                    {academicData.overall?.distribution?.belowAverage || 0}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {academicData.overall?.totalRecords > 0 
                      ? ((academicData.overall.distribution.belowAverage / academicData.overall.totalRecords) * 100).toFixed(1) 
                      : 0}%
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-sm font-medium text-slate-600">Total Semesters</p>
                  <p className="mt-2 text-2xl font-bold text-sky-600">
                    {academicData.bySemester?.length || 0}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {academicData.byDepartment?.length || 0} departments
                  </p>
                </div>
              </div>

              {/* Charts */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/5">
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
                    Performance by Semester
                  </p>
                  <p className="mt-1 text-sm text-slate-500">Average SGPA across semesters</p>
                  <div className="mt-6">
                    {academicData.bySemester && academicData.bySemester.length > 0 ? (
                      <AdvancedChart
                        type="bar"
                        data={{
                          labels: academicData.bySemester.map((s) => `Semester ${s._id}`),
                          datasets: [
                            {
                              label: 'Average SGPA',
                              data: academicData.bySemester.map((s) => 
                                s.avgSGPA ? parseFloat(s.avgSGPA.toFixed(2)) : 0
                              ),
                              backgroundColor: 'rgba(99, 102, 241, 0.8)',
                            },
                            {
                              label: 'Max SGPA',
                              data: academicData.bySemester.map((s) => 
                                s.maxSGPA ? parseFloat(s.maxSGPA.toFixed(2)) : 0
                              ),
                              backgroundColor: 'rgba(34, 197, 94, 0.8)',
                            },
                            {
                              label: 'Min SGPA',
                              data: academicData.bySemester.map((s) => 
                                s.minSGPA ? parseFloat(s.minSGPA.toFixed(2)) : 0
                              ),
                              backgroundColor: 'rgba(251, 191, 36, 0.8)',
                            },
                          ],
                        }}
                      />
                    ) : (
                      <div className="flex h-64 items-center justify-center text-slate-500">
                        No semester data available
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/5">
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
                    Grade Distribution
                  </p>
                  <p className="mt-1 text-sm text-slate-500">Overall performance distribution</p>
                  <div className="mt-6">
                    {academicData.overall?.distribution ? (
                      <AdvancedChart
                        type="pie"
                        data={{
                          labels: ['Excellent (9+)', 'Good (8-9)', 'Average (7-8)', 'Below Average (<7)'],
                          datasets: [
                            {
                              data: [
                                academicData.overall.distribution.excellent || 0,
                                academicData.overall.distribution.good || 0,
                                academicData.overall.distribution.average || 0,
                                academicData.overall.distribution.belowAverage || 0,
                              ],
                              backgroundColor: [
                                'rgba(34, 197, 94, 0.8)',
                                'rgba(99, 102, 241, 0.8)',
                                'rgba(251, 191, 36, 0.8)',
                                'rgba(239, 68, 68, 0.8)',
                              ],
                            },
                          ],
                        }}
                      />
                    ) : (
                      <div className="flex h-64 items-center justify-center text-slate-500">
                        No distribution data available
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Charts */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* CGPA Distribution */}
                {academicData.overall?.cgpaDistribution && (
                  <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/5">
                    <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
                      CGPA Distribution
                    </p>
                    <p className="mt-1 text-sm text-slate-500">Overall CGPA performance</p>
                    <div className="mt-6">
                      <AdvancedChart
                        type="doughnut"
                        data={{
                          labels: ['Excellent (9+)', 'Good (8-9)', 'Average (7-8)', 'Below Average (<7)'],
                          datasets: [
                            {
                              data: [
                                academicData.overall.cgpaDistribution.excellent || 0,
                                academicData.overall.cgpaDistribution.good || 0,
                                academicData.overall.cgpaDistribution.average || 0,
                                academicData.overall.cgpaDistribution.belowAverage || 0,
                              ],
                              backgroundColor: [
                                'rgba(34, 197, 94, 0.8)',
                                'rgba(99, 102, 241, 0.8)',
                                'rgba(251, 191, 36, 0.8)',
                                'rgba(239, 68, 68, 0.8)',
                              ],
                            },
                          ],
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Monthly Trends */}
                {academicData.byMonth && academicData.byMonth.length > 0 && (
                  <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/5">
                    <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
                      Monthly Trends
                    </p>
                    <p className="mt-1 text-sm text-slate-500">Records added over time</p>
                    <div className="mt-6">
                      <AdvancedChart
                        type="line"
                        data={{
                          labels: academicData.byMonth.map((m) => {
                            const [year, month] = m._id.split('-');
                            return new Date(year, month - 1).toLocaleDateString('en-US', {
                              month: 'short',
                              year: 'numeric',
                            });
                          }),
                          datasets: [
                            {
                              label: 'Records',
                              data: academicData.byMonth.map((m) => m.count),
                              borderColor: 'rgb(99, 102, 241)',
                              backgroundColor: 'rgba(99, 102, 241, 0.1)',
                              tension: 0.4,
                            },
                            {
                              label: 'Avg SGPA',
                              data: academicData.byMonth.map((m) =>
                                m.avgSGPA ? parseFloat(m.avgSGPA.toFixed(2)) : 0
                              ),
                              borderColor: 'rgb(34, 197, 94)',
                              backgroundColor: 'rgba(34, 197, 94, 0.1)',
                              tension: 0.4,
                            },
                          ],
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Performance by Department */}
              {academicData.byDepartment && academicData.byDepartment.length > 0 && (
                <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/5">
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
                    Performance by Department
                  </p>
                  <div className="mt-6">
                    <div className="mb-4">
                      <AdvancedChart
                        type="bar"
                        data={{
                          labels: academicData.byDepartment.map((d) => d._id || 'Unassigned'),
                          datasets: [
                            {
                              label: 'Avg SGPA',
                              data: academicData.byDepartment.map((d) =>
                                d.avgSGPA ? parseFloat(d.avgSGPA.toFixed(2)) : 0
                              ),
                              backgroundColor: 'rgba(99, 102, 241, 0.8)',
                            },
                            {
                              label: 'Max SGPA',
                              data: academicData.byDepartment.map((d) =>
                                d.maxSGPA ? parseFloat(d.maxSGPA.toFixed(2)) : 0
                              ),
                              backgroundColor: 'rgba(34, 197, 94, 0.8)',
                            },
                          ],
                        }}
                      />
                    </div>
                    <div className="space-y-3">
                      {academicData.byDepartment.map((dept) => (
                        <div
                          key={dept._id}
                          className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4"
                        >
                          <div>
                            <p className="font-semibold text-slate-800">
                              {dept._id || 'Unassigned'}
                            </p>
                            <p className="text-sm text-slate-500">{dept.count} records</p>
                          </div>
                          <div className="flex gap-6 text-right">
                            <div>
                              <p className="text-lg font-bold text-indigo-600">
                                {dept.avgSGPA ? dept.avgSGPA.toFixed(2) : '0.00'}
                              </p>
                              <p className="text-xs text-slate-500">Avg</p>
                            </div>
                            <div>
                              <p className="text-lg font-bold text-green-600">
                                {dept.maxSGPA ? dept.maxSGPA.toFixed(2) : '0.00'}
                              </p>
                              <p className="text-xs text-slate-500">Max</p>
                            </div>
                            <div>
                              <p className="text-lg font-bold text-amber-600">
                                {dept.minSGPA ? dept.minSGPA.toFixed(2) : '0.00'}
                              </p>
                              <p className="text-xs text-slate-500">Min</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Performance by Batch */}
              {academicData.byBatch && academicData.byBatch.length > 0 && (
                <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/5">
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
                    Performance by Batch
                  </p>
                  <div className="mt-6">
                    <div className="mb-4">
                      <AdvancedChart
                        type="bar"
                        data={{
                          labels: academicData.byBatch.map((b) => b._id || 'Unassigned'),
                          datasets: [
                            {
                              label: 'Avg SGPA',
                              data: academicData.byBatch.map((b) =>
                                b.avgSGPA ? parseFloat(b.avgSGPA.toFixed(2)) : 0
                              ),
                              backgroundColor: 'rgba(168, 85, 247, 0.8)',
                            },
                          ],
                        }}
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {academicData.byBatch.map((batch) => (
                        <div
                          key={batch._id}
                          className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                        >
                          <p className="text-sm font-semibold text-slate-800">
                            Batch {batch._id || 'Unassigned'}
                          </p>
                          <div className="mt-3 space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-600">Records:</span>
                              <span className="font-medium text-slate-800">{batch.count}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-600">Avg SGPA:</span>
                              <span className="font-medium text-indigo-600">
                                {batch.avgSGPA ? batch.avgSGPA.toFixed(2) : 'N/A'}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-600">Max:</span>
                              <span className="font-medium text-green-600">
                                {batch.maxSGPA ? batch.maxSGPA.toFixed(2) : 'N/A'}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-600">Min:</span>
                              <span className="font-medium text-amber-600">
                                {batch.minSGPA ? batch.minSGPA.toFixed(2) : 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Semester Details */}
              {academicData.bySemester && academicData.bySemester.length > 0 && (
                <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/5">
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
                    Semester Details
                  </p>
                  <div className="mt-6">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {academicData.bySemester.map((sem) => (
                        <div
                          key={sem._id}
                          className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                        >
                          <p className="text-sm font-semibold text-slate-800">
                            Semester {sem._id}
                          </p>
                          <div className="mt-3 space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-600">Records:</span>
                              <span className="font-medium text-slate-800">{sem.count}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-600">Avg SGPA:</span>
                              <span className="font-medium text-indigo-600">
                                {sem.avgSGPA ? sem.avgSGPA.toFixed(2) : 'N/A'}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-600">Max:</span>
                              <span className="font-medium text-green-600">
                                {sem.maxSGPA ? sem.maxSGPA.toFixed(2) : 'N/A'}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-600">Min:</span>
                              <span className="font-medium text-amber-600">
                                {sem.minSGPA ? sem.minSGPA.toFixed(2) : 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Top Performing Students */}
              {academicData.topStudents && academicData.topStudents.length > 0 && (
                <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/5">
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
                    Top Performing Students
                  </p>
                  <p className="mt-1 text-sm text-slate-500">Top 10 students by CGPA</p>
                  <div className="mt-6">
                    <div className="space-y-3">
                      {academicData.topStudents.map((student, index) => (
                        <div
                          key={student.studentId}
                          className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-lg font-bold text-indigo-600">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800">{student.name}</p>
                              <p className="text-sm text-slate-500">
                                {student.department} • Batch {student.batch} • {student.semesterCount} semesters
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-indigo-600">
                              {student.cgpa.toFixed(2)}
                            </p>
                            <p className="text-xs text-slate-500">CGPA</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex h-64 items-center justify-center text-slate-500">
              Failed to load academic data
            </div>
          )}
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && userData && (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/5">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Users by Role</p>
              <div className="mt-6">
                <AdvancedChart
                  type="doughnut"
                  data={{
                    labels: userData.byRole.map((r) => r._id),
                    datasets: [
                      {
                        data: userData.byRole.map((r) => r.count),
                        backgroundColor: [
                          'rgba(99, 102, 241, 0.8)',
                          'rgba(34, 197, 94, 0.8)',
                          'rgba(251, 191, 36, 0.8)',
                        ],
                      },
                    ],
                  }}
                />
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/5">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400">By Department</p>
              <div className="mt-6 max-h-96 overflow-y-auto">
                <div className="space-y-2">
                  {userData.byDepartment.map((dept) => (
                    <div key={dept._id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                      <span className="text-sm font-medium text-slate-700">{dept._id || 'Unassigned'}</span>
                      <span className="text-lg font-bold text-indigo-600">{dept.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;

