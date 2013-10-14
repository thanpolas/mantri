
var fix = fix || {};
fix.conf = {};

fix.conf.plain = {
  vendorLibs: {
    jquery: '../assets/jquery.min',
    handlebars: '../assets/handlebars.min',
    ember: 'lib/ember-latest.min',
    jasmine: '../assets/jasmine/jasmine'
  }
};

fix.conf.baseUrl = {
  jsRoot: 'js/',
  vendorLibs: {
    jquery: '../assets/jquery.min',
    handlebars: '../assets/handlebars.min',
    ember: 'lib/ember-latest.min',
    jasmine: '../assets/jasmine/jasmine'
  }
};

fix.conf.baseUrlAbsolute = {
  jsRoot: '/js/',
  vendorLibs: {
    jquery: '../assets/jquery.min',
    handlebars: '../assets/handlebars.min',
    ember: 'lib/ember-latest.min',
    jasmine: '../assets/jasmine/jasmine'
  }
};

fix.conf.baseUrlDotSlash = {
  jsRoot: './',
  vendorLibs: {
    jquery: '../assets/jquery.min',
    handlebars: '../assets/handlebars.min',
    ember: 'lib/ember-latest.min',
    jasmine: '../assets/jasmine/jasmine'
  }
};
