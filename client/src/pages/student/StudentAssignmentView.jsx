import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import SectionCard from '../../components/layout/SectionCard';
import api from '../../services/api';

const daysUntil = (date) => Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));

const StudentAssignmentView = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [submitContent, setSubmitContent] = useState('');
  const [submitFile, setSubmitFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const assignmentRes = await api.get(`/assignments/${assignmentId}`);
        setAssignment(assignmentRes.data);

        const classroomId = assignmentRes.data?.classroom?._id || assignmentRes.data?.classroom;
        if (classroomId) {
          const submissionsRes = await api.get(`/submissions/classroom/${classroomId}`).catch(() => null);
          if (submissionsRes?.data) {
            const submitted = submissionsRes.data.filter(
              (s) => s.status === 'submitted' || s.status === 'returned'
            );
            const mine = submitted.find((s) => {
              const submissionAssignmentId = s.assignment?._id || s.assignment;
              return submissionAssignmentId?.toString() === assignmentId?.toString();
            });

            if (mine) {
              setSubmission(mine);
              setSubmitContent(mine.content || '');
            }
          }
        }
      } catch (error) {
        console.error('Error loading assignment:', error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [assignmentId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('assignmentId', assignmentId);
      formData.append('content', submitContent);
      if (submitFile) {
        formData.append('file', submitFile);
      }

      const response = await api.post('/submissions', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const newSubmission = response.data.submission || response.data;
      setSubmission(newSubmission);
      setShowSubmitForm(false);
      alert('Assignment submitted successfully!');
      window.location.reload();
    } catch (error) {
      alert('Error submitting assignment: ' + error.response?.data?.error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading assignment..." />;
  }

  if (!assignment) {
    return (
      <div className="space-y-6">
        <button onClick={() => navigate('/student')} className="text-blue-600 hover:text-blue-700 font-medium">
          ← Back to Classrooms
        </button>
        <EmptyState
          title="Assignment not found"
          description="The assignment you're looking for doesn't exist."
        />
      </div>
    );
  }

  const remainingDays = daysUntil(assignment.dueDate);
  const isOverdue = remainingDays < 0;
  const canSubmit = assignment.status === 'published' && !submission;

  return (
    <div className="space-y-6">
      <Header assignment={assignment} onBack={() => navigate('/student')} />

      <AssignmentMetaGrid assignment={assignment} submission={submission} remainingDays={remainingDays} />

      {assignment.instructions && <Instructions instructions={assignment.instructions} />}

      {canSubmit && (
        <SubmissionForm
          showSubmitForm={showSubmitForm}
          setShowSubmitForm={setShowSubmitForm}
          submitContent={submitContent}
          setSubmitContent={setSubmitContent}
          submitFile={submitFile}
          setSubmitFile={setSubmitFile}
          handleSubmit={handleSubmit}
          submitting={submitting}
        />
      )}

      {submission && <SubmissionDetails submission={submission} />}
    </div>
  );
};

const Header = ({ assignment, onBack }) => (
  <div>
    <button onClick={onBack} className="mb-3 text-blue-600 hover:text-blue-700 font-medium">
      ← Back to Classrooms
    </button>
    <h1 className="text-3xl font-semibold text-slate-900">{assignment.title}</h1>
    <p className="mt-1 text-slate-600">{assignment.description}</p>
  </div>
);

const AssignmentMetaGrid = ({ assignment, submission, remainingDays }) => (
  <div className="grid gap-6 md:grid-cols-3">
    <SectionCard subtitle="Due Date" title={new Date(assignment.dueDate).toLocaleDateString()}>
      <p className={`text-xs font-semibold ${remainingDays < 0 ? 'text-red-600' : 'text-slate-600'}`}>
        {remainingDays < 0 ? 'Overdue' : `${remainingDays} days remaining`}
      </p>
    </SectionCard>
    <SectionCard subtitle="Points Available" title={assignment.maxPoints} />
    <SectionCard subtitle="Status">
      <p className={`text-lg font-bold ${statusColor(submission)}`}>{submissionStatusLabel(submission)}</p>
    </SectionCard>
  </div>
);

const submissionStatusLabel = (submission) => {
  if (submission?.grade !== undefined) return 'Graded';
  if (submission?.status === 'submitted') return 'Submitted';
  if (submission?.status === 'returned') return 'Returned';
  return 'Not Submitted';
};

const statusColor = (submission) => {
  if (submission?.grade !== undefined) return 'text-green-600';
  if (submission?.status === 'submitted') return 'text-yellow-600';
  if (submission?.status === 'returned') return 'text-blue-600';
  return 'text-slate-600';
};

const Instructions = ({ instructions }) => (
  <SectionCard className="border-blue-200 bg-blue-50" padded>
    <h3 className="mb-2 font-semibold text-slate-900">Instructions</h3>
    <p className="text-slate-700">{instructions}</p>
  </SectionCard>
);

const SubmissionForm = ({ showSubmitForm, setShowSubmitForm, submitContent, setSubmitContent, submitFile, setSubmitFile, handleSubmit, submitting }) => (
  <SectionCard className="border-blue-200 bg-blue-50" padded>
    {!showSubmitForm ? (
      <button
        onClick={() => setShowSubmitForm(true)}
        className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
      >
        Submit Assignment
      </button>
    ) : (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Your Response</label>
          <textarea
            value={submitContent}
            onChange={(e) => setSubmitContent(e.target.value)}
            placeholder="Enter your submission content here..."
            rows="6"
            className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Attachment (Optional)</label>
          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={(e) => setSubmitFile(e.target.files[0])}
            className="w-full rounded-lg border border-dashed border-slate-300 px-4 py-3 text-sm"
          />
          <p className="mt-1 text-xs text-slate-500">Accepted formats: PDF, PNG, JPG. Max 5 MB.</p>
          {submitFile && (
            <p className="mt-2 text-sm text-slate-700">
              Selected: <span className="font-medium">{submitFile.name}</span>
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-green-600 px-6 py-2 font-medium text-white hover:bg-green-700 disabled:bg-gray-400"
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowSubmitForm(false);
              setSubmitContent('');
              setSubmitFile(null);
            }}
            className="rounded-lg bg-slate-300 px-6 py-2 font-medium text-slate-900 hover:bg-slate-400"
          >
            Cancel
          </button>
        </div>
      </form>
    )}
  </SectionCard>
);

const SubmissionDetails = ({ submission }) => (
  <SectionCard>
    <h2 className="mb-4 text-xl font-semibold text-slate-900">Your Submission</h2>

    <div className="mb-4 border-b border-slate-200 pb-4">
      <p className="text-sm text-slate-600">Submitted on:</p>
      <p className="mt-1 font-semibold text-slate-900">
        {submission.submittedAt
          ? `${new Date(submission.submittedAt).toLocaleDateString()} at ${new Date(submission.submittedAt).toLocaleTimeString()}`
          : 'Pending timestamp'}
      </p>
      {submission.isLate && <p className="mt-2 font-semibold text-red-600">⚠️ Late Submission</p>}
    </div>

    <div className="mb-4 rounded-lg bg-slate-50 p-4">
      <p className="mb-2 text-sm text-slate-600">Content:</p>
      <p className="whitespace-pre-wrap text-slate-900">{submission.content}</p>
    </div>

    {submission.attachments && submission.attachments.length > 0 && (
      <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <p className="mb-2 text-sm text-slate-600">Attachment:</p>
        {submission.attachments.map((attachment, index) => (
          <div key={index} className="flex items-center gap-2">
            <a
              href={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${attachment.url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 hover:underline"
            >
              📎 {attachment.filename}
            </a>
            <span className="text-xs text-slate-500">
              (Uploaded: {new Date(attachment.uploadedAt).toLocaleDateString()})
            </span>
          </div>
        ))}
      </div>
    )}

    {submission.grade !== undefined && (
      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
        <p className="mb-2 text-sm text-slate-600">Grade:</p>
        <p className="mb-2 text-2xl font-bold text-green-600">
          {submission.grade}/{submission.maxPoints} ({Math.round((submission.grade / submission.maxPoints) * 100)}%)
        </p>
        {submission.feedback && (
          <>
            <p className="mb-2 text-sm text-slate-600">Feedback:</p>
            <p className="whitespace-pre-wrap text-slate-900">{submission.feedback}</p>
          </>
        )}
      </div>
    )}
  </SectionCard>
);

export default StudentAssignmentView;
