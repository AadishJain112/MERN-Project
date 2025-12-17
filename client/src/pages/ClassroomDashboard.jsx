import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

/**
 * Complete Classroom Management Dashboard
 * Shows how to integrate all classroom components together
 */
const ClassroomDashboard = () => {
  const { user, userRole } = useAuth();
  const [activeTab, setActiveTab] = useState('classrooms');
  const [classrooms, setClassrooms] = useState([]);
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'classrooms') {
      fetchClassrooms();
    }
  }, [activeTab]);

  const fetchClassrooms = async () => {
    setLoading(true);
    try {
      const endpoint = userRole === 'teacher'
        ? '/api/classrooms/teacher/all'
        : '/api/classrooms/student/all';
      const response = await api.get(endpoint);
      setClassrooms(response.data);
    } catch (error) {
      console.error('Error fetching classrooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClassroomAssignments = async (classroomId) => {
    try {
      const response = await api.get(`/assignments/classroom/${classroomId}`);
      setAssignments(response.data);
      setSelectedClassroom(classroomId);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {userRole === 'teacher' ? 'Teaching Dashboard' : 'Student Dashboard'}
          </h1>
          <p className="text-gray-600">Welcome, {user?.name}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b">
          <button
            onClick={() => setActiveTab('classrooms')}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              activeTab === 'classrooms'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Classrooms
          </button>
          <button
            onClick={() => setActiveTab('assignments')}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              activeTab === 'assignments'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Assignments
          </button>
          {userRole === 'teacher' && (
            <button
              onClick={() => setActiveTab('grading')}
              className={`px-4 py-2 font-medium border-b-2 transition ${
                activeTab === 'grading'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Grading
            </button>
          )}
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow p-6">
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : activeTab === 'classrooms' ? (
            <ClassroomsTab
              classrooms={classrooms}
              userRole={userRole}
              onSelectClassroom={fetchClassroomAssignments}
            />
          ) : activeTab === 'assignments' ? (
            <AssignmentsTab
              selectedClassroom={selectedClassroom}
              assignments={assignments}
              classrooms={classrooms}
              userRole={userRole}
              onSelectClassroom={fetchClassroomAssignments}
            />
          ) : (
            <GradingTab
              selectedClassroom={selectedClassroom}
              assignments={assignments}
              classrooms={classrooms}
            />
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Classrooms Tab - List and manage classrooms
 */
const ClassroomsTab = ({ classrooms, userRole, onSelectClassroom }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          {userRole === 'teacher' ? 'My Classrooms' : 'Enrolled Classrooms'}
        </h2>
        {userRole === 'teacher' && (
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Create Classroom
          </button>
        )}
        {userRole === 'student' && (
          <JoinClassroomButton onJoin={() => window.location.reload()} />
        )}
      </div>

      {showCreateForm && (
        <CreateClassroomForm
          onSuccess={() => {
            setShowCreateForm(false);
            window.location.reload();
          }}
        />
      )}

      {classrooms.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-2">
            {userRole === 'teacher'
              ? 'No classrooms created yet'
              : 'Not enrolled in any classrooms'}
          </p>
          <p className="text-sm">
            {userRole === 'student' && 'Ask your teacher for the classroom code'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {classrooms.map(classroom => (
            <ClassroomCard
              key={classroom._id}
              classroom={classroom}
              userRole={userRole}
              onClick={() => onSelectClassroom(classroom._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Classroom Card Component
 */
const ClassroomCard = ({ classroom, userRole, onClick }) => (
  <div className="border rounded-lg p-4 hover:shadow-lg transition cursor-pointer" onClick={onClick}>
    <h3 className="text-xl font-bold mb-2">{classroom.name}</h3>
    <p className="text-gray-600 mb-3">{classroom.description}</p>
    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
      <p><strong>Section:</strong> {classroom.section}</p>
      <p><strong>Dept:</strong> {classroom.department}</p>
      <p><strong>Students:</strong> {classroom.students?.length || 0}</p>
      <p><strong>Status:</strong> {classroom.status}</p>
    </div>
    {userRole === 'teacher' && (
      <div className="bg-blue-50 p-2 rounded text-sm">
        <p className="font-semibold">Classroom Code: <code className="bg-white px-2 py-1 rounded">{classroom.code}</code></p>
        <p className="text-xs text-gray-600 mt-1">Share this code with students to let them join</p>
      </div>
    )}
    <button
      onClick={(e) => {
        e.stopPropagation();
        window.location.href = `/classroom/${classroom._id}`;
      }}
      className="mt-3 w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      Open Classroom
    </button>
  </div>
);

/**
 * Assignments Tab - View and manage assignments
 */
const AssignmentsTab = ({
  selectedClassroom,
  assignments,
  classrooms,
  userRole,
  onSelectClassroom
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);

  if (!selectedClassroom) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg mb-4">Select a classroom to view assignments</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {classrooms.map(classroom => (
            <button
              key={classroom._id}
              onClick={() => onSelectClassroom(classroom._id)}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              {classroom.name}
            </button>
          ))}
        </div>
      </div>
    );
  }

  const classroom = classrooms.find(c => c._id === selectedClassroom);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Assignments</h2>
          <p className="text-gray-600">{classroom?.name}</p>
        </div>
        {userRole === 'teacher' && (
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Create Assignment
          </button>
        )}
      </div>

      {showCreateForm && (
        <CreateAssignmentForm
          classroomId={selectedClassroom}
          onSuccess={() => {
            setShowCreateForm(false);
            window.location.reload();
          }}
        />
      )}

      {assignments.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No assignments yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map(assignment => (
            <AssignmentRow
              key={assignment._id}
              assignment={assignment}
              userRole={userRole}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Assignment Row Component
 */
const AssignmentRow = ({ assignment, userRole }) => {
  const daysUntilDue = Math.ceil(
    (new Date(assignment.dueDate) - new Date()) / (1000 * 60 * 60 * 24)
  );
  const isOverdue = daysUntilDue < 0;

  return (
    <div className="border rounded-lg p-4 hover:bg-gray-50">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2">{assignment.title}</h3>
          <p className="text-gray-600 mb-3">{assignment.description}</p>
          <div className="flex gap-4 text-sm text-gray-600">
            <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
            <span className={isOverdue ? 'text-red-600 font-bold' : daysUntilDue <= 3 ? 'text-orange-600' : ''}>
              {daysUntilDue > 0 ? `${daysUntilDue} days left` : 'Overdue'}
            </span>
            <span>Points: {assignment.maxPoints}</span>
            <span className={`px-2 py-1 rounded text-xs ${
              assignment.status === 'published' ? 'bg-green-100 text-green-800' :
              assignment.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {assignment.status}
            </span>
          </div>
        </div>
        <button
          onClick={() => window.location.href = `/assignment/${assignment._id}`}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 whitespace-nowrap ml-4"
        >
          {userRole === 'teacher' ? 'Manage' : 'Submit'}
        </button>
      </div>
    </div>
  );
};

/**
 * Grading Tab - For teachers to grade submissions
 */
const GradingTab = ({ selectedClassroom, assignments, classrooms }) => {
  if (!selectedClassroom) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg mb-4">Select a classroom to view assignments for grading</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {classrooms.map(classroom => (
            <button
              key={classroom._id}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              {classroom.name}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Grade Submissions</h2>
      {assignments.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No assignments to grade</p>
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map(assignment => (
            <div key={assignment._id} className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2">{assignment.title}</h3>
              <button
                onClick={() => window.location.href = `/assignment/${assignment._id}`}
                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
              >
                View & Grade Submissions
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Helper Components
 */

const JoinClassroomButton = ({ onJoin }) => {
  const [showForm, setShowForm] = useState(false);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/classrooms/join/code', { code });
      alert('Successfully joined classroom!');
      onJoin();
    } catch (error) {
      alert('Error: ' + error.response?.data?.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowForm(!showForm)}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Join Classroom
      </button>
      {showForm && (
        <form onSubmit={handleJoin} className="mt-4 p-4 bg-blue-50 rounded">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Enter 8-character classroom code"
            maxLength="8"
            className="px-3 py-2 border rounded w-full mb-2"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? 'Joining...' : 'Join'}
          </button>
        </form>
      )}
    </>
  );
};

const CreateClassroomForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    section: '',
    department: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/classrooms', formData);
      alert('Classroom created successfully!');
      onSuccess();
    } catch (error) {
      alert('Error: ' + error.response?.data?.error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 p-4 bg-green-50 rounded">
      <h3 className="text-lg font-bold mb-4">Create New Classroom</h3>
      <input
        type="text"
        name="name"
        placeholder="Classroom Name (e.g., CS101)"
        value={formData.name}
        onChange={handleChange}
        className="w-full px-3 py-2 border rounded mb-3"
        required
      />
      <textarea
        name="description"
        placeholder="Description"
        value={formData.description}
        onChange={handleChange}
        className="w-full px-3 py-2 border rounded mb-3"
        rows="2"
      />
      <input
        type="text"
        name="section"
        placeholder="Section (e.g., A, B, C)"
        value={formData.section}
        onChange={handleChange}
        className="w-full px-3 py-2 border rounded mb-3"
        required
      />
      <input
        type="text"
        name="department"
        placeholder="Department"
        value={formData.department}
        onChange={handleChange}
        className="w-full px-3 py-2 border rounded mb-3"
        required
      />
      <button
        type="submit"
        className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        Create Classroom
      </button>
    </form>
  );
};

const CreateAssignmentForm = ({ classroomId, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructions: '',
    dueDate: '',
    maxPoints: 100
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/assignments', {
        ...formData,
        classroomId
      });
      alert('Assignment created successfully!');
      onSuccess();
    } catch (error) {
      alert('Error: ' + error.response?.data?.error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 p-4 bg-green-50 rounded">
      <h3 className="text-lg font-bold mb-4">Create New Assignment</h3>
      <input
        type="text"
        name="title"
        placeholder="Assignment Title"
        value={formData.title}
        onChange={handleChange}
        className="w-full px-3 py-2 border rounded mb-3"
        required
      />
      <textarea
        name="description"
        placeholder="Description"
        value={formData.description}
        onChange={handleChange}
        className="w-full px-3 py-2 border rounded mb-3"
        rows="2"
        required
      />
      <textarea
        name="instructions"
        placeholder="Detailed Instructions"
        value={formData.instructions}
        onChange={handleChange}
        className="w-full px-3 py-2 border rounded mb-3"
        rows="2"
      />
      <input
        type="datetime-local"
        name="dueDate"
        value={formData.dueDate}
        onChange={handleChange}
        className="w-full px-3 py-2 border rounded mb-3"
        required
      />
      <input
        type="number"
        name="maxPoints"
        placeholder="Max Points"
        value={formData.maxPoints}
        onChange={handleChange}
        className="w-full px-3 py-2 border rounded mb-3"
        required
      />
      <button
        type="submit"
        className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        Create Assignment
      </button>
    </form>
  );
};

export default ClassroomDashboard;
