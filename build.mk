gh-pages/lib-ruby-parser.js: build/no-modules/lib_ruby_parser.js
	cp $< $@
CLEAN += gh-pages/lib-ruby-parser.js

gh-pages/lib-ruby-parser.wasm: build/no-modules/lib_ruby_parser.wasm
	cp $< $@
CLEAN += gh-pages/lib-ruby-parser.wasm

gh-pages/preview: gh-pages/lib-ruby-parser.js gh-pages/lib-ruby-parser.wasm
	ruby -run -e httpd gh-pages -p 8000

gh-pages/build: gh-pages/lib-ruby-parser.js gh-pages/lib-ruby-parser.wasm
	@echo "Done"
