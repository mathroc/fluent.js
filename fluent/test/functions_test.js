'use strict';

import assert from 'assert';
import ftl from "@fluent/dedent";

import FluentBundle from '../src/bundle';

suite('Functions', function() {
  let bundle, args, errs;

  setup(function() {
    errs = [];
  });

  suite('missing', function(){
    suiteSetup(function() {
      bundle = new FluentBundle('en-US', { useIsolating: false });
      bundle.addMessages(ftl`
        foo = { MISSING("Foo") }
        `);
    });

    test('falls back to the name of the function', function() {
      const msg = bundle.getMessage('foo');
      const val = bundle.format(msg, args, errs);
      assert.equal(val, '{MISSING()}');
      assert.equal(errs.length, 1);
      assert(errs[0] instanceof ReferenceError); // unknown function
    });
  });

  suite('arguments', function(){
    suiteSetup(function() {
      bundle = new FluentBundle('en-US', {
        useIsolating: false,
        functions: {
          IDENTITY: args => args[0]
        }
      });
      bundle.addMessages(ftl`
        foo = Foo
            .attr = Attribute
        pass-nothing       = { IDENTITY() }
        pass-string        = { IDENTITY("a") }
        pass-number        = { IDENTITY(1) }
        pass-message       = { IDENTITY(foo) }
        pass-attr          = { IDENTITY(foo.attr) }
        pass-variable      = { IDENTITY($var) }
        pass-function-call = { IDENTITY(IDENTITY(1)) }
        `);
    });

    // XXX Gracefully handle wrong argument types passed into FTL Functions
    // https://bugzil.la/1307124
    test.skip('falls back when arguments don\'t match the arity', function() {
      const msg = bundle.getMessage('pass-nothing');
      const val = bundle.format(msg, args, errs);
      assert.equal(val, 'IDENTITY()');
      assert.equal(errs.length, 1);
      assert(errs[0] instanceof RangeError); // wrong argument type
    });

    test('accepts strings', function() {
      const msg = bundle.getMessage('pass-string');
      const val = bundle.format(msg, args, errs);
      assert.equal(val, 'a');
      assert.equal(errs.length, 0);
    });

    test('accepts numbers', function() {
      const msg = bundle.getMessage('pass-number');
      const val = bundle.format(msg, args, errs);
      assert.equal(val, '1');
      assert.equal(errs.length, 0);
    });

    test('accepts entities', function() {
      const msg = bundle.getMessage('pass-message');
      const val = bundle.format(msg, args, errs);
      assert.equal(val, 'Foo');
      assert.equal(errs.length, 0);
    });

    // XXX Accept complex types (e.g. attributes) as arguments to FTL Functions
    // https://bugzil.la/1307120
    test.skip('accepts attributes', function() {
      const msg = bundle.getMessage('pass-attr');
      const val = bundle.format(msg, args, errs);
      assert.equal(val, 'Attribute');
      assert.equal(errs.length, 0);
    });

    test('accepts variables', function() {
      const msg = bundle.getMessage('pass-variable');
      const val = bundle.format(msg, { var: "Variable" }, errs);
      assert.equal(val, 'Variable');
      assert.equal(errs.length, 0);
    });

    test('accepts function calls', function() {
      const msg = bundle.getMessage('pass-function-call');
      const val = bundle.format(msg, args, errs);
      assert.equal(val, '1');
      assert.equal(errs.length, 0);
    });
  });
});
