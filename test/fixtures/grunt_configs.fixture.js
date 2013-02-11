/*jshint camelcase:false */
var configs = {
  deps: {}
};

var CLOSURE_COMPILER = 'path/to/compiler.jar',
    CLOSURE_BUILDER = 'path/to/builder.py';


configs.deps.plain = {
  deppyDeps: {
    todoApp: {
      src: 'test/todoApp',
      dest: 'test/todoApp/deps.js'
    }
  }
};


module.exports = configs;
