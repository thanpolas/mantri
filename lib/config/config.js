/**
 * @fileOverview Handles loading, parsing and executing the config file.
 */
goog.provide('Deppy.Config');
goog.provide('Deppy.Config.EventType');

goog.require('ajax');
goog.require('goog.json');
goog.require('goog.events.EventTarget');
goog.require('goog.object');
goog.require('Deppy.ModuleLoader');

/**
 *
 * @extends {goog.events.EventTarget}
 * @constructor
 */
Deppy.Config = function() {

  goog.base(this);

  /**
   * @type {Deppy.ModuleLoader}
   * @private
   */
  this._loader = Deppy.ModuleLoader.getInstance();

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

/** @const {string} the name of the config file. */
Deppy.Config.CONFIG_FILE = 'deppyConf.json';

/** @const {string} the extension of the config file. */
Deppy.Config.CONFIG_EXT = '.json';

/** @const {string} the script tag data key defining the config url */
Deppy.Config.CONFIG_DATA_KEY = 'config';

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
  var el = this._loader.getOwnScript();

  /** @type {?string} the value of the 'config' data in the script element */
  var elDataConfig = goog.dom.dataset.get( el,
    Deppy.Config.CONFIG_DATA_KEY );

  /** @type {string} the full path to the config JSON file */
  var configPath = '';

  if ( elDataConfig && elDataConfig.length ) {
    configPath = elDataConfig + Deppy.Config.CONFIG_EXT;
  } else {
    configPath = Deppy.Config.CONFIG_FILE;
  }

  ajax({
    url: configPath,
    async: false,
    dataType: 'json',
    error: goog.bind( function( jqXHR, textStatus, errorThrown ) {
      this._configDone();
    }, this ),
    success: goog.bind( function( data, text ) {
      this.parse( data );
    }, this )
  });

};

/**
 * Callback that gets invoked right after the config file script tag.
 *
 * Its job is to move continue operations in case no config file is found.
 */
Deppy.Config.prototype.configFinished = function() {
  this._configDone();
};

/**
 * Main API entry point for configuring deppy.
 * Gets exposed as deppy.config()
 *
 * @param  {Object} config The config object from the user.
 */
Deppy.Config.prototype.parse = function(config) {
  if (!goog.isObject(config)) {
    this._configDone();
    return;
  }
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
  while(scriptPath) {

    scriptPath = this._baseUrl + scriptPath + Deppy.ModuleLoader.JS_EXT;

    this._loader.writeScript(scriptPath);

    scriptPath = this._scriptsToLoad.shift();
  }

  this._configDone();

};

/**
 * Config operations are finished, move on.
 *
 * @private
 */
Deppy.Config.prototype._configDone = function() {
  if (this._loadFinish) {
    return;
  }
  // validate config
  if (!goog.isObject(this._config)) {
    this._config = {};
  }

  this._loadFinish = true;
  this.dispatchEvent(Deppy.Config.EventType.CONFIG_FINISH);
};


/**
 * @return {string|null} Return the dependency file if set, null if not.
 */
Deppy.Config.prototype.getDepFile = function() {
  return this._config.depsFile || null;
};

/**
 * @return {string|null} Return the entry point namespace.
 */
Deppy.Config.prototype.getEntryPoint = function() {
  return this._config.namespace || null;
};

