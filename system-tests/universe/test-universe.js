require("../_support/utils/ServicesUtil");
const { Timeouts } = require("../_support/constants");

describe("Universe", function() {
  beforeEach(() => {
    cy.visitUrl("catalog/packages");
  });

  afterEach(() => {
    cy.window().then(win => {
      win.location.href = "about:blank";
    });
  });

  it("installs a certified package", function() {
    const packageName = "confluent-kafka";

    // Click 'Find a the kafka package'
    cy.contains(packageName).click();

    // Check that this package is certified
    cy.contains("Certified");

    // Click the Review & Run button
    cy.contains("Review & Run").click();

    // Move to the review screen
    cy.contains("Review & Run").click();

    // Click the Run Service button
    cy.contains("Run Service").click();

    // Go to the root services page
    cy.visitUrl("services/overview");

    // Check that it appears in the service list
    cy.get(".page-body-content table", {
      timeout: Timeouts.SERVICE_DEPLOYMENT_TIMEOUT
    })
      .contains(packageName, { timeout: Timeouts.SERVICE_DEPLOYMENT_TIMEOUT })
      .should("exist");
  });

  it("sdk package has a plans tab", function() {
    const packageName = "confluent-kafka";
    // Go to the root services page
    cy.visitUrl("services/overview");

    // Check that it appears in the service list
    cy.get(".page-body-content table", {
      timeout: Timeouts.SERVICE_DEPLOYMENT_TIMEOUT
    })
      .contains(packageName, { timeout: Timeouts.SERVICE_DEPLOYMENT_TIMEOUT })
      .click();

    cy.get(".menu-tabbed-item")
      .contains("Plans", {
        timeout: Timeouts.SERVICE_DEPLOYMENT_TIMEOUT
      })
      .click();

    cy.get(".page-body-content .table-wrapper", {
      timeout: Timeouts.SERVICE_DEPLOYMENT_TIMEOUT
    }).should("exist");
  });

  it("fails to install a package with the same name", function() {
    const packageName = "confluent-kafka";

    // Click 'Find a the kafka package'
    cy.contains(packageName).click();

    // Check that this package is certified
    cy.contains("Certified");

    // Click the Review & Run button
    cy.contains("Review & Run").click();

    // Move to the review screen
    cy.contains("Review & Run").click();

    // Click the Run Service button
    cy.contains("Run Service").click();

    // Should give error that package already installed
    cy.get(".cosmosErrorMsg")
      .contains(
        "A service with the same name already exists. Try a different name."
      )
      .should("exist");
  });

  it("installs a community package", function() {
    const packageName = "bitbucket";

    // Click 'Find a the kafka package'
    cy.contains(packageName).click();

    // Check that this package is certified
    cy.contains("Community");

    // Click the Review & Run button
    cy.contains("Review & Run").click();

    // Move to the review screen
    cy.contains("Review & Run").click();

    // Click the Run Service button
    cy.contains("Run Service").click();

    // Go to the root services page
    cy.visitUrl("services/overview");

    // Check that it appears in the service list
    cy.get(".page-body-content table", {
      timeout: Timeouts.SERVICE_DEPLOYMENT_TIMEOUT
    })
      .contains(packageName, { timeout: Timeouts.SERVICE_DEPLOYMENT_TIMEOUT })
      .should("exist");
  });

  it("uses advanced install to deploy a certified package", function() {
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
    cy.get(".modal input[name=name]")
      .clear()
      .type(serviceName);

    // Wait for the new service to deploy
    cy.get(".modal")
      .contains("Review & Run")
      .click();
    cy.get(".modal")
      .contains("Run Service")
      .click();
    cy.get(".modal.modal-small")
      .contains("Open Service")
      .click();

    // Go to the root services page
    cy.visitUrl("services/overview");

    // Check that it appears in the service list
    cy.get(".page-body-content table", {
      timeout: Timeouts.SERVICE_DEPLOYMENT_TIMEOUT
    })
      .contains(serviceName, { timeout: Timeouts.SERVICE_DEPLOYMENT_TIMEOUT })
      .should("exist");
  });

  it("uses advanced install to deploy a community package", function() {
    const packageName = "bitbucket";
    const serviceName = `${Cypress.env("TEST_UUID")}-${packageName}`;

    // Click 'Find a the kafka package'
    cy.contains(packageName).click();

    // Check that this package is certified
    cy.contains("Community");

    // Click the Review & Run button
    cy.contains("Review & Run").click();

    // Click Edit Config button
    cy.contains("Edit Config").click();

    // Find name input
    cy.get(".modal input[name=name]")
      .clear()
      .type(serviceName);

    // Wait for the new service to deploy
    cy.get(".modal")
      .contains("Review & Run")
      .click();
    cy.get(".modal")
      .contains("Run Service")
      .click();
    cy.get(".modal.modal-small")
      .contains("Open Service")
      .click();

    // Go to the root services page
    cy.visitUrl("services/overview");

    // Check that it appears in the service list
    cy.get(".page-body-content table", {
      timeout: Timeouts.SERVICE_DEPLOYMENT_TIMEOUT
    })
      .contains(serviceName, { timeout: Timeouts.SERVICE_DEPLOYMENT_TIMEOUT })
      .should("exist");
  });

  it("deletes an already installed package", function() {
    const packageName = "bitbucket";
    const serviceName = `${Cypress.env("TEST_UUID")}-${packageName}`;

    cy.visitUrl("services/overview");

    // Click on the name of the package to delete
    cy.get(".page-body-content table")
      .getTableRowThatContains(serviceName)
      .get("a.table-cell-link-primary")
      .contains(serviceName)
      .click();

    // Click delete in the dropdown
    cy.get(".page-header-actions .dropdown")
      .click()
      .get(".dropdown-menu-items")
      .contains("Delete")
      .click();

    // Confirm the deletion
    cy.get(".modal.modal-small input").type(serviceName);
    cy.get(".modal.modal-small button.button-danger", {
      timeout: Timeouts.ANIMATION_TIMEOUT
    })
      .contains("Delete Service", { timeout: Timeouts.ANIMATION_TIMEOUT })
      .click();

    cy.get(".page-body-content table", {
      timeout: Timeouts.SERVICE_DEPLOYMENT_TIMEOUT
    })
      .contains(serviceName, { timeout: Timeouts.SERVICE_DEPLOYMENT_TIMEOUT })
      .should("not.exist");
  });
});
