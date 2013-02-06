
module.exports = function( grunt ) {
  'use strict';

  var externsPath = 'build/externs/';

  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-contrib-handlebars');
  grunt.loadNpmTasks('grunt-closure-tools');
  grunt.loadNpmTasks('grunt-contrib-copy');

  //
  // Grunt configuration:
  //
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
        tasks: ['build', 'test']
      }
    },

    /**
     *
     * BUILD PROCESS
     *
     *
     */

    distFile: 'dist/deppy.js',

    closureBuilder: {
      build: {
        closureLibraryPath: 'closure-library',
        inputs: ['lib/main.js'],
        root: ['lib', 'closure-library'],
        output_mode: 'script',
        namespaces: ['Deppy', 'deppy'],
        output_file: 'temp/tempBuilt.js',
        compile: true,
        compiler: 'build/closure_compiler/sscompiler.jar',
        compiler_options: {
          compilation_level: 'WHITESPACE_ONLY',
          externs: [externsPath + '*.js'],
          define: [
            "'goog.DEBUG=false'"
            ],
          warning_level: 'verbose',
          jscomp_off: [
            '"checkTypes"',
            '"strictModuleDepCheck"'
          ],
          summary_detail_level: 3,
          only_closure_dependencies: null,
          closure_entry_point: 'Deppy'
        }
      }
    },

    concat: {
      dist: {
        src: ['lib/core/closure-hacks.js', 'temp/tempBuilt.js'],
        dest: '<%= distFile %>'
      }
    },

    copy: {
      build: {
        files: {
          '<%= distFile %>': '<%= distFile %>'
        },
        options: {
          processContent: hackClosureSig
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
          'test/todoApp/js/app/templates/hbsCompiled.js':
            'test/todoApp/js/app/**/*.html'
        }
      }
    },

    /**
     * TESTING
     *
     */
    mochaPhantom: 'node_modules/mocha-phantomjs/bin/mocha-phantomjs' +
      ' test/web/index.html',

    shell: {
      mochaPhantom: {
          command: '<%= mochaPhantom %>',
          stdout: true
      },
      mochaPhantomSpec: {
          command: '<%= mochaPhantom %> -R spec',
          stdout: true
      }
    }

  });

  grunt.registerTask('deps', 'closureDepsWriter');

  grunt.registerTask('build', 'closureBuilder:build concat:dist copy:build');

  grunt.registerTask('test', 'Test using mocha-phantom',
    'shell:mochaPhantom');

  grunt.registerTask('default', 'test');

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

