/**
 * @fileOverview Takes care of module loading, starts with config directives.
 */

goog.provide('Deppy.ModuleLoader');

goog.require('goog.dom');
goog.require('goog.dom.dataset');
goog.require('goog.async.Deferred');


/**
 * Takes care of module loading, starts with config directives.
 *
 * @constructor
 */
Deppy.ModuleLoader = function() {

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

/**
 * @const {string} The default javascript extension.
 */
Deppy.ModuleLoader.JS_EXT = '.js';


/** @const {string} the data- attribute key for entry point file */
Deppy.ModuleLoader.ENTRY_POINT_DATA_KEY = 'main'

/** @const {string} the default entry point file */
Deppy.ModuleLoader.ENTRY_POINT_DEFAULT = 'app'

/** @const {string} the data- attribute key for deps file */
Deppy.ModuleLoader.DEPS_DATA_KEY = 'deps'

/** @const {string} the default deps file */
Deppy.ModuleLoader.DEPS_DEFAULT = 'deps'


/**
 * Write script on document. This operation will get scripts synchronously.
 *
 * @param  {string} src A canonical path.
 */
Deppy.ModuleLoader.prototype.writeScript = function (src) {
  document.write(
    '<script type="text/javascript" src="' + src + '"></' + 'script>');

};

/**
 * Triggers on config finish. Required assets have finished loading by now,
 * it's time to get the deps file if one exists, figure out what the entry point
 * of the application is and load it.
 *
 * @param {goog.events.Event} e
 */
Deppy.ModuleLoader.prototype.start = function(e) {
  this._fetchDepsFile();

  this._writeCallback();
};

/**
 * Determine the path of the dependency file and fetch it.
 *
 * @private
 */
Deppy.ModuleLoader.prototype._fetchDepsFile = function() {
  var configDepFile = Deppy.Config.getInstance().getDepFile();
  var elementDepFile = goog.dom.dataset.get(this._ownScriptTag,
    Deppy.ModuleLoader.DEPS_DATA_KEY);

  // check by priority
  var depsFile = elementDepFile || configDepFile
    || Deppy.ModuleLoader.DEPS_DEFAULT;

  this.writeScript(depsFile + Deppy.ModuleLoader.JS_EXT);
};

/**
 * Append a synch callback on the dom after the deps file so
 * we can start fetching user's application.
 *
 * @private
 */
Deppy.ModuleLoader.prototype._writeCallback = function() {
  document.write(
    '<script type="text/javascript">deppy.startApp();</script>');
};

/**
 * Determine the namespace of the entry point file and fetch it.
 *
 */
Deppy.ModuleLoader.prototype.startApp = function() {
  var configEntryPoint = Deppy.Config.getInstance().getDepFile();
  var elementEntryPoint = goog.dom.dataset.get(this._ownScriptTag,
    Deppy.ModuleLoader.ENTRY_POINT_DATA_KEY);

  this._entryPoint = configEntryPoint || elementEntryPoint
    || Deppy.ModuleLoader.ENTRY_POINT_DEFAULT

  // hack goog so it won't get caught by scripts
  var g = goog;
  g.require(this._entryPoint);

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
