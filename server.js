/**
 * Minimalistic server to serve static files
 */
const http = require("http")
const fs = require("fs")
const path = require("path")
const url = require("url")

// Mappage des types MIME
const mimeTypes = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".wav": "audio/wav",
  ".mp4": "video/mp4",
  ".woff": "application/font-woff",
  ".ttf": "application/font-ttf",
  ".eot": "application/vnd.ms-fontobject",
  ".otf": "application/font-otf",
  ".wasm": "application/wasm"
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url)
  const decodedPathname = decodeURIComponent(parsedUrl.pathname)
  let filePath = path.join(__dirname, decodedPathname === "/" ? "index.html" : decodedPathname)
  const extname = path.extname(filePath).toLowerCase()
  const contentType = mimeTypes[extname] || "application/octet-stream"

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === "ENOENT") {
        fs.readFile(path.join(__dirname, "404.html"), (error, content404) => {
          res.writeHead(404, {
            "Content-Type": "text/html"
          })
          res.end(content404 || "404 Not Found", "utf-8")
        })
      } else {
        res.writeHead(500)
        res.end(`Server Error: ${err.code}`)
      }
    } else {
      res.writeHead(200, {
        "Content-Type": contentType
      })
      res.end(content, "utf-8")
    }
  })
})

server.listen(3000, () => {
  console.log("Server running at http://localhost:3000/")
})