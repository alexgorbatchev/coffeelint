// Generated by CoffeeScript 1.6.3
/*
CoffeeLint

Copyright (c) 2011 Matthew Perpick.
CoffeeLint is freely distributable under the MIT license.
*/


(function() {
  var CSVReporter, CheckstyleReporter, CoffeeScript, ErrorReport, JSLintReporter, Reporter, coffeelint, config, configfinder, data, errorReport, findCoffeeScripts, fs, getFallbackConfig, glob, lintFiles, lintSource, loadRules, optimist, options, path, paths, read, reportAndExit, scripts, stdin, thisdir, _ref, _ref1, _ref2,
    __slice = [].slice,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  path = require("path");

  fs = require("fs");

  glob = require("glob");

  optimist = require("optimist");

  thisdir = path.dirname(fs.realpathSync(__filename));

  coffeelint = require(path.join(thisdir, "coffeelint"));

  configfinder = require(path.join(thisdir, "configfinder"));

  CoffeeScript = require('coffee-script');

  read = function(path) {
    var realPath;
    realPath = fs.realpathSync(path);
    return fs.readFileSync(realPath).toString();
  };

  findCoffeeScripts = function(paths) {
    var files, p, _i, _len;
    files = [];
    for (_i = 0, _len = paths.length; _i < _len; _i++) {
      p = paths[_i];
      if (fs.statSync(p).isDirectory()) {
        files = files.concat(glob.sync("" + p + "/**/*.coffee"));
      } else {
        files.push(p);
      }
    }
    return files;
  };

  ErrorReport = (function() {
    function ErrorReport() {
      this.paths = {};
    }

    ErrorReport.prototype.getExitCode = function() {
      for (path in this.paths) {
        if (this.pathHasError(path)) {
          return 1;
        }
      }
      return 0;
    };

    ErrorReport.prototype.getSummary = function() {
      var error, errorCount, errors, pathCount, warningCount, _i, _len, _ref;
      pathCount = errorCount = warningCount = 0;
      _ref = this.paths;
      for (path in _ref) {
        errors = _ref[path];
        pathCount++;
        for (_i = 0, _len = errors.length; _i < _len; _i++) {
          error = errors[_i];
          if (error.level === 'error') {
            errorCount++;
          }
          if (error.level === 'warn') {
            warningCount++;
          }
        }
      }
      return {
        errorCount: errorCount,
        warningCount: warningCount,
        pathCount: pathCount
      };
    };

    ErrorReport.prototype.getErrors = function(path) {
      return this.paths[path];
    };

    ErrorReport.prototype.pathHasWarning = function(path) {
      return this._hasLevel(path, 'warn');
    };

    ErrorReport.prototype.pathHasError = function(path) {
      return this._hasLevel(path, 'error');
    };

    ErrorReport.prototype.hasError = function() {
      for (path in this.paths) {
        if (this.pathHasError(path)) {
          return true;
        }
      }
      return false;
    };

    ErrorReport.prototype._hasLevel = function(path, level) {
      var error, _i, _len, _ref;
      _ref = this.paths[path];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        error = _ref[_i];
        if (error.level === level) {
          return true;
        }
      }
      return false;
    };

    return ErrorReport;

  })();

  Reporter = (function() {
    function Reporter(errorReport, colorize) {
      if (colorize == null) {
        colorize = true;
      }
      this.errorReport = errorReport;
      this.colorize = colorize && process.stdout.isTTY;
      this.ok = '✓';
      this.warn = '⚡';
      this.err = '✗';
    }

    Reporter.prototype.stylize = function() {
      var map, message, styles;
      message = arguments[0], styles = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      if (!this.colorize) {
        return message;
      }
      map = {
        bold: [1, 22],
        yellow: [33, 39],
        green: [32, 39],
        red: [31, 39]
      };
      return styles.reduce(function(m, s) {
        return "\u001b[" + map[s][0] + "m" + m + "\u001b[" + map[s][1] + "m";
      }, message);
    };

    Reporter.prototype.publish = function() {
      var errors, paths, report;
      paths = this.errorReport.paths;
      report = "";
      for (path in paths) {
        errors = paths[path];
        report += this.reportPath(path, errors);
      }
      report += this.reportSummary(this.errorReport.getSummary());
      report += "";
      if (!options.argv.q || this.errorReport.hasError()) {
        this.print(report);
      }
      return this;
    };

    Reporter.prototype.reportSummary = function(s) {
      var e, err, file, msg, p, start, w, warn;
      start = s.errorCount > 0 ? "" + this.err + " " + (this.stylize("Lint!", 'red', 'bold')) : s.warningCount > 0 ? "" + this.warn + " " + (this.stylize("Warning!", 'yellow', 'bold')) : "" + this.ok + " " + (this.stylize("Ok!", 'green', 'bold'));
      e = s.errorCount;
      w = s.warningCount;
      p = s.pathCount;
      err = this.plural('error', e);
      warn = this.plural('warning', w);
      file = this.plural('file', p);
      msg = "" + start + " » " + e + " " + err + " and " + w + " " + warn + " in " + p + " " + file;
      return "\n" + this.stylize(msg) + "\n";
    };

    Reporter.prototype.reportPath = function(path, errors) {
      var color, e, hasError, hasWarning, lineEnd, o, output, overall, pathReport, _i, _len, _ref;
      _ref = (hasError = this.errorReport.pathHasError(path)) ? [this.err, 'red'] : (hasWarning = this.errorReport.pathHasWarning(path)) ? [this.warn, 'yellow'] : [this.ok, 'green'], overall = _ref[0], color = _ref[1];
      pathReport = "";
      if (!options.argv.q || hasError) {
        pathReport += "  " + overall + " " + (this.stylize(path, color, 'bold')) + "\n";
      }
      for (_i = 0, _len = errors.length; _i < _len; _i++) {
        e = errors[_i];
        if (options.argv.q && e.level !== 'error') {
          continue;
        }
        o = e.level === 'error' ? this.err : this.warn;
        lineEnd = "";
        if (e.lineNumberEnd != null) {
          lineEnd = "-" + e.lineNumberEnd;
        }
        output = "#" + e.lineNumber + lineEnd;
        pathReport += "     " + ("" + o + " " + (this.stylize(output, color)) + ": " + e.message + ".");
        if (e.context) {
          pathReport += " " + e.context + ".";
        }
        pathReport += "\n";
      }
      return pathReport;
    };

    Reporter.prototype.print = function(message) {
      return console.log(message);
    };

    Reporter.prototype.plural = function(str, count) {
      if (count === 1) {
        return str;
      } else {
        return "" + str + "s";
      }
    };

    return Reporter;

  })();

  CSVReporter = (function(_super) {
    __extends(CSVReporter, _super);

    function CSVReporter() {
      _ref = CSVReporter.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    CSVReporter.prototype.publish = function() {
      var e, errors, f, header, _ref1, _results;
      header = ["path", "lineNumber", "lineNumberEnd", "level", "message"];
      this.print(header.join(","));
      _ref1 = this.errorReport.paths;
      _results = [];
      for (path in _ref1) {
        errors = _ref1[path];
        _results.push((function() {
          var _i, _len, _ref2, _results1;
          _results1 = [];
          for (_i = 0, _len = errors.length; _i < _len; _i++) {
            e = errors[_i];
            if (e.context) {
              e.message += " " + e.context + ".";
            }
            f = [path, e.lineNumber, (_ref2 = e.lineNumberEnd) != null ? _ref2 : e.lineNumberEnd, e.level, e.message];
            _results1.push(this.print(f.join(",")));
          }
          return _results1;
        }).call(this));
      }
      return _results;
    };

    return CSVReporter;

  })(Reporter);

  JSLintReporter = (function(_super) {
    __extends(JSLintReporter, _super);

    function JSLintReporter() {
      _ref1 = JSLintReporter.__super__.constructor.apply(this, arguments);
      return _ref1;
    }

    JSLintReporter.prototype.publish = function() {
      var e, errors, _i, _len, _ref2, _ref3;
      this.print("<?xml version=\"1.0\" encoding=\"utf-8\"?><jslint>");
      _ref2 = this.errorReport.paths;
      for (path in _ref2) {
        errors = _ref2[path];
        if (errors.length) {
          this.print("<file name=\"" + path + "\">");
          for (_i = 0, _len = errors.length; _i < _len; _i++) {
            e = errors[_i];
            this.print("<issue line=\"" + e.lineNumber + "\"\n        lineEnd=\"" + ((_ref3 = e.lineNumberEnd) != null ? _ref3 : e.lineNumber) + "\"\n        reason=\"[" + (this.escape(e.level)) + "] " + (this.escape(e.message)) + "\"\n        evidence=\"" + (this.escape(e.context)) + "\"/>");
          }
          this.print("</file>");
        }
      }
      return this.print("</jslint>");
    };

    JSLintReporter.prototype.escape = function(msg) {
      var r, replacements, _i, _len;
      msg = "" + msg;
      if (!msg) {
        return;
      }
      replacements = [[/&/g, "&amp;"], [/"/g, "&quot;"], [/</g, "&lt;"], [/>/g, "&gt;"], [/'/g, "&apos;"]];
      for (_i = 0, _len = replacements.length; _i < _len; _i++) {
        r = replacements[_i];
        msg = msg.replace(r[0], r[1]);
      }
      return msg;
    };

    return JSLintReporter;

  })(Reporter);

  CheckstyleReporter = (function(_super) {
    __extends(CheckstyleReporter, _super);

    function CheckstyleReporter() {
      _ref2 = CheckstyleReporter.__super__.constructor.apply(this, arguments);
      return _ref2;
    }

    CheckstyleReporter.prototype.publish = function() {
      var context, e, errors, level, _i, _len, _ref3, _ref4;
      this.print("<?xml version=\"1.0\" encoding=\"utf-8\"?>");
      this.print("<checkstyle version=\"4.3\">");
      _ref3 = this.errorReport.paths;
      for (path in _ref3) {
        errors = _ref3[path];
        if (errors.length) {
          this.print("<file name=\"" + path + "\">");
          for (_i = 0, _len = errors.length; _i < _len; _i++) {
            e = errors[_i];
            level = e.level;
            if (level === 'warn') {
              level = 'warning';
            }
            context = (_ref4 = e.context) != null ? _ref4 : "";
            this.print("<error line=\"" + e.lineNumber + "\"\n    severity=\"" + (this.escape(level)) + "\"\n    message=\"" + (this.escape(e.message + '; context: ' + context)) + "\"\n    source=\"coffeelint\"/>");
          }
          this.print("</file>");
        }
      }
      return this.print("</checkstyle>");
    };

    return CheckstyleReporter;

  })(JSLintReporter);

  lintFiles = function(files, config) {
    var data, errorReport, file, fileConfig, literate, ruleName, source, _i, _len;
    errorReport = new ErrorReport();
    for (_i = 0, _len = files.length; _i < _len; _i++) {
      file = files[_i];
      source = read(file);
      literate = CoffeeScript.helpers.isLiterate(file);
      fileConfig = config ? config : getFallbackConfig(file);
      for (ruleName in fileConfig) {
        data = fileConfig[ruleName];
        if (data.module != null) {
          loadRules(data.module, ruleName);
        }
      }
      errorReport.paths[file] = coffeelint.lint(source, fileConfig, literate);
    }
    return errorReport;
  };

  lintSource = function(source, config, literate) {
    var data, errorReport, ruleName;
    if (literate == null) {
      literate = false;
    }
    errorReport = new ErrorReport();
    config || (config = getFallbackConfig());
    for (ruleName in config) {
      data = config[ruleName];
      if (data.module != null) {
        loadRules(data.module, ruleName);
      }
    }
    errorReport.paths["stdin"] = coffeelint.lint(source, config, literate);
    return errorReport;
  };

  getFallbackConfig = function(filename) {
    if (filename == null) {
      filename = null;
    }
    if (!options.argv.noconfig) {
      return configfinder.getConfig(filename);
    }
  };

  loadRules = function(moduleName, ruleName) {
    var e, rule, ruleModule, _i, _len, _results;
    if (ruleName == null) {
      ruleName = void 0;
    }
    try {
      try {
        ruleModule = require(moduleName);
      } catch (_error) {
        e = _error;
        ruleModule = require(path.resolve(process.cwd(), moduleName));
      }
      if (typeof ruleModule === 'function') {
        return coffeelint.registerRule(ruleModule, ruleName);
      } else {
        _results = [];
        for (_i = 0, _len = ruleModule.length; _i < _len; _i++) {
          rule = ruleModule[_i];
          _results.push(coffeelint.registerRule(rule));
        }
        return _results;
      }
    } catch (_error) {
      e = _error;
      console.error("Error loading " + moduleName);
      throw e;
    }
  };

  reportAndExit = function(errorReport, options) {
    var colorize, reporter;
    reporter = options.argv.jslint ? new JSLintReporter(errorReport) : options.argv.csv ? new CSVReporter(errorReport) : options.argv.checkstyle ? new CheckstyleReporter(errorReport) : (colorize = !options.argv.nocolor, new Reporter(errorReport, colorize));
    reporter.publish();
    return process.on('exit', function() {
      return process.exit(errorReport.getExitCode());
    });
  };

  options = optimist.usage("Usage: coffeelint [options] source [...]").alias("f", "file").alias("h", "help").alias("v", "version").alias("s", "stdin").alias("q", "quiet").describe("f", "Specify a custom configuration file.").describe("rules", "Specify a custom rule or directory of rules.").describe("makeconfig", "Prints a default config file").describe("noconfig", "Ignores the environment variable COFFEELINT_CONFIG.").describe("h", "Print help information.").describe("v", "Print current version number.").describe("r", "(not used, but left for backward compatibility)").describe("csv", "Use the csv reporter.").describe("jslint", "Use the JSLint XML reporter.").describe("checkstyle", "Use the checkstyle XML reporter.").describe("nocolor", "Don't colorize the output").describe("s", "Lint the source from stdin").describe("q", "Only print errors.").describe("literate", "Used with --stdin to process as Literate CoffeeScript").boolean("csv").boolean("jslint").boolean("checkstyle").boolean("nocolor").boolean("noconfig").boolean("makeconfig").boolean("literate").boolean("r").boolean("s").boolean("q", "Print errors only.");

  if (options.argv.v) {
    console.log(coffeelint.VERSION);
    process.exit(0);
  } else if (options.argv.h) {
    options.showHelp();
    process.exit(0);
  } else if (options.argv.makeconfig) {
    console.log(JSON.stringify(coffeelint.RULES, (function(k, v) {
      if (k !== 'message' && k !== 'description') {
        return v;
      }
    }), 4));
  } else if (options.argv._.length < 1 && !options.argv.s) {
    options.showHelp();
    process.exit(1);
  } else {
    config = null;
    if (!options.argv.noconfig) {
      if (options.argv.f) {
        config = JSON.parse(read(options.argv.f));
      } else if (process.env.COFFEELINT_CONFIG && fs.existsSync(process.env.COFFEELINT_CONFIG)) {
        config = JSON.parse(read(process.env.COFFEELINT_CONFIG));
      }
    }
    if (options.argv.rules) {
      loadRules(options.argv.rules);
    }
    if (options.argv.s) {
      data = '';
      stdin = process.openStdin();
      stdin.on('data', function(buffer) {
        if (buffer) {
          return data += buffer.toString();
        }
      });
      stdin.on('end', function() {
        var errorReport;
        errorReport = lintSource(data, config, options.argv.literate);
        return reportAndExit(errorReport, options);
      });
    } else {
      paths = options.argv._;
      scripts = findCoffeeScripts(paths);
      errorReport = lintFiles(scripts, config, options.argv.literate);
      reportAndExit(errorReport, options);
    }
  }

}).call(this);
