const puppeteer = require('puppeteer');
const http = require('http');
var fs = require('fs');
var path = require('path');
const assert = require('assert').strict;

const server = http.createServer((req, res) => {
    console.log(`req.url = ${req.url}`);
    let filePath;
    if (req.url === '/' || req.url == '/favicon.ico') {
        filePath = './tests/index.html';
    } else {
        filePath = './build' + req.url;
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
server.listen(8080);

function sleep(ms) {
    return new Promise((res, rej) => {
        setTimeout(() => res(), ms);
    });
}

async function runTest() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const messages = [];
    page
        .on('console', (message) => messages.push(message))
        .on('pageerror', err => { throw err })
        .on('requestfailed', request => {
            throw `${request.failure().errorText} ${request.url()}`
        });
    await page.goto('http://localhost:8080');
    await sleep(3000);
    const output = await page.evaluate(() => {
        return window.output;
    });
    await browser.close();
    console.log(messages);
    assert.equal(messages[messages.length - 1]._text, "Page load end");
    console.log(output);
    assert.equal(output.ast.recv.value, '2');
}

setTimeout(() => {
    server.close();
    console.log("Timeout, exiting...");
    process.exit(1);
}, 10000);

(async () => {
    await runTest();
    console.log("OK.");
    server.close();
    process.exit(0);
})();
