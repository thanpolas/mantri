/**
 * @fileOverview Takes care of module loading, starts with config directives.
 */

goog.provide('Deppy.ModuleLoader');

goog.require('goog.dom');
goog.require('goog.dom.dataset');


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
Deppy.ModuleLoader.ENTRY_POINT_DATA_KEY = 'main';

/** @const {string} the default entry point file */
Deppy.ModuleLoader.ENTRY_POINT_DEFAULT = 'app';

/** @const {string} the data- attribute key for deps file */
Deppy.ModuleLoader.DEPS_DATA_KEY = 'deps';

/** @const {string} the default deps file */
Deppy.ModuleLoader.DEPS_DEFAULT = 'deps';

/**
 * [get description]
 * @return {element} return own script tag element.
 */
Deppy.ModuleLoader.prototype.getOwnScript = function() {
  return this._ownScriptTag;
};

/**
 * Write script on document. This operation will get scripts synchronously.
 *
 * @param  {string} src A canonical path.
 * @param  {boolean=} optInline set to true to append inline javascript.
 */
Deppy.ModuleLoader.prototype.writeScript = function (src, optInline) {
  var out = '<script type="text/javascript"';
  if (!optInline) {
    out += ' src="' + src + '">';
  } else {
    out += '>' + src;
  }
  out += '</script>';
  document.write(out);
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

  this.writeScript('deppy.startApp();', true);
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
 * Determine the namespace of the entry point file and fetch it.
 *
 */
Deppy.ModuleLoader.prototype.startApp = function() {

  var configEntryPoint = Deppy.Config.getInstance().getEntryPoint();

  var elementEntryPoint = goog.dom.dataset.get(this._ownScriptTag,
    Deppy.ModuleLoader.ENTRY_POINT_DATA_KEY);

  this._entryPoint = configEntryPoint || elementEntryPoint ||
    Deppy.ModuleLoader.ENTRY_POINT_DEFAULT;

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
};


/**
 * On entry point error.
 * @private
 */
Deppy.ModuleLoader.prototype._onEntryErr = function() {
  throw new Error('Failed to load entry point. Check path: ' + this._entryPoint);
};
