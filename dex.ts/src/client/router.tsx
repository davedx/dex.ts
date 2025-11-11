import React, { useEffect, useState } from "react";

export type Page = React.FC;
export type Loader = () => Promise<{ default: Page; ssr?: boolean }>;

let dynamicModules: Record<string, Loader> = {};

export function setRouteLoaders(loaders: Record<string, Loader>) {
  dynamicModules = loaders;
}

function normalizePath(pathname: string) {
  if (pathname !== "/" && pathname.endsWith("/")) return pathname.slice(0, -1);
  return pathname || "/";
}

export function useRouteComponent(): React.ReactElement | null {
  const [pathname, setPathname] = useState(() =>
    normalizePath(window.location.pathname)
  );
  const [Component, setComponent] = useState<Page | null>(null);

  useEffect(() => {
    const onPop = () => setPathname(normalizePath(window.location.pathname));
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    const load = async () => {
      const loader = dynamicModules[pathname] ?? dynamicModules["/"];
      if (!loader) {
        setComponent(() => () => <h1>404</h1>);
        return;
      }
      try {
        const mod = await loader();
        setComponent(() => mod.default as Page);
      } catch (err) {
        console.error("Failed to load page:", err);
        setComponent(() => () => <h1>404</h1>);
      }
    };
    load();
  }, [pathname]);

  return Component ? React.createElement(Component) : null;
}

export function navigate(path: string) {
  const p = normalizePath(path);
  if (p === normalizePath(window.location.pathname)) return;
  history.pushState(null, "", p);
  window.dispatchEvent(new PopStateEvent("popstate"));
}
