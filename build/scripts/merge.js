const fs = require('fs');
const ENV = process.env.ENV;

const wrapper_src = fs.readFileSync(`./build/${ENV}-lib-ruby-parser-wrapper.js`).toString().replace('lib_ruby_parser_wasm_bg', `${ENV}-lib-ruby-parser`);
const types_src = fs.readFileSync('./js/types.js').toString();
const nodes_src = fs.readFileSync('./js/nodes.js').toString();
const messages_src = fs.readFileSync('./js/messages.js').toString();

let POST_INIT;
if (ENV == 'web') {
    POST_INIT = `
root.parse = wasm_bindgen.parse;
let onLoadCallbacks = [];
let loaded = false;
root.onLoad = function(cb) {
    if (loaded) {
        cb()
    } else {
        onLoadCallbacks.push(cb);
    }
}
const lib_ruby_parser_wasm_url = document.currentScript.src.replace(/\.js$/, '.wasm');
wasm_bindgen(lib_ruby_parser_wasm_url).then(() => {
    loaded = true;
    onLoadCallbacks.forEach(cb => cb());
    onLoadCallbacks = [];
});
`;
} else {
    POST_INIT = ``;
}

const HEADER = `
(function () {
    let root;

    if (typeof (module) !== 'undefined') {
        root = module.exports;
    } else if (typeof (window) !== 'undefined') {
        window.LibRubyParser = {};
        root = window.LibRubyParser;
    }
`;

const FOOTER = `
})();
`;

const output = `
${HEADER}

${nodes_src}
${messages_src}
${types_src}

${wrapper_src}

${POST_INIT}

${FOOTER}
`

fs.writeFileSync(`./build/${ENV}-lib-ruby-parser.js`, output);
