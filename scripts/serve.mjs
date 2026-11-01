import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
export function staticServer(port = 4175) {
  const root = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../dist",
  );
  const types = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".xml": "application/xml; charset=utf-8",
    ".txt": "text/plain; charset=utf-8",
    ".md": "text/markdown; charset=utf-8",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".webmanifest": "application/manifest+json",
  };
  const server = http.createServer((req, res) => {
    let file;
    try {
      const p = decodeURIComponent(
        new URL(req.url, "http://localhost").pathname,
      );
      const target = path.resolve(root, "." + p);
      if (path.relative(root, target).startsWith("..")) {
        res.writeHead(400);
        res.end();
        return;
      }
      file = p === "/" ? path.join(root, "index.html") : target;
      if (!fs.existsSync(file) || !fs.statSync(file).isFile())
        file = target + ".html";
    } catch {
      res.writeHead(400);
      res.end();
      return;
    }
    let status = 200;
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
      file = path.join(root, "404.html");
      status = 404;
    }
    res.writeHead(status, {
      "Content-Type": types[path.extname(file)] || "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
    });
    if (req.method === "HEAD") res.end();
    else fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => {
    server.listen(port, "127.0.0.1", () => resolve(server));
  });
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await staticServer(Number(process.env.PORT) || 4175);
  console.log("Ibrahim Tools preview: http://127.0.0.1:4175");
}
