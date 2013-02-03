goog.provide('Deppy.Core');
goog.provide('deppy');

goog.require('Deppy.Config');

/**
 * The main constructor
 *
 * @constructor
 */
Deppy.Core = function() {

  /**
   * Instanciate the config class
   * @type {Deppy.Config}
   * @private
   */
  this._config = Deppy.Config.getInstance();

  // expose config parse method
  this.config = goog.bind(this._config.parse, this._config);

  /**
   * The module loader
   * type {Deepy.ModuleLoader}
   */
  //this.moduleLoader = Deppy.ModuleLoader.getInstance();


  // fetch config, parse it and start loading modules
  this._config.fetch();
    // .awaitDeferred(this.config.parse)
    // .callback(this.moduleLoader.start);


};

// go
deppy = new Deppy.Core();

console.log('Finished')
