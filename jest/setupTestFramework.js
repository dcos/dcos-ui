import path from 'path';
import Enzyme from "enzyme";
import Adapter from "enzyme-adapter-react-16";

Enzyme.configure({ adapter: new Adapter() });

if (process.env.TEAMCITY_VERSION != null) {
  var jasmineReporters = require('jasmine-reporters/src/teamcity_reporter');
  jasmine.getEnv().addReporter(new jasmineReporters.TeamCityReporter());
} else if (process.env.JENKINS_VERSION != null) {
  var jasmineReporters = require('jasmine-reporters/src/junit_reporter');
  jasmine.getEnv().addReporter(new jasmineReporters.JUnitXmlReporter({
    savePath: path.join(__dirname, 'test-results'),
    consolidateAll: false,
    consolidate: true
  }));
}
