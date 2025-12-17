import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import SectionCard from '../../components/layout/SectionCard';
import TabNav from '../../components/layout/TabNav';
import api from '../../services/api';

const daysUntil = (date) => Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));

const StudentClassroomView = () => {
  const { classroomId } = useParams();
  const navigate = useNavigate();
  const [classroom, setClassroom] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('assignments');

  useEffect(() => {
    const load = async () => {
      try {
        const [classroomRes, assignmentsRes, submissionsRes] = await Promise.all([
          api.get(`/classrooms/${classroomId}`),
          api.get(`/assignments/classroom/${classroomId}`),
          api.get(`/submissions/classroom/${classroomId}`),
        ]);

        setClassroom(classroomRes.data);
        setAssignments(assignmentsRes.data.filter((a) => a.status === 'published'));
        setSubmissions(
          submissionsRes.data.filter((s) => s.status === 'submitted' || s.status === 'returned')
        );
      } catch (error) {
        console.error('Error loading classroom:', error);
        alert('Failed to load classroom');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [classroomId]);

  if (loading) {
    return <LoadingSpinner label="Loading classroom..." />;
  }

  if (!classroom) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate('/student')}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          ← Back to Dashboard
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
      <ClassroomHeader classroom={classroom} onBack={() => navigate('/student')} />

      <div className="grid gap-6 md:grid-cols-2">
        <SectionCard subtitle="Section" title={classroom.section} />
        <SectionCard subtitle="Department" title={classroom.department} />
      </div>

      <TabNav
        tabs={[
          { id: 'assignments', label: 'Assignments' },
          { id: 'my-submissions', label: 'My Submissions' },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === 'assignments' && (
        <AssignmentsTab
          assignments={assignments}
          submissions={submissions}
          onOpen={(id) => navigate(`/student/assignment/${id}`)}
        />
      )}

      {activeTab === 'my-submissions' && (
        <SubmissionsTab
          submissions={submissions}
          onOpen={(id) => navigate(`/student/assignment/${id}`)}
        />
      )}
    </div>
  );
};

const ClassroomHeader = ({ classroom, onBack }) => (
  <div>
    <button onClick={onBack} className="mb-3 text-blue-600 hover:text-blue-700 font-medium">
      ← Back to Classrooms
    </button>
    <h1 className="text-3xl font-semibold text-slate-900">{classroom.name}</h1>
    <p className="mt-1 text-slate-600">{classroom.description}</p>
  </div>
);

const AssignmentsTab = ({ assignments, submissions, onOpen }) => {
  if (assignments.length === 0) {
    return (
      <SectionCard padded>
        <EmptyState
          title="No assignments yet"
          description="Check back later for assignments from your instructor."
        />
      </SectionCard>
    );
  }

  return (
    <div className="space-y-4">
      {assignments.map((assignment) => {
        const submission = submissions.find((s) => {
          const submissionAssignmentId = s.assignment?._id || s.assignment;
          return submissionAssignmentId?.toString() === assignment._id?.toString();
        });

        return (
          <AssignmentCard
            key={assignment._id}
            assignment={assignment}
            submission={submission}
            onOpen={onOpen}
          />
        );
      })}
    </div>
  );
};

const AssignmentCard = ({ assignment, submission, onOpen }) => {
  const dueInDays = daysUntil(assignment.dueDate);
  const dueLabel = dueInDays > 0 ? `${dueInDays} days left` : 'Overdue';
  const dueClass = dueInDays < 0 ? 'text-red-600 font-bold' : 'text-slate-600';

  return (
    <SectionCard className="hover:shadow-2xl transition" padded>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-900">{assignment.title}</h3>
          <p className="mt-1 text-slate-600">{assignment.description}</p>
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-600">
            <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
            <span className={dueClass}>{dueLabel}</span>
            <span>Points: {assignment.maxPoints}</span>
          </div>
          {submission?.grade !== undefined && (
            <div className="mt-3 rounded-lg border border-green-200 bg-green-50 p-3">
              <p className="text-sm font-semibold text-green-900">
                Your Grade: {submission.grade}/{submission.maxPoints} ({Math.round((submission.grade / submission.maxPoints) * 100)}%)
              </p>
              {submission.feedback && (
                <p className="mt-1 text-sm text-green-800">Feedback: {submission.feedback}</p>
              )}
            </div>
          )}
        </div>
        <button
          onClick={() => onOpen(assignment._id)}
          className="ml-4 whitespace-nowrap rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
        >
          {submission ? 'View' : 'Submit'}
        </button>
      </div>
    </SectionCard>
  );
};

const SubmissionsTab = ({ submissions, onOpen }) => {
  if (submissions.length === 0) {
    return (
      <SectionCard padded>
        <EmptyState
          title="No submissions yet"
          description="Submit your first assignment to see it here."
        />
      </SectionCard>
    );
  }

  return (
    <div className="space-y-4">
      {submissions.map((submission) => (
        <SubmissionCard key={submission._id} submission={submission} onOpen={onOpen} />
      ))}
    </div>
  );
};

const SubmissionCard = ({ submission, onOpen }) => (
  <SectionCard>
    <h3 className="text-lg font-semibold text-slate-900">{submission.assignment?.title}</h3>
    <div className="mt-2 space-y-2 text-sm text-slate-600">
      <p>
        Submitted:{' '}
        {submission.submittedAt
          ? new Date(submission.submittedAt).toLocaleDateString()
          : 'Pending timestamp'}
      </p>
      <p>
        Status:
        <StatusBadge status={submission.status} />
      </p>
      {submission.isLate && <p className="font-semibold text-red-600">Late Submission</p>}
    </div>
    {submission.grade !== undefined && (
      <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3">
        <p className="text-sm font-semibold text-green-900">
          Grade: {submission.grade}/{submission.maxPoints} ({Math.round((submission.grade / submission.maxPoints) * 100)}%)
        </p>
        {submission.feedback && (
          <p className="mt-2 text-sm text-green-800">Feedback: {submission.feedback}</p>
        )}
      </div>
    )}
    <button
      onClick={() => onOpen(submission.assignment?._id)}
      className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
    >
      View Assignment
    </button>
  </SectionCard>
);

const StatusBadge = ({ status }) => {
  const styles = {
    submitted: 'bg-yellow-100 text-yellow-800',
    returned: 'bg-blue-100 text-blue-800',
    graded: 'bg-green-100 text-green-800',
  };

  const style = styles[status] || 'bg-gray-100 text-gray-800';

  return (
    <span className={`ml-2 inline-block rounded px-3 py-1 text-xs font-medium ${style}`}>
      {status?.toUpperCase()}
    </span>
  );
};

export default StudentClassroomView;