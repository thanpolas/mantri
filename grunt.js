
module.exports = function( grunt ) {
  'use strict';

  var externsPath = 'build/externs/';


  grunt.loadNpmTasks('grunt-contrib-handlebars');
  grunt.loadNpmTasks('grunt-closure-tools');
  grunt.loadNpmTasks('grunt-contrib-copy');

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
      todoApp: {
        closureLibraryPath: 'closure-library',
        output_file: 'test/todoApp/deps.js',
        options: {
          root_with_prefix: ['"test/todoApp/ ./"']
        }
      }

    },

    watch: {
      autoBuild: {
        files: 'lib/**/*.js',
        tasks: ['buildTest']
      }
    },

    copy: {
      testBuild: {
        files: {
          'test/todoApp/js/lib/deppy/deppy.js': 'test/todoApp/js/lib/deppy/deppy.js'
        },
        options: {
          processContent: hackClosureSig
        }
      }
    },


    closureBuilder: {
      deppyTest: {
        closureLibraryPath: 'closure-library',
        inputs: ['lib/main.js'],
        root: ['lib', 'closure-library'],
        output_mode: 'script',
        namespaces: ['Deppy', 'deppy'],
        output_file: 'temp/tempBuilt.js'
        // compile: true,
        // compiler: 'build/closure_compiler/sscompiler.jar',
        // compiler_options: {
        //   compilation_level: 'WHITESPACE_ONLY',
        //   externs: [externsPath + '*.js'],
        //   define: [
        //     "'goog.DEBUG=false'"
        //     ],
        //   warning_level: 'verbose',
        //   jscomp_off: [
        //     '"checkTypes"',
        //     '"strictModuleDepCheck"'
        //   ],
        //   summary_detail_level: 3,
        //   only_closure_dependencies: null,
        //   closure_entry_point: 'Deppy',
        //   output_wrapper: '(function(){%output%}).call(this);'
        // }

      }
    },

    concat: {
      dist: {
        src: ['lib/core/closure-hacks.js', 'temp/tempBuilt.js'],
        dest: 'test/todoApp/js/lib/deppy/deppy.js'
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
  grunt.registerTask('buildTest', 'closureBuilder:deppyTest concat copy:testBuild');
  grunt.registerTask('default', 'closureDepsWriter');

  /**
   * Replaces the closure signature from the final built file.
   *
   * This is required so depsWriter operation on user's source base
   * will not break.
   *
   * @param  {string} contents The contents we want to parse and replace.
   * @return {string} replaced contents.
   */
  function hackClosureSig(contents) {
    var closureSig = 'var goog = goog || {}; // Identifies this file as the Closure base.';
    var JSreplace = 'var goog = {};';
    return contents.replace(closureSig, JSreplace);
  }

};

