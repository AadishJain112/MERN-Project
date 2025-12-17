import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ActivityCard from '../../components/ActivityCard';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import SectionCard from '../../components/layout/SectionCard';
import TabNav from '../../components/layout/TabNav';
import StatCard from '../../components/StatCard';
import api from '../../services/api';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [pending, setPending] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [activitiesRes, classroomsRes] = await Promise.all([
        api.get('/teacher/activities/pending'),
        api.get('/classrooms/teacher/all'),
      ]);
      setPending(activitiesRes.data);
      setClassrooms(classroomsRes.data);
    } catch (error) {
      console.error('Error loading teacher dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return <LoadingSpinner label="Loading teacher dashboard..." />;
  }

  const stats = [
    { title: 'My Classrooms', value: classrooms.length, change: 'Active classrooms', accent: 'primary' },
    { title: 'Pending Reviews', value: pending.length, change: 'Awaiting your action', accent: 'secondary' },
    {
      title: 'Event Submissions',
      value: pending.filter((item) => item.category === 'event').length,
      change: 'Events to review',
      accent: 'accent',
    },
  ];

  return (
    <div className="space-y-10">
      <SectionCard padded>
        <p className="text-xs uppercase tracking-[0.5em] text-slate-400">Teacher overview</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">Welcome back, instructor</h1>
        <p className="mt-2 text-sm text-slate-500">
          Manage your classrooms, create assignments, and grade student submissions all in one place.
        </p>
      </SectionCard>

      <TabNav
        tabs={[
          { id: 'overview', label: 'Dashboard' },
          { id: 'classrooms', label: 'Classrooms' },
          { id: 'activities', label: 'Activities' },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === 'overview' && (
        <OverviewTab stats={stats} classrooms={classrooms} pending={pending} onNavigate={setActiveTab} navigate={navigate} />
      )}

      {activeTab === 'classrooms' && (
        <ClassroomsSection classrooms={classrooms} onRefresh={loadData} navigate={navigate} />
      )}

      {activeTab === 'activities' && <ActivitiesTab pending={pending} />}
    </div>
  );
};

const OverviewTab = ({ stats, classrooms, pending, onNavigate, navigate }) => (
  <div className="space-y-6">
    <div className="grid gap-6 md:grid-cols-3">
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>

    <div className="grid gap-6 md:grid-cols-2">
      <SectionCard
        title="Recent Classrooms"
        action={
          <button
            onClick={() => onNavigate('classrooms')}
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            View All
          </button>
        }
      >
        {classrooms.length === 0 ? (
          <EmptyState title="No classrooms yet" description="Create your first classroom to get started." />
        ) : (
          <div className="space-y-3">
            {classrooms.slice(0, 3).map((classroom) => (
              <button
                key={classroom._id}
                onClick={() => navigate(`/teacher/classroom/${classroom._id}`)}
                className="w-full rounded-lg border border-slate-200 p-3 text-left transition hover:bg-slate-50"
              >
                <p className="font-semibold text-slate-900">{classroom.name}</p>
                <p className="text-sm text-slate-600">
                  {classroom.students?.length || 0} students • {classroom.section}
                </p>
              </button>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="Pending Reviews"
        action={
          <button
            onClick={() => onNavigate('activities')}
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            View All
          </button>
        }
      >
        {pending.length === 0 ? (
          <EmptyState title="All caught up!" description="No pending submissions right now." />
        ) : (
          <div className="space-y-3">
            {pending.slice(0, 3).map((activity) => (
              <div key={activity._id} className="rounded-lg border border-slate-200 p-3 hover:bg-slate-50">
                <p className="text-sm font-semibold text-slate-900">{activity.title}</p>
                <p className="mt-1 text-xs text-slate-600">
                  {activity.category} • {activity.student?.name}
                </p>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  </div>
);

const ClassroomsSection = ({ classrooms, onRefresh, navigate }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', section: '', department: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateClassroom = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/classrooms', formData);
      alert('Classroom created successfully!');
      setFormData({ name: '', description: '', section: '', department: '' });
      setShowCreateForm(false);
      onRefresh();
    } catch (error) {
      alert('Error creating classroom: ' + error.response?.data?.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-slate-900">My Classrooms</h2>
        <button
          onClick={() => setShowCreateForm((prev) => !prev)}
          className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
        >
          {showCreateForm ? 'Cancel' : '+ New Classroom'}
        </button>
      </div>

      {showCreateForm && (
        <SectionCard>
          <CreateClassroomForm
            formData={formData}
            onChange={handleChange}
            onSubmit={handleCreateClassroom}
            isSubmitting={isSubmitting}
          />
        </SectionCard>
      )}

      {classrooms.length === 0 ? (
        <SectionCard padded>
          <EmptyState
            title="No classrooms yet"
            description="Create your first classroom to start managing assignments and students."
          />
        </SectionCard>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {classrooms.map((classroom) => (
            <ClassroomCard key={classroom._id} classroom={classroom} navigate={navigate} />
          ))}
        </div>
      )}
    </div>
  );
};

const CreateClassroomForm = ({ formData, onChange, onSubmit, isSubmitting }) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">Classroom Name</label>
      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={onChange}
        placeholder="e.g., CS101 - Programming Basics"
        className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
        required
      />
    </div>
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
      <textarea
        name="description"
        value={formData.description}
        onChange={onChange}
        placeholder="What is this classroom about?"
        rows="3"
        className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
      />
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Section</label>
        <input
          type="text"
          name="section"
          value={formData.section}
          onChange={onChange}
          placeholder="e.g., A, B, Section 1"
          className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Department</label>
        <input
          type="text"
          name="department"
          value={formData.department}
          onChange={onChange}
          placeholder="e.g., Computer Science"
          className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
    </div>
    <button
      type="submit"
      disabled={isSubmitting}
      className="w-full rounded-lg bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700 disabled:bg-gray-400"
    >
      {isSubmitting ? 'Creating...' : 'Create Classroom'}
    </button>
  </form>
);

const ClassroomCard = ({ classroom, navigate }) => (
  <SectionCard className="cursor-pointer hover:shadow-2xl transition" onClick={() => navigate(`/teacher/classroom/${classroom._id}`)}>
    <div className="mb-4">
      <h3 className="text-lg font-semibold text-slate-900">{classroom.name}</h3>
      <p className="mt-1 text-sm text-slate-600">{classroom.description}</p>
    </div>
    <div className="mb-4 space-y-2 border-b border-slate-200 pb-4 text-sm text-slate-600">
      <p>
        <strong>Section:</strong> {classroom.section}
      </p>
      <p>
        <strong>Department:</strong> {classroom.department}
      </p>
      <p>
        <strong>Students:</strong> {classroom.students?.length || 0}
      </p>
    </div>
    <div className="mb-4 rounded-lg bg-blue-50 p-3">
      <p className="text-xs text-slate-600">Classroom Code:</p>
      <p className="font-mono font-bold text-blue-600">{classroom.code}</p>
      <p className="mt-1 text-xs text-slate-500">Share this with students to invite them</p>
    </div>
    <button
      onClick={(e) => {
        e.stopPropagation();
        navigate(`/teacher/classroom/${classroom._id}`);
      }}
      className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
    >
      Open Classroom
    </button>
  </SectionCard>
);

const ActivitiesTab = ({ pending }) => (
  <SectionCard title="Pending Submissions">
    {pending.length === 0 ? (
      <div className="mt-6">
        <EmptyState title="All caught up!" description="No pending applications right now." />
      </div>
    ) : (
      <div className="mt-6 space-y-4">
        {pending.map((activity) => (
          <ActivityCard key={activity._id} activity={activity} />
        ))}
      </div>
    )}
  </SectionCard>
);

export default TeacherDashboard;

