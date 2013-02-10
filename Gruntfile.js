/*jshint camelcase:false */
/*
 * deppy
 * https://github.com/thanpolas/deppy
 *
 * Copyright (c) 2013 Thanasis Polychronakis
 * Licensed under the MIT license.
 */

var deppy = require('./tasks/grunt_deps');
var deppyBuild = require('./tasks/grunt_build');


module.exports = function( grunt ) {
  'use strict';

  deppy(grunt);
  deppyBuild(grunt);

  var externsPath = 'build/externs/';

  // grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-contrib-handlebars');
  grunt.loadNpmTasks('grunt-closure-tools');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');

  //
  // Grunt configuration:
  //
  //
  grunt.initConfig({
    // Project configuration
    // ---------------------
    //

    deppyDeps: {
      options: {

      },
      todoApp: {
        src: 'test/todoApp',
        dest: 'test/todoApp/deps.js'
      }
    },

    deppyBuild: {
      options: {

      },
      todoApp: {
        src: 'test/todoApp/deppyConf.json',
        dest: 'test/todoApp/js/dist/build.js'
      }
    },


    closureDepsWriter: {
      options: {
        closureLibraryPath: 'closure-library'
      },
      deppy: {
        output_file: 'lib/deps.js',
        options: {
          root_with_prefix: ['"lib ../../../lib"']
        }
      },
      todoApp: {
        options: {
          root_with_prefix: ['"test/todoApp/ ./"']
        },

        dest: 'test/todoApp/deps.js'

      }

    },

    watch: {
      autoBuild: {
        files: 'lib/**/*.js',
        tasks: ['build', 'test']
      },
      gruntFile: {
        files: ['Gruntfile.js', 'tasks/*.js'],
        tasks: ['deppyDeps']
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

  grunt.registerTask('deps', ['closureDepsWriter']);

  grunt.registerTask('build', ['closureBuilder:build', 'concat:dist', 'copy:build']);

  // Test using mocha-phantom
  grunt.registerTask('test', ['shell:mochaPhantom']);

  grunt.registerTask('default', ['test']);

  /**
   * Replaces the closure signature from the final built file.
   *
   * This is required so depsWriter operation on user's source base
   * will not break.
   *
   * @param  {string} contents The contents we want to parse and replace.
   * @return {string} replaced contents.
   */
  function hackClosureSig (contents) {
    var closureSig = 'var goog = goog || {}; // Identifies this file as the Closure base.';
    var JSreplace = 'var goog = {};';
    return contents.replace(closureSig, JSreplace);
  }

};

