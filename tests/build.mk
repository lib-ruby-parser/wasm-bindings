tests/no-modules: build/no-modules/lib_ruby_parser.js
	node tests/test-web.js

tests/node: build/nodejs/lib_ruby_parser.js
	node tests/test-node.js
