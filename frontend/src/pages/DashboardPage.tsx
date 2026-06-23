import { Navigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { Card } from "../components/ui/Card";
import { useAuth } from "../context/AuthContext";

const roleBadge: Record<string, string> = {
  ARTIST: "bg-violet-100 text-violet-700",
  CLIENT: "bg-sky-100 text-sky-700",
};

export function DashboardPage() {
  const { user, isArtist, isClient } = useAuth();

  if (isArtist) return <Navigate to="/commissions" replace />;
  if (isClient) return <Navigate to="/my-commissions" replace />;

  return (
    <Layout>
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Dashboard</h2>
          <p className="mt-1 text-sm text-slate-500">Welcome back.</p>
        </div>

        <Card className="flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-full bg-accent-100 text-accent-700 text-xl font-semibold">
            {user?.email.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-slate-900">{user?.email}</p>
            <span
              className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${roleBadge[user?.role ?? ""] ?? "bg-slate-100 text-slate-700"}`}
            >
              {user?.role}
            </span>
          </div>
        </Card>

        <Card className="text-sm text-slate-500">
          Client portal coming soon.
        </Card>
      </div>
    </Layout>
  );
}
