import Jasmine from 'jasmine';

let jasmine = new Jasmine();
jasmine.loadConfigFile('spec/javascripts/support/jasmine.config.json');
jasmine.execute();