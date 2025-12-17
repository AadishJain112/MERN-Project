import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-950 px-4 text-center text-white">
    <div className="hero-spark" />
    <p className="text-9xl font-black text-white/10">404</p>
    <h1 className="mt-6 text-3xl font-semibold text-white">This page drifted away</h1>
    <p className="mt-3 max-w-md text-slate-200">
      The page you were looking for may have been moved or removed. Let’s guide you back to safer
      waters.
    </p>
    <Link to="/" className="btn-primary mt-8">
      Back to safety
    </Link>
  </div>
);

export default NotFound;

