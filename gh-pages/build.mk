gh-pages/lib-ruby-parser.js: build/web-lib-ruby-parser.js
	cp $< $@
CLEAN += gh-pages/lib-ruby-parser.js

gh-pages/lib-ruby-parser.wasm: build/web-lib-ruby-parser.wasm
	cp $< $@
CLEAN += gh-pages/lib-ruby-parser.wasm

gh-pages/preview: gh-pages/lib-ruby-parser.js gh-pages/lib-ruby-parser.wasm
	ruby -run -e httpd gh-pages -p 8000

gh-pages/build: gh-pages/lib-ruby-parser.js gh-pages/lib-ruby-parser.wasm
	@echo "Done"
