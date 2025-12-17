const tokens = {
  primary: {
    gradient: 'from-indigo-500/15 via-white to-indigo-500/5',
    pill: 'text-indigo-600 bg-indigo-50',
    dot: 'bg-indigo-500',
  },
  secondary: {
    gradient: 'from-violet-500/15 via-white to-violet-500/5',
    pill: 'text-violet-600 bg-violet-50',
    dot: 'bg-violet-500',
  },
  accent: {
    gradient: 'from-emerald-500/15 via-white to-emerald-500/5',
    pill: 'text-emerald-600 bg-emerald-50',
    dot: 'bg-emerald-500',
  },
};

const StatCard = ({ title, value, change, accent = 'primary' }) => {
  const palette = tokens[accent] || tokens.primary;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/90 p-6 shadow-xl shadow-slate-900/5">
      <div className={`absolute inset-0 bg-gradient-to-br ${palette.gradient} opacity-90`} />
      <div className="relative">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">
          <span className={`status-dot ${palette.dot}`} />
          {title}
        </div>
        <p className="mt-6 text-4xl font-semibold text-slate-900">{value}</p>
        {change && (
          <span className={`mt-4 inline-flex rounded-full px-4 py-1 text-xs font-semibold ${palette.pill}`}>
            {change}
          </span>
        )}
      </div>
    </div>
  );
};

export default StatCard;

