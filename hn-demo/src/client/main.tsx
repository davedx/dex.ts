import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App";
import { setRouteLoaders } from "dex.ts/client";
import { ROUTE_LOADERS, ROUTES_LIST } from "../.dex/routes.gen";

setRouteLoaders(ROUTE_LOADERS);
// optional debug
console.log("[routes] available:", ROUTES_LIST);

declare global {
  interface Window {
    __SSR_HTML__?: boolean;
    __DEX_DATA__?: unknown;
  }
}

// If SSR provided HTML, hydrate; otherwise mount
const rootEl = document.getElementById("root")!;
if (window.__SSR_HTML__) {
  hydrateRoot(rootEl, <App />);
} else {
  createRoot(rootEl).render(<App />);
}
