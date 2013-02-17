/*jshint camelcase:false */
/*
 * mantri
 * https://github.com/thanpolas/mantri
 *
 * Copyright (c) 2013 Thanasis Polychronakis
 * Licensed under the MIT license.
 */

var mantri = require('./tasks/grunt_mantri'),
    compiler = require( 'superstartup-closure-compiler' );

var CLOSURE_LIBRARY = 'closure-library';

module.exports = function( grunt ) {
  'use strict';

  mantri(grunt);

  var externsPath = 'build/externs/';

  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-closure-tools');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  //
  // Grunt configuration:
  //
  //
  grunt.initConfig({
    // Project configuration
    // ---------------------
    //

    mantriDeps: {
      options: {

      },
      testCase: {
        src: 'test/case/js',
        dest: 'temp/deps.js'
      }
    },

    mantriBuild: {
      options: {

      },
      testCase: {
        options: {
          debug: false
        },
        src: 'test/case/mantriConf.json',
        dest: 'temp/testCase.build.js'
      }

    },
    closureDepsWriter: {
      options: {
        closureLibraryPath: 'closure-library'
      },
      mantri: {
        output_file: 'src/deps.js',
        options: {
          root_with_prefix: ['"src ../../../src"']
        }
      }

    },
    watch: {
      test: {
        files: ['dist/*.js', 'test/**/*.js'],
        tasks: ['test']
      }
    },

    /**
     *
     * BUILD PROCESS
     *
     *
     */

    tempFile: 'temp/compiled.js',
    distFile: 'dist/mantri.js',

    closureBuilder: {
      build: {
        options: {
          closureLibraryPath: CLOSURE_LIBRARY,
          inputs: ['src/main.js'],
          output_mode: 'script',
          namespaces: ['Mantri', 'mantri'],
          compile: true,
          compilerFile: compiler.getPathSS(),
          compilerOpts: {
            compilation_level: 'SIMPLE_OPTIMIZATIONS',
            externs: [externsPath + '*.js'],
            define: [
              '\'goog.DEBUG=false\'',
              '\'COMPILED=false\''
              ],
            warning_level: 'verbose',
            jscomp_off: [
              'checkTypes',
              'strictModuleDepCheck'
            ],
            summary_detail_level: 3,
            only_closure_dependencies: null,
            closure_entry_point: 'Mantri'
          }
        },
        src: ['src', CLOSURE_LIBRARY],
        dest: '<%= tempFile %>'
      }
    },

    concat: {
      dist: {
        src: ['src/core/closure-hacks.js', '<%= tempFile %>'],
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

    /**
     * TESTING
     *
     */

    connect: {
      test: {
        options: {
          port: 4242,
          base: './',
          keepalive: false
        }
      }
    },
    mochaPhantom: 'node_modules/mocha-phantomjs/bin/mocha-phantomjs' +
      ' http://localhost:4242/test/web/index.html',

    shell: {
      mochaPhantom: {
          command: '<%= mochaPhantom %>',
          options: {
            stdout: true
          }
      },
      mochaPhantomSpec: {
          command: '<%= mochaPhantom %> -R spec',
          options: {
            stdout: true
          }
      }
    },

    mochaTest: {
      gruntTasks: [ 'test/grunt-task/**/*.js' ]
    },

    mochaTestConfig: {
      gruntTasks: {
        options: {
          reporter: 'nyan'
        }
      }
    }


  });

  grunt.registerTask('deps', ['closureDepsWriter']);

  grunt.registerTask('build', ['closureBuilder:build', 'concat:dist', 'copy:build']);

  grunt.registerTask('test', 'Test all or specific targets', function(target) {
    var gruntTest = [
      'mantriDeps:testCase',
      'mantriBuild:testCase',
      'mantriBuild:testCase',
      'mochaTest:gruntTasks'
    ],
        webTest   = ['connect:test', 'shell:mochaPhantom'];

    switch( target ) {
      case 'tasks':
      case 'grunt':
      case 'node':
        grunt.task.run(gruntTest);
      break;
      case 'web':
        grunt.task.run(webTest);
      break;
      default:
        grunt.task.run(webTest);
        grunt.task.run(gruntTest);
      break;
    }

  });

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

