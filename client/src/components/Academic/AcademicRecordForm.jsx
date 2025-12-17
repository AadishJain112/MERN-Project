// frontend/src/components/Academic/AcademicRecordForm.jsx
import { useState, useEffect } from 'react';
import api from '../../services/api';

const AcademicRecordForm = ({ studentId, record, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    semester: '',
    subjects: [{ code: '', name: '', internalMarks: '', endTermMarks: '' }],
    remarks: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (record) {
      setFormData({
        semester: record.semester || '',
        subjects:
          record.subjects?.map((s) => ({
            code: s.code || '',
            name: s.name || '',
            internalMarks: s.internalMarks || '',
            endTermMarks: s.endTermMarks || '',
          })) || [{ code: '', name: '', internalMarks: '', endTermMarks: '' }],
        remarks: record.remarks || '',
      });
    }
  }, [record]);

  const validate = () => {
    const newErrors = {};

    if (!formData.semester || formData.semester < 1) {
      newErrors.semester = 'Semester must be at least 1';
    }

    if (formData.subjects.length === 0) {
      newErrors.subjects = 'At least one subject is required';
    }

    formData.subjects.forEach((subject, index) => {
      if (!subject.code) {
        newErrors[`subject_${index}_code`] = 'Subject code is required';
      }
      if (!subject.name) {
        newErrors[`subject_${index}_name`] = 'Subject name is required';
      }
      const internal = parseFloat(subject.internalMarks);
      const endTerm = parseFloat(subject.endTermMarks);
      if (isNaN(internal) || internal < 0 || internal > 100) {
        newErrors[`subject_${index}_internal`] = 'Internal marks must be between 0 and 100';
      }
      if (isNaN(endTerm) || endTerm < 0 || endTerm > 100) {
        newErrors[`subject_${index}_endTerm`] = 'End term marks must be between 0 and 100';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        semester: parseInt(formData.semester),
        subjects: formData.subjects.map((s) => ({
          code: s.code,
          name: s.name,
          internalMarks: parseFloat(s.internalMarks),
          endTermMarks: parseFloat(s.endTermMarks),
        })),
        remarks: formData.remarks,
      };

      if (record) {
        await api.put(`/marks/${record._id}`, payload);
      } else {
        await api.post(`/students/${studentId}/marks`, payload);
      }

      onSubmit();
    } catch (error) {
      console.error('Error saving record:', error);
      alert(error.response?.data?.message || 'Failed to save record');
    } finally {
      setSubmitting(false);
    }
  };

  const addSubject = () => {
    setFormData({
      ...formData,
      subjects: [...formData.subjects, { code: '', name: '', internalMarks: '', endTermMarks: '' }],
    });
  };

  const removeSubject = (index) => {
    if (formData.subjects.length > 1) {
      setFormData({
        ...formData,
        subjects: formData.subjects.filter((_, i) => i !== index),
      });
    }
  };

  const updateSubject = (index, field, value) => {
    const newSubjects = [...formData.subjects];
    newSubjects[index][field] = value;
    setFormData({ ...formData, subjects: newSubjects });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Semester */}
      <div>
        <label className="block text-sm font-medium text-slate-700">Semester *</label>
        <input
          type="number"
          min="1"
          value={formData.semester}
          onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
          className="mt-1 w-full rounded-2xl border border-slate-300 px-4 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
          disabled={!!record}
        />
        {errors.semester && <p className="mt-1 text-sm text-red-600">{errors.semester}</p>}
      </div>

      {/* Subjects */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="block text-sm font-medium text-slate-700">Subjects *</label>
          <button
            type="button"
            onClick={addSubject}
            className="text-sm text-indigo-600 hover:text-indigo-700"
          >
            + Add Subject
          </button>
        </div>
        <div className="space-y-4">
          {formData.subjects.map((subject, index) => (
            <div
              key={index}
              className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">Subject {index + 1}</span>
                {formData.subjects.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSubject(index)}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-xs text-slate-600">Code *</label>
                  <input
                    type="text"
                    value={subject.code}
                    onChange={(e) => updateSubject(index, 'code', e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                    required
                  />
                  {errors[`subject_${index}_code`] && (
                    <p className="mt-1 text-xs text-red-600">{errors[`subject_${index}_code`]}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs text-slate-600">Name *</label>
                  <input
                    type="text"
                    value={subject.name}
                    onChange={(e) => updateSubject(index, 'name', e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                    required
                  />
                  {errors[`subject_${index}_name`] && (
                    <p className="mt-1 text-xs text-red-600">{errors[`subject_${index}_name`]}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs text-slate-600">Internal Marks *</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={subject.internalMarks}
                    onChange={(e) => updateSubject(index, 'internalMarks', e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                    required
                  />
                  {errors[`subject_${index}_internal`] && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors[`subject_${index}_internal`]}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs text-slate-600">End Term Marks *</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={subject.endTermMarks}
                    onChange={(e) => updateSubject(index, 'endTermMarks', e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                    required
                  />
                  {errors[`subject_${index}_endTerm`] && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors[`subject_${index}_endTerm`]}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Remarks */}
      <div>
        <label className="block text-sm font-medium text-slate-700">Remarks</label>
        <textarea
          value={formData.remarks}
          onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
          rows={3}
          className="mt-1 w-full rounded-2xl border border-slate-300 px-4 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-2xl border border-slate-300 px-6 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-2xl bg-indigo-600 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {submitting ? 'Saving...' : record ? 'Update' : 'Save'}
        </button>
      </div>
    </form>
  );
};

export default AcademicRecordForm;

