/**
 * @fileOverview Multiple Modules build operations.
 */

var __     = require('lodash');
var async = require('async');

var helpers= require('./helpers');
var mantriCompile = require('./mantri-build-compile');

var buildModule = module.exports = {};

/**
 * Checks if there are modules defined and builds them.
 *
 * @param {Object} buildOpts Build options.
 * @param {Object} options The options object.
 * @param {Function(Error=)} cb Callback
 */
buildModule.buildModules = function(buildOpts, options, cb) {

  if (!__.isObject(buildOpts.buildModules)) {
    return cb();
  }

  var namespaces = __.keys(buildOpts.buildModules);

  async.map(
    namespaces,
    __.partial(buildModule._compileModule, buildOpts, options),
    cb
  );

};


/**
 * Prepare and compile a module. Used when multiple modules are defined in
 * mantriConf.json file.
 *
 * @param {Object} buildOpts Build options.
 * @param {Object} options The options object.
 * @param {Object} namespace the Module's namespace.
 * @param {Function(Error=)} cb Callback.
 * @private
 */
buildModule._compileModule = function(buildOpts, options, namespace, cb) {
  // The module in the "buildModule" key defined in the mantriConf.json file.
  var moduleConf = buildOpts.buildModules[namespace];

  var compileOpts = {
    jsRoot: buildOpts.jsRoot,
    gmockDir: options.googMock,
    dest: moduleConf.dest,
    target: buildOpts.target,
    tempBuildDest: options._tmpDir.path + '/module-' + namespace + '.js',
    debug: options.debug,
    namespace: namespace,
    outputWrapper: buildModule._checkModuleOutputWrapper(namespace, moduleConf),
    noCompile: options.noCompile,
    sourceMapFile: moduleConf.sourceMapFile,
    sourceMappingURL: moduleConf.sourceMappingURL,
  };

  helpers.log.debug( compileOpts.debug, 'Compiling module: ' + namespace);

  mantriCompile.compile(compileOpts, function(status) {
    if (!status) {return cb(new Error('Compilation Error'));}
    cb();
  });
};

/**
 * Check the outputWrapper option and if not defined return custom dirty
 * solution to modules so they properly export their payload.
 *
 * @param {Object} namespace the Module's namespace.
 * @param {Object} moduleConf  The module in the "buildModule" key defined in the mantriConf.json file.
 * @return {string|undefined} The proper outputWrapper to apply.
 * @private
 */
buildModule._checkModuleOutputWrapper = function(namespace, moduleConf) {

  // don't apply custom wrapper if explicitly set to 'null'
  if (moduleConf.outputWrapper === null) {return;}

  if (__.isString(moduleConf.outputWrapper) && moduleConf.outputWrapper.length) {
    // user defined wrapper
    return moduleConf.outputWrapper;
  }

  // apply the custom wrapper
  var exportString = buildModule._getWrapperExportString(namespace);

  var wrapper = '(function(){%output%;' + exportString +'}).call(this);';

  return wrapper;
};

/**
 * Generate and return a custom export string for the specific module.
 *
 * For a namespace of 'app.ctrl.dong' the following string would be returned
 * (without the newlines or spaces):
 *    this.app = this.app || {};
 *    this.app.ctrl = this.app.ctrl || {};
 *    this.app.ctrl.dong = app.ctrl.dong;
 *
 * @return {string} the proper js text that exports the module.
 * @private
 */
buildModule._getWrapperExportString = function(namespace) {
  var nsParts = namespace.split('.');
  var totalParts = nsParts.length;
  var exportString = '';
  var tempString = '';
  var orAssign = '||{};';
  var exportTarget = 'this';

  nsParts.forEach(function(part, index) {
    if (index === 0) {
      tempString = part;
      exportString = exportTarget+ '.' + tempString + '=' + exportTarget +
        '.' +tempString + orAssign;
    } else {
      tempString += '.' + part;
      if ((index + 1) === totalParts) {
        // last part
        exportString += exportTarget + '.' + tempString + '=' + tempString + ';';
      } else {
        exportString += exportTarget + '.' + tempString + '=' + exportTarget +
        '.' + tempString + orAssign;
      }
    }
  });

  return exportString;
};
