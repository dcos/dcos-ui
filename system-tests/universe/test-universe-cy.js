describe("Universe", () => {
  describe("on catalog/packages", () => {
    beforeEach(() => {
      cy.visitUrl("catalog/packages");
    });

    // we run this first, so the plan-check down below does not need to wait for so long.
    it("uses advanced install to deploy a certified package", () => {
      const packageName = "confluent-kafka";
      const serviceName = `${Cypress.env("TEST_UUID")}-${packageName}`;

      // Click 'Find a the kafka package'
      cy.contains(packageName).click();

      // Check that this package is certified
      cy.contains("Certified");

      // Click the Review & Run button
      cy.contains("Review & Run").click();

      // Click Edit Config button
      cy.contains("Edit Config").click();

      // Find name input
      cy.get(".modal input[name=name]").retype(serviceName);

      // Wait for the new service to deploy
      cy.get(".modal").contains("Review & Run").click();
      cy.get(".modal").contains("Run Service").click();
      cy.get(".modal.modal-small").contains("Open Service").click();

      // Go to the root services page
      cy.visitUrl("services/overview");

      // Check that it appears in the service list
      cy.get(".page-body-content .service-table").contains(serviceName);
    });

    it("installs a certified package", () => {
      const packageName = "chronos";

      // Click 'Find a the kafka package'
      cy.contains(packageName).click();

      // Check that this package is certified
      cy.contains("Certified");

      // Click the Review & Run button
      cy.contains("Review & Run").click();
      cy.contains("Review & Run").click();
      cy.contains("Run Service").click();
      // Check that it appears in the service list
      cy.visitUrl("services/overview");
      cy.get(".page-body-content .service-table").contains(packageName);

      // Check that we cannot deploy with the same name again.
      cy.visitUrl("catalog/packages");
      cy.contains("Certified");
      cy.contains(packageName).click();
      cy.contains("Review & Run").click();
      cy.contains("Review & Run").click();
      cy.contains("Run Service").click();

      // Should give error that package already installed
      cy.get(".cosmosErrorMsg").contains(
        "A service with the same name already exists. Try a different name."
      );
    });

    it("installs a community package", () => {
      cy.get("button").contains("Community").click();

      cy.contains("bitbucket").click();

      // Check that this package is not certified
      cy.contains("Community");

      // Move to the config screen
      cy.contains("Review & Run").click();

      // Click the Continue button
      cy.get(".button-primary").contains("Continue").click();

      // Move to the review screen
      cy.contains("Review & Run").click();

      cy.contains("Run Service").click();

      cy.contains("Open Service").click();

      // Go to the root services page
      cy.visitUrl("services/overview");

      // Check that it appears in the service list
      cy.get(".page-body-content .service-table").contains("bitbucket");
    });
  });

  describe("on services/overview", () => {
    beforeEach(() => {
      cy.visitUrl("services/overview");
    });

    it("deletes an already installed package", () => {
      const serviceName = "bitbucket";

      // Click on the name of the package to delete
      cy.get(".page-body-content .service-table")
        .contains(serviceName)
        .get("a.table-cell-link-primary")
        .contains(serviceName)
        .click({ force: true });

      // Click delete in the dropdown
      cy.get(".page-header-actions .dropdown")
        .click()
        .get(".dropdown-menu-items")
        .scrollIntoView()
        .contains("Delete")
        .click();

      // Confirm the deletion
      cy.get(".modal.modal-small input").type(serviceName);
      cy.get(".modal.modal-small button.button-danger")
        .contains("Delete Service")
        .click();

      cy.get(".page-body-content .service-table")
        .contains(serviceName)
        .should("not.exist");
    });

    it("plan is displayed", () => {
      const packageName = "confluent-kafka";
      // Check that it appears in the service list
      cy.get(".page-body-content .service-table").contains(packageName).click();
      cy.get(".page-header-navigation-tabs").contains("Plans").click();
      cy.contains("broker (serial)");
    });
  });
});
