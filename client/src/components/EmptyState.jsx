const EmptyState = ({ title, description, action }) => (
  <div className="rounded-3xl border border-dashed border-slate-200 bg-white/80 p-8 text-center shadow-inner shadow-slate-900/5">
    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-2xl text-slate-400">
      ☁︎
    </div>
    <p className="mt-4 text-lg font-semibold text-slate-900">{title}</p>
    <p className="mt-2 text-sm text-slate-500">{description}</p>
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export default EmptyState;

