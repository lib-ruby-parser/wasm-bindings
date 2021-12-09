# wasm bindings for `lib-ruby-parser`

API mostly mirrors Rust version.

[Live demo](https://lib-ruby-parser.github.io/wasm-bindings/)

## Including the library

You can grab the latest release on [Releases](https://github.com/lib-ruby-parser/wasm-bindings/releases) page.

+ Files prefixed with `web-` are designed to work in the browser
+ Files prefixes with `nodejs-` are for Node.js only

Alternatively you can include web version from GitHub pages:

```html
<script type="text/javascript" src="https://lib-ruby-parser.github.io/wasm-bindings/lib-ruby-parser.js">
</script>
```

please note, this URL is not going to be stable or versioned. Moreover, GitHub pages always host what's in the master branch, so better use proper vendoring. **This URL is for quick testing only**.

If you use vendored version:

+ for Node.js:
    + make sure that `.wasm` file is called `nodejs-lib-ruby-parser.wasm`
    + put in the same folder as your JS file, it uses a relative hardcoded `require`
+ for web version:
    + name of the `wasm` file is inferred from the `js` file, i.e. for `/a/b/c.js` WASM file must be available at `/a/b/c.wasm`. JS file literally calls `document.currentScript.src.replace(/.js$/, '.wasm')` to get WASM file URL.

Once both JS and WASM files are included:

+ for Node.js run `const LibRubyParser = require('./path/to/nodejs-lib-ruby-parser.js')`
+ or, in browser, `LibRubyParser` becomes globally available, however, there's an important note. In browser WASM files are loaded asynchronously, and so your code must wait for WASM code to be loaded and executed, there's a hook for that:

```js
LibRubyParser.onLoad(() => {
    // lib-ruby-parser is ready to be used
})
```

## API

```js
const parserResult = LibRubyParser.parse('2 + 2')
```

here `parserResult` is an instance of `LibRubyParser.ParserResult` class that fully mirrors Rust API. It has fields:

+ `ast` - `undefined | LibRubyParser.Node`, `Node` class has a bunch of subclasses located under `LibRubyParser.nodes` namespace
+ `tokens` - `Array<LibRubyParser.Token>`, every token has `token_type`, `token_value`, `loc`
+ `diagnostics` - `Array<LibRubyParser.Diagnostic>`, every diagnostic has `level`, `message`, `loc`. All message variants are placed under `LibRubyParser.messages` namespace, all of them are inherited from `LibRubyParser.DiagnsoticMessage` class.
+ `comments` - `Array<LibRubyParser.Comment>`, every comment has `location` and `kind`.
+ `magic_comments` - `Array<LibRubyParser.MagicComment>`, every magic comment has `kind`, `key_l`, `value_l`
+ `input` - `LibRubyParser.DecodedInput` with `name`, `lines` and `bytes`

It is possible to pass buffer name as the second argument, `"(eval)"` is the default value:

```js
const parserResult = LibRubyParser.parse('2 + 2', 'filename.rb')
```

It is also possible to specify custom decoder if your code has encoding different from `UTF-8/ASCII-8BIT/BINARY`:

```js
function decoder(encoding, input) {
    // encoding is a string taked from `# encoding: ...` magic comment
    // input is a Uint8Array of raw bytes
}

const parserResult = LibRubyParser.parse('2 + 2', null, decoder);
```

To return decoded input simply `return` a new `Uint8Array` array.

To return decoding error simply `throw` a string with message (that you'll later get back in `.diagnostics` list).
