// frontend/src/components/Academic/MarksTable.jsx

const MarksTable = ({ records, onEdit, onDelete }) => {
  if (!records || records.length === 0) {
    return null;
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/5">
      <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Academic Records</p>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                Semester
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                Subjects
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                SGPA
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                Remarks
              </th>
              {(onEdit || onDelete) && (
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {records.map((record) => (
              <tr key={record._id} className="hover:bg-slate-50/50">
                <td className="px-4 py-4">
                  <span className="text-sm font-semibold text-slate-900">Semester {record.semester}</span>
                </td>
                <td className="px-4 py-4">
                  <div className="space-y-1">
                    {record.subjects?.map((subject, idx) => (
                      <div key={idx} className="text-xs text-slate-600">
                        <span className="font-medium">{subject.code}:</span> {subject.name} (
                        {subject.internalMarks} + {subject.endTermMarks} = {subject.total})
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className="text-lg font-bold text-indigo-600">{record.sgpa?.toFixed(2)}</span>
                </td>
                <td className="px-4 py-4">
                  <span className="text-sm text-slate-600">{record.remarks || '-'}</span>
                </td>
                {(onEdit || onDelete) && (
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(record)}
                          className="rounded-lg bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-200"
                        >
                          Edit
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(record._id)}
                          className="rounded-lg bg-red-100 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-200"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MarksTable;

