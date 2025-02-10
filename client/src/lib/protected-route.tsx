import { useAuth } from "@/lib/auth";
import { Redirect, Route } from "wouter";
import { Loader2 } from "lucide-react";

export function ProtectedRoute({
  component: Component,
  path,
}: {
  component: React.ComponentType;
  path: string;
}) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Redirect to="/" />;
  }

  return <Route path={path} component={Component} />;
}
