// Generated by CoffeeScript 1.6.3
(function() {
  var NoTabs;

  module.exports = NoTabs = (function() {
    function NoTabs() {}

    NoTabs.prototype.rule = {
      name: 'cyclomatic_complexity',
      value: 10,
      level: 'ignore',
      message: 'The cyclomatic complexity is too damn high',
      description: 'Examine the complexity of your application.'
    };

    NoTabs.prototype.getComplexity = function(node) {
      var complexity, name, _ref;
      name = node.constructor.name;
      complexity = name === 'If' || name === 'While' || name === 'For' || name === 'Try' ? 1 : name === 'Op' && ((_ref = node.operator) === '&&' || _ref === '||') ? 1 : name === 'Switch' ? node.cases.length : 0;
      return complexity;
    };

    NoTabs.prototype.lintAST = function(node, astApi) {
      this.astApi = astApi;
      this.lintNode(node);
      return void 0;
    };

    NoTabs.prototype.lintNode = function(node, line) {
      var complexity, error, name, rule,
        _this = this;
      name = node.constructor.name;
      complexity = this.getComplexity(node);
      node.eachChild(function(childNode) {
        var nodeLine;
        nodeLine = childNode.locationData.first_line;
        if (childNode) {
          return complexity += _this.lintNode(childNode, nodeLine);
        }
      });
      rule = this.astApi.config[this.rule.name];
      if (name === 'Code' && complexity >= rule.value) {
        error = this.astApi.createError({
          context: complexity + 1,
          lineNumber: line + 1,
          lineNumberEnd: node.locationData.last_line + 1
        });
        if (error) {
          this.errors.push(error);
        }
      }
      return complexity;
    };

    return NoTabs;

  })();

}).call(this);
