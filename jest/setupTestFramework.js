if (process.env.TEAMCITY_VERSION != null) {
  require('../node_modules/jasmine-reporters/src/jasmine.teamcity_reporter');
  jasmine.getEnv().addReporter(new jasmine.TeamcityReporter());
} else if (process.env.JENKINS_VERSION != null) {
  require('../node_modules/jasmine-reporters/src/jasmine.junit_reporter');
  jasmine.getEnv().addReporter(new jasmine.JUnitXmlReporter());
}
