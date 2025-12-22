import { useState } from "react";
import EmptyState from "../../components/EmptyState";
import api from "../../services/api";

const UploadActivity = () => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "event",
  });
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: "", message: "" });

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, value));
    if (file) {
      formData.append("file", file);
    }

    try {
      setLoading(true);
      await api.post("/student/activity/add", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setStatus({ type: "success", message: "Activity submitted for review." });
      setForm({ title: "", description: "", category: "event" });
      setFile(null);
    } catch (err) {
      setStatus({
        type: "error",
        message: err.response?.data?.message || "Unable to upload activity",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/5">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
          Upload achievement
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-black-900">
          Submit proof in seconds
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Fill in the details and attach proof for faster teacher validation.
        </p>
      </div>

      {status.message && (
        <EmptyState
          title={status.type === "success" ? "Success" : "Heads up"}
          description={status.message}
        />
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/5"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="text-xs uppercase tracking-[0.3em] text-black">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-black focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              placeholder="E.g. Winner - Hackathon 2025"
              required
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.3em] text-black">
              Category
            </label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-black focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="event" className="text-black">
                Event
              </option>
              <option value="achievement" className="text-black">
                Achievement
              </option>
              <option value="skill" className="text-black">
                Skill
              </option>
            </select>
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.3em]  text-black">
              Certificate
            </label>
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(event) => setFile(event.target.files[0])}
              className="mt-2 w-full rounded-2xl border border-dashed border-slate-300 px-4 py-3 text-sm text-black"
            />
            <p className="mt-1 text-xs  text-black">
              Accepted formats: PDF, PNG, JPG. Max 5 MB.
            </p>
          </div>
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.3em]  text-black">
            Description
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-black focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            placeholder="Add relevant details, collaborators, dates, etc."
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-indigo-400"
        >
          {loading ? "Submitting..." : "Submit for verification"}
        </button>
      </form>
    </div>
  );
};

export default UploadActivity;
