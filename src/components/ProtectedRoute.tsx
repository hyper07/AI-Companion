import { useEffect } from "react";
import { useNavigate } from "react-router";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

function RedirectToLogin() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/");
  }, [navigate]);
  return null;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  return (
    <>
      <AuthLoading>
        <div className="flex h-screen items-center justify-center bg-slate-50">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 text-sm">Loading...</p>
          </div>
        </div>
      </AuthLoading>
      <Unauthenticated>
        <RedirectToLogin />
      </Unauthenticated>
      <Authenticated>
        {children}
      </Authenticated>
    </>
  );
}
