import React from "react";
import { renderToString } from "react-dom/server";

export function fileToRoute2(file: string) {
  const rel = file.replaceAll("\\", "/");
  // handle both /src/pages and /dist/pages prefixes
  let route = rel.replace(/.*\/(src|dist)\/pages/, "");
  route = route.replace(/\.page\.(t|j)sx?$/, "");
  if (route.endsWith("/index")) route = route.slice(0, -"/index".length);
  if (!route.startsWith("/")) route = "/" + route;
  return route || "/";
}

export function fileToRoute(file: string) {
  // Normalize path separators
  const rel = file.replaceAll("\\", "/");

  // Remove the "src/pages" prefix
  let route = rel.replace(/^src\/pages/, "");

  // Drop .page.tsx extension
  route = route.replace(/\.page\.(t|j)sx?$/, "");

  // Handle /index pages (so /foo/index.page.tsx -> /foo)
  if (route.endsWith("/index")) route = route.slice(0, -6);

  // Always start with exactly one leading slash
  if (!route.startsWith("/")) route = "/" + route;

  return route;
}

type PageModule = {
  default: React.FC<any>;
  ssr?: boolean;
  load?: (args: { context: any; url: string }) => Promise<any>;
};

export async function renderPage(mod: PageModule, context: any, url: string) {
  const { default: Component } = mod;

  const data =
    typeof mod.load === "function"
      ? await mod.load({ context, url })
      : undefined;

  // Render with the data prop
  const appHtml = renderToString(React.createElement(Component, { data }));

  // Serialize for hydration (framework-owned; app never touches this global directly)
  const serialized = data === undefined ? "undefined" : JSON.stringify(data);
  const dataScript = `<script>window.__DEX_DATA__=${serialized};</script>`;

  return { appHtml, dataScript };
}
