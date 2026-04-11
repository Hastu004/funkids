const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const baseDir = __dirname;

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

const siteInfo = {
  name: "FunKids",
  message: "Te esperamos para una tarde llena de juegos y creatividad.",
  contactEmail: "hola@funkids.cl",
  schedule: "lunes a sabado de 10:00 a 18:00",
};

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
  });
  res.end(JSON.stringify(payload));
}

function sendFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const type = mimeTypes[ext] || "application/octet-stream";

  fs.readFile(filePath, (error, content) => {
    if (error) {
      sendJson(res, 500, { error: "No se pudo leer el archivo solicitado." });
      return;
    }

    res.writeHead(200, { "Content-Type": type });
    res.end(content);
  });
}

const server = http.createServer((req, res) => {
  const url = req.url === "/" ? "/index.html" : req.url;

  if (url === "/api/info") {
    sendJson(res, 200, siteInfo);
    return;
  }

  const safePath = path.normalize(url).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(baseDir, safePath);

  if (!filePath.startsWith(baseDir)) {
    sendJson(res, 403, { error: "Acceso no permitido." });
    return;
  }

  fs.stat(filePath, (error, stats) => {
    if (error || !stats.isFile()) {
      sendJson(res, 404, { error: "Recurso no encontrado." });
      return;
    }

    sendFile(res, filePath);
  });
});

server.listen(PORT, () => {
  console.log(`FunKids disponible en http://localhost:${PORT}`);
});
