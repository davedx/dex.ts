import express from "express";
import { readdir } from "fs/promises";
import path from "path";
import url from "url";
import fs from "fs";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

/**
 * Recursively walk a directory and return all .ts/.js files.
 */
async function walk(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const full = path.join(dir, entry.name);
      return entry.isDirectory() ? walk(full) : full;
    })
  );
  return files.flat().filter((f) => f.endsWith(".ts") || f.endsWith(".js"));
}

/**
 * Convert filesystem path → express-style route.
 * api/posts/[id].ts → /posts/:id
 * api/users/[userId]/posts.ts → /users/:userId/posts
 */
function fileToRoute(file: string, apiDir: string): string {
  const rel = file.replace(apiDir, "").replace(/\.(ts|js)$/, "");
  return (
    rel
      .split(path.sep)
      .map((seg) => (seg.startsWith("[") ? `:${seg.slice(1, -1)}` : seg))
      .join("/")
      .replace(/\/index$/, "") || "/"
  );
}

/**
 * Build an express.Router() from files in /api.
 */
export async function createApiRouter(
  apiRoot: string,
  options: Record<string, any> = {},
  dev = false
) {
  const router = express.Router();

  if (!fs.existsSync(apiRoot)) {
    console.warn(`[api-router] No API directory found at ${apiRoot}`);
    return router;
  }

  const methodMap = {
    GET: router.get.bind(router),
    POST: router.post.bind(router),
    PUT: router.put.bind(router),
    PATCH: router.patch.bind(router),
    DELETE: router.delete.bind(router),
  };
  const files = await walk(apiRoot);

  for (const file of files) {
    const route = fileToRoute(file, apiRoot);
    const mod = await import(url.pathToFileURL(file).href);
    const verbs = Object.keys(mod).filter((k) =>
      ["GET", "POST", "PUT", "PATCH", "DELETE"].includes(k.toUpperCase())
    );
    const context = options.context || {};

    for (const verb of verbs) {
      const fn = methodMap[verb as keyof typeof methodMap];
      if (fn) {
        fn(route, async (req, res, next) => {
          try {
            const m = dev
              ? await import(`${url.pathToFileURL(file).href}?t=${Date.now()}`)
              : mod;
            const handler = m[verb];
            const result = await handler(context, req, res);
            if (result !== undefined && !res.headersSent) res.json(result);
          } catch (err) {
            next(err);
          }
        });
      }
    }

    // Return 405 if unsupported method called
    router.all(route, (req, res, next) => {
      if (!verbs.includes(req.method))
        res.status(405).json({ error: "Method Not Allowed" });
      else next();
    });
  }

  return router;
}
