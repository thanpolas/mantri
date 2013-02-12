# deppy

A Javascript dependency management system for everyone.

## Status

Very early on, barely finished scaffolding.# deppy

> Simple Dependency Management for Javascript

## Getting Started
_If you haven't used [grunt][] before, be sure to check out the [Getting Started][] guide._

TBD...

If the plugin has been installed correctly, running `grunt --help` at the command line should list the newly-installed plugin's task or tasks. In addition, the plugin should be listed in package.json as a `devDependency`, which ensures that it will be installed whenever the `npm install` command is run.

[grunt]: http://gruntjs.com/
[Getting Started]: https://github.com/gruntjs/grunt/blob/devel/docs/getting_started.md
[package.json]: https://npmjs.org/doc/json.html

## The "deppy" task

### Overview
In your project's Gruntfile, add a section named `deppy` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  deppy: {
    options: {
      // Task-specific options go here.
    },
    your_target: {
      // Target-specific file lists and/or options go here.
    },
  },
})
```

### Options

#### options.separator
Type: `String`
Default value: `',  '`

A string value that is used to do something with whatever.

#### options.punctuation
Type: `String`
Default value: `'.'`

A string value that is used to do something else with whatever else.

### Usage Examples

#### Default Options
In this example, the default options are used to do something with whatever. So if the `testing` file has the content `Testing` and the `123` file had the content `1 2 3`, the generated result would be `Testing, 1 2 3.`

```js
grunt.initConfig({
  deppy: {
    options: {},
    files: {
      'dest/default_options': ['src/testing', 'src/123'],
    },
  },
})
```

#### Build Options

```js
deppyBuild: {
  options: {
  },
  target: {
    src: 'filepath/to/deppyConf.js',

    // [OPTIONAL] if not set will output to stdout
    dest: 'any/destination/file.js'
  },
}
```

#### Deppy Configuration file

```js
{
  baseUrl: 'folder/',
  paths: {
    library: 'path/file'
  },
  build: {
    input: 'boostrap/file.js',

    dest: 'path/dest.js'
  }
}
```


## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt][].

## Release History
_(Nothing yet)_
