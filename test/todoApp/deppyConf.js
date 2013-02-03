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
    // http://stackoverflow.com/questions/9469235/is-it-possible-to-load-a-handlebars-template-via-ajax
    hbsCompiled: 'lib/templates/hbsCompiled'
  },
});
