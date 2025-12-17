import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';
import { useAuthContext } from '../../context/AuthContext';

const StudentClassrooms = () => {
  const { user } = useAuthContext();
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        const { data } = await api.get('/classrooms/student/all');
        setClassrooms(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load classrooms');
      } finally {
        setLoading(false);
      }
    };
    fetchClassrooms();
  }, []);

  const handleJoin = async (event) => {
    event.preventDefault();
    if (!joinCode.trim()) return;
    setJoining(true);
    try {
      await api.post('/classrooms/join/code', { code: joinCode.trim() });
      setJoinCode('');
      const { data } = await api.get('/classrooms/student/all');
      setClassrooms(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to join classroom');
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading classrooms..." />;
  }

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Classrooms</p>
            <h1 className="text-2xl font-semibold text-slate-900">My Classrooms</h1>
            <p className="text-sm text-slate-500">{user?.department || 'Department'}</p>
          </div>
          <form onSubmit={handleJoin} className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              placeholder="Enter classroom code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              className="w-48 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={joining}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60"
            >
              {joining ? 'Joining...' : 'Join Class'}
            </button>
          </form>
        </div>
        {error && <p className="mt-4 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}
      </div>

      {classrooms.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white/80 p-12 text-center text-slate-500">
          <p className="text-lg font-semibold text-slate-700">You are not in any classrooms yet</p>
          <p className="mt-2 text-sm">Ask your teacher for a classroom code to join.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {classrooms.map((classroom) => (
            <div
              key={classroom._id}
              className="group rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Section {classroom.section}</p>
                  <h2 className="mt-1 text-xl font-semibold text-slate-900">{classroom.name}</h2>
                  <p className="text-sm text-slate-500">{classroom.department}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {classroom.students?.length || 0} students
                </span>
              </div>
              {classroom.description && (
                <p className="mt-3 text-sm text-slate-600">{classroom.description}</p>
              )}
              <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
                <span>Teacher: {classroom.teacher?.name || 'N/A'}</span>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  {classroom.status || 'active'}
                </span>
              </div>
              <Link
                to={`/student/classroom/${classroom._id}`}
                className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
              >
                Open Classroom
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentClassrooms;
