goog.provide('Deppy.Core');
goog.provide('deppy');

goog.require('Deppy.Config');
goog.require('Deppy.Config.EventType');
goog.require('Deppy.ModuleLoader');

/**
 * The main constructor
 *
 * @constructor
 */
Deppy.Core = function() {
  // reset instance holders,
  // required for testing.
  Deppy.ModuleLoader.instance_ = null;
  Deppy.Config.instance_ = null;

  /**
   * Get the module loader singleton
   * @type {Deppy.ModuleLoader}
   * @private
   */
  this._moduleLoader = Deppy.ModuleLoader.getInstance();

  /**
   * Instanciate the config class
   * @type {Deppy.Config}
   * @private
   */
  this._config = Deppy.Config.getInstance();


  // expose config parse method
  this.config = goog.bind(this._config.parse, this._config);
  // expose config
  this.fetchConfig = goog.bind(this._config.fetch, this._config);
  // expose config
  this.configFinished = goog.bind(this._config.configFinished, this._config);
  // expose startApp method (invoked internally)
  this.startApp = goog.bind(this._moduleLoader.startApp, this._moduleLoader);

  goog.events.listen(this._config, Deppy.Config.EventType.CONFIG_FINISH,
    this._moduleLoader.start, false, this._moduleLoader);

  // roll the ball
  this._config.fetch();

};

if ('undefined' === typeof(TESTTESTTEST)) {
  // go
  window.deppy = new Deppy.Core();
}
