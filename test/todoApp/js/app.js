// Load our app
goog.provide('Todos.App');
goog.require('Todos.Router');
goog.require('Todos.models.Store');
goog.require('Todos.ctrls.Entries');
goog.require('Todos.views.Application');

console.log('app.js loaded');

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

