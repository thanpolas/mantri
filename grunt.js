
module.exports = function( grunt ) {
  'use strict';

  var externsPath = 'build/externs/';


  grunt.loadNpmTasks('grunt-contrib-handlebars');
  grunt.loadNpmTasks('grunt-closure-tools');

  //
  // Grunt configuration:
  //
  // https://github.com/cowboy/grunt/blob/master/docs/getting_started.md
  //
  grunt.initConfig({
    // Project configuration
    // ---------------------
    closureDepsWriter: {
      deppy: {
        closureLibraryPath: 'closure-library',
        output_file: 'lib/deps.js',
        options: {
          root_with_prefix: ['"lib ../../../lib"']
        }
      },
    },

    closureBuilder: {
      deppyTest: {
        closureLibraryPath: 'closure-library',
        inputs: ['lib/main.js'],
        root: ['lib', 'closure-library'],
        output_file: 'test/todoApp/js/lib/deppy/deppy.js',
        compile: true,
        compiler: 'build/closure_compiler/sscompiler.jar',
        compiler_options: {
          compilation_level: 'ADVANCED_OPTIMIZATIONS',
          externs: [externsPath + '*.js'],
          define: [
            "'goog.DEBUG=false'"
            ],
          warning_level: 'verbose',
          jscomp_off: ['checkTypes', 'fileoverviewTags'],
          summary_detail_level: 3,
          only_closure_dependencies: null,
          closure_entry_point: 'Deppy',
          output_wrapper: '(function(){%output%}).call(this);'
        }

      }
    },


    handlebars: {
      todoApp: {
        options: {
          namespace: 'Todos.tpl',
          wrapped: true,
          processName: function(filename) {
              var pieces = filename.split('/');
              return pieces[pieces.length - 1].split('.')[0];
            }
        },
        files: {
          'test/todoApp/js/app/templates/hbsCompiled.js': 'test/todoApp/js/app/**/*.html'
        }
      }
    }


  });

  // Alias the `test` task to run the `mocha` task instead
  grunt.registerTask('test', 'server:phantom mocha');

  grunt.registerTask('default', 'closureDepsWriter');
};
