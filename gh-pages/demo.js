console.log('Running demo');

LibRubyParser.onLoad(() => {
    console.log('LibRubyParser WASM is loaded');
});

function pp(value, level) {
    if (level === undefined) {
        level = 0;
    }
    if (value === undefined) {
        return 'undefined';
    }
    if (typeof (value) === 'string') {
        return `"${value}"`;
    }
    if (typeof (value) === 'number') {
        return `${value}`;
    }
    if (typeof (value) === 'boolean') {
        return `${value}`;
    }
    if (value instanceof Uint8Array) {
        return `Uint8Array(bytes = "${new TextDecoder().decode(value)}")`;
    }
    if (Array.isArray(value)) {
        let output = `[\n`;
        for (let item of value) {
            output += `${' '.repeat(level + 4)}${pp(item, level + 4)},\n`;
        }
        output += `${' '.repeat(level)}}`;
        return output;
    }
    let output = `${value.constructor.name} {\n`;
    let keys = Object.getOwnPropertyNames(value);
    for (let key of keys) {
        output += `${' '.repeat(level + 4)}${key}: ${pp(value[key], level + 4)},\n`;
    }
    output += `${' '.repeat(level)}}`;
    return output;
}

document.addEventListener('DOMContentLoaded', () => {
    const outputField = document.getElementById('output-field');
    const inputField = document.getElementById('input-field');

    function parse() {
        const code = inputField.value;
        const output = LibRubyParser.parse(code, 'demo.rb');
        window.output = output;
        outputField.textContent = pp(output);
    }

    inputField.addEventListener('input', () => {
        LibRubyParser.onLoad(parse);
    });

    LibRubyParser.onLoad(parse);
});

console.warn("Output is always available as `output` (it's set on `window`)");
