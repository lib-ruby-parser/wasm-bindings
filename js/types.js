class Loc {
    constructor(begin, end) {
        this.begin = begin;
        this.end = end;
    }
}

class Bytes {
    constructor(raw) {
        this.raw = raw;
    }
}

class Token {
    constructor(token_type, token_value, loc) {
        this.token_type = token_type;
        this.token_value = token_value;
        this.loc = loc;
    }
}

class Diagnostic {
    constructor(level, message, loc) {
        this.level = level;
        this.message = message;
        this.loc = loc;
    }
}

class Comment {
    constructor(location, kind) {
        this.location = location;
        this.kind = kind;
    }
}

class MagicComment {
    constructor(kind, key_l, value_l) {
        this.kind = kind;
        this.key_l = key_l;
        this.value_l = value_l;
    }
}

class DecodedInput {
    constructor(name, lines, bytes) {
        this.name = name;
        this.lines = lines;
        this.bytes = bytes;
    }
}

class SourceLine {
    constructor(start, end, ends_with_eof) {
        this.start = start;
        this.end = end;
        this.ends_with_eof = ends_with_eof;
    }
}

class ParserResult {
    constructor(
        ast,
        tokens,
        diagnostics,
        comments,
        magic_comments,
        input,
    ) {
        this.ast = ast;
        this.tokens = tokens;
        this.diagnostics = diagnostics;
        this.comments = comments;
        this.magic_comments = magic_comments;
        this.input = input;
    }
}

root.Loc = Loc;
root.Bytes = Bytes;
root.Token = Token;
root.Diagnostic = Diagnostic;
root.Comment = Comment;
root.MagicComment = MagicComment;
root.DecodedInput = DecodedInput;
root.SourceLine = SourceLine;
root.ParserResult = ParserResult;
