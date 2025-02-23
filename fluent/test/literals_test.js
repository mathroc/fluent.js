"use strict";
import assert from "assert";
import ftl from "@fluent/dedent";

import FluentBundle from "../src/bundle";

suite('Literals as selectors', function() {
  let bundle, errs;

  setup(function() {
    bundle = new FluentBundle('en-US', {useIsolating: false});
    errs = [];
  });

  test('a matching string literal selector', function() {
    bundle.addMessages(ftl`
      foo = { "a" ->
          [a] A
         *[b] B
      }
      `);
    const msg = bundle.getMessage('foo');
    const val = bundle.format(msg, null, errs);
    assert.equal(val, 'A');
    assert.equal(errs.length, 0);
  });

  test('a non-matching string literal selector', function() {
    bundle.addMessages(ftl`
      foo = { "c" ->
          [a] A
         *[b] B
      }
      `);
    const msg = bundle.getMessage('foo');
    const val = bundle.format(msg, null, errs);
    assert.equal(val, 'B');
    assert.equal(errs.length, 0);
  });

  test('a matching number literal selector', function() {
    bundle.addMessages(ftl`
      foo = { 0 ->
          [0] A
         *[1] B
      }
      `);
    const msg = bundle.getMessage('foo');
    const val = bundle.format(msg, null, errs);
    assert.equal(val, 'A');
    assert.equal(errs.length, 0);
  });

  test('a non-matching number literal selector', function() {
    bundle.addMessages(ftl`
      foo = { 2 ->
          [0] A
         *[1] B
      }
      `);
    const msg = bundle.getMessage('foo');
    const val = bundle.format(msg, null, errs);
    assert.equal(val, 'B');
    assert.equal(errs.length, 0);
  });

  test('a number literal selector matching a plural category', function() {
    bundle.addMessages(ftl`
      foo = { 1 ->
          [one] A
         *[other] B
      }
      `);
    const msg = bundle.getMessage('foo');
    const val = bundle.format(msg, null, errs);
    assert.equal(val, 'A');
    assert.equal(errs.length, 0);
  });
});
