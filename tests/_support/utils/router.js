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
};
