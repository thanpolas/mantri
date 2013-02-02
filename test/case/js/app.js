
// Define libraries.
// They will be included as soon as this method is invoked, find them in their
// respective global namespaces.
deppy.config({
	baseUrl: 'js/',
	paths: {
		jquery: 'assets/jquery.min',
		ember: 'lib/ember-latest.min',
		handlebars: '../assets/handlebars.min',
		text: 'lib/require/text',
		jasmine: '../assets/jasmine/jasmine',
		jasmine_html: '../assets/jasmine/jasmine-html',

    // http://stackoverflow.com/questions/9860512/emberjs-handlebars-precompiling
    hbsCompiled: 'lib/templates/hbsCompiled'
	},
});

// Load our app
goog.provide('Todos');
goog.require('Todos.Router');
goog.require('Todos.models.Store');
goog.require('Todos.ctrls.Entries');
goog.require('Todos.views.Application');


Todos.App = Ember.Application.create({
	VERSION: '1.0',
	rootElement: '#todoapp',
	// Load routes
	Router: Todos.Router,
	// Extend to inherit outlet support
	ApplicationController: Ember.Controller.extend(),
	ApplicationView: Todos.views.Application,
	entriesController: Todos.ctrls.Entries.create({
		store: new Todos.models.Store('todos-emberjs')
	}),
	ready: function() {
		this.initialize();
	}
});

