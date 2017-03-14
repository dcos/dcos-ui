const _routes = new Map();

module.exports = {
  clearRoutes() {
    _routes.clear();
  },

  route(routeRegEx, fixtureString) {
    _routes.set(routeRegEx, fixtureString);
    cy.route(...arguments);

    return this;
  },

  getAPIResponse(routeString, callback) {
    let selectedFilterString = null;

    _routes.forEach(function (fixtureString, routeRegEx) {
      if (routeRegEx.test(routeString)) {
        selectedFilterString = /^fx:(.*)/.exec(fixtureString)[1];
      }
    });

    if (selectedFilterString != null) {
      cy.fixture(selectedFilterString).should(function (fixture) {
        callback(fixture);
      });
    }
  }
};
