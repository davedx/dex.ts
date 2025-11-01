import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App";

declare global {
  interface Window {
    __SSR_HTML__?: boolean;
  }
}

// If SSR provided HTML, hydrate; otherwise mount
const rootEl = document.getElementById("root")!;
if (window.__SSR_HTML__) {
  console.log("hydrating root");
  hydrateRoot(rootEl, <App />);
} else {
  createRoot(rootEl).render(<App />);
}
