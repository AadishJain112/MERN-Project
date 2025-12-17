import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import SectionCard from '../../components/layout/SectionCard';
import api from '../../services/api';

const AssignmentView = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [gradeFormData, setGradeFormData] = useState({});
  const [submittingGrade, setSubmittingGrade] = useState(null);
  const [gradingSubmission, setGradingSubmission] = useState(null);

  const loadData = async () => {
    try {
      const [assignmentRes, submissionsRes, summaryRes] = await Promise.all([
        api.get(`/assignments/${assignmentId}`),
        api.get(`/submissions/assignment/${assignmentId}/all`),
        api.get(`/submissions/assignment/${assignmentId}/summary`),
      ]);

      setAssignment(assignmentRes.data);
      const actualSubmissions = submissionsRes.data.filter(
        (s) => (s.status === 'submitted' || s.status === 'returned') && s.submittedAt
      );
      setSubmissions(actualSubmissions);
      setSummary(summaryRes.data);
    } catch (error) {
      console.error('Error loading assignment:', error);
      alert('Failed to load assignment');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [assignmentId]);

  const handleDeleteAssignment = async () => {
    if (!window.confirm('Are you sure you want to delete this assignment? This action cannot be undone.')) return;

    try {
      await api.delete(`/assignments/${assignmentId}`);
      alert('Assignment deleted successfully!');
      navigate('/teacher');
    } catch (error) {
      alert('Error deleting assignment: ' + error.response?.data?.error);
    }
  };

  const handleGradeChange = (submissionId, field, value) => {
    setGradeFormData((prev) => ({
      ...prev,
      [submissionId]: { ...prev[submissionId], [field]: value },
    }));
  };

  const handleSaveGrade = async (submissionId) => {
    const formData = gradeFormData[submissionId];
    if (!formData || formData.grade === undefined) {
      alert('Please enter a grade');
      return;
    }

    setSubmittingGrade(submissionId);
    try {
      await api.put(`/submissions/${submissionId}/grade`, {
        grade: parseInt(formData.grade, 10),
        feedback: formData.feedback || '',
      });
      alert('Submission graded successfully!');
      await loadData();
      setGradeFormData({});
      setGradingSubmission(null);
    } catch (error) {
      alert('Error grading submission: ' + error.response?.data?.error);
    } finally {
      setSubmittingGrade(null);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading assignment..." />;
  }

  if (!assignment) {
    return (
      <div className="space-y-6">
        <button onClick={() => navigate('/teacher')} className="text-blue-600 hover:text-blue-700 font-medium">
          ← Back to Classrooms
        </button>
        <EmptyState
          title="Assignment not found"
          description="The assignment you're looking for doesn't exist."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Header assignment={assignment} onBack={() => navigate('/teacher')} onDelete={handleDeleteAssignment} />

      <AssignmentInfoGrid assignment={assignment} submissionsCount={submissions.length} />

      {assignment.instructions && <Instructions instructions={assignment.instructions} />}

      {summary && <SummaryGrid summary={summary} totalSubmissions={submissions.length} />}

      <SubmissionList submissions={submissions} onOpen={(s) => setGradingSubmission(s)} />

      {gradingSubmission && (
        <GradeModal
          submission={gradingSubmission}
          assignment={assignment}
          gradeFormData={gradeFormData}
          handleGradeChange={handleGradeChange}
          handleSaveGrade={handleSaveGrade}
          submittingGrade={submittingGrade}
          onClose={() => {
            setGradingSubmission(null);
            setGradeFormData({});
          }}
        />
      )}
    </div>
  );
};

const Header = ({ assignment, onBack, onDelete }) => (
  <div className="space-y-3">
    <div className="flex items-start justify-between">
      <button onClick={onBack} className="text-blue-600 hover:text-blue-700 font-medium">
        ← Back to Classrooms
      </button>
      <button
        onClick={onDelete}
        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
      >
        Delete Assignment
      </button>
    </div>
    <div>
      <h1 className="text-3xl font-semibold text-slate-900">{assignment.title}</h1>
      <p className="mt-1 text-slate-600">{assignment.description}</p>
    </div>
  </div>
);

const AssignmentInfoGrid = ({ assignment, submissionsCount }) => (
  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
    <SectionCard subtitle="Status">
      <p className={`text-2xl font-bold ${statusColor(assignment.status)}`}>
        {assignment.status.toUpperCase()}
      </p>
    </SectionCard>
    <SectionCard subtitle="Due Date">
      <p className="text-lg font-bold text-slate-900">
        {new Date(assignment.dueDate).toLocaleDateString()}
      </p>
      <p className="text-xs text-slate-500 mt-1">
        {new Date(assignment.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </p>
    </SectionCard>
    <SectionCard subtitle="Max Points" title={assignment.maxPoints} />
    <SectionCard subtitle="Submissions" title={submissionsCount} />
  </div>
);

const statusColor = (status) => {
  if (status === 'published') return 'text-green-600';
  if (status === 'draft') return 'text-yellow-600';
  return 'text-gray-600';
};

const Instructions = ({ instructions }) => (
  <SectionCard className="border-blue-200 bg-blue-50">
    <h3 className="mb-2 font-semibold text-slate-900">Instructions</h3>
    <p className="text-slate-700">{instructions}</p>
  </SectionCard>
);

const SummaryGrid = ({ summary, totalSubmissions }) => (
  <div className="grid gap-6 md:grid-cols-3">
    <SectionCard subtitle="Submitted">
      <p className="text-3xl font-bold text-slate-900">{summary.totalSubmitted}</p>
      <p className="text-xs text-slate-500 mt-1">
        {summary.totalSubmitted} / {totalSubmissions}
      </p>
    </SectionCard>
    <SectionCard subtitle="Graded">
      <p className="text-3xl font-bold text-slate-900">{summary.totalGraded}</p>
      <p className="text-xs text-slate-500 mt-1">
        {summary.totalGraded} / {totalSubmissions}
      </p>
    </SectionCard>
    <SectionCard subtitle="Average Grade">
      <p className="text-3xl font-bold text-slate-900">{summary.averageGrade.toFixed(1)}%</p>
    </SectionCard>
  </div>
);

const SubmissionList = ({ submissions, onOpen }) => (
  <SectionCard title={`Student Submissions (${submissions.length})`}>
    {submissions.length === 0 ? (
      <EmptyState title="No submissions yet" description="Students will submit their work here." />
    ) : (
      <div className="space-y-3">
        {submissions.map((submission) => (
          <div
            key={submission._id}
            className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:bg-slate-100"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-slate-900">
                    {submission.student?.name || submission.studentName || 'Unknown Student'}
                  </h3>
                  {submission.isLate && (
                    <span className="rounded bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">LATE</span>
                  )}
                  {submission.grade !== undefined && (
                    <span className="rounded bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                      {submission.grade}/{submission.maxPoints} ({Math.round((submission.grade / submission.maxPoints) * 100)}%)
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  {submission.student?.email || submission.studentEmail} • Submitted{' '}
                  {new Date(submission.submittedAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => onOpen(submission)}
                className="whitespace-nowrap rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                {submission.grade !== undefined ? 'View/Edit Grade' : 'Grade'}
              </button>
            </div>
          </div>
        ))}
      </div>
    )}
  </SectionCard>
);

const GradeModal = ({
  submission,
  assignment,
  gradeFormData,
  handleGradeChange,
  handleSaveGrade,
  submittingGrade,
  onClose,
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
      <div className="sticky top-0 flex items-start justify-between border-b border-slate-200 px-6 py-4 bg-white">
        <div>
          <h3 className="text-xl font-bold text-slate-900">
            {submission.student?.name || submission.studentName}
          </h3>
          <p className="text-sm text-slate-600">{submission.student?.email || submission.studentEmail}</p>
          <p className="mt-1 text-xs text-slate-500">
            Submitted: {new Date(submission.submittedAt).toLocaleDateString()} at{' '}
            {new Date(submission.submittedAt).toLocaleTimeString()}
          </p>
          {submission.isLate && <p className="mt-1 text-xs font-bold text-red-600">⚠️ LATE SUBMISSION</p>}
        </div>
        <button onClick={onClose} className="text-2xl text-slate-400 hover:text-slate-600">
          ×
        </button>
      </div>

      <div className="space-y-4 p-6">
        <div>
          <h4 className="mb-2 font-semibold text-slate-900">Submission Content:</h4>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="whitespace-pre-wrap text-slate-700">
              {submission.content || '(No content provided)'}
            </p>
          </div>
        </div>

        {submission.attachments && submission.attachments.length > 0 && (
          <div>
            <h4 className="mb-2 font-semibold text-slate-900">Attachment:</h4>
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              {submission.attachments.map((attachment, index) => (
                <div key={index} className="flex items-center gap-2">
                  <a
                    href={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${attachment.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
                  >
                    📎 {attachment.filename}
                  </a>
                  <span className="text-xs text-slate-500">
                    (Uploaded: {new Date(attachment.uploadedAt).toLocaleDateString()})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Grade (0-{assignment.maxPoints})
            </label>
            <input
              type="number"
              min="0"
              max={assignment.maxPoints}
              value={gradeFormData[submission._id]?.grade ?? submission.grade ?? ''}
              onChange={(e) => handleGradeChange(submission._id, 'grade', e.target.value)}
              placeholder="Enter grade"
              className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Feedback (optional)</label>
            <textarea
              value={gradeFormData[submission._id]?.feedback ?? submission.feedback ?? ''}
              onChange={(e) => handleGradeChange(submission._id, 'feedback', e.target.value)}
              placeholder="Add feedback for the student"
              rows="4"
              className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => handleSaveGrade(submission._id)}
            disabled={submittingGrade === submission._id}
            className="flex-1 rounded-lg bg-green-600 px-4 py-3 font-semibold text-white hover:bg-green-700 disabled:bg-gray-400"
          >
            {submittingGrade === submission._id ? 'Saving...' : 'Save Grade'}
          </button>
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-200 px-4 py-3 font-semibold text-slate-900 hover:bg-slate-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default AssignmentView;
