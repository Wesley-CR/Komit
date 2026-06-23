import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/Button";

interface LayoutProps {
  children: ReactNode;
}

const roleBadge: Record<string, string> = {
  ARTIST: "bg-violet-100 text-violet-700",
  CLIENT: "bg-sky-100 text-sky-700",
};

export function Layout({ children }: LayoutProps) {
  const { user, logout, isArtist } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-6 px-4">
          <span className="text-lg font-semibold tracking-tight text-slate-900 mr-2">Komit</span>

          {/* Nav */}
          {isArtist && (
            <nav className="flex items-center gap-1">
              <NavLink
                to="/commissions"
                className={({ isActive }) =>
                  \`rounded-lg px-3 py-1.5 text-sm transition-colors \${
                    isActive
                      ? "bg-accent-50 text-accent-700 font-medium"
                      : "text-slate-600 hover:bg-slate-100"
                  }\`
                }
              >
                Commissions
              </NavLink>
            </nav>
          )}

          {/* Right side */}
          {user && (
            <div className="ml-auto flex items-center gap-3">
              <span className="text-sm text-slate-500 hidden sm:block">{user.email}</span>
              <span
                className={\`rounded-full px-2.5 py-0.5 text-xs font-medium \${roleBadge[user.role] ?? "bg-slate-100 text-slate-700"}\`}
              >
                {user.role}
              </span>
              <Button variant="ghost" onClick={logout} className="h-8 px-3 text-xs">
                Log out
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
