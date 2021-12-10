const fs = require('fs');
const LibRubyParser = require('../build/nodejs-lib-ruby-parser.js');

const filelist = fs.readFileSync(process.env.FILELIST_PATH).toString().split("\n");
const files = filelist.map(filepath => fs.readFileSync(filepath).toString());

const start = performance.now();

for (let file of files) {
    LibRubyParser.parse(file);
}

const end = performance.now();
console.log((end - start) / 1000);
