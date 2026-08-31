import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Footer from "./Footer";

const ICONS = {
  dashboard: (
    <>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </>
  ),
  jobs: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </>
  ),
  applications: (
    <>
      <path d="M9 6h11M9 12h11M9 18h11" />
      <circle cx="4.5" cy="6" r="1.4" />
      <circle cx="4.5" cy="12" r="1.4" />
      <circle cx="4.5" cy="18" r="1.4" />
    </>
  ),
  profile: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19 12a7 7 0 0 0-.1-1l2-1.6-2-3.4-2.3 1a7 7 0 0 0-1.7-1l-.4-2.5h-4l-.4 2.5a7 7 0 0 0-1.7 1l-2.3-1-2 3.4 2 1.6a7 7 0 0 0 0 2l-2 1.6 2 3.4 2.3-1a7 7 0 0 0 1.7 1l.4 2.5h4l.4-2.5a7 7 0 0 0 1.7-1l2.3 1 2-3.4-2-1.6a7 7 0 0 0 .1-1Z" />
    </>
  ),
  admin: (
    <>
      <path d="M12 3l7 3v5c0 4.4-2.9 8.5-7 10-4.1-1.5-7-5.6-7-10V6l7-3Z" />
    </>
  ),
};

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: "dashboard", end: true },
  { to: "/jobs", label: "Jobs", icon: "jobs" },
  { to: "/applications", label: "Applications", icon: "applications" },
  { to: "/profile", label: "Profile", icon: "profile" },
  { to: "/settings", label: "Settings", icon: "settings" },
];

function Logo() {
  return (
    <div className="flex items-center gap-2.5 px-2">
      <img
        src="/favicon.png"
        alt="ApplyIQ"
        className="h-[30px] w-[30px] rounded-[9px] object-cover shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_6px_16px_-6px_rgba(55,138,221,0.6)]"
      />
      <span className="font-display text-[16px] font-bold tracking-tight text-white">
        Apply<span className="text-lime">IQ</span>
      </span>
    </div>
  );
}

function SidebarContent({ navItems, user, logout, onNavigate }) {
  return (
    <>
      <Logo />
      <nav className="mt-7 flex flex-col gap-0.5 px-2">
        <p className="px-2.5 pb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-slate-600">Workspace</p>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-[10px] px-2.5 py-2 text-[13.5px] font-medium transition-colors ${
                isActive
                  ? "bg-electric/12 text-white shadow-[inset_0_0_0_1px_rgba(55,138,221,0.28)]"
                  : "text-slate-400 hover:bg-surface hover:text-slate-100"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <svg
                  viewBox="0 0 24 24"
                  className={`h-[17px] w-[17px] shrink-0 ${isActive ? "text-electric-light" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {ICONS[item.icon]}
                </svg>
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto px-3">
        <div className="flex items-center gap-2.5 rounded-[10px] border border-white/8 bg-surface p-2.5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-[#2d5f8f] to-[#1c3c5c] text-[12px] font-semibold text-[#dbe9f8]">
            {(user?.name ?? "?").slice(0, 2).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-white">{user?.name ?? "Guest"}</p>
            <p className="truncate text-[11px] text-slate-500">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="mt-1.5 w-full rounded-md bg-white/5 px-2 py-1.5 text-xs text-slate-300 transition-colors hover:bg-white/10"
        >
          Log out
        </button>
      </div>
    </>
  );
}

export default function Layout() {
  const { user, logout } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const navItems =
    user?.role === "ADMIN" ? [...NAV_ITEMS, { to: "/admin", label: "Admin", icon: "admin" }] : NAV_ITEMS;

  return (
    <div className="flex min-h-screen bg-navy">
      {/* Desktop sidebar — always visible at lg+ */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-white/5 bg-gradient-to-b from-navy-light/50 to-navy py-6 lg:flex">
        <SidebarContent navItems={navItems} user={user} logout={logout} />
      </aside>

      {/* Mobile drawer — overlay + slide-in panel, only rendered when open */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileNavOpen(false)} />
          <aside className="relative z-50 flex h-full w-64 flex-col border-r border-white/5 bg-navy py-6">
            <SidebarContent
              navItems={navItems}
              user={user}
              logout={logout}
              onNavigate={() => setMobileNavOpen(false)}
            />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar — hamburger + logo, hidden at lg+ */}
        <div className="flex items-center gap-3 border-b border-white/5 bg-navy-light/40 p-4 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open navigation"
            className="rounded-md p-1.5 text-slate-300 hover:bg-white/5"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
            </svg>
          </button>
          <Logo />
        </div>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-9">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
