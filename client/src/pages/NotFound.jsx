import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen grid place-items-center bg-slate-50 dark:bg-surface-darker p-6">
      <div className="text-center">
        <div className="font-display font-extrabold text-8xl bg-gradient-to-r from-brand-600 to-accent-500 bg-clip-text text-transparent">
          404
        </div>
        <h1 className="font-display font-bold text-2xl mt-2">Page not found</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-md">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="btn-primary mt-6 inline-flex">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
