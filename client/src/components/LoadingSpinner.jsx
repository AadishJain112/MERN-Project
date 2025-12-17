const LoadingSpinner = ({ label = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-white/70 bg-white/80 p-10 text-slate-600 shadow-lg shadow-slate-900/5">
    <div className="relative h-12 w-12">
      <span className="absolute inset-0 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-500" />
      <span className="absolute inset-2 rounded-full bg-gradient-to-br from-indigo-500/20 to-violet-500/10" />
    </div>
    <p className="text-sm font-semibold text-slate-500">{label}</p>
  </div>
);

export default LoadingSpinner;

