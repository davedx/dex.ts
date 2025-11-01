#!/usr/bin/env node
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import chokidar from "chokidar";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = process.cwd();

// Resolve tsx from the framework’s own node_modules
const require = createRequire(import.meta.url);
const tsxPath = require.resolve("tsx");

let child;

function start() {
  child = spawn(
    "node",
    [
      "--enable-source-maps",
      "--import",
      tsxPath,
      path.resolve(projectRoot, "src/server/server.ts"),
    ],
    { stdio: "inherit" }
  );
}

function stop() {
  if (child) child.kill();
}

function restart(file) {
  console.log(`[dev-runner] change in ${file} → restarting server...`);
  stop();
  start();
}

// Watch only the server source directory
const watcher = chokidar.watch("src/server", {
  ignoreInitial: true,
  awaitWriteFinish: { stabilityThreshold: 100, pollInterval: 50 },
});

watcher.on("all", (_evt, file) => restart(file));

// Start initially
start();
