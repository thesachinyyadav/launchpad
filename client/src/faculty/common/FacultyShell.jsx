import { Link } from 'react-router-dom'
import BrandLogo from '../../components/BrandLogo'

const navigationItems = [
  { key: 'dashboard', label: 'Dashboard', to: '/faculty/dashboard' },
  { key: 'reviews', label: 'Reviews', to: '/faculty/reviews' },
  { key: 'mentorship', label: 'Mentorship', to: '/faculty/mentorship' },
  { key: 'interns', label: 'Interns', to: '/faculty/interns' },
]

const utilityItems = [
  { label: 'Notifications', to: '/notifications' },
  { label: 'Settings', to: '/settings' },
]

function navClass(isActive) {
  if (isActive) {
    return 'border-r-4 border-lp-gold bg-white/95 text-lp-navy shadow-sm'
  }

  return 'text-slate-600 hover:bg-white/80 hover:text-lp-navy'
}

function FacultyShell({ activeKey, title, subtitle, badge, headerAction, children }) {
  return (
    <div className="min-h-screen bg-[#F6F8FC] text-lp-navy">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-slate-200 bg-slate-100/90 backdrop-blur lg:flex lg:flex-col">
        <div className="border-b border-slate-200 px-6 py-7">
          <BrandLogo compact />
          <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.14em] text-lp-gold">
            Faculty Portal
          </p>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigationItems.map((item) => (
            <Link
              key={item.key}
              to={item.to}
              className={`lp-focus block rounded-lg px-3 py-3 text-sm font-semibold transition ${navClass(
                activeKey === item.key,
              )}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-slate-200 p-4">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
            Workspace Tools
          </p>
          <div className="space-y-1">
            {utilityItems.map((item) => (
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
              Faculty / {title}
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
          </div>
        </div>
      </header>

      <main className="px-4 pb-28 pt-6 sm:px-6 lg:ml-72 lg:px-8 lg:pb-10">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-slate-200 bg-white/95 p-2 lg:hidden">
        {navigationItems.map((item) => (
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

export default FacultyShell
