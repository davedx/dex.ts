import { spawn } from "node:child_process";
import chokidar from "chokidar";

let child;
function start() {
  child = spawn(
    "node",
    ["--enable-source-maps", "--import", "tsx", "src/server/server.ts"],
    {
      stdio: "inherit",
    }
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

const watcher = chokidar.watch("src/server", {
  ignoreInitial: true,
  awaitWriteFinish: { stabilityThreshold: 100, pollInterval: 50 },
});

watcher.on("all", (_evt, file) => restart(file));

// IMPORTANT: We do NOT watch src/client or node_modules or .vite at all.
start();
