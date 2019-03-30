require("../_support");
require("../_support/utils/ServicesUtil");
const { Timeouts } = require("../_support/constants");

describe("Services", function() {
  /**
   * Test the external volumes
   *
   * --- IMPORTANT NOTICE ---
   *
   * REMEMBER TO UPDATE num_vols_delete IN external-volumes/teardown
   * WHENEVER YOU ADD OR REMOVE A TEST CASE
   */
  describe("External Volumes", function() {
    afterEach(() => {
      cy.window().then(win => {
        win.location.href = "about:blank";
      });
    });

    it("create an app with external volume", function() {
      cy.visitUrl(`services/overview/%2F${Cypress.env("TEST_UUID")}/create`);
      cy.server()
        .route("POST", /\/service\/marathon\/v2\/apps/)
        .as("appsReq");

      const serviceName = "app-with-external-volume";
      const cmdline =
        "while true ; do echo 'test' > test/echo ; sleep 100 ; done";
      const volumeName = `dcos-system-test-${Cypress.env(
        "TEST_UUID"
      )}-${serviceName}`;

      // Select 'Single Container'
      cy.contains("Single Container").click();

      // Fill-in the input elements
      cy.root()
        .getFormGroupInputFor("Service ID *")
        .type(`{selectall}{rightarrow}${serviceName}`);

      cy.root()
        .getFormGroupInputFor("Memory (MiB) *")
        .type("{selectall}64");
      cy.root()
        .getFormGroupInputFor("Command")
        .type(cmdline);

      // Select Universal Container Runtime (UCR)
      cy.contains("More Settings").click();
      cy.get("label")
        .contains("Universal Container Runtime (UCR)")
        .click();

      // Select Volumes section
      cy.root()
        .get(".menu-tabbed-item")
        .contains("Volumes")
        .click();

      // Add an environment variable
      cy.contains("Add Volume").click();
      cy.get(".button.dropdown-toggle").click();
      cy.root()
        .contains(".dropdown-select-item-title", "External Persistent Volume")
        .click();
      cy.root()
        .getFormGroupInputFor("Name")
        .type(volumeName);
      cy.root()
        .getFormGroupInputFor("Size (GiB)")
        .type("1");
      cy.root()
        .getFormGroupInputFor("Container Path")
        .type("test");

      // Click Review and Run
      cy.contains("Review & Run").click();

      // Run service
      cy.get("button.button-primary")
        .contains("Run Service")
        .click();

      // Wait for the table and the service to appear
      cy.get(".page-body-content table")
        .contains(serviceName, { timeout: Timeouts.SERVICE_DEPLOYMENT_TIMEOUT })
        .should("exist");

      // Now click on the name
      cy.get(".page-body-content table")
        .getTableRowThatContains(serviceName)
        .get("a.table-cell-link-primary")
        .contains(serviceName)
        .click();

      // Open edit screen
      cy.get(".page-header-actions .dropdown")
        .click()
        .get(".dropdown-menu-items")
        .contains("Edit")
        .click();

      // Check if values are as expected
      cy.root()
        .getFormGroupInputFor("Service ID *")
        .should("have.value", `/${Cypress.env("TEST_UUID")}/${serviceName}`);

      cy.root()
        .getFormGroupInputFor("Memory (MiB) *")
        .should("have.value", "64");
      cy.root()
        .getFormGroupInputFor("Command")
        .should("have.value", cmdline);

      // Select Volumes section
      cy.root()
        .get(".menu-tabbed-item")
        .contains("Volumes")
        .click();

      cy.root()
        .getFormGroupInputFor("Name")
        .should("have.value", volumeName);
      cy.root()
        .getFormGroupInputFor("Size (GiB)")
        .should("have.value", "1");
      cy.root()
        .getFormGroupInputFor("Container Path")
        .should("have.value", "test");
    });

    it.skip("create an app that is persistent after suspension", function() {
      // This service is created using the external-volumes/setup script
      const serviceName = "external-volumes-single";
      const message = `TEST_OUTPUT_${Cypress.env("TEST_UUID")}`;

      cy.visitUrl(
        `services/detail/%2F${Cypress.env("TEST_UUID")}%2F${serviceName}`
      );

      // Link is partly covered by another one, so we have to force it.
      cy.contains(`${Cypress.env("TEST_UUID")}_${serviceName}`).click({
        force: true
      });

      cy.contains("Logs").click();
      cy.contains("button", "Output (stdout)").click();

      cy.contains(message).should("exist");

      cy.visitUrl(
        `services/detail/%2F${Cypress.env("TEST_UUID")}%2F${serviceName}`
      );

      cy.get(".page-header-actions .dropdown")
        .click()
        .get(".dropdown-menu-items")
        .contains("Stop")
        .click();

      cy.root()
        .contains("button", "Stop Service")
        .click();

      cy.get(".page-header-actions .dropdown")
        .click()
        .get(".dropdown-menu-items")
        .contains("Resume")
        .click();

      cy.contains("button", "Resume Service").click();

      // Link is partly covered by another one, so we have to force it.
      cy.contains(`${Cypress.env("TEST_UUID")}_${serviceName}`).click({
        force: true
      });

      cy.contains("Logs").click();
      cy.contains("button", "Output (stdout)").click();

      cy.contains(message + "\n" + message).should("exist");
    });
  });
});
