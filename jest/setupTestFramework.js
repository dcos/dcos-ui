if (process.env.TEAMCITY_VERSION != null) {
  var jasmineReporters = require('jasmine-reporters/src/teamcity_reporter');
  jasmine.getEnv().addReporter(new jasmineReporters.TeamCityReporter());
} else if (process.env.JENKINS_VERSION != null) {
  var jasmineReporters = require('jasmine-reporters/src/junit_reporter');
  jasmine.getEnv().addReporter(new jasmineReporters.JUnitXmlReporter());
}
