# Mantri

Traditionaλ JS Dependency System.

Mantri exposes a robust and developer friendly API to manage your projects' dependencies, by hacking the powerful [Google Closure Tools][closure-tools].


~~~~~~~~-----========= THE NOT READY YET RIBBON =========------~~~~~~~~

[![Build Status](https://travis-ci.org/thanpolas/mantri.png?branch=master)](https://travis-ci.org/thanpolas/mantri)

## **Mantri** is...

* **✓** A Robust and discreet Dependency Management System.
* **✓** Synchronous. Everything is done before [DOMContentLoaded event][DOMContentLoaded] triggers.
* **✓** A [Grunt][] plugin.
* **✓** A command line tool (soon).
* **✓** Cross-browser.

## **Mantri** does not...

* **✗** Dictate how you write your code. Vanilla JS, [AMD][], [commonJS][], knock yourselves out.
* **✗** Need any runtime on your production file.
* **✗** Need any dependency declarations in your production file.
* **✗** Have any problem moving around JS files or folders.
* **✗** Have any problem working with other dependency systems.
* **✗** Polute your namespace. *But you are free to if you want*.

## Quick Start

Currently **Mantri** is only available as a [Grunt][] plugin. Install it via npm:

```shell
npm install mantri --save-dev
```

After Mantri is installed, use the `mantriInit` grunt task to initialize your web app. If your web root is in the folder `www` here's what you need to do:

```shell
grunt mantriInit:www
```
You now need to edit the [Gruntfile.js][Gruntfile] and add the `mantriDeps` and `mantriBuild` tasks. More details on this in the [Mantri as a grunt plugin wiki][grunt-wiki].

### Two things to keep in mind

* Every time you create or edit a dependency declaration in your js app you need to run the [`mantriDeps`][mantriDeps] task to re-calculate your dependencies.

* Mantri is not meant to be used on your production environment. Whenever you want to deploy your app use the [`mantriBuild`][mantriBuild] task to bundle and minify your application into one file.

### Hands On

The classical ToDo MVC application has been refactored to use the Mantri Dependency System. You can [find the repo over here][ToDoApp], or clone it on the spot:

```shell
git clone git@github.com:thanpolas/todoAppMantri.git
```

Find the full [Documentation in the wiki][wiki].

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

* **Java** [Java 1.6](http://java.com/) or later.
* **Python** [Python 2.7](http://python.org/).

## Full Documentation

... [can be found in the wiki](https://github.com/thanpolas/mantri/wiki)

Start with the [Getting Started Guide][start-wiki] for a more detailed introduction.

## A Fair Warning

**Mantri** is fresh. So fresh the paint hasn't yet dried. We are in the `0.0.x` stage and the API may change radically in the future. Your comments, suggestions, use cases and love are more than required to drive this project forward. So please share your thoughts and concerns by opening an issue.



## Release History
- **v0.0.1**, *Mid Feb 2013*
  - Big Bang


[closure-tools]: https://developers.google.com/closure/ "Google Closure Tools"
[amd]: https://github.com/amdjs/amdjs-api/wiki/AMD "The Asynchronous Module Definition (AMD) API"
[commonjs]: http://www.commonjs.org/ "CommonJS Module System"
[wiki]: https://github.com/thanpolas/mantri/wiki "Mantri Documentation home"
[config-wiki]: https://github.com/thanpolas/mantri/wiki/The-Web-Configuration-File "The Mantri web configuration file"
[cli-wiki]: https://github.com/thanpolas/mantri/wiki/Mantri-on-the-Command-Line "Mantri on the Command Line"
[start-wiki]: https://github.com/thanpolas/mantri/wiki/Getting-Started-Guide "Mantri Getting Started Guide"
[web-wiki]: https://github.com/thanpolas/mantri/wiki/Mantri-Web-API "Mantri's Web API"
[grunt-wiki]: https://github.com/thanpolas/mantri/wiki/Mantri-As-a-Grunt-Plugin "Using Mantri as a Grunt Plugin"
[grunt]: http://gruntjs.com/
[Getting Started]: https://github.com/gruntjs/grunt/wiki/Getting-started
[package.json]: https://npmjs.org/doc/json.html
[DOMContentLoaded]: https://developer.mozilla.org/en-US/docs/Mozilla_event_reference/DOMContentLoaded_(event) "MDN DOMContentLoaded event"
[mantriDeps]: https://github.com/thanpolas/mantri/wiki/Grunt-Task-mantriDeps "The mantriDeps grunt task"
[mantriBuild]: https://github.com/thanpolas/mantri/wiki/Grunt-Task-mantriBuild "The mantriBuild grunt task"
[Gruntfile]: https://github.com/gruntjs/grunt/wiki/Sample-Gruntfile "Grunt's Gruntfile.js"
[ToDoApp]: https://github.com/thanpolas/todoAppMantri "The classical ToDo MVC app using Mantri's dependency management system"
