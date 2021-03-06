// Generated by CoffeeScript 1.6.3
(function() {
  var CamelCaseClasses, regexes;

  regexes = {
    camelCase: /^[A-Z][a-zA-Z\d]*$/
  };

  module.exports = CamelCaseClasses = (function() {
    function CamelCaseClasses() {}

    CamelCaseClasses.prototype.rule = {
      name: 'camel_case_classes',
      level: 'error',
      message: 'Class names should be camel cased',
      description: "This rule mandates that all class names are CamelCased. Camel\ncasing class names is a generally accepted way of distinguishing\nconstructor functions - which require the 'new' prefix to behave\nproperly - from plain old functions.\n<pre>\n<code># Good!\nclass BoaConstrictor\n\n# Bad!\nclass boaConstrictor\n</code>\n</pre>\nThis rule is enabled by default."
    };

    CamelCaseClasses.prototype.tokens = ['CLASS'];

    CamelCaseClasses.prototype.lintToken = function(token, tokenApi) {
      var className, offset, _ref, _ref1, _ref2;
      if ((token.newLine != null) || ((_ref = tokenApi.peek()[0]) === 'INDENT' || _ref === 'EXTENDS')) {
        return null;
      }
      className = null;
      offset = 1;
      while (!className) {
        if (((_ref1 = tokenApi.peek(offset + 1)) != null ? _ref1[0] : void 0) === '.') {
          offset += 2;
        } else if (((_ref2 = tokenApi.peek(offset)) != null ? _ref2[0] : void 0) === '@') {
          offset += 1;
        } else {
          className = tokenApi.peek(offset)[1];
        }
      }
      if (!regexes.camelCase.test(className)) {
        return {
          context: "class name: " + className
        };
      }
    };

    return CamelCaseClasses;

  })();

}).call(this);
