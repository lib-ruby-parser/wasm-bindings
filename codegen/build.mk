CODEGEN_DEPS = $(wildcard codegen/codegen/*.rs)
CODEGEN_DEPS += codegen/Cargo.toml
CODEGEN_DEPS += codegen/build.rs
DO_CODEGEN = cd codegen && cargo build

js/nodes.js: $(CODEGEN_DEPS)
	$(DO_CODEGEN)
CLEAN += js/nodes.js

js/messages.js: $(CODEGEN_DEPS)
	$(DO_CODEGEN)
CLEAN += js/messages.js

bindings/src/nodes.rs: $(CODEGEN_DEPS)
	$(DO_CODEGEN)
CLEAN += bindings/src/nodes.rs

bindings/src/messages.rs: $(CODEGEN_DEPS)
	$(DO_CODEGEN)
CLEAN += bindings/src/messages.rs
