import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../out/", import.meta.url));
const prefix = "/transit-layout";
const port = Number(process.argv[2] ?? 3000);
const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".glb": "model/gltf-binary",
  ".wasm": "application/wasm",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
};
await stat(resolve(root, "index.html")).catch(() => {
  throw new Error("Build the static site first with npm run build.");
});
createServer(async (request, response) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405).end();
    return;
  }
  try {
    const pathname = decodeURIComponent(
      new URL(request.url, "http://localhost").pathname,
    );
    if (pathname === "/" || pathname === prefix) {
      response.writeHead(302, { Location: `${prefix}/` }).end();
      return;
    }
    if (!pathname.startsWith(`${prefix}/`)) {
      response.writeHead(404).end();
      return;
    }
    let target = resolve(
      root,
      pathname.slice(prefix.length + 1) || "index.html",
    );
    if (!target.startsWith(root.endsWith(sep) ? root : `${root}${sep}`)) {
      response.writeHead(403).end();
      return;
    }
    const info = await stat(target).catch(() => null);
    if (info?.isDirectory()) target = resolve(target, "index.html");
    else if (!info && !extname(target)) target += ".html";
    const body = await readFile(target);
    response.writeHead(200, {
      "Content-Type": mime[extname(target)] ?? "application/octet-stream",
      "Cache-Control": "no-store",
    });
    response.end(request.method === "HEAD" ? undefined : body);
  } catch {
    response.writeHead(404).end();
  }
}).listen(port, "127.0.0.1", () => {
  process.stdout.write(`Static preview: http://127.0.0.1:${port}${prefix}/\n`);
});
