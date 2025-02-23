import assert from "assert";
import ftl from "@fluent/dedent";

import {
  FluentParser, FluentSerializer, serializeExpression, serializeVariantKey
} from "../src";


suite("Serialize resource", function() {
  let pretty;

  setup(function() {
    const parser = new FluentParser();
    const serializer = new FluentSerializer({
      withJunk: false
    });

    pretty = function pretty(text) {
      const res = parser.parse(text);
      return serializer.serialize(res);
    }
  });

  test("invalid resource", function() {
    const serializer = new FluentSerializer();
    assert.throws(
      () => serializer.serialize(null),
      /Cannot read property 'type'/
    );
    assert.throws(
      () => serializer.serialize({}),
      /Unknown resource type/
    );
  });

  test("simple message without EOL", function() {
    const input = "foo = Foo";
    assert.equal(pretty(input), "foo = Foo\n");
  });

  test("simple message", function() {
    const input = ftl`
      foo = Foo

      `;
    assert.equal(pretty(input), input);
  });

  test("simple term", function() {
    const input = ftl`
      -foo = Foo

      `;
    assert.equal(pretty(input), input);
  });

  test("two simple messages", function() {
    const input = ftl`
      foo = Foo
      bar = Bar

      `;
    assert.equal(pretty(input), input);
  });

  test("block multiline message", function() {
    const input = ftl`
      foo =
          Foo
          Bar

      `;
    assert.equal(pretty(input), input);
  });

  test("inline multiline message", function() {
    const input = ftl`
      foo = Foo
          Bar

      `;
    const output = ftl`
      foo =
          Foo
          Bar

      `;
    assert.equal(pretty(input), output);
  });

  test("message reference", function() {
    const input = ftl`
      foo = Foo { bar }

      `;
    assert.equal(pretty(input), input);
  });

  test("term reference", function() {
    const input = ftl`
      foo = Foo { -bar }

      `;
    assert.equal(pretty(input), input);
  });

  test("external argument", function() {
    const input = ftl`
      foo = Foo { $bar }

      `;
    assert.equal(pretty(input), input);
  });

  test("number element", function() {
    const input = ftl`
      foo = Foo { 1 }

      `;
    assert.equal(pretty(input), input);
  });

  test("string element", function() {
    const input = ftl`
      foo = Foo { "bar" }

      `;
    assert.equal(pretty(input), input);
  });

  test("attribute expression", function() {
    const input = ftl`
      foo = Foo { bar.baz }

      `;
    assert.equal(pretty(input), input);
  });

  test("resource comment", function() {
    const input = ftl`
      ### A multiline
      ### resource comment.

      foo = Foo

      `;
    assert.equal(pretty(input), input);
  });

  test("message comment", function() {
    const input = ftl`
      # A multiline
      # message comment.
      foo = Foo

      `;
    assert.equal(pretty(input), input);
  });

  test("group comment", function() {
    const input = ftl`
      foo = Foo

      ## Comment Header
      ##
      ## A multiline
      ## group comment.

      bar = Bar

      `;
    assert.equal(pretty(input), input);
  });

  test("standalone comment", function() {
    const input = ftl`
      foo = Foo

      # A Standalone Comment

      bar = Bar

      `;
    assert.equal(pretty(input), input);
  });

  test("multiline with placeable", function() {
    const input = ftl`
      foo =
          Foo { bar }
          Baz

      `;
    assert.equal(pretty(input), input);
  });

  test("attribute", function() {
    const input = ftl`
      foo =
          .attr = Foo Attr

      `;
    assert.equal(pretty(input), input);
  });

  test("multiline attribute", function() {
    const input = ftl`
      foo =
          .attr =
              Foo Attr
              Continued

      `;
    assert.equal(pretty(input), input);
  });

  test("two attributes", function() {
    const input = ftl`
      foo =
          .attr-a = Foo Attr A
          .attr-b = Foo Attr B

      `;
    assert.equal(pretty(input), input);
  });

  test("value and attributes", function() {
    const input = ftl`
      foo = Foo Value
          .attr-a = Foo Attr A
          .attr-b = Foo Attr B

      `;
    assert.equal(pretty(input), input);
  });

  test("multiline value and attributes", function() {
    const input = ftl`
      foo =
          Foo Value
          Continued
          .attr-a = Foo Attr A
          .attr-b = Foo Attr B

      `;
    assert.equal(pretty(input), input);
  });

  test("select expression", function() {
    const input = ftl`
      foo =
          { $sel ->
             *[a] A
              [b] B
          }

      `;
    assert.equal(pretty(input), input);
  });

  test("multiline variant", function() {
    const input = ftl`
      foo =
          { $sel ->
             *[a]
                  AAA
                  BBB
          }

      `;
    assert.equal(pretty(input), input);
  });

  test("multiline variant with first line inline", function() {
    const input = ftl`
      foo =
          { $sel ->
             *[a] AAA
                  BBB
          }

      `;
    const output = ftl`
      foo =
          { $sel ->
             *[a]
                  AAA
                  BBB
          }

      `;
    assert.equal(pretty(input), output);
  });

  test("variant key number", function() {
    const input = ftl`
      foo =
          { $sel ->
             *[1] 1
          }

      `;
    assert.equal(pretty(input), input);
  });

  test("select expression in block value", function() {
    const input = ftl`
      foo =
          Foo { $sel ->
             *[a] A
              [b] B
          }

      `;
    assert.equal(pretty(input), input);
  });

  test("select expression in inline value", function() {
    const input = ftl`
      foo = Foo { $sel ->
             *[a] A
              [b] B
          }

      `;
    const output = ftl`
      foo =
          Foo { $sel ->
             *[a] A
              [b] B
          }

      `;
    assert.equal(pretty(input), output);
  });

  test("select expression in multiline value", function() {
    const input = ftl`
      foo =
          Foo
          Bar { $sel ->
             *[a] A
              [b] B
          }

      `;
    assert.equal(pretty(input), input);
  });

  test("nested select expression", function() {
    const input = ftl`
      foo =
          { $a ->
             *[a]
                  { $b ->
                     *[b] Foo
                  }
          }

      `;
    assert.equal(pretty(input), input);
  });

  test("selector external argument", function() {
    const input = ftl`
      foo =
          { $bar ->
             *[a] A
          }

      `;
    assert.equal(pretty(input), input);
  });

  test("selector number expression", function() {
    const input = ftl`
      foo =
          { 1 ->
             *[a] A
          }

      `;
    assert.equal(pretty(input), input);
  });

  test("selector string expression", function() {
    const input = ftl`
      foo =
          { "bar" ->
             *[a] A
          }

      `;
    assert.equal(pretty(input), input);
  });

  test("selector attribute expression", function() {
    const input = ftl`
      foo =
          { -bar.baz ->
             *[a] A
          }

      `;
    assert.equal(pretty(input), input);
  });

  test("call expression", function() {
    const input = ftl`
      foo = { FOO() }

      `;
    assert.equal(pretty(input), input);
  });

  test("call expression with string expression", function() {
    const input = ftl`
      foo = { FOO("bar") }

      `;
    assert.equal(pretty(input), input);
  });

  test("call expression with number expression", function() {
    const input = ftl`
      foo = { FOO(1) }

      `;
    assert.equal(pretty(input), input);
  });

  test("call expression with message reference", function() {
    const input = ftl`
      foo = { FOO(bar) }

      `;
    assert.equal(pretty(input), input);
  });

  test("call expression with external argument", function() {
    const input = ftl`
      foo = { FOO($bar) }

      `;
    assert.equal(pretty(input), input);
  });

  test("call expression with number named argument", function() {
    const input = ftl`
      foo = { FOO(bar: 1) }

      `;
    assert.equal(pretty(input), input);
  });

  test("call expression with string named argument", function() {
    const input = ftl`
      foo = { FOO(bar: "bar") }

      `;
    assert.equal(pretty(input), input);
  });

  test("call expression with two positional arguments", function() {
    const input = ftl`
      foo = { FOO(bar, baz) }

      `;
    assert.equal(pretty(input), input);
  });

  test("call expression with two named arguments", function() {
    const input = ftl`
      foo = { FOO(bar: "bar", baz: "baz") }

      `;
    assert.equal(pretty(input), input);
  });

  test("call expression with positional and named arguments", function() {
    const input = ftl`
      foo = { FOO(bar, 1, baz: "baz") }

      `;
    assert.equal(pretty(input), input);
  });

  test("macro call", function() {
    const input = ftl`
      foo = { -term() }

      `;
    assert.equal(pretty(input), input);
  });

  test("nested placeables", function() {
    const input = ftl`
      foo = {{ FOO() }}

      `;
    assert.equal(pretty(input), input);
  });

  test("Backslash in TextElement", function() {
    const input = ftl`
      foo = \\{ placeable }

      `;
    assert.equal(pretty(input), input);
  });

  test("Escaped special char in StringLiteral", function() {
    const input = ftl`
      foo = { "Escaped \\" quote" }

      `;
    assert.equal(pretty(input), input);
  });

  test("Unicode escape sequence", function() {
    const input = ftl`
      foo = { "\\u0065" }

      `;
    assert.equal(pretty(input), input);
  });
});

suite("serializeExpression", function() {
  let pretty;

  setup(function() {
    const parser = new FluentParser();

    pretty = function pretty(text) {
      const {value: {elements: [placeable]}} = parser.parseEntry(text);
      return serializeExpression(placeable.expression);
    }
  });

  test("invalid expression", function() {
    assert.throws(
      () => serializeExpression(null),
      /Cannot read property 'type'/
    );
    assert.throws(
      () => serializeExpression({}),
      /Unknown expression type/
    );
  });

  test("string expression", function() {
    const input = ftl`
      foo = { "str" }

      `;
    assert.equal(pretty(input), "\"str\"");
  });

  test("number expression", function() {
    const input = ftl`
      foo = { 3 }

      `;
    assert.equal(pretty(input), "3");
  });

  test("message reference", function() {
    const input = ftl`
      foo = { msg }

      `;
    assert.equal(pretty(input), "msg");
  });

  test("external argument", function() {
    const input = ftl`
      foo = { $ext }

      `;
    assert.equal(pretty(input), "$ext");
  });

  test("attribute expression", function() {
    const input = ftl`
      foo = { msg.attr }

      `;
    assert.equal(pretty(input), "msg.attr");
  });

  test("call expression", function() {
    const input = ftl`
      foo = { BUILTIN(3.14, kwarg: "value") }

      `;
    assert.equal(pretty(input), "BUILTIN(3.14, kwarg: \"value\")");
  });

  test("select expression", function() {
    const input = ftl`
      foo =
          { $num ->
              *[one] One
          }

      `;
    assert.equal(pretty(input), "$num ->\n   *[one] One\n");
  });
});

suite("Serialize padding around comments", function() {
  let pretty;

  setup(function() {
    const parser = new FluentParser();
    const serializer = new FluentSerializer({
      withJunk: false
    });

    pretty = function pretty(text) {
      const res = parser.parse(text);
      return serializer.serialize(res);
    }
  });

  test("standalone comment has not padding when first", function() {
    const input = ftl`
      # Comment A

      foo = Foo

      # Comment B

      bar = Bar

      `;
    assert.equal(pretty(input), input);
    // Run again to make sure the same instance of the serializer doesn't keep
    // state about how many entires is has already serialized.
    assert.equal(pretty(input), input);
  });

  test("group comment has not padding when first", function() {
    const input = ftl`
      ## Group A

      foo = Foo

      ## Group B

      bar = Bar

      `;
    assert.equal(pretty(input), input);
    assert.equal(pretty(input), input);
  });

  test("resource comment has not padding when first", function() {
    const input = ftl`
      ### Resource Comment A

      foo = Foo

      ### Resource Comment B

      bar = Bar

      `;
    assert.equal(pretty(input), input);
    assert.equal(pretty(input), input);
  });
});

suite("serializeVariantKey", function() {
  let prettyVariantKey;

  setup(function() {
    let parser = new FluentParser();

    prettyVariantKey = function(text, index) {
      let pattern = parser.parseEntry(text).value;
      let variants = pattern.elements[0].expression.variants;
      return serializeVariantKey(variants[index].key);
    }
  });

  test("invalid expression", function() {
    assert.throws(
      () => serializeVariantKey(null),
      /Cannot read property 'type'/
    );
    assert.throws(
      () => serializeVariantKey({}),
      /Unknown variant key type/
    );
  });

  test("identifiers", function() {
    const input = ftl`
      foo = { $num ->
          [one] One
         *[other] Other
      }

      `;
    assert.equal(prettyVariantKey(input, 0), "one");
    assert.equal(prettyVariantKey(input, 1), "other");
  });

  test("number literals", function() {
    const input = ftl`
      foo = { $num ->
          [-123456789] Minus a lot
          [0] Zero
         *[3.14] Pi
          [007] James
      }

      `;
    assert.equal(prettyVariantKey(input, 0), "-123456789");
    assert.equal(prettyVariantKey(input, 1), "0");
    assert.equal(prettyVariantKey(input, 2), "3.14");
    assert.equal(prettyVariantKey(input, 3), "007");
  });
});
