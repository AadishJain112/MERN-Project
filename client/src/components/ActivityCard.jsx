import { API_ORIGIN } from '../services/api';

const statusStyles = {
  pending: {
    badge: 'bg-amber-50 text-amber-600',
    border: 'from-amber-200/70 to-amber-100/20',
  },
  approved: {
    badge: 'bg-emerald-50 text-emerald-600',
    border: 'from-emerald-200/70 to-emerald-100/20',
  },
  rejected: {
    badge: 'bg-rose-50 text-rose-600',
    border: 'from-rose-200/70 to-rose-100/20',
  },
};

const buildFileUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${API_ORIGIN}${path}`;
};

const ActivityCard = ({ activity, actions }) => {
  const palette = statusStyles[activity.status] || statusStyles.pending;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white p-5 shadow-xl shadow-slate-900/5">
      <div className={`absolute inset-y-0 left-0 w-1 bg-gradient-to-b ${palette.border}`} />
      <div className="relative flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-lg font-semibold text-slate-900">{activity.title}</p>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
              {activity.category}
            </p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${palette.badge}`}>
            {activity.status}
          </span>
        </div>
        {activity.student?.name && (
          <p className="text-xs font-medium text-slate-500">
            Submitted by {activity.student.name}{' '}
            {activity.student.department && (
              <span className="text-slate-400">/ {activity.student.department}</span>
            )}
          </p>
        )}
        {activity.description && <p className="text-sm text-slate-600">{activity.description}</p>}
        {activity.file && (
          <a
            href={buildFileUrl(activity.file)}
            className="inline-flex text-sm font-semibold text-indigo-600 underline decoration-dotted underline-offset-4"
            target="_blank"
            rel="noreferrer"
          >
            View attachment
          </a>
        )}
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
    </div>
  );
};

export default ActivityCard;

