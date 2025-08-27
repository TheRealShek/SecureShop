import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="text-center animate-fade-in">
        <div className="mb-6">
          <h1 className="text-8xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">404</h1>
        </div>
        <h2 className="mt-4 text-3xl font-bold text-slate-900">Page Not Found</h2>
        <p className="mt-4 text-lg text-slate-600 max-w-md mx-auto">
          The page you're looking for doesn't exist or you don't have permission to access it.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/dashboard"
            className="inline-flex items-center rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 hover:scale-105"
          >
            Go to Dashboard
          </Link>
          <Link
            to="/products"
            className="inline-flex items-center rounded-xl bg-white border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 hover:scale-105"
          >
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
}
