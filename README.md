# Mantri

Traditionaλ JS Dependency System.

Mantri takes the powerful [Google Closure tools][closure-tools], hacks them and exposes a robust and developer friendly API to manage your projects' dependencies.

## **Mantri** is...

* **✓** A Robust and discreet Dependency Management System.
* **✓** A Javascript source bundling and minifying tool.
* **✓** An intuitive debugging tool.
* **✓** A [Grunt][] plugin.
* **✓** A command line tool (soon).
* **✓** Cross-browser. Really dude, even mosaic will work!.

## **Mantri** does not...

* **✗** Dictate how you write your code. Vanilla JS, [AMD][], [commonJS][], knock yourselves out.
* **✗** Leave any footprint on the final, production bundled file. No dependencies, no runtime requirements, not a single bit.
* **✗** Need to have any dependency declarations in your production file.
* **✗** have any problem working with other dependency systems.
* **✗** polute your namespace. *But you are free to if you want*.

## Quick Start Guide

Currently **Mantri** is only available as a Grunt plugin. Install it via npm:
```
npm install mantri --save-dev
```

And go to the [Mantri as a grunt plugin wiki][grunt-wiki] for the documentation.

## The Web API

Each javascript file provides a unique namespace and can require any number of other namespaces:

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

## A Fair Warning

**Mantri** is fresh. So fresh the paint hasn't yet dried. We are in the `0.0.x` stage and the API may change radically in the future. Your comments, suggestions, use cases and love are more than required to drive this project forward. So please share your thoughts and concerns by opening an issue.



## Release History
- **v0.0.1**, *Mid Feb 2013*
  - Big Bang


[closure-tools]: https://developers.google.com/closure/ "Google Closure Tools"
[amd]: https://github.com/amdjs/amdjs-api/wiki/AMD "The Asynchronous Module Definition (AMD) API"
[commonjs]: http://www.commonjs.org/ "CommonJS Module System"
[config-wiki]: https://github.com/thanpolas/mantri/wiki/The-Web-Configuration-File "The Mantri web configuration file"
[cli-wiki]: https://github.com/thanpolas/mantri/wiki/Mantri-on-the-Command-Line "Mantri on the Command Line"
[web-wiki]: https://github.com/thanpolas/mantri/wiki/Mantri-Web-API "Mantri's Web API"
[grunt-wiki]: https://github.com/thanpolas/mantri/wiki/Mantri-As-a-Grunt-Plugin "Using Mantri as a Grunt Plugin"
[grunt]: http://gruntjs.com/
[Getting Started]: https://github.com/gruntjs/grunt/wiki/Getting-started
[package.json]: https://npmjs.org/doc/json.html

