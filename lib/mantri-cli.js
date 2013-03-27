/*
 * mantri
 * http://mantrijs.com/
 *
 * Copyright (c) 2012 "Cowboy" Ben Alman
 * Licensed under the MIT license.
 * https://github.com/gruntjs/grunt/blob/master/LICENSE-MIT
 */

'use strict';

// Nodejs libs.
var path = require('path');

// help output
var help = require('./mantri-help');

// mantri helpers
var helpers  = require('./helpers');
var log = helpers.log;

// mantri libs
var mantriDeps = require('./mantri-deps');
var mantriBuild = require('./mantri-build');

// External libs.
var nopt = require('nopt');

// available tasks
var validTasks = ['build', 'init', 'deps', 'watch'];



// This is only executed when run via command line.
var cli = module.exports = function() {

  var task = cli.tasks[0];

  if (cli.options.help || 0 === cli.tasks.length) {
    help.display(task);
    return;
  }

  if ( -1 === validTasks.indexOf(task)) {
    log.warn('Invalid command. Valid commands: '.yellow + 'init'.blue +
      ', '.yellow + 'deps'.blue + ', '.yellow + 'watch'.blue + ', '.yellow +
      'build'.blue);
    log.info('\n');
    log.error('Aborted not a valid command'.red);
    return;
  }

  var opts;
  var noop = function(){};
  var files = {
    src: null,
    dest: null
  };

  switch( task ) {
    case 'deps':
      log.info('Starting dependency task...');
      opts = getParsedArgs( depsOptList ).options;
      files.src = opts.src;
      files.dest = opts.dest;
      mantriDeps.run(noop, files, {root: opts.root}, 'cli');
    break;
    case 'build':
      log.info('Starting to build...');
      opts = getParsedArgs( buildOptList ).options;
      files.src = opts.src;
      files.dest = opts.dest;
      mantriBuild.run(noop, files, {root: opts.root}, 'cli');
    break;
  }
  // mantriDeps


  // Run tasks.
  //mantri.tasks(cli.tasks, cli.options, done);
};

//
// Default options.
//
var defaultOptList = cli.optlist = {
  help: {
    short: 'h',
    info: 'Display this help text.',
    type: Boolean
  },
  debug: {
    short: 'd',
    info: 'Enable debugging mode for tasks that support it.',
    type: Number
  },
  version: {
    short: 'V',
    info: 'Print the mantri version. Combine with --verbose for more info.',
    type: Boolean
  }
};


//
// Dependency task options
//
var depsOptList = {
  src: {
    info: 'The source to scan for `goog.provide` and `goog.require` ' +
      'statements, essentialy the path to your web application. Default "./"',
    type: path
  },
  dest: {
    info: 'The file you wish the generated deps file to be saved at. Default ' +
      'is "deps.js"',
    type: String
  },
  root: {
    info: 'The root option defines the Document (web) Root directory of your ' +
      'website. It is required if you define the source option. Default is "./"',
    type: path
  }
};




//
// Build task options
//
var buildOptList = {
  src: {
    info: 'The path to your `mantriConf.json` file. Default "./mantriConf.json"',
    type: String
  },
  dest: {
    info: 'The destination file to store the output. If no dest is defined ' +
      'Mantri will output to stdout.',
    type: String
  }
};


/**
 * Parse an option list into a form that nopt can handle.
 *
 * @param {Object} optionsList The options list
 * @return {Object} The parsed object.
 */
function getParsedArgs(optionsList) {
  var aliases = {};
  var known = {};

  Object.keys(optionsList).forEach(function(key) {
    var short = optionsList[key].short;
    if (short) {
      aliases[short] = '--' + key;
    }
    known[key] = optionsList[key].type;
  });

  var parsedRaw = nopt(known, aliases, process.argv, 2);
  var parsed = {};
  parsed.tasks = parsedRaw.argv.remain;
  parsed.options = parsedRaw;
  delete parsedRaw.argv;
  return parsed;

}

// synch fill out tasks and default options
var parsed = getParsedArgs(defaultOptList);
cli.tasks = parsed.tasks;
cli.options = parsed.options;

// Initialize any Array options that weren't initialized.
Object.keys(defaultOptList).forEach(function(key) {
  if (defaultOptList[key].type === Array && !(key in cli.options)) {
    cli.options[key] = [];
  }
});
