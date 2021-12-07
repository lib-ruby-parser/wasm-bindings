const LibRubyParser = require('../build/nodejs/lib_ruby_parser.js');
const assert = require('assert').strict;

function test_ast() {
    const actual = LibRubyParser.parse("2 + 2").ast;
    const expected = new LibRubyParser.nodes.Send(
        // recv
        new LibRubyParser.nodes.Int(
            '2',
            undefined,
            new LibRubyParser.Loc(0, 1)
        ),
        // method_name
        '+',
        // args,
        [
            new LibRubyParser.nodes.Int(
                // value
                '2',
                // operator_l
                undefined,
                // expression_l
                new LibRubyParser.Loc(4, 5),
            )
        ],
        // dot_l
        undefined,
        // selector_l
        new LibRubyParser.Loc(2, 3),
        // begin_l
        undefined,
        // end_l
        undefined,
        // operator_l
        undefined,
        // expression_l,
        new LibRubyParser.Loc(0, 5),
    );
    assert.deepEqual(actual, expected);
}

function test_tokens() {
    const actual = LibRubyParser.parse('foo 42').tokens;
    const expected = [
        new LibRubyParser.Token(
            307,
            new LibRubyParser.Bytes(new TextEncoder("utf-8").encode("foo")),
            new LibRubyParser.Loc(0, 3),
        ),
        new LibRubyParser.Token(
            314,
            new LibRubyParser.Bytes(new TextEncoder("utf-8").encode("42")),
            new LibRubyParser.Loc(4, 6),
        ),
        new LibRubyParser.Token(
            0,
            new LibRubyParser.Bytes(Uint8Array.from([])),
            new LibRubyParser.Loc(6, 6),
        ),
    ];
    assert.deepEqual(actual, expected);
}

function test_diagnostics() {
    const actual = LibRubyParser.parse('def foo; BAR = 1; end').diagnostics;
    const expected = [
        new LibRubyParser.Diagnostic(
            'error',
            new LibRubyParser.messages.DynamicConstantAssignment(),
            new LibRubyParser.Loc(9, 12),
        )
    ];
    assert.deepEqual(actual, expected);
}

function test_comments() {
    const actual = LibRubyParser.parse("# foo\n=begin\nbar\n=end").comments;
    const expected = [
        new LibRubyParser.Comment(
            new LibRubyParser.Loc(0, 6),
            'inline'
        ),
        new LibRubyParser.Comment(
            new LibRubyParser.Loc(6, 21),
            'document'
        ),
    ];
    assert.deepEqual(actual, expected);
}

function test_magic_comments() {
    const actual = LibRubyParser.parse(`
# encoding: utf-8
# warn_indent: false
# frozen_string_literal: true
# shareable_constant_value: foo
`).magic_comments;
    const expected = [
        new LibRubyParser.MagicComment(
            'encoding',
            new LibRubyParser.Loc(3, 11),
            new LibRubyParser.Loc(13, 18),
        ),
        new LibRubyParser.MagicComment(
            'warn_indent',
            new LibRubyParser.Loc(21, 32),
            new LibRubyParser.Loc(34, 39),
        ),
        new LibRubyParser.MagicComment(
            'frozen_string_literal',
            new LibRubyParser.Loc(42, 63),
            new LibRubyParser.Loc(65, 69),
        ),
        new LibRubyParser.MagicComment(
            'shareable_constant_value',
            new LibRubyParser.Loc(72, 96),
            new LibRubyParser.Loc(98, 101),
        ),
    ];
    assert.deepEqual(actual, expected);
}

function test_input() {
    const actual = LibRubyParser.parse('2 + 2', 'foo.rb').input;
    const expected = new LibRubyParser.DecodedInput(
        'foo.rb',
        [
            new LibRubyParser.SourceLine(0, 5, true),
        ],
        new TextEncoder("utf-8").encode("2 + 2")
    );
    assert.deepEqual(actual, expected);
}

function test_decoder_ok() {
    let decoder_called = false;
    let yielded_encoding = null;
    let yielded_input = null;

    const input = '# encoding: two-is-three\n2 + 2';
    const output = LibRubyParser.parse(
        input,
        null,
        (encoding, input) => {
            decoder_called = true;

            yielded_encoding = encoding;
            yielded_input = input;

            // decode back and replace 2 -> 3
            input = new TextDecoder().decode(input);
            input = input.replace(/2/g, '3');

            return new TextEncoder("utf-8").encode(input);
        }
    );
    assert(decoder_called);
    assert.equal(yielded_encoding, 'two-is-three');
    assert.deepEqual(yielded_input, new TextEncoder("utf-8").encode(input));

    assert.equal(output.ast.recv.value, '3');
    assert.equal(output.ast.args[0].value, '3');
    assert.deepEqual(output.tokens[0].token_value.raw, new TextEncoder("utf-8").encode('3'));
    assert.deepEqual(output.tokens[2].token_value.raw, new TextEncoder("utf-8").encode('3'));
}

function test_decoder_err() {
    let decoder_called = false;
    let yielded_encoding = null;
    let yielded_input = null;

    const input = '# encoding: two-is-three\n2 + 2';
    const output = LibRubyParser.parse(
        input,
        null,
        (encoding, input) => {
            decoder_called = true;

            yielded_encoding = encoding;
            yielded_input = input;

            throw `JS[Unsupported encoding ${encoding}]`;
        }
    );
    assert.equal(yielded_encoding, 'two-is-three');
    assert.deepEqual(yielded_input, new TextEncoder("utf-8").encode(input));

    assert.equal(output.ast, undefined);
    assert.deepEqual(output.tokens, [
        new LibRubyParser.Token(
            0,
            new LibRubyParser.Bytes(Uint8Array.from([])),
            new LibRubyParser.Loc(0, 1)
        )
    ]);
    assert.deepEqual(output.diagnostics, [
        new LibRubyParser.Diagnostic(
            'error',
            new LibRubyParser.messages.EncodingError('DecodingError("JS[Unsupported encoding two-is-three]")'),
            new LibRubyParser.Loc(12, 24)
        )
    ]);
    assert.deepEqual(output.comments, []);
    assert.deepEqual(output.magic_comments, []);
}

test_ast();
test_tokens();
test_diagnostics();
test_comments();
test_magic_comments();
test_input();
test_decoder_ok();
test_decoder_err();
