/**
 * @fileOverview Handles loading, parsing and executing the config file.
 */
goog.provide('Deppy.Config');
goog.provide('Deppy.Config.EventType');

goog.require('goog.events.EventTarget');
goog.require('goog.async.Deferred');
goog.require('goog.net.jsloader');
goog.require('goog.object');

/**
 *
 * @extends {goog.events.EventTarget}
 * @constructor
 */
Deppy.Config = function() {

  goog.base(this);

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
goog.inherits(Deppy.Config, goog.events.EventTarget);
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
 * Events triggered by this class.
 *
 * @enum {string}
 */
Deppy.Config.EventType = {
  CONFIG_FINISH: 'config.finish'
};



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
 * @param  {Object} config The config object from the user.
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
  goog.net.jsloader.load(scriptPath)
    .addBoth(this._startLoading, this);

};

/**
 * Config operations are finished, move on.
 *
 * @private
 */
Deppy.Config.prototype._configDone = function() {
  this.dispatchEvent(Deppy.Config.EventType.CONFIG_FINISH);
};


/**
 * Config script load success.
 * @private
 */
Deppy.Config.prototype._onConfigLoad = function() {
  this._loadFinish = true;
};


/**
 * Config script load failure.
 * @private
 */
Deppy.Config.prototype._onConfigErr = function() {
  this._loadFinish = true;
  this._errLoad = true;
};

/**
 * @return {string|null} Return the dependency file is set, null if not.
 */
Deppy.Config.prototype.getDepFile = function() {
  return this._config.depsFile || null;
};

