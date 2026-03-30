import { Link } from 'react-router-dom'
import BrandLogo from '../../components/BrandLogo'

const primaryNavigation = [
  { key: 'dashboard', label: 'Dashboard', to: '/incubatee/dashboard' },
  { key: 'projects', label: 'Projects', to: '/incubatee/projects' },
  { key: 'submissions', label: 'Submissions', to: '/incubatee/submissions' },
  { key: 'faculty', label: 'Faculty', to: '/incubatee/faculty' },
  { key: 'finance', label: 'Finance', to: '/incubatee/finance' },
  { key: 'support', label: 'Support', to: '/incubatee/support' },
  { key: 'interns', label: 'Interns', to: '/incubatee/interns' },
]

const utilityNavigation = [
  { label: 'Presentations', to: '/incubatee/presentations' },
  { label: 'Progress PPT', to: '/incubatee/progress' },
]

function navItemClass(isActive) {
  if (isActive) {
    return 'border-r-4 border-lp-gold bg-white text-lp-navy shadow-sm'
  }

  return 'text-slate-500 hover:bg-white/80 hover:text-lp-navy'
}

function IncubateeShell({
  activeKey,
  title,
  subtitle,
  badge,
  headerAction,
  children,
}) {
  return (
    <div className="min-h-screen bg-[#F6F8FC] text-lp-navy">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-slate-200 bg-slate-100/90 backdrop-blur lg:flex lg:flex-col">
        <div className="border-b border-slate-200 px-6 py-7">
          <BrandLogo compact />
          <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.14em] text-lp-gold">
            Incubatee Workspace
          </p>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {primaryNavigation.map((item) => (
            <Link
              key={item.key}
              to={item.to}
              className={`lp-focus block rounded-lg px-3 py-3 text-sm font-semibold transition ${navItemClass(
                activeKey === item.key,
              )}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-slate-200 p-4">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
            Submission Flow
          </p>
          <div className="space-y-1">
            {utilityNavigation.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="lp-focus block rounded-lg bg-white px-3 py-2.5 text-xs font-semibold text-slate-600 hover:text-lp-navy"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </aside>

      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur lg:ml-72">
        <div className="flex min-h-20 flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
              Incubatee / {title}
            </p>
            <h1 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-lp-navy sm:text-3xl">
              {title}
            </h1>
            {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {badge ? (
              <span className="rounded-full bg-lp-gold/15 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-lp-navy">
                {badge}
              </span>
            ) : null}
            {headerAction}
            <Link
              to="/notifications"
              className="lp-focus rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.09em] text-slate-600 hover:text-lp-navy"
            >
              Notifications
            </Link>
            <Link
              to="/settings"
              className="lp-focus rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.09em] text-slate-600 hover:text-lp-navy"
            >
              Settings
            </Link>
          </div>
        </div>
      </header>

      <main className="px-4 pb-28 pt-6 sm:px-6 lg:ml-72 lg:px-8 lg:pb-10">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-slate-200 bg-white/95 p-2 lg:hidden">
        {primaryNavigation.slice(0, 4).map((item) => (
          <Link
            key={item.key}
            to={item.to}
            className={`lp-focus rounded-xl px-2 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.08em] ${
              activeKey === item.key
                ? 'bg-lp-navy text-white'
                : 'text-slate-500 hover:bg-slate-100 hover:text-lp-navy'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  )
}

export default IncubateeShell
