const _routes = new Map();

module.exports = {
  /**
   * Clears the private routes map of any previous values.
   *
   * @return {undefined}
   */
  clearRoutes() {
    _routes.clear();
  },

  /**
   * Define a fixture to be returned when the matched route is consumed. This
   * proxies Cypress' #route method.
   *
   * @param  {RegExp} routeRegEx - the regular expresison that Cypress will
   * use to match the route
   * @param  {String} fixtureString - the Cypress fixture string
   * @return {router} router instance
   */
  route(routeRegEx, fixtureString) {
    _routes.set(routeRegEx, fixtureString);
    cy.route(...arguments);

    return this;
  },

  /**
   * Retrieve the fixture for a given route.
   *
   * @param  {String} routeString - the route that should match the desired
   * fixture
   * @param  {Function} callback - the callback will receive the fixture
   * @return {undefined}
   */
  getAPIResponse(routeString, callback) {
    let desiredFixtureString = null;

    _routes.forEach(function(fixtureString, routeRegEx) {
      if (routeRegEx.test(routeString)) {
        // The desired fixture string will be the second element in the returned
        // array.
        desiredFixtureString = /^(?:fx|fixture):(.*)/.exec(fixtureString)[1];
      }
    });

    if (desiredFixtureString == null) {
      callback(null);

      return;
    }

    cy.fixture(desiredFixtureString).then(callback);
  }
};
