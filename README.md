# Mantri

Traditionaλ JS Dependency System.

Mantri helps you manage your application's dependencies.

Visit http://mantrijs.com

[![Build Status](https://travis-ci.org/closureplease/mantri.png?branch=master)](https://travis-ci.org/closureplease/mantri)

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

Mantri consinsts of the Web API and the command line tools. The Web API will manage your application dependencies during development. The command line tools will build your application and calculate dependencies.

### Install

Install the global Command Line Interface of Mantri. You only need to run this command once, and possibly it needs superuser rights so `sudo` may be required:

```shell
npm install mantri-cli -g --silent
```

On your project, install the mantri library localy:

```shell
npm install mantri --silent --save-dev
```

Type `mantri` in the command line to get a list of available commands. Continue to the [Getting Started Guide][Getting Started].

### Two things to keep in mind

* Every time you edit or create a dependency declaration you need to run the [`mantriDeps`][mantriDeps] task or the `mantri deps` command to re-calculate your dependencies.

* Mantri is not meant to be used on your production environment. Whenever you want to deploy your app use the [`mantriBuild`][mantriBuild] task or the `mantri build` command to bundle and minify your application into one file.

## Hands On

The classical ToDo MVC application has been refactored to use the Mantri Dependency System. You can [find the repo  here][ToDoApp], or clone it:

```shell
git clone git@github.com:closureplease/todoAppMantri.git
```

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

## Full Documentation

... [can be found in the wiki][wiki] or view the same on a more cozy web version at [mantrijs.com][]

Start with the [Getting Started Guide][start-wiki] for a more detailed introduction.

## A Fair Warning

**Mantri** is fresh. So fresh the paint hasn't yet dried. We are in the `0.0.x` stage and the API may change radically in the future. Your comments, suggestions, use cases and love are more than required to drive this project forward. So please share your thoughts and concerns by opening an issue.



## Release History
- **v0.0.1**, *Mid Feb 2013*
  - Big Bang


[closure-tools]: https://developers.google.com/closure/ "Google Closure Tools"
[amd]: https://github.com/amdjs/amdjs-api/wiki/AMD "The Asynchronous Module Definition (AMD) API"
[commonjs]: http://www.commonjs.org/ "CommonJS Module System"
[wiki]: https://github.com/closureplease/mantri/wiki "Mantri Documentation home"
[config-wiki]: https://github.com/closureplease/mantri/wiki/The-Web-Configuration-File "The Mantri web configuration file"
[cli-wiki]: https://github.com/closureplease/mantri/wiki/Mantri-on-the-Command-Line "Mantri on the Command Line"
[start-wiki]: https://github.com/closureplease/mantri/wiki/Getting-Started-Guide "Mantri Getting Started Guide"
[web-wiki]: https://github.com/closureplease/mantri/wiki/Mantri-Web-API "Mantri's Web API"
[grunt-wiki]: https://github.com/closureplease/mantri/wiki/Mantri-As-a-Grunt-Plugin "Using Mantri as a Grunt Plugin"
[grunt]: http://gruntjs.com/
[Getting Started]: https://github.com/gruntjs/grunt/wiki/Getting-started
[package.json]: https://npmjs.org/doc/json.html
[DOMContentLoaded]: https://developer.mozilla.org/en-US/docs/Mozilla_event_reference/DOMContentLoaded_(event) "MDN DOMContentLoaded event"
[mantriDeps]: https://github.com/closureplease/mantri/wiki/Grunt-Task-mantriDeps "The mantriDeps grunt task"
[mantriBuild]: https://github.com/closureplease/mantri/wiki/Grunt-Task-mantriBuild "The mantriBuild grunt task"
[Gruntfile]: https://github.com/gruntjs/grunt/wiki/Sample-Gruntfile "Grunt's Gruntfile.js"
[ToDoApp]: https://github.com/thanpolas/todoAppMantri "The classical ToDo MVC app using Mantri's dependency management system"
[mantrijs.com]: http://mantrijs.com "Mantri Homepage"
