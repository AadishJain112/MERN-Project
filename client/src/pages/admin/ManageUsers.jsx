import { useEffect, useState } from "react";
import EmptyState from "../../components/EmptyState";
import LoadingSpinner from "../../components/LoadingSpinner";
import api from "../../services/api";

const defaultForm = {
  name: "",
  email: "",
  role: "student",
  department: "",
  batch: "",
  password: "",
};

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [roleFilter, setRoleFilter] = useState("all");

  const refreshUsers = async () => {
    try {
      const { data } = await api.get("/admin/users");
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setUsers([]);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        await refreshUsers();
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/admin/user/add", form);
      setForm(defaultForm);
      await refreshUsers();
    } catch (err) {
      // ignore for now
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/user/delete/${id}`);
      await refreshUsers();
    } catch (err) {
      // ignore
    }
  };

  // Organize users by role and department
  const organizeUsers = () => {
    const organized = {
      teacher: {},
      student: {},
      admin: {},
    };

    users.forEach((user) => {
      const role = user.role || 'student';
      const dept = user.department || 'No Department';
      
      if (!organized[role][dept]) {
        organized[role][dept] = [];
      }
      organized[role][dept].push(user);
    });

    // Sort departments alphabetically within each role
    Object.keys(organized).forEach((role) => {
      const sortedDepts = Object.keys(organized[role]).sort();
      const sorted = {};
      sortedDepts.forEach((dept) => {
        // Sort users within department by name
        sorted[dept] = organized[role][dept].sort((a, b) =>
          (a.name || '').localeCompare(b.name || '')
        );
      });
      organized[role] = sorted;
    });

    return organized;
  };

  const organizedUsers = organizeUsers();

  // Check if filtered results are empty
  const hasFilteredResults = () => {
    if (roleFilter === "all") {
      return users.length > 0;
    }
    const roleData = organizedUsers[roleFilter] || {};
    return Object.values(roleData).flat().length > 0;
  };

  if (loading) return <LoadingSpinner label="Loading users..." />;

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
          Add new user
        </p>
        <p className="mt-2 text-sm text-slate-500">
          Create student, teacher, or admin accounts for CD-STAR.
        </p>

        <form className="mt-6 text-black space-y-4" onSubmit={handleSubmit}>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Full name"
            required
            className="w-full rounded-2xl border px-4 py-3 text-sm"
          />
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            required
            className="w-full rounded-2xl border px-4 py-3 text-sm"
          />
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full rounded-2xl border px-4 py-3 text-sm"
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="admin">Admin</option>
          </select>
          <div className="grid gap-3 md:grid-cols-2">
            <input
              name="department"
              value={form.department}
              onChange={handleChange}
              placeholder="Department"
              className="rounded-2xl border px-4 py-3 text-sm"
            />
            <input
              name="batch"
              value={form.batch}
              onChange={handleChange}
              placeholder="Batch"
              className="rounded-2xl border px-4 py-3 text-sm"
            />
          </div>
          <input
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Temporary password (optional)"
            type="password"
            className="w-full rounded-2xl border px-4 py-3 text-sm"
          />
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-2xl bg-indigo-600 px-4 py-3 text-sm text-white"
          >
            {submitting ? "Creating..." : "Create user"}
          </button>
        </form>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
              Existing users
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Users organized by role and department.
            </p>
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="all">All Users</option>
            <option value="teacher">Teachers</option>
            <option value="student">Students</option>
            <option value="admin">Admins</option>
          </select>
        </div>
        {users.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              title="No users yet"
              description="Add your first user to begin."
            />
          </div>
        ) : !hasFilteredResults() ? (
          <div className="mt-4">
            <EmptyState
              title={`No ${roleFilter === "all" ? "" : roleFilter + " "}users found`}
              description={`There are no ${roleFilter === "all" ? "" : roleFilter + " "}users in the system.`}
            />
          </div>
        ) : (
          <div className="mt-6 space-y-8">
            {/* Teachers Section */}
            {(roleFilter === "all" || roleFilter === "teacher") &&
              Object.keys(organizedUsers.teacher).length > 0 && (
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-slate-900">Teachers</h3>
                  <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
                    {Object.values(organizedUsers.teacher).flat().length}
                  </span>
                </div>
                {Object.entries(organizedUsers.teacher).map(([dept, deptUsers]) => (
                  <div key={`teacher-${dept}`} className="mb-6">
                    <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-600">
                      {dept}
                    </h4>
                    <div className="space-y-2">
                      {deptUsers.map((u) => (
                        <div
                          key={u._id}
                          className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm hover:bg-slate-50"
                        >
                          <div className="flex-1">
                            <p className="font-semibold text-slate-800">{u.name}</p>
                            <p className="text-slate-500">{u.email}</p>
                            {u.batch && (
                              <p className="text-xs text-slate-400">Batch: {u.batch}</p>
                            )}
                          </div>
                          <button
                            onClick={() => handleDelete(u._id)}
                            className="rounded-lg bg-rose-500 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-600"
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Students Section */}
            {(roleFilter === "all" || roleFilter === "student") &&
              Object.keys(organizedUsers.student).length > 0 && (
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-slate-900">Students</h3>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    {Object.values(organizedUsers.student).flat().length}
                  </span>
                </div>
                {Object.entries(organizedUsers.student).map(([dept, deptUsers]) => (
                  <div key={`student-${dept}`} className="mb-6">
                    <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-600">
                      {dept}
                    </h4>
                    <div className="space-y-2">
                      {deptUsers.map((u) => (
                        <div
                          key={u._id}
                          className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm hover:bg-slate-50"
                        >
                          <div className="flex-1">
                            <p className="font-semibold text-slate-800">{u.name}</p>
                            <p className="text-slate-500">{u.email}</p>
                            <div className="mt-1 flex gap-3 text-xs text-slate-400">
                              {u.rollNumber && <span>Roll: {u.rollNumber}</span>}
                              {u.batch && <span>Batch: {u.batch}</span>}
                              {u.cgpa !== undefined && (
                                <span className="font-semibold text-slate-600">
                                  CGPA: {u.cgpa.toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleDelete(u._id)}
                            className="rounded-lg bg-rose-500 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-600"
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Admins Section */}
            {(roleFilter === "all" || roleFilter === "admin") &&
              Object.keys(organizedUsers.admin).length > 0 && (
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-slate-900">Admins</h3>
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                    {Object.values(organizedUsers.admin).flat().length}
                  </span>
                </div>
                {Object.entries(organizedUsers.admin).map(([dept, deptUsers]) => (
                  <div key={`admin-${dept}`} className="mb-6">
                    <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-600">
                      {dept}
                    </h4>
                    <div className="space-y-2">
                      {deptUsers.map((u) => (
                        <div
                          key={u._id}
                          className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm hover:bg-slate-50"
                        >
                          <div className="flex-1">
                            <p className="font-semibold text-slate-800">{u.name}</p>
                            <p className="text-slate-500">{u.email}</p>
                          </div>
                          <button
                            onClick={() => handleDelete(u._id)}
                            className="rounded-lg bg-rose-500 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-600"
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageUsers;
