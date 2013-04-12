
var fix = fix || {};
fix.conf = {};

fix.conf.plain = {
  libs: {
    jquery: '../assets/jquery.min',
    handlebars: '../assets/handlebars.min',
    ember: 'lib/ember-latest.min',
    jasmine: '../assets/jasmine/jasmine'
  }
};

fix.conf.baseUrl = {
  baseUrl: 'js/',
  libs: {
    jquery: '../assets/jquery.min',
    handlebars: '../assets/handlebars.min',
    ember: 'lib/ember-latest.min',
    jasmine: '../assets/jasmine/jasmine'
  }
};

fix.conf.baseUrlAbsolute = {
  baseUrl: '/js/',
  libs: {
    jquery: '../assets/jquery.min',
    handlebars: '../assets/handlebars.min',
    ember: 'lib/ember-latest.min',
    jasmine: '../assets/jasmine/jasmine'
  }
};

fix.conf.baseUrlDotSlash = {
  baseUrl: './',
  libs: {
    jquery: '../assets/jquery.min',
    handlebars: '../assets/handlebars.min',
    ember: 'lib/ember-latest.min',
    jasmine: '../assets/jasmine/jasmine'
  }
};
