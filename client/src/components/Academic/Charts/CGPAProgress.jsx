// frontend/src/components/Academic/Charts/CGPAProgress.jsx

const CGPAProgress = ({ cgpa }) => {
  const percentage = (cgpa / 10) * 100;
  const getColor = () => {
    if (cgpa >= 8) return 'bg-green-500';
    if (cgpa >= 7) return 'bg-blue-500';
    if (cgpa >= 6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Cumulative GPA</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">{cgpa.toFixed(2)}</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">out of 10.0</span>
          <div className="group relative">
            <svg
              className="h-5 w-5 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="absolute bottom-full right-0 mb-2 hidden w-48 rounded-lg bg-slate-900 p-2 text-xs text-white group-hover:block">
              CGPA is calculated as the average of all semester SGPA values
            </div>
          </div>
        </div>
      </div>
      <div className="h-4 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className={`h-full ${getColor()} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default CGPAProgress;

