import * as wasm from "wasm-bindings";

console.log(wasm.js_parse("2 + 2"));

let input = document.getElementById("input");
let output = document.getElementById("output");

input.onkeyup = () => {
    output.value = wasm.js_parse(input.value);
}
