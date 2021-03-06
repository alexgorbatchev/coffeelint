// Generated by CoffeeScript 1.6.3
(function() {
  var ASTApi, ASTLinter, BaseLinter,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  BaseLinter = require('./base_linter.coffee');

  ASTApi = (function() {
    function ASTApi(config) {
      this.config = config;
    }

    return ASTApi;

  })();

  module.exports = ASTLinter = (function(_super) {
    __extends(ASTLinter, _super);

    function ASTLinter(source, config, rules, CoffeeScript) {
      this.CoffeeScript = CoffeeScript;
      ASTLinter.__super__.constructor.call(this, source, config, rules);
      this.astApi = new ASTApi(this.config);
    }

    ASTLinter.prototype.acceptRule = function(rule) {
      return typeof rule.lintAST === 'function';
    };

    ASTLinter.prototype.lint = function() {
      var coffeeError, err, errors, rule, v, _i, _len, _ref,
        _this = this;
      errors = [];
      try {
        this.node = this.CoffeeScript.nodes(this.source);
      } catch (_error) {
        coffeeError = _error;
        err = this._parseCoffeeScriptError(coffeeError);
        if (err != null) {
          errors.push(err);
        }
        return errors;
      }
      _ref = this.rules;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        rule = _ref[_i];
        this.astApi.createError = function(attrs) {
          if (attrs == null) {
            attrs = {};
          }
          return _this.createError(rule.rule.name, attrs);
        };
        rule.errors = errors;
        v = this.normalizeResult(rule, rule.lintAST(this.node, this.astApi));
        if (v != null) {
          return v;
        }
      }
      return errors;
    };

    ASTLinter.prototype._parseCoffeeScriptError = function(coffeeError) {
      var attrs, lineNumber, match, message, rule;
      rule = this.config['coffeescript_error'];
      message = coffeeError.toString();
      lineNumber = -1;
      if (coffeeError.location != null) {
        lineNumber = coffeeError.location.first_line + 1;
      } else {
        match = /line (\d+)/.exec(message);
        if ((match != null ? match.length : void 0) > 1) {
          lineNumber = parseInt(match[1], 10);
        }
      }
      attrs = {
        message: message,
        level: rule.level,
        lineNumber: lineNumber
      };
      return this.createError('coffeescript_error', attrs);
    };

    return ASTLinter;

  })(BaseLinter);

}).call(this);
