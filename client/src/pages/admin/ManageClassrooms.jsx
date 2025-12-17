import { useEffect, useState } from "react";
import EmptyState from "../../components/EmptyState";
import LoadingSpinner from "../../components/LoadingSpinner";
import api from "../../services/api";

const defaultForm = {
  name: "",
  description: "",
  section: "",
  department: "",
  teacherId: "",
};

const ManageClassrooms = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [editingId, setEditingId] = useState(null);
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [showStudentManager, setShowStudentManager] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");

  const refreshClassrooms = async () => {
    try {
      const { data } = await api.get("/admin/classrooms");
      setClassrooms(Array.isArray(data) ? data : []);
    } catch (err) {
      setClassrooms([]);
    }
  };

  const loadTeachers = async () => {
    try {
      const { data } = await api.get("/admin/users?role=teacher");
      setTeachers(Array.isArray(data) ? data : []);
    } catch (err) {
      setTeachers([]);
    }
  };

  const loadStudents = async () => {
    try {
      const { data } = await api.get("/admin/users?role=student");
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      setStudents([]);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        await Promise.all([refreshClassrooms(), loadTeachers(), loadStudents()]);
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
      if (editingId) {
        await api.put(`/admin/classrooms/${editingId}`, form);
      } else {
        await api.post("/admin/classrooms", form);
      }
      setForm(defaultForm);
      setEditingId(null);
      await refreshClassrooms();
    } catch (err) {
      alert(err.response?.data?.message || "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (classroom) => {
    setForm({
      name: classroom.name || "",
      description: classroom.description || "",
      section: classroom.section || "",
      department: classroom.department || "",
      teacherId: classroom.teacher?._id || "",
    });
    setEditingId(classroom._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancel = () => {
    setForm(defaultForm);
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this classroom?")) return;
    try {
      await api.delete(`/admin/classrooms/${id}`);
      await refreshClassrooms();
    } catch (err) {
      alert(err.response?.data?.message || "An error occurred");
    }
  };

  const handleManageStudents = (classroom) => {
    setSelectedClassroom(classroom);
    setShowStudentManager(true);
  };

  const handleAddStudent = async (studentId) => {
    try {
      const { data } = await api.post(`/admin/classrooms/${selectedClassroom._id}/add-student`, {
        studentId,
      });
      await refreshClassrooms();
      // Update selected classroom from response
      if (data.classroom) {
        setSelectedClassroom(data.classroom);
      } else {
        // Fallback: fetch updated classroom
        const { data: updated } = await api.get(`/classrooms/${selectedClassroom._id}`);
        setSelectedClassroom(updated);
      }
    } catch (err) {
      alert(err.response?.data?.message || "An error occurred");
    }
  };

  const handleRemoveStudent = async (studentId) => {
    try {
      const { data } = await api.post(`/admin/classrooms/${selectedClassroom._id}/remove-student`, {
        studentId,
      });
      await refreshClassrooms();
      // Update selected classroom from response
      if (data.classroom) {
        setSelectedClassroom(data.classroom);
      } else {
        // Fallback: fetch updated classroom
        const { data: updated } = await api.get(`/classrooms/${selectedClassroom._id}`);
        setSelectedClassroom(updated);
      }
    } catch (err) {
      alert(err.response?.data?.message || "An error occurred");
    }
  };

  const filteredStudents = students.filter(
    (student) =>
      !selectedClassroom?.students?.some((s) => s._id === student._id) &&
      (student.name?.toLowerCase().includes(studentSearch.toLowerCase()) ||
        student.email?.toLowerCase().includes(studentSearch.toLowerCase()) ||
        student.rollNumber?.toLowerCase().includes(studentSearch.toLowerCase()))
  );

  if (loading) return <LoadingSpinner label="Loading classrooms..." />;

  if (showStudentManager && selectedClassroom) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">
              Manage Students: {selectedClassroom.name}
            </h2>
            <p className="text-sm text-slate-500">
              Add or remove students from this classroom
            </p>
          </div>
          <button
            onClick={() => {
              setShowStudentManager(false);
              setSelectedClassroom(null);
            }}
            className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Back to Classrooms
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Add Students */}
          <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl">
            <p className="text-lg font-semibold text-slate-900 mb-4">
              Add Students
            </p>
            <input
              type="text"
              placeholder="Search students..."
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              className="w-full rounded-2xl border px-4 py-3 text-sm mb-4"
            />
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredStudents.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">
                  No students available to add
                </p>
              ) : (
                filteredStudents.map((student) => (
                  <div
                    key={student._id}
                    className="flex items-center justify-between rounded-2xl border px-4 py-3"
                  >
                    <div>
                      <p className="font-semibold text-slate-800">{student.name}</p>
                      <p className="text-xs text-slate-500">{student.email}</p>
                      {student.rollNumber && (
                        <p className="text-xs text-slate-400">
                          Roll: {student.rollNumber}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleAddStudent(student._id)}
                      className="rounded-lg bg-indigo-600 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-700"
                    >
                      Add
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Current Students */}
          <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl">
            <p className="text-lg font-semibold text-slate-900 mb-4">
              Current Students ({selectedClassroom.students?.length || 0})
            </p>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {!selectedClassroom.students || selectedClassroom.students.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">
                  No students in this classroom
                </p>
              ) : (
                selectedClassroom.students.map((student) => (
                  <div
                    key={student._id}
                    className="flex items-center justify-between rounded-2xl border px-4 py-3"
                  >
                    <div>
                      <p className="font-semibold text-slate-800">{student.name}</p>
                      <p className="text-xs text-slate-500">{student.email}</p>
                      {student.rollNumber && (
                        <p className="text-xs text-slate-400">
                          Roll: {student.rollNumber}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveStudent(student._id)}
                      className="rounded-lg bg-rose-500 px-3 py-1 text-xs font-medium text-white hover:bg-rose-600"
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
          {editingId ? "Edit classroom" : "Create new classroom"}
        </p>
        <p className="mt-2 text-sm text-slate-500">
          {editingId
            ? "Update classroom details and assign a teacher."
            : "Create a new classroom and assign a teacher to it."}
        </p>

        <form className="mt-6 text-black space-y-4" onSubmit={handleSubmit}>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Classroom Name (e.g., CS101 - Programming Basics)"
            required
            className="w-full rounded-2xl border px-4 py-3 text-sm"
          />
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Description (optional)"
            rows="3"
            className="w-full rounded-2xl border px-4 py-3 text-sm"
          />
          <div className="grid gap-3 md:grid-cols-2">
            <input
              name="section"
              value={form.section}
              onChange={handleChange}
              placeholder="Section (e.g., A, B, Section 1)"
              required
              className="rounded-2xl border px-4 py-3 text-sm"
            />
            <input
              name="department"
              value={form.department}
              onChange={handleChange}
              placeholder="Department (e.g., Computer Science)"
              required
              className="rounded-2xl border px-4 py-3 text-sm"
            />
          </div>
          <select
            name="teacherId"
            value={form.teacherId}
            onChange={handleChange}
            required
            className="w-full rounded-2xl border px-4 py-3 text-sm"
          >
            <option value="">Select a teacher</option>
            {teachers.map((teacher) => (
              <option key={teacher._id} value={teacher._id}>
                {teacher.name} ({teacher.email})
              </option>
            ))}
          </select>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-medium text-white hover:bg-indigo-700 disabled:bg-gray-400"
            >
              {submitting
                ? editingId
                  ? "Updating..."
                  : "Creating..."
                : editingId
                ? "Update Classroom"
                : "Create Classroom"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
          All Classrooms
        </p>
        <p className="mt-2 text-sm text-slate-500">
          Manage existing classrooms, assign teachers, and manage students.
        </p>
        {classrooms.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              title="No classrooms yet"
              description="Create your first classroom to begin."
            />
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {classrooms.map((classroom) => (
              <div
                key={classroom._id}
                className="rounded-2xl border border-slate-200 bg-white p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900">
                        {classroom.name}
                      </h3>
                      {classroom.code && (
                        <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                          Code: {classroom.code}
                        </span>
                      )}
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          classroom.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {classroom.status}
                      </span>
                    </div>
                    {classroom.description && (
                      <p className="text-sm text-slate-600 mb-2">
                        {classroom.description}
                      </p>
                    )}
                    <div className="grid gap-2 md:grid-cols-2 text-sm">
                      <div>
                        <span className="text-slate-500">Section: </span>
                        <span className="font-medium text-slate-800">
                          {classroom.section}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">Department: </span>
                        <span className="font-medium text-slate-800">
                          {classroom.department}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">Teacher: </span>
                        <span className="font-medium text-slate-800">
                          {classroom.teacher?.name || "Not assigned"}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">Students: </span>
                        <span className="font-medium text-slate-800">
                          {classroom.students?.length || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <button
                      onClick={() => handleManageStudents(classroom)}
                      className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white hover:bg-indigo-700"
                    >
                      Manage Students
                    </button>
                    <button
                      onClick={() => handleEdit(classroom)}
                      className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(classroom._id)}
                      className="rounded-lg bg-rose-500 px-4 py-2 text-xs font-medium text-white hover:bg-rose-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageClassrooms;
