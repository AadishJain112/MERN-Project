import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import SectionCard from '../../components/layout/SectionCard';
import api from '../../services/api';

const daysUntil = (date) => Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));

const ClassroomView = () => {
  const { classroomId } = useParams();
  const navigate = useNavigate();
  const [classroom, setClassroom] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateAssignment, setShowCreateAssignment] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructions: '',
    dueDate: '',
    maxPoints: 100,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [classroomRes, assignmentsRes] = await Promise.all([
          api.get(`/classrooms/${classroomId}`),
          api.get(`/assignments/classroom/${classroomId}`),
        ]);
        setClassroom(classroomRes.data);
        setAssignments(assignmentsRes.data);
      } catch (error) {
        console.error('Error loading classroom:', error);
        alert('Failed to load classroom');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [classroomId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name === 'maxPoints' ? parseInt(value, 10) : value }));
  };

  const refreshAssignments = async () => {
    const assignmentsRes = await api.get(`/assignments/classroom/${classroomId}`);
    setAssignments(assignmentsRes.data);
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/assignments', { ...formData, classroomId });
      alert('Assignment created successfully!');
      setFormData({ title: '', description: '', instructions: '', dueDate: '', maxPoints: 100 });
      setShowCreateAssignment(false);
      await refreshAssignments();
    } catch (error) {
      alert('Error creating assignment: ' + error.response?.data?.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublishAssignment = async (assignmentId) => {
    try {
      await api.put(`/assignments/${assignmentId}/publish`);
      alert('Assignment published successfully!');
      await refreshAssignments();
    } catch (error) {
      alert('Error publishing assignment: ' + error.response?.data?.error);
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) return;
    try {
      await api.delete(`/assignments/${assignmentId}`);
      alert('Assignment deleted successfully!');
      await refreshAssignments();
    } catch (error) {
      alert('Error deleting assignment: ' + error.response?.data?.error);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading classroom..." />;
  }

  if (!classroom) {
    return (
      <div className="space-y-6">
        <button onClick={() => navigate('/teacher')} className="text-blue-600 hover:text-blue-700 font-medium">
          ← Back to Classrooms
        </button>
        <EmptyState
          title="Classroom not found"
          description="The classroom you're looking for doesn't exist."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ClassroomHeader classroom={classroom} onBack={() => navigate('/teacher')} />

      <div className="grid gap-6 md:grid-cols-3">
        <SectionCard subtitle="Classroom Code">
          <p className="mt-1 font-mono text-2xl font-bold text-blue-600">{classroom.code}</p>
          <p className="mt-2 text-xs text-slate-500">Share with students to invite them</p>
        </SectionCard>
        <SectionCard subtitle="Enrolled Students" title={classroom.students?.length || 0} />
        <SectionCard subtitle="Assignments" title={assignments.length} />
      </div>

      <StudentsList students={classroom.students} />

      <AssignmentsSection
        assignments={assignments}
        showCreateAssignment={showCreateAssignment}
        setShowCreateAssignment={setShowCreateAssignment}
        formData={formData}
        onChange={handleChange}
        onCreate={handleCreateAssignment}
        onPublish={handlePublishAssignment}
        onDelete={handleDeleteAssignment}
        isSubmitting={isSubmitting}
        navigate={navigate}
      />
    </div>
  );
};

const ClassroomHeader = ({ classroom, onBack }) => (
  <div className="flex items-start justify-between">
    <div>
      <button onClick={onBack} className="mb-3 text-blue-600 hover:text-blue-700 font-medium">
        ← Back to Classrooms
      </button>
      <h1 className="text-3xl font-semibold text-slate-900">{classroom.name}</h1>
      <p className="mt-1 text-slate-600">{classroom.description}</p>
    </div>
  </div>
);

const StudentsList = ({ students = [] }) => {
  const navigate = useNavigate();
  
  return (
    <SectionCard title={`Enrolled Students (${students.length || 0})`}>
      {students.length === 0 ? (
        <EmptyState
          title="No students yet"
          description="Students will appear here once they join using the classroom code."
        />
      ) : (
        <div className="grid gap-3">
          {students.map((student) => (
            <div key={student._id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-4 hover:bg-slate-100 transition">
              <div className="flex-1">
                <p className="font-medium text-slate-900">{student.name}</p>
                <p className="text-sm text-slate-600">{student.email}</p>
                {student.rollNumber && <p className="text-sm text-slate-500">Roll: {student.rollNumber}</p>}
              </div>
              <button
                onClick={() => navigate(`/teacher/student/${student._id}`)}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                View Profile
              </button>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
};

const AssignmentsSection = ({
  assignments,
  showCreateAssignment,
  setShowCreateAssignment,
  formData,
  onChange,
  onCreate,
  onPublish,
  onDelete,
  isSubmitting,
  navigate,
}) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-semibold text-slate-900">Assignments</h2>
      <button
        onClick={() => setShowCreateAssignment((prev) => !prev)}
        className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
      >
        {showCreateAssignment ? 'Cancel' : '+ New Assignment'}
      </button>
    </div>

    {showCreateAssignment && (
      <SectionCard>
        <AssignmentForm formData={formData} onChange={onChange} onSubmit={onCreate} isSubmitting={isSubmitting} />
      </SectionCard>
    )}

    {assignments.length === 0 ? (
      <SectionCard padded>
        <EmptyState
          title="No assignments yet"
          description="Create your first assignment to get students started."
        />
      </SectionCard>
    ) : (
      <div className="space-y-4">
        {assignments.map((assignment) => (
          <AssignmentCard
            key={assignment._id}
            assignment={assignment}
            onPublish={onPublish}
            onDelete={onDelete}
            navigate={navigate}
          />
        ))}
      </div>
    )}
  </div>
);

const AssignmentForm = ({ formData, onChange, onSubmit, isSubmitting }) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">Assignment Title</label>
      <input
        type="text"
        name="title"
        value={formData.title}
        onChange={onChange}
        placeholder="e.g., Midterm Project"
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
        placeholder="What should students do?"
        rows="3"
        className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
        required
      />
    </div>
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">Instructions</label>
      <textarea
        name="instructions"
        value={formData.instructions}
        onChange={onChange}
        placeholder="Detailed instructions (optional)"
        rows="2"
        className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
      />
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Due Date</label>
        <input
          type="datetime-local"
          name="dueDate"
          value={formData.dueDate}
          onChange={onChange}
          className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Max Points</label>
        <input
          type="number"
          name="maxPoints"
          value={formData.maxPoints}
          onChange={onChange}
          min="1"
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
      {isSubmitting ? 'Creating...' : 'Create Assignment'}
    </button>
  </form>
);

const AssignmentCard = ({ assignment, onPublish, onDelete, navigate }) => {
  const dueInDays = daysUntil(assignment.dueDate);
  const dueLabel = dueInDays > 0 ? `${dueInDays} days left` : 'Overdue';
  const dueClass = dueInDays < 0 ? 'text-red-600 font-bold' : 'text-slate-600';

  return (
    <SectionCard className="hover:shadow-2xl transition">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-900">{assignment.title}</h3>
          <p className="mt-1 text-slate-600">{assignment.description}</p>
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-600">
            <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
            <span className={dueClass}>{dueLabel}</span>
            <span>Points: {assignment.maxPoints}</span>
            <StatusPill status={assignment.status} />
          </div>
        </div>
        <div className="ml-4 flex gap-2">
          <button
            onClick={() => navigate(`/teacher/assignment/${assignment._id}`)}
            className="whitespace-nowrap rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            {assignment.status === 'published' ? 'View & Grade' : 'Edit'}
          </button>
          {assignment.status === 'draft' && (
            <>
              <button
                onClick={() => onPublish(assignment._id)}
                className="rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700"
              >
                Publish
              </button>
              <button
                onClick={() => onDelete(assignment._id)}
                className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </SectionCard>
  );
};

const StatusPill = ({ status }) => {
  const styles = {
    published: 'bg-green-100 text-green-800',
    draft: 'bg-yellow-100 text-yellow-800',
  };
  const style = styles[status] || 'bg-gray-100 text-gray-800';

  return <span className={`rounded px-2 py-1 text-xs font-medium ${style}`}>{status.toUpperCase()}</span>;
};

export default ClassroomView;
