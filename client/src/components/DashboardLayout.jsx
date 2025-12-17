import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import NotificationBell from './Notifications/NotificationBell';

const menuConfig = {
  student: [
    { label: 'Overview', to: '/student' },
    { label: 'My Classrooms', to: '/student/classrooms' },
    { label: 'Upload Activity', to: '/student/upload' },
    { label: 'My Activities', to: '/student/activities' },
    { label: 'Profile', to: '/student/profile' },
  ],
  teacher: [
    { label: 'Overview', to: '/teacher' },
    { label: 'My Classrooms', to: '/teacher' },
    { label: 'Pending Approvals', to: '/teacher/pending' },
  ],
  admin: [
    { label: 'Overview', to: '/admin' },
    { label: 'Analytics', to: '/admin/analytics' },
    { label: 'Manage Users', to: '/admin/users' },
    { label: 'Manage Classrooms', to: '/admin/classrooms' },
  ],
};

const roleThemes = {
  student: {
    accent: 'from-emerald-400 to-emerald-500',
    label: 'text-emerald-500',
  },
  teacher: {
    accent: 'from-sky-400 to-sky-500',
    label: 'text-sky-500',
  },
  admin: {
    accent: 'from-amber-400 to-amber-500',
    label: 'text-amber-500',
  },
};

const DashboardLayout = () => {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();
  const menu = menuConfig[user?.role] || [];
  const theme = roleThemes[user?.role] || roleThemes.student;

  return (
    <div className="app-grid flex min-h-screen bg-slate-950 text-white">
      <aside className="hidden lg:flex w-72 flex-col px-4 py-6">
        <div className="glass-panel flex flex-1 flex-col gap-8 p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.6em] text-slate-400">CD-STAR</p>
            <p className="mt-3 text-2xl font-semibold text-white">Control Center</p>
            <p className="text-sm text-slate-400">Navigate your workspace</p>
          </div>
          <nav className="flex-1">
            <ul className="space-y-1">
              {menu.map((item) => (
                <li key={`${item.to}-${item.label}`}>
                  <NavLink
                    to={item.to}
                    end={item.to === '/student' || item.to === '/teacher'}
                    className={({ isActive }) =>
                      `flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                        isActive
                          ? 'bg-white/15 text-white shadow-lg shadow-black/20'
                          : 'text-slate-400 hover:bg-white/5 hover:text-white'
                      }`
                    }
                  >
                    <span>{item.label}</span>
                    <span aria-hidden className="text-xs text-white/60">
                      →
                    </span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
            <p className="font-semibold text-white">Need help?</p>
            <p>Visit the resource hub for guidance.</p>
          </div>
        </div>
      </aside>

      <div className="relative flex flex-1 flex-col">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.25),transparent_60%)] opacity-70" />
        <header className="relative z-20 border-b border-white/10 bg-white/10 px-4 py-5 backdrop-blur-xl sm:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-slate-200">Active session</p>
              <p className="text-2xl font-semibold text-white">{user?.name}</p>
              <p className={`text-sm font-semibold ${theme.label} uppercase tracking-[0.6em]`}>
                {user?.role}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <NotificationBell />
              <select
                onChange={(event) => {
                  const path = event.target.value;
                  if (path) {
                    navigate(path);
                  }
                }}
                className="rounded-2xl border border-white/20 bg-white/5 px-4 py-2 text-sm text-white focus:border-white/40 focus:outline-none"
                defaultValue=""
              >
                <option value="" disabled>
                  Quick jump
                </option>
                {menu.map((item) => (
                  <option key={`${item.to}-${item.label}`} value={item.to} className="text-slate-800">
                    {item.label}
                  </option>
                ))}
              </select>
              <button
                onClick={logout}
                className="rounded-2xl border border-white/30 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Logout
              </button>
            </div>
          </div>
        </header>
        <main className="relative flex-1 overflow-y-auto bg-gradient-to-b from-white/90 via-slate-50 to-slate-100 px-4 py-8 sm:px-8 lg:px-12">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

