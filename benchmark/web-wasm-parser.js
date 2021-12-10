const { startServer, stopServer } = require('../tests/server.js');
const puppeteer = require('../node_modules/puppeteer');
const fs = require('fs');

startServer({ port: 8080 });

function sleep(ms) {
    return new Promise((res, rej) => {
        setTimeout(() => res(), ms);
    });
}

const filelist = fs.readFileSync(process.env.FILELIST_PATH).toString().split("\n");
const files = filelist.map(filepath => fs.readFileSync(filepath).toString());

(async function () {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('http://localhost:8080');


    await page.evaluate(`window.files = ${JSON.stringify(files)}`);
    const webDuration = await page.evaluate(() => {
        return new Promise((resolve, reject) => {
            LibRubyParser.onLoad(() => {
                const start = performance.now();
                for (file of files) {
                    LibRubyParser.parse(file);
                }
                const end = performance.now();
                const duration = (end - start) / 1000;
                console.log(duration);
                resolve(duration);
            })
        });
    });
    console.log(webDuration);

    await browser.close();
    stopServer();
})()
