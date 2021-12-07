extern crate js_sys;
extern crate lib_ruby_parser;

use lib_ruby_parser::{
    source::{
        Comment as RustComment, CommentType as RustCommentType, DecodedInput as RustDecodedInput,
        Decoder as RustDecoder, DecoderResult as RustDecoderResult, InputError as RustInputError,
        MagicComment as RustMagicComment, MagicCommentKind as RustMagicCommentKind,
        SourceLine as RustSourceLine,
    },
    Bytes as RustBytes, Diagnostic as RustDiagnostic, ErrorLevel as RustErrorLevel, Loc as RustLoc,
    Node as RustNode, Parser as RustParser, ParserOptions as RustParserOptions,
    ParserResult as RustParserResult, Token as RustToken,
};

use js_sys::Uint8Array;
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;

mod nodes;
use nodes::JsNode;

mod messages;
use messages::JsDiagnosticMessage;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

trait IntoJs: Sized {
    type Output;

    fn into_js(self) -> Self::Output;
}

impl<T> IntoJs for Vec<T>
where
    T: IntoJs,
{
    type Output = Vec<<T as IntoJs>::Output>;

    fn into_js(self) -> Self::Output {
        self.into_iter().map(|item| item.into_js()).collect()
    }
}

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_name = Loc)]
    pub type JsLoc;

    #[wasm_bindgen(constructor, js_class = Loc)]
    fn new(begin: usize, end: usize) -> JsLoc;
}

impl IntoJs for RustLoc {
    type Output = JsLoc;

    fn into_js(self) -> JsLoc {
        JsLoc::new(self.begin, self.end)
    }
}

impl IntoJs for Option<RustLoc> {
    type Output = Option<JsLoc>;

    fn into_js(self) -> Option<JsLoc> {
        self.map(|rust_loc| rust_loc.into_js())
    }
}

impl IntoJs for Box<RustNode> {
    type Output = JsNode;

    fn into_js(self) -> JsNode {
        (*self).into_js()
    }
}

impl IntoJs for Option<Box<RustNode>> {
    type Output = Option<JsNode>;

    fn into_js(self) -> Option<JsNode> {
        self.map(|boxed_rust_node| (*boxed_rust_node).into_js())
    }
}

impl IntoJs for String {
    type Output = String;

    fn into_js(self) -> String {
        self
    }
}

impl IntoJs for Option<String> {
    type Output = Option<String>;

    fn into_js(self) -> Option<String> {
        self
    }
}

impl IntoJs for u8 {
    type Output = u8;

    fn into_js(self) -> u8 {
        self
    }
}

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_name = Bytes)]
    pub type JsBytes;

    #[wasm_bindgen(constructor, js_class = Bytes)]
    fn new(raw: Vec<u8>) -> JsBytes;
}

impl IntoJs for RustBytes {
    type Output = JsBytes;
    fn into_js(self) -> JsBytes {
        JsBytes::new(self.raw)
    }
}

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_name = Token)]
    pub type JsToken;

    #[wasm_bindgen(constructor, js_class = Token)]
    fn new(token_type: i32, token_value: JsBytes, loc: JsLoc) -> JsToken;
}

impl IntoJs for RustToken {
    type Output = JsToken;
    fn into_js(self) -> JsToken {
        JsToken::new(
            self.token_type,
            self.token_value.into_js(),
            self.loc.into_js(),
        )
    }
}

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_name = Diagnostic)]
    pub type JsDiagnostic;

    #[wasm_bindgen(constructor, js_class = Diagnostic)]
    fn new(level: String, message: JsDiagnosticMessage, loc: JsLoc) -> JsDiagnostic;
}

impl IntoJs for RustDiagnostic {
    type Output = JsDiagnostic;
    fn into_js(self) -> JsDiagnostic {
        JsDiagnostic::new(
            self.level.into_js(),
            self.message.into_js(),
            self.loc.into_js(),
        )
    }
}

impl IntoJs for RustErrorLevel {
    type Output = String;

    fn into_js(self) -> String {
        match self {
            RustErrorLevel::Warning => "warning",
            RustErrorLevel::Error => "error",
        }
        .to_string()
    }
}

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_name = Comment)]
    pub type JsComment;

    #[wasm_bindgen(constructor, js_class = Comment)]
    fn new(location: JsLoc, kind: String) -> JsComment;
}

impl IntoJs for RustComment {
    type Output = JsComment;
    fn into_js(self) -> JsComment {
        JsComment::new(self.location.into_js(), self.kind.into_js())
    }
}

impl IntoJs for RustCommentType {
    type Output = String;
    fn into_js(self) -> String {
        match self {
            RustCommentType::Inline => "inline",
            RustCommentType::Document => "document",
            RustCommentType::Unknown => "unknown",
        }
        .to_string()
    }
}

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_name = MagicComment)]
    pub type JsMagicComment;

    #[wasm_bindgen(constructor, js_class = MagicComment)]
    fn new(kind: String, key_l: JsLoc, value_l: JsLoc) -> JsMagicComment;
}

impl IntoJs for RustMagicComment {
    type Output = JsMagicComment;
    fn into_js(self) -> JsMagicComment {
        JsMagicComment::new(
            self.kind.into_js(),
            self.key_l.into_js(),
            self.value_l.into_js(),
        )
    }
}

impl IntoJs for RustMagicCommentKind {
    type Output = String;
    fn into_js(self) -> String {
        match self {
            RustMagicCommentKind::Encoding => "encoding",
            RustMagicCommentKind::FrozenStringLiteral => "frozen_string_literal",
            RustMagicCommentKind::WarnIndent => "warn_indent",
            RustMagicCommentKind::ShareableConstantValue => "shareable_constant_value",
        }
        .to_string()
    }
}

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_name = DecodedInput)]
    pub type JsDecodedInput;

    #[wasm_bindgen(constructor, js_class = DecodedInput)]
    fn new(name: String, lines: Vec<JsSourceLine>, bytes: Vec<u8>) -> JsDecodedInput;
}

impl IntoJs for RustDecodedInput {
    type Output = JsDecodedInput;
    fn into_js(self) -> JsDecodedInput {
        JsDecodedInput::new(
            self.name.into_js(),
            self.lines
                .into_iter()
                .map(|line| line.into_js())
                .collect::<Vec<_>>(),
            self.bytes,
        )
    }
}

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_name = SourceLine)]
    pub type JsSourceLine;

    #[wasm_bindgen(constructor, js_class = SourceLine)]
    fn new(start: usize, end: usize, ends_with_eof: bool) -> JsSourceLine;
}

impl IntoJs for RustSourceLine {
    type Output = JsSourceLine;
    fn into_js(self) -> JsSourceLine {
        JsSourceLine::new(self.start, self.end, self.ends_with_eof)
    }
}

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_name = ParserResult)]
    pub type JsParserResult;

    #[wasm_bindgen(constructor, js_class = ParserResult)]
    fn new(
        ast: Option<JsNode>,
        tokens: Vec<JsToken>,
        diagnostics: Vec<JsDiagnostic>,
        comments: Vec<JsComment>,
        magic_comments: Vec<JsMagicComment>,
        input: JsDecodedInput,
    ) -> JsParserResult;
}

impl IntoJs for RustParserResult {
    type Output = JsParserResult;
    fn into_js(self) -> JsParserResult {
        JsParserResult::new(
            self.ast.into_js(),
            self.tokens.into_js(),
            self.diagnostics.into_js(),
            self.comments.into_js(),
            self.magic_comments.into_js(),
            self.input.into_js(),
        )
    }
}

fn fn_based_decoder(decoder: js_sys::Function) -> Option<RustDecoder> {
    if decoder.is_null() {
        return None;
    }

    Some(RustDecoder::new(Box::new(
        move |encoding: String, bytes: Vec<u8>| {
            let this = JsValue::null();
            let js_encoding = JsValue::from(encoding);
            let js_bytes = Uint8Array::from(bytes.as_slice());
            let result = decoder.call2(&this, &js_encoding, &js_bytes);
            match result {
                Ok(decoded) => {
                    if Uint8Array::instanceof(&decoded) {
                        let decoded = Uint8Array::from(decoded).to_vec();
                        RustDecoderResult::Ok(decoded)
                    } else {
                        RustDecoderResult::Err(RustInputError::DecodingError(String::from(
                            "JS decoder must return a Uint8Array or throw a String",
                        )))
                    }
                }
                Err(err) => {
                    if err.is_string() {
                        let err = err.as_string().unwrap();
                        RustDecoderResult::Err(RustInputError::DecodingError(err))
                    } else {
                        RustDecoderResult::Err(RustInputError::DecodingError(String::from(
                            "JS decoder must return a Uint8Array or throw a String",
                        )))
                    }
                }
            }
        },
    )))
}

#[wasm_bindgen]
pub fn parse(
    input: &str,
    buffer_name: Option<String>,
    decoder: js_sys::Function,
) -> JsParserResult {
    let options = RustParserOptions {
        buffer_name: buffer_name.unwrap_or_else(|| String::from("(eval)")),
        decoder: fn_based_decoder(decoder),
        token_rewriter: None,
        record_tokens: true,
    };
    let parser = RustParser::new(input, options);
    let output = parser.do_parse();

    output.into_js()
}
