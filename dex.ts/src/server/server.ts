import express from "express";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import fg from "fast-glob";
import { renderPage, fileToRoute, fileToRoute2 } from "./ssr.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProd = process.env.NODE_ENV === "production";
const projectRoot = process.cwd();

function normalizeRoutePath(route: string) {
  // Turn '/index' or '' into '/'
  if (route === "" || route === "/" || route === "/index") return "/";
  return route;
}

export async function createDexServer() {
  const app = express();
  let vite: any = null;

  // --- Vite setup (dev) or static assets (prod) ---
  if (!isProd) {
    const projectRoot = process.cwd();
    const vitePkg = await import("vite");
    vite = await vitePkg.createServer({
      root: projectRoot,
      server: { middlewareMode: true },
      appType: "custom",
      configFile: path.resolve(projectRoot, "vite.config.js"),
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving static files:");
    app.use(
      express.static(path.resolve(projectRoot, "dist/client"), { index: false })
    );
  }

  // --- Simple API example ---
  app.get("/api/hello", (_, res) => res.json({ ok: true }));

  // --- Prepare static data for production ---
  const baseTemplatePath = isProd
    ? path.resolve(projectRoot, "dist/client/index.html")
    : path.resolve("index.html");

  let prodTemplate: string | null = null;
  let prodPages: string[] = [];

  if (isProd) {
    if (fs.existsSync(baseTemplatePath)) {
      prodTemplate = fs.readFileSync(baseTemplatePath, "utf-8");
    } else {
      console.warn("No built index.html found — SSR may fail.");
    }

    const serverPagesDir = path.resolve(projectRoot, "dist/pages");

    if (fs.existsSync(serverPagesDir)) {
      prodPages = await fg("**/*.page.js", {
        cwd: serverPagesDir,
        absolute: true,
      });
    }
  }

  // --- Main SSR handler ---
  app.get("*", async (req, res, next) => {
    try {
      console.info(`GET ${req.path}`);

      const urlPath = req.path;
      let html: string | null = null;

      if (!isProd) {
        // Dev: find pages fresh each request (handles file adds/removes)
        const files = await fg("src/pages/**/*.page.tsx");
        const routes = files.map((f) => {
          const route =
            "/" +
            f
              .replace(/^src\/pages\//, "")
              .replace(/\/index\.page\.tsx$/, "")
              .replace(/\.page\.tsx$/, "");

          return {
            route: normalizeRoutePath(route),
            moduleId: "/" + f,
          };
        });
        const routesJson = JSON.stringify(routes);

        for (const file of files) {
          const route = fileToRoute(file);
          if (route === urlPath) {
            const mod = await vite.ssrLoadModule("/" + file);
            if (mod.ssr) {
              const Page = mod.default;

              // Fresh template + transform by Vite each time
              let template = fs.readFileSync(baseTemplatePath, "utf-8");
              template = await vite.transformIndexHtml(
                req.originalUrl,
                template
              );

              const appHtml = await renderPage(Page);
              html = template.replace(
                /<div id="root">\s*<\/div>/,
                `<div id="root">${appHtml}</div>`
              );
              html = html.replace(
                "</body>",
                `<script>window.__DEX_ROUTES__ = ${routesJson};</script></body>`
              );
              break;
            } else {
              // CSR-only page: serve plain HTML shell
              let template = isProd
                ? prodTemplate!
                : fs.readFileSync(baseTemplatePath, "utf-8");

              if (!isProd) {
                template = await vite.transformIndexHtml(
                  req.originalUrl,
                  template
                );
              }

              html = template;
              html = html.replace(
                "</body>",
                `<script>window.__DEX_ROUTES__ = ${routesJson};</script></body>`
              );
              break;
            }
          }
        }
      } else {
        // --- Production: use cached pages and inject routes ---
        const routes = prodPages.map((abs) => {
          const rel = path.relative(
            path.resolve(projectRoot, "dist/pages"),
            abs
          );
          const route = normalizeRoutePath(fileToRoute2(abs));
          // In prod, moduleId should match the built client bundle path:
          // e.g. /pages/about.page.js (served from /client/pages)
          return { route, moduleId: "/pages/" + rel.replace(/\\/g, "/") };
        });
        const routesJson = JSON.stringify(routes);
        console.log(routesJson);

        let matched = false;

        for (const abs of prodPages) {
          const route = fileToRoute2(abs);
          if (route === urlPath) {
            const mod = await import(abs);
            matched = true;

            if (mod.ssr) {
              const Page = mod.default;
              const appHtml = await renderPage(Page);

              html = prodTemplate!.replace(
                /<div id="root">\s*<\/div>/,
                `<div id="root">${appHtml}</div>`
              );
            } else {
              // CSR-only: serve plain shell
              html = prodTemplate!;
            }

            // Inject routes data (for client navigation)
            html = html.replace(
              "</body>",
              `<script>window.__DEX_ROUTES__ = ${routesJson};</script></body>`
            );
            break;
          }
        }

        if (!matched) {
          // Fallback: serve HTML shell + routes (client will show 404)
          html = prodTemplate!.replace(
            "</body>",
            `<script>window.__DEX_ROUTES__ = ${routesJson};</script></body>`
          );
        }
      }

      if (html) {
        res.status(200).type("html").end(html);
      } else {
        res.status(404).send("<div>404 Not Found</div>");
      }
    } catch (e) {
      if (vite) vite.ssrFixStacktrace(e);
      if (!res.headersSent) next(e);
      else console.error("Suppressed error after response:", e);
    }
  });

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running: http://localhost:${port}`);
  });
}
