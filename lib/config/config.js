/**
 * @fileOverview Handles loading, parsing and executing the config file.
 */

goog.provide('Deppy.Config');

goog.require('goog.async.Deferred');
goog.require('goog.net.jsloader');
goog.require('goog.object');

/**
 *
 * @constructor
 */
Deppy.Config = function() {

  /**
   * @type {boolean} open when config script is loaded.
   * @private
   */
  this._loadFinish = false;
  /**
   * @type {boolean} open if config script failed
   * @private
   */
  this._errLoad = false;

  /**
   * The config object as defined by the user.
   * @type {?Object}
   * @private
   */
  this._config = null;

  /**
   * The config defined scripts to load (vendor deps).
   * @type {Array}
   * @private
   */
  this._scriptsToLoad = [];

  /**
   * The baseUrl option as provided by the user.
   * @type {string}
   * @private
   */
  this._baseUrl = '';
};
goog.addSingletonGetter(Deppy.Config);

/**
 * @const {string} the name of the config file.
 */
Deppy.Config.CONFIG_FILE = 'deppyConf.js';

/**
 * @const {string} The default javascript extension.
 */
Deppy.Config.JS_EXT = '.js';

/**
 * Fetch the config file
 */
Deppy.Config.prototype.fetch = function() {
  goog.net.jsloader.load(Deppy.Config.CONFIG_FILE)
    .addCallback(this._onConfigLoad, this)
    .addErrback(this._onConfigErr, this);
};

/**
 * Main API entry point for configuring deppy.
 * Gets exposed as deppy.config()
 *
 * @param  {Object} config The config object.
 */
Deppy.Config.prototype.parse = function(config) {

  this._config = config;
  this._baseUrl = config.baseUrl || '';

  if (goog.isObject(config.paths)) {
    this._scriptsToLoad = goog.object.getValues(config.paths);
    this._startLoading();
  } else {
    this._configDone();
  }
};

/**
 * Start loading the vendor scripts synchronously and
 * sequencially.
 *
 * @private
 */
Deppy.Config.prototype._startLoading = function() {

  var scriptPath = this._scriptsToLoad.shift();

  if (!scriptPath) {
    this._configDone();
    return;
  }

  scriptPath = this._baseUrl + scriptPath + Deppy.Config.JS_EXT;
  console.log('Loading ' + scriptPath);
  goog.net.jsloader.load(scriptPath)
    .addBoth(this._startLoading, this);

};

/**
 * Config operations are finished, move on.
 *
 * @private
 */
Deppy.Config.prototype._configDone = function() {
  console.log('config done');
};


/**
 * Config script load success.
 * @private
 */
Deppy.Config.prototype._onConfigLoad = function() {
  this._loadFinish = true;
  console.log('finish!');
};


/**
 * Config script load failure.
 * @private
 */
Deppy.Config.prototype._onConfigErr = function() {
  this._loadFinish = true;
  this._errLoad = true;
  console.log('err', arguments);
};
