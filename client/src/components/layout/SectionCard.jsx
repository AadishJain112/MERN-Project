const baseClasses = 'rounded-3xl border border-slate-200 bg-white/90 shadow-xl shadow-slate-900/5';

const SectionCard = ({ title, subtitle, action, className = '', padded = true, children, ...rest }) => {
  const padding = padded ? 'p-6' : '';
  const mergedClasses = [baseClasses, padding, className].filter(Boolean).join(' ');

  return (
    <div className={mergedClasses} {...rest}>
      {(title || subtitle || action) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            {subtitle && (
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400">{subtitle}</p>
            )}
            {title && <h2 className="mt-1 text-lg font-semibold text-slate-900">{title}</h2>}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      )}
      {children}
    </div>
  );
};

export default SectionCard;
