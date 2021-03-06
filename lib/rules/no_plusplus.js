// Generated by CoffeeScript 1.6.3
(function() {
  var NoPlusPlus;

  module.exports = NoPlusPlus = (function() {
    function NoPlusPlus() {}

    NoPlusPlus.prototype.rule = {
      name: 'no_plusplus',
      level: 'ignore',
      message: 'The increment and decrement operators are forbidden',
      description: "This rule forbids the increment and decrement arithmetic operators.\nSome people believe the <tt>++</tt> and <tt>--</tt> to be cryptic\nand the cause of bugs due to misunderstandings of their precedence\nrules.\nThis rule is disabled by default."
    };

    NoPlusPlus.prototype.tokens = ["++", "--"];

    NoPlusPlus.prototype.lintToken = function(token, tokenApi) {
      return {
        context: "found '" + token[0] + "'"
      };
    };

    return NoPlusPlus;

  })();

}).call(this);
