/**
 * @fileOverview Takes care of module loading, starts with config directives.
 */

goog.provide('Mantri.ModuleLoader');

goog.require('goog.dom');
goog.require('goog.dom.dataset');
goog.require('goog.Uri');


/**
 * Takes care of module loading, starts with config directives.
 *
 * @constructor
 */
Mantri.ModuleLoader = function() {

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

  /**
   * @type {?string} Cache the path prefix.
   * @private
   */
  this._pathPrefix = null;

  /**
   * @type {boolean} If we have a cached prefix value
   * @private
   */
  this._hasPathPrefix = false;

};
goog.addSingletonGetter(Mantri.ModuleLoader);

/**
 * @const {string} The default javascript extension.
 */
Mantri.ModuleLoader.JS_EXT = '.js';

/** @type {String} One string to move back one folder */
Mantri.ModuleLoader.BACK_PATH = '../';

/** @const {string} the data- attribute key for entry point file */
Mantri.ModuleLoader.ENTRY_POINT_DATA_KEY = 'require';

/** @const {string} the default entry point file */
Mantri.ModuleLoader.ENTRY_POINT_DEFAULT = 'app';

/** @const {string} the data- attribute key for deps file */
Mantri.ModuleLoader.DEPS_DATA_KEY = 'deps';

/** @const {string} the default deps file */
Mantri.ModuleLoader.DEPS_DEFAULT = 'deps';

/**
 * [get description]
 * @return {element} return own script tag element.
 */
Mantri.ModuleLoader.prototype.getOwnScript = function() {
  return this._ownScriptTag;
};

/**
 * Write script on document. This operation will get scripts synchronously.
 *
 * @param  {string} src A canonical path.
 * @param  {boolean=} optInline set to true to append inline javascript.
 */
Mantri.ModuleLoader.prototype.writeScript = function (src, optInline) {

  var pathPrefix = this.getPathPrefix();
  var out = '<script type="text/javascript"';
  if (!optInline) {
    out += ' src="' + pathPrefix + src + '">';
  } else {
    out += '>' + src;
  }
  out += '</script>';
  document.write(out);
};

/**
 * Figure out what prefix is required for the scripts to load.
 *
 * Checks if we are in a deep level and compares with config directives.
 *
 * @return {!string} String.
 */
Mantri.ModuleLoader.prototype.getPathPrefix = function() {
  console.log(this._hasPathPrefix, this._pathPrefix);
  if ( this._hasPathPrefix ) {
    return this._pathPrefix;
  }
  this._hasPathPrefix = true;

  // check for absolute path in baseUrl
  var baseUrl = Mantri.Config.getInstance().get( Mantri.Config.Properties.BASEURL );
  if ( goog.isString( baseUrl ) && '/' === baseUrl.charAt(0) ) {
    this._pathPrefix = '';
    return this._pathPrefix;
  }

  // find the relative location to doc root
  // this may be a shoot in the foot, we might as well
  // use absolute paths.
  var location   = window.location.href,
      uri        = new goog.Uri( location ),
      slashRegex = /(\/)/g,
      uriPath    = uri.getPath();

  var matches = uriPath.match( slashRegex );

  if ( !goog.isArray( matches ) && matches.length) {
    // no dice
    this._pathPrefix = '';
    return this._pathPrefix;
  }

  var stepBackPaths = matches.length - 1;

  this._pathPrefix = new Array(1 + stepBackPaths)
    .join( Mantri.ModuleLoader.BACK_PATH );

  return this._pathPrefix;
};



/**
 * Triggers on config finish. Required assets have finished loading by now,
 * it's time to get the deps file if one exists, figure out what the entry point
 * of the application is and load it.
 *
 * @param {goog.events.Event} e
 */
Mantri.ModuleLoader.prototype.start = function(e) {
  this._fetchDepsFile();

  this.writeScript('mantri.startApp();', true);
};

/**
 * Determine the path of the dependency file and fetch it.
 *
 * @private
 */
Mantri.ModuleLoader.prototype._fetchDepsFile = function() {
  var configDepFile = Mantri.Config.getInstance().getDepFile();
  var elementDepFile = goog.dom.dataset.get(this._ownScriptTag,
    Mantri.ModuleLoader.DEPS_DATA_KEY);

  // check by priority
  var depsFile = elementDepFile || configDepFile ||
      Mantri.ModuleLoader.DEPS_DEFAULT;

  this.writeScript(depsFile + Mantri.ModuleLoader.JS_EXT);
};


/**
 * Determine the namespace of the entry point file and fetch it.
 *
 */
Mantri.ModuleLoader.prototype.startApp = function() {

  var configEntryPoint = Mantri.Config.getInstance().getEntryPoint();

  var elementEntryPoint = goog.dom.dataset.get(this._ownScriptTag,
    Mantri.ModuleLoader.ENTRY_POINT_DATA_KEY);

  this._entryPoint = configEntryPoint || elementEntryPoint ||
    Mantri.ModuleLoader.ENTRY_POINT_DEFAULT;

  // hack goog so it won't get caught by scripts
  var g = goog;
  g.require(this._entryPoint);

};

/**
 * On entry point load finish.
 * @private
 */
Mantri.ModuleLoader.prototype._onEntryLoad = function() {
  // nothing to do, things are rolling...
};


/**
 * On entry point error.
 * @private
 */
Mantri.ModuleLoader.prototype._onEntryErr = function() {
  throw new Error('Failed to load entry point. Check path: ' + this._entryPoint);
};
