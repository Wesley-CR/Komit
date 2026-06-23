import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

export function UnauthorizedPage() {
  const navigate = useNavigate();
  const { isClient, isArtist } = useAuth();
  const homeRoute = isClient ? "/my-commissions" : isArtist ? "/commissions" : "/dashboard";

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm text-center">
        <Card className="space-y-4">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-red-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="size-6 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">Access denied</h2>
            <p className="mt-1 text-sm text-slate-500">
              You don't have permission to view this page.
            </p>
          </div>

          <Button variant="ghost" onClick={() => navigate(homeRoute)} className="w-full">
            Go back
          </Button>
        </Card>
      </div>
    </div>
  );
}
