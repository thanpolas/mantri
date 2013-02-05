/**
 * @fileOverview Takes care of module loading, starts with config directives.
 */

goog.provide('Deppy.ModuleLoader');

goog.require('goog.dom');
goog.require('goog.dom.dataset');
goog.require('goog.async.Deferred');

goog.require('Deppy.Config');

/**
 * Takes care of module loading, starts with config directives.
 *
 * @constructor
 */
Deppy.ModuleLoader = function() {

  /**
   * Instanciate the config class
   * @type {Deppy.Config}
   * @private
   */
  this._config = Deppy.Config.getInstance();

  // figure out which is our entry point
  var scriptTags = document.getElementsByTagName('script');

  /**
   * @type {Element} the script tag used to fetch this application.
   * @private
   */
  this._ownScriptTag = scriptTags[ scriptTags.length - 1 ];

  /**
   * @type {string} The relative path to the user's application entry point.
   * @private
   */
  this._entryPoint = '';

};
goog.addSingletonGetter(Deppy.ModuleLoader);

/** @const {string} the data- attribute key for entry point file */
Deppy.ModuleLoader.ENTRY_POINT_DATA_KEY = 'main'

/** @const {string} the default entry point file */
Deppy.ModuleLoader.ENTRY_POINT_DEFAULT = 'app'

/** @const {string} the data- attribute key for deps file */
Deppy.ModuleLoader.DEPS_DATA_KEY = 'deps'

/** @const {string} the default deps file */
Deppy.ModuleLoader.DEPS_DEFAULT = 'deps'


/**
 * Triggers on config finish. Required assets have finished loading by now,
 * it's time to get the deps file if one exists, figure out what the entry point
 * of the application is and load it.
 *
 * @param {goog.events.Event} e
 * @private
 */
Deppy.ModuleLoader.prototype.start = function(e) {
  console.log('starting app fetch');
  this._fetchDepsFile()
    .addBoth(this._fetchEntryPoint, this);
};

/**
 * Determine the path of the dependency file and fetch it.
 *
 * @return {goog.async.Deferred} A deferred.
 */
Deppy.ModuleLoader.prototype._fetchDepsFile = function() {
  var configDepFile = this._config.getDepFile();
  var elementDepFile = goog.dom.dataset.get(this._ownScriptTag,
    Deppy.ModuleLoader.DEPS_DATA_KEY);

  // check by priority
  var depsFile = elementDepFile || configDepFile
    || Deppy.ModuleLoader.DEPS_DEFAULT;

  return goog.net.jsloader.load(depsFile + Deppy.Config.JS_EXT)
};

/**
 * Determine the path of the dependency file and fetch it.
 *
 * @return {goog.async.Deferred} A deferred.
 */
Deppy.ModuleLoader.prototype._fetchEntryPoint = function() {
  var configEntryPoint = this._config.getDepFile();
  var elementEntryPoint = goog.dom.dataset.get(this._ownScriptTag,
    Deppy.ModuleLoader.ENTRY_POINT_DATA_KEY);


  this._entryPoint = configEntryPoint || elementEntryPoint
    || Deppy.ModuleLoader.ENTRY_POINT_DEFAULT

  this._entryPoint = this._entryPoint + Deppy.Config.JS_EXT

  goog.net.jsloader.load(this._entryPoint)
    .addCallback(this._onEntryLoad, this)
    .addErrback(this._onEntryErr, this);
};

/**
 * On entry point load finish.
 * @private
 */
Deppy.ModuleLoader.prototype._onEntryLoad = function() {
  // nothing to do, things are rolling...
  console.log('loading all finished');
};


/**
 * On entry point error.
 * @private
 */
Deppy.ModuleLoader.prototype._onEntryErr = function() {
  throw new Error('Failed to load entry point. Check path: ' + this._entryPoint);
};
