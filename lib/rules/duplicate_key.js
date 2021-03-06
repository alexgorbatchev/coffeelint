// Generated by CoffeeScript 1.6.3
(function() {
  var DuplicateKey;

  module.exports = DuplicateKey = (function() {
    DuplicateKey.prototype.rule = {
      name: 'duplicate_key',
      level: 'error',
      message: 'Duplicate key defined in object or class',
      description: "Prevents defining duplicate keys in object literals and classes"
    };

    DuplicateKey.prototype.tokens = ['IDENTIFIER', "{", "}"];

    function DuplicateKey() {
      this.braceScopes = [];
    }

    DuplicateKey.prototype.lintToken = function(_arg, tokenApi) {
      var type;
      type = _arg[0];
      if (type === "{" || type === "}") {
        this.lintBrace.apply(this, arguments);
        return void 0;
      }
      if (type === "IDENTIFIER") {
        return this.lintIdentifier.apply(this, arguments);
      }
    };

    DuplicateKey.prototype.lintIdentifier = function(token, tokenApi) {
      var key, nextToken, previousToken;
      key = token[1];
      if (this.currentScope == null) {
        return null;
      }
      nextToken = tokenApi.peek(1);
      if (nextToken[1] !== ':') {
        return null;
      }
      previousToken = tokenApi.peek(-1);
      if (previousToken[0] === '@') {
        key = "@" + key;
      }
      key = "identifier-" + key;
      if (this.currentScope[key]) {
        return true;
      } else {
        this.currentScope[key] = token;
        return null;
      }
    };

    DuplicateKey.prototype.lintBrace = function(token) {
      if (token[0] === '{') {
        if (this.currentScope != null) {
          this.braceScopes.push(this.currentScope);
        }
        this.currentScope = {};
      } else {
        this.currentScope = this.braceScopes.pop();
      }
      return null;
    };

    return DuplicateKey;

  })();

}).call(this);
