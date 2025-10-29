import express from "express";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { renderPage, fileToRoute, fileToRoute2 } from "./ssr.js";
import fg from "fast-glob";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProd = process.env.NODE_ENV === "production";

async function createServer() {
  const app = express();
  let vite: any = null;

  if (!isProd) {
    // Create ONE Vite dev server in middleware mode
    const vitePkg = await import("vite");
    vite = await vitePkg.createServer({
      server: { middlewareMode: true },
      appType: "custom",
      configFile: path.resolve("vite.config.js"),
    });
    app.use(vite.middlewares);
  } else {
    // Serve built static assets
    app.use(
      express.static(path.resolve(__dirname, "../client"), {
        index: false,
      })
    );
  }

  // Example API route
  app.get("/api/hello", (_, res) => res.json({ ok: true }));

  // Main handler: SSR in dev/prod, otherwise serve index.html
  app.get("*", async (req, res, next) => {
    try {
      const urlPath = req.path;

      if (!isProd) {
        // --- DEV SSR ---
        const files = await fg("src/pages/**/*.page.tsx");

        for (const file of files) {
          const route = fileToRoute(file);
          if (route === urlPath) {
            const mod = await vite.ssrLoadModule("/" + file);
            const Page = mod.default;
            if (mod.ssr) {
              // Load base HTML template (same one used for CSR)
              let template = fs.readFileSync(
                path.resolve("index.html"),
                "utf-8"
              );

              // 2. Transform it via Vite (adds preamble and HMR scripts)
              template = await vite.transformIndexHtml(
                req.originalUrl,
                template
              );

              // 3. Render the page markup
              const appHtml = await renderPage(Page);

              // 4. Inject SSR markup into the template
              const html = template.replace(
                '<div id="root"></div>',
                `<div id="root">${appHtml}</div>`
              );

              // 5. Send full HTML
              return res.status(200).type("html").end(html);
            }
          }
        }

        // --- DEV CSR fallback ---
        const templatePath = path.resolve("index.html");
        let html = fs.readFileSync(templatePath, "utf-8");
        html = await vite.transformIndexHtml(req.originalUrl, html);
        return res.status(200).type("html").end(html);
      }

      // --- PROD SSR ---
      console.log(`__dirname: ${__dirname}`);
      const serverPagesDir = path.resolve(__dirname, "../pages");
      const files = fs.existsSync(serverPagesDir)
        ? await fg("**/*.page.js", { cwd: serverPagesDir, absolute: true })
        : [];

      for (const abs of files) {
        const route = fileToRoute2(abs);
        console.log(
          `comparing abs ${abs} route ${route} to urlPath ${urlPath}`
        );
        if (route === urlPath) {
          const mod = await import(abs);
          const Page = mod.default;
          if (mod.ssr) {
            // 1. Load built HTML template from dist/client
            let template = fs.readFileSync(
              path.resolve(__dirname, "../client/index.html"),
              "utf-8"
            );

            // 2. Render the page markup (same as dev)
            const appHtml = await renderPage(Page);

            // 3. Inject SSR markup into the template
            const html = template.replace(
              '<div id="root"></div>',
              `<div id="root">${appHtml}</div>`
            );

            // 4. Send final HTML
            return res.status(200).type("html").end(html);
          }
        }
      }

      // --- PROD CSR fallback ---
      const html = fs.readFileSync(
        path.resolve(__dirname, "../client/index.html"),
        "utf-8"
      );
      return res.status(200).type("html").end(html);
    } catch (e) {
      if (vite) vite.ssrFixStacktrace(e);
      next(e);
    }
  });

  const port = process.env.PORT || 3000;
  app.listen(port, () =>
    console.log(`Server running: http://localhost:${port}`)
  );
}

createServer();
