const http = require('http');
var fs = require('fs');
var path = require('path');

let server = null;

const root = path.join(__filename, '../..');

function startServer(port) {
    server = http.createServer((req, res) => {
        console.log(`req.url = ${req.url}`);
        let filePath;
        if (req.url === '/' || req.url == '/favicon.ico') {
            filePath = path.join(root, 'tests/index.html');
        } else {
            filePath = path.join(root, 'build' + req.url);
        }

        let extname = path.extname(filePath);
        let contentType;
        switch (extname) {
            case '.js':
                contentType = 'text/javascript';
                break;
            case '.wasm':
                contentType = 'application/wasm'
                break;
            case '.html':
            case '.ico':
                contentType = 'text/html';
                break;
            default:
                throw `Unsupported extension ${extname}`;
        }

        console.log(`returning file ${filePath} with content-type ${contentType}`);
        fs.readFile(filePath, (err, content) => {
            if (err) {
                throw err;
            }
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        });
    });
    server.listen(port);
}

function stopServer() {
    server.close();
}

module.exports = { startServer, stopServer };
