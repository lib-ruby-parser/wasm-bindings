import * as wasm from "wasm-bindings";

console.log(wasm.js_parse("2 + 2"));

let input = document.getElementById("input");
let output = document.getElementById("output");

let parse = () => {
    output.value = wasm.js_parse(input.value);
}

input.onkeyup = parse;
parse();
