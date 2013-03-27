/**
 * @fileOverview the mantri cli library.
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
var mantriInit = require('./mantri-init');

// External libs.
var nopt = require('nopt');

// available tasks
var validTasks = ['build', 'init', 'deps', 'watch'];

// option list objects.
var defaultOptList, buildOptList, depsOptList, initOptList;

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


// This is only executed when run via command line.
var cli = module.exports = function() {

  var task = cli.tasks[0];

  if (cli.options.help || 0 === cli.tasks.length) {
    help.display(task);
    return;
  }

  if ( -1 === validTasks.indexOf(task)) {
    log.warn('Invalid command. Valid commands: '.yellow + 'init'.blue +
      ', '.yellow + 'deps'.blue + ', '.yellow + 'build'.blue);
    log.info('\n');
    log.error('Aborted not a valid command'.red);
    return;
  }

  var noop = function(){};
  var parsedOpts, opts;

  switch( task ) {
    case 'deps':
      log.info('Starting dependency task...');
      parsedOpts = getParsedArgs( depsOptList ).options;

      opts = {
        src: parsedOpts.src,
        dest: parsedOpts.dest,
        root: parsedOpts.root,
        target: 'cli'
      };
      mantriDeps.run(opts, noop);
    break;
    case 'build':
      log.info('Starting to build...');
      parsedOpts = getParsedArgs( buildOptList ).options;
      opts = {
        src: parsedOpts.src,
        dest: parsedOpts.dest,
        debug: cli.options.debug,
        target: 'cli'
      };
      mantriBuild.run(opts, function(status){
        if (status) {
          log.info('Build complete.');
        } else {
          log.error('Build failed'.red);
        }
      });
    break;
    case 'init':
      log.info('Starting init...');
      parsedOpts = getParsedArgs( initOptList ).options;
      mantriInit.run(parsedOpts.dest);
    break;
  }

};

//
// Default options.
//
defaultOptList = cli.optlist = {
  help: {
    short: 'h',
    info: 'Display this help text.',
    type: Boolean
  },
  debug: {
    short: 'd',
    info: 'Enable debugging mode.',
    type: Boolean
  }
};


//
// Dependency task options
//
depsOptList = cli.depsOptList = {
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
buildOptList = cli.buildOptList = {
  src: {
    info: 'The path to your `mantriConf.json` file. Default "./mantriConf.json"',
    type: String
  },
  dest: {
    info: 'The destination file to store the output. This is required.',
    type: String
  }
};

initOptList = cli.initOptList = {
  dest: {
    info: 'The destination path to create the mantri files. Default is cwd',
    type: path
  }
};


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
