/*jshint camelcase:false */
goog.provide('Mantri.Core');
goog.provide('mantri');

goog.require('Mantri.Config');
goog.require('Mantri.Config.EventType');
goog.require('Mantri.ModuleLoader');

/**
 * The main constructor
 *
 * @constructor
 */
Mantri.Core = function() {
  // reset singleton instance references,
  // required for testing.
  Mantri.ModuleLoader.instance_ = null;
  Mantri.Config.instance_ = null;

  /**
   * Get the module loader singleton
   * @type {Mantri.ModuleLoader}
   * @private
   */
  this._moduleLoader = Mantri.ModuleLoader.getInstance();

  /**
   * Instanciate the config class
   * @type {Mantri.Config}
   * @private
   */
  this._config = Mantri.Config.getInstance();


  // expose config parse method
  this.config = goog.bind(this._config.parse, this._config);
  // expose config
  this.fetchConfig = goog.bind(this._config.fetch, this._config);
  // expose config
  this.configFinished = goog.bind(this._config.configFinished, this._config);
  // expose startApp method (invoked internally)
  this.startApp = goog.bind(this._moduleLoader.startApp, this._moduleLoader);

  // when config finishes fetch the dependencies file
  goog.events.listen(this._config, Mantri.Config.EventType.CONFIG_FINISH,
    this._moduleLoader.fetchDeps, false, this._moduleLoader);

  // when dependencies finish loading start loading consumer's files
  goog.events.listen(this._moduleLoader,
    Mantri.ModuleLoader.EventType.DEPS_FINISH,
    this._moduleLoader.loadModules, false, this._moduleLoader);

  // expose the starting point
  this.init = goog.bind(this._config.fetch, this._config);
};

if (typeof(TESTTESTTEST) === 'undefined') {
  // go
  window.mantri = new Mantri.Core();
  // roll the ball
  window.mantri.init();
}
