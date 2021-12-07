mod messages_rs;
mod nodes_rs;

mod messages_js;
mod nodes_js;

mod fns;

pub(crate) fn codegen() {
    nodes_rs::codegen();
    messages_rs::codegen();

    nodes_js::codegen();
    messages_js::codegen();
}
