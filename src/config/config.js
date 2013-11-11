/*jshint camelcase:false */
/**
 * @fileoverview Handles loading, parsing and executing the config file.
 */
goog.provide('Mantri.Config');
goog.provide('Mantri.Config.EventType');
goog.provide('Mantri.Config.Properties');

goog.require('jQuery');
goog.require('goog.json');
goog.require('goog.events.EventTarget');
goog.require('goog.object');
goog.require('Mantri.ModuleLoader');

/**
 *
 * @extends {goog.events.EventTarget}
 * @constructor
 */
Mantri.Config = function() {

  goog.base(this);

  this.uri = new goog.Uri();

  /**
   * @type {Mantri.ModuleLoader}
   * @private
   */
  this._loader = Mantri.ModuleLoader.getInstance();

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
   * @type {Object}
   * @private
   */
  this._config = {};

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
goog.inherits(Mantri.Config, goog.events.EventTarget);
goog.addSingletonGetter(Mantri.Config);

/**
 * The properties available via the config JSON file.
 *
 * This enum does not describe structure of the config
 * map, although it tries via intendation.
 *
 * Plainly do a static declaration of keys used.
 *
 * @enum {string}
 */
Mantri.Config.Properties = {
  BASEURL: 'jsRoot',
  LIBS: 'vendorLibs',
  NAMESPACE: 'require',

  // the build tree
  BUILD: 'build',
  INPUT: 'src',
  DEST: 'dest'

};

/** @const {string} the name of the config file. */
Mantri.Config.CONFIG_FILE = '/mantriConf.json';

/** @const {string} the extension of the config file. */
Mantri.Config.CONFIG_EXT = '.json';

/** @const {string} the script tag data key defining the config url */
Mantri.Config.CONFIG_DATA_KEY = 'config';

/**
 * Events triggered by this class.
 *
 * @enum {string}
 */
Mantri.Config.EventType = {
  CONFIG_FINISH: 'config.finish'
};

/**
 * @param  {string} property The property name.
 * @return {*} Config properties.
 */
Mantri.Config.prototype.get = function( property ) {
  return this._config[ property ];
};



/**
 * Fetch the config file
 */
Mantri.Config.prototype.fetch = function() {
  var el = this._loader.getOwnScript();

  /** @type {?string} the value of the 'config' data in the script element */
  var elDataConfig = goog.dom.dataset.get( el,
    Mantri.Config.CONFIG_DATA_KEY );

  /** @type {string} the full path to the config JSON file */
  var configPath = '';

  if ( elDataConfig && elDataConfig.length ) {
    configPath = elDataConfig + Mantri.Config.CONFIG_EXT;
  } else {
    configPath = Mantri.Config.CONFIG_FILE;
  }

  jQuery.ajax({
    url: configPath,
    async: false,
    dataType: 'json',
    error: goog.bind( function( jqXHR, textStatus, errorThrown ) {
      document.write('<p style="font-size: 22px;color:red;font-weight:900;">' +
        ' Mantri :: Failed to' +
        ' load "mantriConf.json" file. Error: &nbsp;' + errorThrown + '</p>');
      this._configDone();
    }, this ),
    success: goog.bind( this.parse, this)
  });

};

/**
 * Callback that gets invoked right after the config file script tag.
 *
 * Its job is to move continue operations in case no config file is found.
 */
Mantri.Config.prototype.configFinished = function() {
  this._configDone();
};

/**
 * Main API entry point for configuring mantri.
 * Gets exposed as mantri.config()
 *
 * @param  {Object} config The config object from the user.
 */
Mantri.Config.prototype.parse = function(config) {

  if (!goog.isObject(config)) {
    this._configDone();
    return;
  }
  this._config = config;
  this._baseUrl = config[ Mantri.Config.Properties.BASEURL ] || '';

  var libs = config[ Mantri.Config.Properties.LIBS ];

  if (goog.isObject( libs )) {
    this._scriptsToLoad = goog.object.getValues( libs );
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
Mantri.Config.prototype._startLoading = function() {
  var scriptPath = this._scriptsToLoad.shift();
  while(scriptPath) {
    scriptPath = this._baseUrl + scriptPath + Mantri.ModuleLoader.JS_EXT;

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
Mantri.Config.prototype._configDone = function() {
  if (this._loadFinish) {
    return;
  }
  // validate config
  if (!goog.isObject(this._config)) {
    this._config = {};
  }

  this._loadFinish = true;
  this.dispatchEvent(Mantri.Config.EventType.CONFIG_FINISH);
};


/**
 * @return {string|null} Return the dependency file if set, null if not.
 */
Mantri.Config.prototype.getDepFile = function() {
  return this._config.depsFile || null;
};

/**
 * @return {string|null} Return the entry point namespace.
 */
Mantri.Config.prototype.getEntryPoint = function() {
  return this._config[ Mantri.Config.Properties.NAMESPACE ] || null;
};

