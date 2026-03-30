import { Link } from 'react-router-dom'
import BrandLogo from '../../components/BrandLogo'

const navigationItems = [
  { key: 'dashboard', label: 'Dashboard', to: '/admin/dashboard' },
  { key: 'incubatees', label: 'Incubatees', to: '/admin/incubatees' },
  { key: 'faculty', label: 'Faculty', to: '/admin/faculty' },
  { key: 'finance', label: 'Finance', to: '/admin/finance' },
  { key: 'system', label: 'System', to: '/admin/system' },
]

const utilityItems = [
  { label: 'Notifications', to: '/notifications' },
  { label: 'Settings', to: '/settings' },
]

function navClass(isActive) {
  if (isActive) {
    return 'border-r-4 border-lp-gold bg-lp-gold/10 text-lp-gold'
  }

  return 'text-slate-300 hover:bg-white/5 hover:text-white'
}

function AdminShell({ activeKey, title, subtitle, badge, headerAction, children }) {
  return (
    <div className="min-h-screen bg-[#F4F7FC] text-lp-navy">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-white/10 bg-lp-navy lg:flex lg:flex-col">
        <div className="border-b border-white/10 px-6 py-7">
          <BrandLogo textClassName="text-white" />
          <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.14em] text-lp-gold">
            Admin Control Plane
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

        <div className="border-t border-white/10 p-4">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
            Utility
          </p>
          <div className="space-y-1">
            {utilityItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="lp-focus block rounded-lg bg-white/10 px-3 py-2.5 text-xs font-semibold text-slate-200 hover:bg-white/20"
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
              Admin / {title}
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

      <main className="px-4 pb-32 pt-6 sm:px-6 lg:ml-72 lg:px-8 lg:pb-14">{children}</main>

      <footer className="hidden border-t border-slate-200 bg-white/85 px-4 py-4 text-xs text-slate-500 lg:ml-72 lg:block lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span>LaunchPad CICF Admin Workspace</span>
          <span>Email-only notifications via Resend</span>
        </div>
      </footer>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-slate-200 bg-white/95 p-2 lg:hidden">
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

export default AdminShell
