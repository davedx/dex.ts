import React, { useEffect, useMemo, useState } from "react";

// Any page component type
export type Page = React.FC;

// Eagerly import page modules for fast dev HMR (can switch to lazy if desired)
const modules = import.meta.glob("../pages/**/*.page.tsx", {
  eager: true,
}) as Record<string, { default: Page; ssr?: boolean }>;

// Build route table once
function normalizePath(file: string) {
  // ../pages/index.page.tsx -> /
  // ../pages/about.page.tsx -> /about
  const p = file
    .replace("../pages", "")
    .replace(/\.page\.(t|j)sx?$/, "")
    .replace(/\/index$/, "/");
  return p === "/" ? "/" : p;
}

export type Route = { path: string; component: Page; ssr: boolean };

export const routes: Route[] = Object.entries(modules).map(([k, mod]) => ({
  path: normalizePath(k),
  component: mod.default,
  ssr: !!mod.ssr,
}));

// Minimal client-side router (history API)
export function useRouteComponent(): React.ReactElement | null {
  const [pathname, setPathname] = useState(() => window.location.pathname);

  useEffect(() => {
    const onPop = () => setPathname(window.location.pathname);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const route = useMemo(
    () =>
      routes.find((r) => r.path === pathname) ??
      routes.find((r) => r.path === "/"),
    [pathname]
  );

  return route ? React.createElement(route.component) : <h1>404</h1>;
}

export function navigate(path: string) {
  history.pushState(null, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}
