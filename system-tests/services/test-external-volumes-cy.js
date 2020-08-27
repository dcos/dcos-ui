describe("Services", () => {
  /**
   * Test the external volumes
   *
   * --- IMPORTANT NOTICE ---
   *
   * REMEMBER TO UPDATE num_vols_delete IN external-volumes/teardown
   * WHENEVER YOU ADD OR REMOVE A TEST CASE
   */
  describe("External Volumes", () => {
    afterEach(() => {
      cy.window().then((win) => {
        win.location.href = "about:blank";
      });
    });

    it("create an app with external volume", () => {
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
      cy.getFormGroupInputFor("Service ID *").type(
        `{selectall}{rightarrow}${serviceName}`
      );

      cy.getFormGroupInputFor("Memory (MiB) *").retype("64");
      cy.getFormGroupInputFor("Command").type(cmdline);

      // Select Universal Container Runtime (UCR)
      cy.contains("More Settings").click();
      cy.get("label").contains("Universal Container Runtime (UCR)").click();

      // Select Volumes section
      cy.get(".menu-tabbed-item").contains("Volumes").click();

      // Add an environment variable
      cy.contains("Add Volume").click();
      cy.get(".button.dropdown-toggle").click();
      cy.contains(
        ".dropdown-select-item-title",
        "External Persistent Volume"
      ).click();
      cy.getFormGroupInputFor("Name").type(volumeName);
      cy.getFormGroupInputFor("Size (GiB)").type("1");
      cy.getFormGroupInputFor("Container Path").type("test");

      // Click Review and Run
      cy.contains("Review & Run").click();

      // Run service
      cy.get("button.button-primary").contains("Run Service").click();

      // Wait for the table and the service to appear
      cy.get(".page-body-content .service-table").contains(serviceName);

      // Now click on the name
      cy.get(".page-body-content .service-table")
        .contains(serviceName)
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
      cy.getFormGroupInputFor("Service ID *").should(
        "have.value",
        `/${Cypress.env("TEST_UUID")}/${serviceName}`
      );

      cy.getFormGroupInputFor("Memory (MiB) *").should("have.value", "64");
      cy.getFormGroupInputFor("Command").should("have.value", cmdline);

      // Select Volumes section
      cy.get(".menu-tabbed-item").contains("Volumes").click();

      cy.getFormGroupInputFor("Name").should("have.value", volumeName);
      cy.getFormGroupInputFor("Size (GiB)").should("have.value", "1");
      cy.getFormGroupInputFor("Container Path").should("have.value", "test");
    });

    it.skip("create an app that is persistent after suspension", () => {
      // This service is created using the external-volumes/setup script
      const serviceName = "external-volumes-single";
      const message = `TEST_OUTPUT_${Cypress.env("TEST_UUID")}`;

      cy.visitUrl(
        `services/detail/%2F${Cypress.env("TEST_UUID")}%2F${serviceName}`
      );

      // Link is partly covered by another one, so we have to force it.
      cy.contains(`${Cypress.env("TEST_UUID")}_${serviceName}`).click({
        force: true,
      });

      cy.contains("Logs").click();
      cy.contains("button", "Output (stdout)").click();

      cy.contains(message);

      cy.visitUrl(
        `services/detail/%2F${Cypress.env("TEST_UUID")}%2F${serviceName}`
      );

      cy.get(".page-header-actions .dropdown")
        .click()
        .get(".dropdown-menu-items")
        .contains("Stop")
        .click();

      cy.contains("button", "Stop Service").click();

      cy.get(".page-header-actions .dropdown")
        .click()
        .get(".dropdown-menu-items")
        .contains("Resume")
        .click();

      cy.contains("button", "Resume Service").click();

      // Link is partly covered by another one, so we have to force it.
      cy.contains(`${Cypress.env("TEST_UUID")}_${serviceName}`).click({
        force: true,
      });

      cy.contains("Logs").click();
      cy.contains("button", "Output (stdout)").click();

      cy.contains(message + "\n" + message);
    });
  });
});
