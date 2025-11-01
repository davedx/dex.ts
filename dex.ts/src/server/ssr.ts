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

export async function renderPage(Component: React.FC) {
  const html = renderToString(React.createElement(Component));
  return html;
}
