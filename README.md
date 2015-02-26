# Mantri

Traditionaλ JS Dependency System.

Mantri helps you manage your application's dependencies.

Visit http://mantrijs.com

[![Build Status](https://travis-ci.org/closureplease/mantri.png?branch=master)](https://travis-ci.org/closureplease/mantri)

[![NPM](https://nodei.co/npm/mantri.png?downloads=true)](https://npmjs.org/package/mantri)

> **Attention 0.1.x** The current 0.2.x version brings some rather breaking changes. [Read the migration guide for more information][migration].

## **Mantri** is...

* **✓** A Robust and discreet Dependency Management System.
* **✓** Synchronous. Everything is done before [DOMContentLoaded event][DOMContentLoaded] triggers.
* **✓** A [Grunt][] plugin.
* **✓** A command line tool.
* **✓** Cross-browser.

## **Mantri** does not...

* **✗** Dictate how you write your code. Vanilla JS, [AMD][], [commonJS][], knock yourselves out.
* **✗** Need any runtime on your production file.
* **✗** Need any dependency declarations in your production file.
* **✗** Have any problem moving around JS files or folders.
* **✗** Have any problem working with other dependency systems.
* **✗** Polute your namespace. *But you are free to if you want*.

## Getting Started

Mantri consists of the Web Runtime and the Command Line Tools. The Web Runtime's job is to load the files of your application during development. The Command Line Tools perform various tasks like building your application and calculating dependencies.

### Install

In order to get started, you'll want to install Mantri's command line interface (CLI) globally. You may need to use sudo (for OSX, *nix, BSD etc) or run your command shell as Administrator (for Windows) to do this.

```shell
npm install -g mantri-cli --silent
```
This will put the `mantri` command in your system path, allowing it to be run from any directory.

Note that installing `mantri-cli` does not install the mantri library! The job of the mantri CLI is simple: run the version of mantri which has been installed in your application. This allows multiple versions of mantri to be installed on the same machine simultaneously.

On your project, install the mantri library localy:

```shell
npm install mantri --silent --save-dev
```

Read the [Getting Started Guide][Getting Started] for a more detailed introduction.

### Two things to keep in mind

* Every time you edit or create a dependency declaration you need to run the [`mantriDeps`][mantriDeps] task or the `mantri deps` command to re-calculate your dependencies.

* Mantri is not meant to be used on your production environment. Whenever you want to deploy your app use the [`mantriBuild`][mantriBuild] task or the `mantri build` command to bundle and minify your application into one file.

## The Web API

Each file should provide a unique namespace and can require any number of other namespaces:

```js
goog.provide('app');

goog.require('app.router');
goog.require('app.controller');
goog.require('app.view');
```

Read more about the [web API in this wiki page][web-wiki]

## Dependencies

[Google Closure Tools][closure-tools] have a couple dependencies, which are reasonable enough for any developer:

* **Node** [Node.js 0.8.0](http://nodejs.org) or later.
* **Java** [Java 1.6](http://java.com/) or later.
* **Python** [Python 2.7](http://python.org/).

## Hands On

The classical ToDo MVC application has been refactored to use the Mantri Dependency System. You can [find the repo  here][ToDoApp], or clone it:

```shell
git clone git@github.com:closureplease/todoAppMantri.git
```

## Full Documentation

... [can be found in the wiki][wiki] or view the same on a more cozy web version at [mantrijs.com][]

Start with the [Getting Started Guide][start-wiki] for a more detailed introduction.

## Release History

- **v0.2.3**, *26 Feb 2015*
  - Upgraded all packages to latest.
- **v0.2.2**, *11 Nov 2013*
  - The web component will now warn if `mantriConf.json` could not be loaded.
- **v0.2.1**, *5 Nov 2013*
  - Added feature to use Closure Library in the codebase. Use the key `closureLibrary` and set the path.
- **v0.2.0**, *4 Nov 2013* **Breaking Changes** [Read the migration guide][migration].
  - New Feature: Can now build multiple targets ([Built-Modules][]).
  - Added support for SourceMaps, available through the `sourceMapFile` key.
  - Changed `mantriConf.json` keys:
    - `baseUrl` --> `jsRoot`
    - `libs` --> `vendorLibs`
    - `build.input` --> `build.src`
    - `build.exclude` --> `build.excludeVendor`
    - New key: `buildModules`
  - Changed format of `outputWrapper`, now uses Closure's pattern.
  - New experimental key `_noCompile`, to not perform any compilation steps.
  - Published web component on Bower repo.
- **v0.1.5**, *13 May 2013*
  - Fix bug in Firefox. Not a permanent fix, [issue will remain open](https://github.com/closureplease/mantri/issues/5), [bugzilla issue created](https://bugzilla.mozilla.org/show_bug.cgi?id=871719).
- **v0.1.1**, *12 Apr 2013*
  - Bug fixes on web component for IE6,7,8,9
- **v0.1.0**, *03 Apr 2013*
  - First stable version
  - Added CLI support
- **v0.0.1**, *Mid Feb 2013*
  - Big Bang


[closure-tools]: https://developers.google.com/closure/ "Google Closure Tools"
[amd]: https://github.com/amdjs/amdjs-api/wiki/AMD "The Asynchronous Module Definition (AMD) API"
[commonjs]: http://www.commonjs.org/ "CommonJS Module System"
[wiki]: https://github.com/closureplease/mantri/wiki "Mantri Documentation home"
[config-wiki]: https://github.com/closureplease/mantri/wiki/The-Web-Configuration-File "The Mantri web configuration file"
[cli-wiki]: https://github.com/closureplease/mantri/wiki/Mantri-on-the-Command-Line "Mantri on the Command Line"
[start-wiki]: https://github.com/closureplease/mantri/wiki/Getting-Started-Guide "Mantri Getting Started Guide"
[web-wiki]: https://github.com/closureplease/mantri/wiki#the-web-api "Mantri's Web API"
[grunt-wiki]: https://github.com/closureplease/mantri/wiki/Mantri-As-a-Grunt-Plugin "Using Mantri as a Grunt Plugin"
[grunt]: http://gruntjs.com/
[Getting Started]: http://mantrijs.com/getting-started/ "Mantri Getting Started guide"
[Grunt Getting Started]: https://github.com/gruntjs/grunt/wiki/Getting-started
[package.json]: https://npmjs.org/doc/json.html
[DOMContentLoaded]: https://developer.mozilla.org/en-US/docs/Mozilla_event_reference/DOMContentLoaded_(event) "MDN DOMContentLoaded event"
[mantriDeps]: https://github.com/closureplease/mantri/wiki/Grunt-Task-mantriDeps "The mantriDeps grunt task"
[mantriBuild]: https://github.com/closureplease/mantri/wiki/Grunt-Task-mantriBuild "The mantriBuild grunt task"
[Gruntfile]: https://github.com/gruntjs/grunt/wiki/Sample-Gruntfile "Grunt's Gruntfile.js"
[ToDoApp]: https://github.com/thanpolas/todoAppMantri "The classical ToDo MVC app using Mantri's dependency management system"
[mantrijs.com]: http://mantrijs.com "Mantri Homepage"
[built-modules]: http://thanpol.as/javascript/writing-modular-javascript-rewind/#the_builtmodule "The Built-Module - Writing Modular Javascript REWIND by Thanasis Polychronakis"
[sourcemaps]: SourceMaps-on-Mantri
[built modules]: Building-Multiple-Modules
[migration]: http://mantrijs.com/api/migrating-from-0.1.x-to-0.2.x/

