export function dashboardRedirect(
  isAuthenticated: boolean,
  nextPath = "/dashboard",
): string | null {
  if (isAuthenticated) return null;
  const safePath = nextPath.startsWith("/") && !nextPath.startsWith("//") ? nextPath : "/dashboard";
  return `/dashboard/login?next=${encodeURIComponent(safePath)}`;
}
