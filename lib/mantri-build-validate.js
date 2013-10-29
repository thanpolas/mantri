/**
 * @fileOverview Validate the configuration passed to build op.
 */
var path   = require('path');

var __     = require('lodash');
var grunt  = require('grunt');


var helpers= require('./helpers');


var valid = module.exports = {};


/**
 * Validate the build options passed.
 *
 * @param {Object} buildOpts The build options to validate.
 * @return {boolean} yes / no.
 */
valid.validate = function( buildOpts ) {
  // An empty mantriConf options object.
  var mantriConf = {
    build: {},
  };


  var src = '';

  // check if a mantriConf web config file was defined
  if (!__.isString(buildOpts.mantriConf)) {
    helpers.log.error('mantriConf.json file was not defined');
    return false;
  }

  // Read and validate the web config file
  if ( !grunt.file.isFile(buildOpts.mantriConf) ) {
    helpers.log.error('No mantriConf.json file found: '.red +
      buildOpts.mantriConf.blue);
    return false;
  }

  mantriConf = grunt.file.readJSON( buildOpts.mantriConf );

  if (!valid.mantriConfValidate(mantriConf, buildOpts, buildOpts.mantriConf)) {
    return false;
  }

  src = mantriConf.build.src;

  // assign default values
  buildOpts.src = buildOpts.src || src;
  buildOpts.dest = buildOpts.dest || mantriConf.build.dest || 'app.min.js';
  buildOpts.documentRoot = buildOpts.documentRoot ||
    mantriConf.build.documentRoot || './';
  buildOpts.jsRoot = buildOpts.jsRoot || mantriConf.jsRoot ||
    path.dirname(buildOpts.src);
  buildOpts.outputWrapper = buildOpts.outputWrapper ||
    mantriConf.build.outputWrapper || null;
  buildOpts.excludeVendor = buildOpts.excludeVendor ||
    mantriConf.build.excludeVendor || [];
  buildOpts.vendorLibs = buildOpts.vendorLibs || mantriConf.vendorLibs || null;

  buildOpts.buildModules = mantriConf.buildModules || [];

  // Validate outcome
  if ( !buildOpts.src ) {
    helpers.log.error('No input file defined! Use the "build.src" property'.red +
      ' in your mantriConf.json file.'.red);
    return false ;
  }

  return true;
};


/**
 * Validate the module definitions of mantriConf.json file.
 *
 * @param {Object} buildModuleConf The buildModule Object.
 * @private
 * @throws {Error} If Not valid, log message generated.
 */
valid._validateModule = function(buildModuleConf) {

  if ( !__.isString( buildModuleConf.dest ) ) {
    helpers.log.error('No "dest" key found in an item of the "buildModules" ' +
      'array in your mantriConf.json file.');
    throw new Error();
  }

};

/**
 * Validate the mantriConf Object and normalize paths.
 *
 * @param {Object} mantriConf The mantri configuration object.
 * @param {Object} buildOpts The build options.
 * @param {string} confFile location of mantriConf.
 * @return {boolean}
 */
valid.mantriConfValidate = function(mantriConf, buildOpts, confFile) {

  if ( !__.isObject( mantriConf.build ) ) {
    helpers.log.error('There is no \'build\' key in your mantriConf file.');
    return false;
  }

  if ( !__.isString( mantriConf.build.src ) ) {
    helpers.log.error('There is no \'build.src\' key in your mantriConf file.');
    return false;
  }

  // take care of legacy values, transpose them to the new ones.
  valid.mantriConfLegacy(mantriConf);

  // set documentRoot if not defined
  mantriConf.build.documentRoot = mantriConf.build.documentRoot ||
    path.dirname(confFile);
  var documentRoot = mantriConf.build.documentRoot;

  // check if jsRoot is there
  if (__.isString( mantriConf.jsRoot)) {
    mantriConf.jsRoot = path.join(documentRoot, mantriConf.jsRoot);
  }

  // check for buildModules
  if (__.isObject(mantriConf.buildModules)) {
    try {

      mantriConf.buildModules.forIn(valid._validateModule);
    } catch(ex) {
      return false;
    }
  } else {
    mantriConf.buildModules = [];
  }

  return true;
};


/**
 * Warn about deprecated mantriConf option keys and transport them to new ones.
 *
 * @param  {Object} mantriConf The mantriConf object.
 */
valid.mantriConfLegacy = function(mantriConf) {
  if (__.isString(mantriConf.build.input)) {
    mantriConf.build.src = mantriConf.build.src || mantriConf.build.input;
    delete mantriConf.build.input;
    helpers.log.warn('mantriConf.json: "build.input" key has been deprecated.' +
      ' Use "build.src" instead.');
  }

  if (__.isArray(mantriConf.build.Vendor)) {
    mantriConf.build.excludeVendor = mantriConf.build.excludeVendor ||
      mantriConf.build.exclude;
    delete mantriConf.build.exclude;
    helpers.log.warn('mantriConf.json: "build.exclude" key has been deprecated.' +
      ' Use "build.excludeVendor" instead.');
  }

  if (__.isString(mantriConf.baseUrl)){
    mantriConf.jsRoot = mantriConf.jsRoot || mantriConf.baseUrl;
    delete mantriConf.baseUrl;
    helpers.log.warn('mantriConf.json: "baseUrl" key has been deprecated.' +
      ' Use "jsRoot" instead.');
  }

  if (__.isObject(mantriConf.libs)){
    mantriConf.vendorLibs = mantriConf.vendorLibs || mantriConf.libs;
    delete mantriConf.libs;
    helpers.log.warn('mantriConf.json: "libs" key has been deprecated.' +
      ' Use "vendorLibs" instead.');
  }
};
