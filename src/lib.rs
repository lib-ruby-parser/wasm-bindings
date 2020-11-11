extern crate lib_ruby_parser;
use lib_ruby_parser::{Parser, ParserOptions, ParserResult};

use wasm_bindgen::prelude::*;

fn parse(input: &str) -> Result<String, String> {
    let params = ParserOptions {
        debug: true,
        buffer_name: "(eval)".to_owned(),
        ..Default::default()
    };

    let mut parser = Parser::new(input.as_bytes(), params).map_err(|err| err.to_string())?;
    let ParserResult {
        ast,
        diagnostics,
        tokens,
        comments,
        magic_comments,
    } = parser.do_parse();

    let output = format!(
        "
AST:
{ast}

Diagnostics:
{diagnostics}

Tokens:
{tokens}

Comments:
{comments}

Magic comments:
{magic_comments}
",
        ast = if let Some(ast) = ast {
            ast.inspect(0)
        } else {
            "None".to_owned()
        },
        diagnostics = diagnostics
            .iter()
            .map(|d| d
                .render()
                .unwrap_or_else(|| "<failed to render diagnostic>".to_owned()))
            .collect::<Vec<_>>()
            .join("\n"),
        tokens = tokens
            .iter()
            .map(|t| format!("{:?}", t))
            .collect::<Vec<_>>()
            .join("\n"),
        comments = format!("{:#?}", comments),
        magic_comments = format!("{:#?}", magic_comments),
    );

    Ok(output)
}

#[wasm_bindgen]
pub fn js_parse(input: &str) -> String {
    match parse(input) {
        Ok(output) => format!("OK\n{}", output),
        Err(err) => format!("Err\n{}", err),
    }
}
