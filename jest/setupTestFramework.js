import path from "path";
import Enzyme from "enzyme";
import Adapter from "enzyme-adapter-react-15.4";

Enzyme.configure({ adapter: new Adapter() });

let jasmineReporters;
if (process.env.TEAMCITY_VERSION != null) {
  jasmineReporters = require("jasmine-reporters/src/teamcity_reporter");

  jasmine.getEnv().addReporter(new jasmineReporters.TeamCityReporter());
} else if (process.env.JENKINS_VERSION != null) {
  jasmineReporters = require("jasmine-reporters/src/junit_reporter");

  jasmine.getEnv().addReporter(
    new jasmineReporters.JUnitXmlReporter({
      savePath: path.join(__dirname, "test-results"),
      consolidateAll: false,
      consolidate: true
    })
  );
}
