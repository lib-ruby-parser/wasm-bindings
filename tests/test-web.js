const puppeteer = require('puppeteer');
const assert = require('assert').strict;
const { startServer, stopServer } = require('./server');

startServer(8080);

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
    stopServer();
    console.log("Timeout, exiting...");
    process.exit(1);
}, 10000);

(async () => {
    await runTest();
    console.log("OK.");
    stopServer();
    process.exit(0);
})();
