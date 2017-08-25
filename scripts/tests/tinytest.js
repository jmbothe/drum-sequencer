/**
 * Very simple in-browser unit-test library, with zero deps.
 *
 * Background turns green if all tests pass, otherwise red.
 * View the JavaScript console to see failure reasons.
 *
 * Example:
 *
 *   adder.js (code under test)
 *
 *     function add(a, b) {
 *       return a + b;
 *     }
 *
 *   adder-test.html (tests - just open a browser to see results)
 *
 *     <script src="tinytest.js"></script>
 *     <script src="adder.js"></script>
 *     <script>
 *
 *     tests({
 *
 *       'adds numbers': function() {
 *         eq(6, add(2, 4));
 *         eq(6.6, add(2.6, 4));
 *       },
 *
 *       'subtracts numbers': function() {
 *         eq(-2, add(2, -4));
 *       },
 *
 *     });
 *     </script>
 *
 * That's it. Stop using over complicated frameworks that get in your way.
 *
 * -Joe Walnes
 * MIT License. See https://github.com/joewalnes/jstinytest/
 */

const helper = {
  pluralize: function pluralize(string, count) {
    if (count === 1) {
      return string;
    } else if (string[string.length - 1] === 's') {
      return `${string}es`;
    }
    return `${string}s`;
  },
  renderStats: function renderStats(tests, failures) {
    const numTests = Object.keys(tests).length;
    const numSuccesses = numTests - failures;
    const summaryString = `Ran ${numTests} ${this.pluralize('test', numTests)}: ${numSuccesses} ${this.pluralize('success', numSuccesses)}, ${failures} ${this.pluralize('failure', failures)}`;
    const summaryHeader = document.createElement('h1');
    summaryHeader.textContent = summaryString;
    document.body.appendChild(summaryHeader);
  },
};

const TinyTest = {

  run: function run(tests) {
    let failures = 0;
    Object.keys(tests).forEach(function iterate(item) {
      const testAction = tests[item];
      try {
        testAction.apply(this);
        console.log(`%c${item}`, 'color: green');
      } catch (e) {
        failures += 1;
        console.groupCollapsed(`%c${item}`, 'color: red');
        console.error(e.stack);
        console.groupEnd();
      }
    });
    setTimeout(() => {
      // Give document a chance to complete
      if (window.document && document.body) {
        helper.renderStats(tests, failures);
        document.body.style.backgroundColor = (failures === 0 ? '#99ff99' : '#ff9999');
      }
    }, 0);
  },

  fail: function fail(msg) {
    throw new Error(`fail(): ${msg}`);
  },

  assert: function assert(value, msg) {
    if (!value) {
      throw new Error(`assert(): ${msg}`);
    }
  },

  assertEquals: function assertEquals(expected, actual) {
    if (expected != actual) {
      throw new Error(`assertEquals() ${expected} != ${actual}`);
    }
  },

  assertStrictEquals: function assertStrictEquals(expected, actual) {
    if (expected !== actual) {
      throw new Error(`assertStrictEquals() ${expected} !== ${actual}`);
    }
  },

};

const fail = TinyTest.fail.bind(TinyTest);
const assert = TinyTest.assert.bind(TinyTest);
const assertEquals = TinyTest.assertEquals.bind(TinyTest);
const eq = TinyTest.assertEquals.bind(TinyTest); // alias for assertEquals
const assertStrictEquals = TinyTest.assertStrictEquals.bind(TinyTest);
const tests = TinyTest.run.bind(TinyTest);
