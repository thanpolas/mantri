/**
 * @fileoverview cli help screen.
 */

'use strict';

var grunt = require('grunt');
var mantri = require('../');

// Nodejs libs.
var path = require('path');

// Set column widths.
var col1len = 0;
exports.initCol1 = function(str) {
  col1len = Math.max(col1len, str.length);
};
exports.initWidths = function() {
  // Widths for options/tasks table output.
  exports.widths = [1, col1len, 2, 76 - col1len];
};

// Render an array in table form.
exports.table = function(arr) {
  arr.forEach(function(item) {
    grunt.log.writetableln(exports.widths, ['', grunt.util._.pad(item[0], col1len), '', item[1]]);
  });
};

// First methods
var headerQueue = [
  'initOptions',
  'initTasks',
  'initWidths',
  'header'
];

var footerQueue = [
  'footer'
];


// Methods to run, in-order for main help display.
exports.queue = headerQueue.concat([
  'usage',
  'options',
  'commands',
], footerQueue);

var initQueue = headerQueue.concat([
  'usageInit',
  'options',
], footerQueue);
var depsQueue = headerQueue.concat([
  'usageDeps',
  'options'
], footerQueue);
var buildQueue = headerQueue.concat([
  'usageBuild',
  'options'
], footerQueue);

// Actually display stuff.
exports.display = function(optTask) {
  var queue;
  switch(optTask) {
    case 'init':
      queue = initQueue;
    break;
    case 'deps':
      queue = depsQueue;
    break;
    case 'build':
      queue = buildQueue;
    break;
    default:
      queue = exports.queue;
    break;
  }

  queue.forEach(function(name) { exports[name](); });
};


// Header.
exports.header = function() {
  grunt.log.writeln('mantri: Javacript Dependency System');
};

// Usage info.
exports.usage = function() {
  grunt.log.header('Usage');
  grunt.log.writeln(' ' + path.basename(process.argv[1]) + ' [command] [options]');
};

// Options.
exports.initOptions = function( optOptlist ) {
  var optlist = optOptlist || mantri.cli.optlist;

  // Build 2-column array for table view.
  exports._options = Object.keys( optlist ).map(function(long) {
    var o = optlist[long];
    var col1 = '--' + (o.negate ? 'no-' : '') + long + (o.short ? ', -' + o.short : '');
    exports.initCol1(col1);
    return [col1, o.info];
  });
};

exports.options = function() {
  grunt.log.header('Options');
  exports.table(exports._options);

};

// Tasks.
exports.initTasks = function() {
  // Initialize task system so that the tasks can be listed.
  grunt.task.init([], {help: true});

  // Build object of tasks by info (where they were loaded from).
  exports._tasks = [];
  Object.keys(grunt.task._tasks).forEach(function(name) {
    exports.initCol1(name);
    var task = grunt.task._tasks[name];
    exports._tasks.push(task);
  });
};

exports.commands = function() {
  grunt.log.header('Available Commands');

  exports.table([
    ['init', 'Copy the mantri.web.js and mantriConf.json files to the folder' +
      ' you define. If no folder is defined the files will be copied to' +
      ' your current working directory.'],
    ['deps', 'The deps command generates the dependency file "deps.js".' +
      ' This file is required by the web application ' +
      ' in the development environment.'],
    ['build', 'The build command bundles and minifies all your' +
      ' application\'s code and third-party dependencies.']
    ]);

    grunt.log.writeln().writelns(
      'Try the help flag ( -h ) after each command to view more details ' +
      'about the options of that command.'
    );

};

// Footer.
exports.footer = function() {
  grunt.log.writeln().writeln('For more information, see http://mantrijs.com/');
};


exports.usageInit = function() {
  // overwrite opt list
  exports.initOptions(mantri.cli.initOptList);

  grunt.log.header('Usage');
  grunt.log.writeln(' ' + path.basename(process.argv[1]) + ' init --dest=destfolder/');
};
exports.usageDeps = function() {
  // overwrite opt list
  exports.initOptions(mantri.cli.depsOptList);

  grunt.log.header('Usage');
  grunt.log.writeln(' ' + path.basename(process.argv[1]) + ' deps ' +
    '--dest=./deps.js --src=./ --root=./');
};
exports.usageBuild = function() {
  // overwrite opt list
  exports.initOptions(mantri.cli.buildOptList);

  grunt.log.header('Usage');
  grunt.log.writeln(' ' + path.basename(process.argv[1]) + ' build ' +
    '--dest=compiled.js --src=./mantriConf.json');
};


