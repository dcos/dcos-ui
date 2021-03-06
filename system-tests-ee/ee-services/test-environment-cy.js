describe("Services", () => {
  /**
   * This tests ensures that the environment is clean and in a well-known state
   */
  describe("Environment", () => {
    beforeEach(() => {
      cy.visitUrl(`services/overview/%2F${Cypress.env("TEST_UUID")}`);
    });

    afterEach(() => {
      cy.window().then((win) => {
        win.location.href = "about:blank";
      });
    });

    it("contains no running services", () => {
      // We should have the 'No running services' panel
      cy.contains("No running services");

      // That should contain a 'Run a Service' button
      cy.get(".page-body-content .button-primary").contains("Run a Service");
    });
  });
});
