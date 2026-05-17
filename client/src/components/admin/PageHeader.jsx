export function PageHeader({ title, description, actions }) {
  return (
    <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
      <div>
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight">{title}</h1>
        {description && (
          <p className="text-slate-500 dark:text-slate-400 mt-1">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}
