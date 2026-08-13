import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Footer from "./Footer";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/jobs", label: "Jobs" },
  { to: "/applications", label: "Applications" },
  { to: "/profile", label: "Profile" },
  { to: "/settings", label: "Settings" },
];

function Logo() {
  return (
    <div className="flex items-center gap-2 px-2">
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <rect width="28" height="28" rx="8" className="fill-electric" />
        <path
          d="M8 18L13 11L16.5 15L20 9"
          stroke="#020B18"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M20 9H16" stroke="#020B18" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M20 9V13" stroke="#020B18" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
      <span className="text-lg font-bold tracking-tight text-white">
        Apply<span className="text-lime">IQ</span>
      </span>
    </div>
  );
}

function SidebarContent({ navItems, user, logout, onNavigate }) {
  return (
    <>
      <Logo />
      <nav className="mt-8 flex flex-col gap-1 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-electric/15 text-electric-light"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto px-4">
        <div className="rounded-lg bg-white/5 p-3 text-sm">
          <p className="font-medium text-slate-200">{user?.name ?? "Guest"}</p>
          <p className="truncate text-xs text-slate-500">{user?.email}</p>
          <button
            onClick={logout}
            className="mt-2 w-full rounded-md bg-white/5 px-2 py-1 text-xs text-slate-300 hover:bg-white/10"
          >
            Log out
          </button>
        </div>
      </div>
    </>
  );
}

export default function Layout() {
  const { user, logout } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const navItems = user?.role === "ADMIN" ? [...NAV_ITEMS, { to: "/admin", label: "Admin" }] : NAV_ITEMS;

  return (
    <div className="flex min-h-screen bg-navy">
      {/* Desktop sidebar — always visible at lg+ */}
      <aside className="hidden lg:flex w-64 shrink-0 border-r border-white/5 bg-navy-light/40 flex-col py-6">
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

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
