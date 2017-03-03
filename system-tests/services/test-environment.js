describe('Services', function () {

  /**
   * This tests ensures that the environment is clean and in a well-known state
   */
  describe('Environment', function () {

    beforeEach(function () {
      cy
        .visitUrl(`services/overview/%2F${Cypress.env('TEST_UUID')}`);
    });

    it('should contain no running services', function () {
      // We should have the 'No running services' panel
      cy
        .contains('No running services')
        .should('exist');

      // That should contain a 'Run a Service' button
      cy
        .get('.page-body-content .button-success')
        .contains('Run a Service')
        .click();

      // That wen clicked, opens the 'Create Service' modal
      cy
        .get('.modal-full-screen-header-title')
        .contains('Run a Service')
        .should('exist');
    });

  });

});
