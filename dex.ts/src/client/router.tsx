import React, { useEffect, useState } from "react";

declare global {
  interface Window {
    __SSR_HTML__?: boolean;
    __DEX_DATA__?: unknown;
  }
}

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

type PageModule = {
  default: React.ComponentType<{ data?: any }>;
};

export function useRouteComponent(): React.ReactElement | null {
  const [pathname, setPathname] = useState(() =>
    normalizePath(window.location.pathname)
  );
  const [Component, setComponent] = useState<React.ComponentType<{
    data?: any;
  }> | null>(null);
  const [data, setData] = useState<any>(() => window.__DEX_DATA__ ?? null);

  // listen to browser back/forward
  useEffect(() => {
    const onPop = () => setPathname(normalizePath(window.location.pathname));
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // load the route module and data when pathname changes
  useEffect(() => {
    const load = async () => {
      const loader = dynamicModules[pathname] ?? dynamicModules["/"];
      if (!loader) {
        setComponent(() => () => <h1>404</h1>);
        return;
      }

      try {
        const mod = (await loader()) as PageModule;
        setComponent(() => mod.default);

        // If this is a client-side navigation (no SSR data), fetch JSON data
        if (window.__DEX_DATA__ === undefined) {
          const res = await fetch(
            `/_dex/data?route=${encodeURIComponent(pathname)}`
          );
          const json = res.ok ? await res.json() : null;
          setData(json);
        } else {
          // Consume SSR data exactly once
          delete window.__DEX_DATA__;
        }
      } catch (err) {
        console.error("Failed to load page:", err);
        setComponent(() => () => <h1>404</h1>);
      }
    };

    load();
  }, [pathname]);

  return Component ? <Component data={data} /> : null;
}

export function navigate(path: string) {
  const p = normalizePath(path);
  if (p === normalizePath(window.location.pathname)) return;
  history.pushState(null, "", p);
  window.dispatchEvent(new PopStateEvent("popstate"));
}
