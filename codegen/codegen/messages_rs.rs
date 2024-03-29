use lib_ruby_parser_nodes::template::*;

const TEMPLATE: &str = "// This file is autogenerated by {{ helper generated-by }}

use wasm_bindgen::prelude::*;
use crate::IntoJs;

{{ each message }}<dnl>
#[wasm_bindgen]
extern \"C\" {
    #[wasm_bindgen(js_name = {{ helper message-camelcase-name }})]
    pub type Js{{ helper message-camelcase-name }};

    #[wasm_bindgen(constructor, js_namespace = messages, js_class = {{ helper message-camelcase-name }})]
    fn new(
{{ each message-field }}<dnl>
        {{ helper message-field-name }}: {{ helper message-field-js-type }},
{{ end }}<dnl>
    ) -> Js{{ helper message-camelcase-name }};
}
{{ end }}<dnl>

#[wasm_bindgen]
extern \"C\" {
    #[wasm_bindgen(js_name = DiagnosticMessage)]
    pub type JsDiagnosticMessage;

    #[wasm_bindgen(constructor, js_class = DiagnosticMessage)]
    fn new(v: JsValue) -> JsDiagnosticMessage;
}
use lib_ruby_parser::DiagnosticMessage as RustDiagnosticMessage;
impl IntoJs for RustDiagnosticMessage {
    type Output = JsDiagnosticMessage;
    fn into_js(self) -> JsDiagnosticMessage {
        match self {
{{ each message }}<dnl>
            Self::{{ helper message-camelcase-name }} { {{ each message-field }}{{ helper message-field-name }}, {{ end }} } => {
                JsDiagnosticMessage::from(
                    JsValue::from(
                        Js{{ helper message-camelcase-name }}::new(
{{ each message-field }}<dnl>
                            {{ helper message-field-name }}.into_js(),
{{ end }}<dnl>
                        )
                    )
                )
            },
{{ end }}<dnl>
        }
    }
}
";

pub(crate) fn codegen() {
    let template = TemplateRoot::new(TEMPLATE).unwrap();
    let fns = crate::codegen::fns::default_fns!();

    let contents = template.render(ALL_DATA, &fns);
    std::fs::write("../bindings/src/messages.rs", contents).unwrap();
}
