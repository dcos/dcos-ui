require("../_support/utils/ServicesUtil");
const { Timeouts } = require("../_support/constants");

describe("Services", function() {
  /**
   * Test the applications
   */
  describe("Applications", function() {
    beforeEach(function() {
      cy.visitUrl(`services/overview/%2F${Cypress.env("TEST_UUID")}/create`);
      cy.server().route("POST", /\/service\/marathon\/v2\/apps/).as("appsReq");
    });

    afterEach(() => {
      cy.window().then(win => {
        win.location.href = "about:blank";
      });
    });

    function selectMesosRuntime() {
      cy.contains("More Settings").click();
      cy.get("label").contains("Universal Container Runtime (UCR)").click();
    }

    it("creates a simple app", function() {
      const serviceName = "app-with-inline-shell-script";
      const cmdline = "while true; do echo 'test' ; sleep 100 ; done";

      // Select 'Single Container'
      cy.contains("Single Container").click();

      // Select Universal Container Runtime (UCR)
      selectMesosRuntime();

      // Fill-in the input elements
      cy
        .root()
        .getFormGroupInputFor("Service ID *")
        .type(`{selectall}{rightarrow}${serviceName}`);
      //
      // TODO: Due to a bug in cypress you cannot type values with dots
      // cy
      //   .get('input[name=cpus]')
      //   .type('{selectall}0.5');
      //
      cy.root().getFormGroupInputFor("Memory (MiB) *").type("{selectall}10");
      cy.root().getFormGroupInputFor("Command").type(cmdline).blur();

      // Click Review and Run
      cy
        .get("button.button-primary")
        .contains("Review & Run")
        .click({ timeout: Timeouts.ANIMATION_TIMEOUT });

      // Run service
      cy
        .get("button.button-primary")
        .contains("Run Service")
        .click({ timeout: Timeouts.ANIMATION_TIMEOUT });

      // Wait for the table and the service to appear
      cy
        .get(".page-body-content table", {
          timeout: Timeouts.SERVICE_DEPLOYMENT_TIMEOUT
        })
        .contains(serviceName, { timeout: Timeouts.SERVICE_DEPLOYMENT_TIMEOUT })
        .should("exist");

      // Now click on the name
      cy
        .get(".page-body-content table")
        .getTableRowThatContains(serviceName)
        .get("a.table-cell-link-primary")
        .contains(serviceName)
        .click();

      // open edit screen
      cy
        .get(".page-header-actions .dropdown")
        .click()
        .get(".dropdown-menu-items")
        .contains("Edit")
        .click();

      // check if values are as expected
      cy
        .root()
        .getFormGroupInputFor("Service ID *")
        .should("have.value", `/${Cypress.env("TEST_UUID")}/${serviceName}`);

      // TODO: Due to a bug in cypress you cannot type values with dots
      // cy
      //   .getFormGroupInputFor('CPUs *')
      //   .contents('equal', '0.5');

      cy
        .root()
        .getFormGroupInputFor("Memory (MiB) *")
        .should("have.value", "10");

      // Test Universal Container Runtime (UCR) again? should be tested before...
    });

    it("fails create the same app name again", function() {
      // same as above
      const serviceName = "app-with-inline-shell-script";
      const cmdline = "while true; do echo 'test' ; sleep 100 ; done";
      const dangerMessage = `An app with id [/${Cypress.env("TEST_UUID")}/${serviceName}] already exists.`;

      // Select 'Single Container'
      cy.contains("Single Container").click();

      // Select Universal Container Runtime (UCR)
      selectMesosRuntime();

      // Fill-in the input elements
      cy
        .root()
        .getFormGroupInputFor("Service ID *")
        .type(`{selectall}{rightarrow}${serviceName}`);

      cy.root().getFormGroupInputFor("Command").type(cmdline).blur();

      // Check JSON view
      cy.contains("JSON Editor").click();

      // Click Review and Run
      cy
        .get("button.button-primary")
        .contains("Review & Run")
        .click({ timeout: Timeouts.ANIMATION_TIMEOUT });

      // Run service
      cy
        .get("button.button-primary")
        .contains("Run Service")
        .click({ timeout: Timeouts.ANIMATION_TIMEOUT });

      // Also no Error should exist
      cy
        .get(".message-danger", {
          timeout: Timeouts.SERVICE_DEPLOYMENT_TIMEOUT
        })
        .contains(dangerMessage, {
          timeout: Timeouts.SERVICE_DEPLOYMENT_TIMEOUT
        })
        .should("exist");
    });

    it("creates an app with artifacts", function() {
      const serviceName = "app-with-artifacts";
      const cmdline = "while true; do echo 'test' ; sleep 100 ; done";

      // Select 'Single Container'
      cy.contains("Single Container").click();

      // Select Universal Container Runtime (UCR)
      selectMesosRuntime();

      // Fill-in the input elements
      cy
        .root()
        .getFormGroupInputFor("Service ID *")
        .type(`{selectall}{rightarrow}${serviceName}`);
      //
      // TODO: Due to a bug in cypress you cannot type values with dots
      // cy
      //   .root()
      //   .getFormGroupInputFor('CPUs *')
      //   .type('{selectall}0.1');
      //
      cy.root().getFormGroupInputFor("Memory (MiB) *").type("{selectall}10");
      cy.root().getFormGroupInputFor("Command").type(cmdline);

      // Use some artifacts
      cy.contains("Add Artifact").click();
      cy
        .get('input[name="fetch.0.uri"]')
        .type("http://lorempicsum.com/simpsons/600/400/1");
      cy.contains("Add Artifact").click();
      cy
        .get('input[name="fetch.1.uri"]')
        .type("http://lorempicsum.com/simpsons/600/400/2");
      cy.contains("Add Artifact").click();
      cy
        .get('input[name="fetch.2.uri"]')
        .type("http://lorempicsum.com/simpsons/600/400/3");

      // Click Review and Run
      cy
        .get("button.button-primary")
        .contains("Review & Run")
        .click({ timeout: Timeouts.ANIMATION_TIMEOUT });

      // Run service
      cy
        .get("button.button-primary")
        .contains("Run Service")
        .click({ timeout: Timeouts.ANIMATION_TIMEOUT });

      // Wait for the table and the service to appear
      cy
        .get(".page-body-content table", {
          timeout: Timeouts.SERVICE_DEPLOYMENT_TIMEOUT
        })
        .contains(serviceName, {
          timeout: Timeouts.SERVICE_DEPLOYMENT_TIMEOUT
        })
        .should("exist");

      // Now click on the name
      cy
        .get(".page-body-content table")
        .getTableRowThatContains(serviceName)
        .get("a.table-cell-link-primary")
        .contains(serviceName)
        .click();

      // open edit screen
      cy
        .get(".page-header-actions .dropdown")
        .click()
        .get(".dropdown-menu-items")
        .contains("Edit")
        .click();

      // check if values are as expected
      cy
        .root()
        .getFormGroupInputFor("Service ID *")
        .should("have.value", `/${Cypress.env("TEST_UUID")}/${serviceName}`);
      cy
        .root()
        .getFormGroupInputFor("Memory (MiB) *")
        .should("have.value", "10");
      cy.root().getFormGroupInputFor("Command").should("have.value", cmdline);

      cy
        .root()
        .get('input[name="fetch.0.uri"]')
        .should("have.value", "http://lorempicsum.com/simpsons/600/400/1");

      cy
        .root()
        .get('input[name="fetch.1.uri"]')
        .should("have.value", "http://lorempicsum.com/simpsons/600/400/2");

      cy
        .root()
        .get('input[name="fetch.2.uri"]')
        .should("have.value", "http://lorempicsum.com/simpsons/600/400/3");
    });

    it.skip("creates an app with command health check", function() {
      const serviceName = "app-with-command-health-check";

      // Select 'Single Container'
      cy.contains("Single Container").click();

      // Fill-in the input elements
      cy
        .root()
        .getFormGroupInputFor("Service ID *")
        .type(`{selectall}{rightarrow}${serviceName}`);
      cy.root().getFormGroupInputFor("Container Image").type("nginx");
      //
      // TODO: Due to a bug in cypress you cannot type values with dots
      // cy
      //   .get('input[name=cpus]')
      //   .type('{selectall}0.5');
      //
      cy.root().getFormGroupInputFor("Memory (MiB) *").type("{selectall}32");

      // Select Networking section
      cy.root().get(".menu-tabbed-item").contains("Networking").click();

      // Select "Bridge"
      cy.root().getFormGroupInputFor("Network Type").select("Bridge");

      // Click "Add Service Endpoint"
      cy.contains("Add Service Endpoint").click();
      cy.root().getFormGroupInputFor("Container Port").type("80");

      // Switch to health checks
      cy.contains("Health Checks").click();

      // Add a health check
      cy.contains("Add Health Check").click();
      cy.root().getFormGroupInputFor("Protocol").select("Command");
      cy.root().getFormGroupInputFor("Command").type("sleep 5; exit 0");

      // Click Review and Run
      cy
        .get("button.button-primary")
        .contains("Review & Run")
        .click({ timeout: Timeouts.ANIMATION_TIMEOUT });

      // Run service
      cy
        .get("button.button-primary")
        .contains("Run Service")
        .click({ timeout: Timeouts.ANIMATION_TIMEOUT });

      // Wait for the table and the service to appear
      cy
        .get(".page-body-content table")
        .contains(serviceName, { timeout: Timeouts.SERVICE_DEPLOYMENT_TIMEOUT })
        .should("exist")
        .as(serviceName);

      cy
        .get("@serviceName")
        .parents("tr")
        .first()
        .contains("Running", { timeout: Timeouts.SERVICE_DEPLOYMENT_TIMEOUT })
        .should("exist");

      // Now click on the name
      cy
        .get(".page-body-content table")
        .getTableRowThatContains(serviceName)
        .get("a.table-cell-link-primary")
        .contains(serviceName)
        .click();

      // open edit screen
      cy
        .get(".page-header-actions .dropdown")
        .click()
        .get(".dropdown-menu-items")
        .contains("Edit")
        .click();

      // check if values are as expected
      cy
        .root()
        .getFormGroupInputFor("Service ID *")
        .should("have.value", `/${Cypress.env("TEST_UUID")}/${serviceName}`);

      cy
        .root()
        .getFormGroupInputFor("Container Image")
        .should("have.value", "nginx");

      cy
        .root()
        .getFormGroupInputFor("Memory (MiB) *")
        .should("have.value", "32");

      // Select Networking section
      cy.root().get(".menu-tabbed-item").contains("Networking").click();

      // Select "Bridge"
      cy
        .root()
        .getFormGroupInputFor("Network Type")
        .should("have.value", "BRIDGE");

      // Click "Add Service Endpoint"
      cy.contains("Add Service Endpoint").click();
      cy
        .root()
        .getFormGroupInputFor("Container Port")
        .should("have.value", "80");

      // Switch to health checks
      cy.contains("Health Checks").click();
      cy
        .root()
        .getFormGroupInputFor("Protocol")
        .should("have.value", "COMMAND");
      cy
        .root()
        .getFormGroupInputFor("Command")
        .should("have.value", "sleep 5; exit 0");
    });

    it("creates an app with docker config", function() {
      const serviceName = "app-with-docker-config";
      const cmdline = "python3 -m http.server 8080";

      // Select 'Single Container'
      cy.contains("Single Container").click();

      // Fill-in the input elements
      cy
        .root()
        .getFormGroupInputFor("Service ID *")
        .type(`{selectall}{rightarrow}${serviceName}`);
      cy.root().getFormGroupInputFor("Container Image").type("python:3");
      //
      // TODO: Due to a bug in cypress you cannot type values with dots
      // cy
      //   .get('input[name=cpus]')
      //   .type('{selectall}0.5');
      //
      cy.root().getFormGroupInputFor("Memory (MiB) *").type("{selectall}32");
      cy.root().getFormGroupInputFor("Command").type(cmdline);

      // Select Networking section
      cy.root().get(".menu-tabbed-item").contains("Networking").click();

      // Select "Bridge"
      cy.root().getFormGroupInputFor("Network Type").select("Bridge");

      // Click "Add Service Endpoint"
      cy.contains("Add Service Endpoint").click();

      // Setup HTTP endpoint
      cy.root().getFormGroupInputFor("Container Port").type("8080");
      cy.root().getFormGroupInputFor("Service Endpoint Name").type("http");

      // Check JSON view
      cy.contains("JSON Editor").click();

      // Click Review and Run
      cy
        .get("button.button-primary")
        .contains("Review & Run")
        .click({ timeout: Timeouts.ANIMATION_TIMEOUT });

      // Run service
      cy
        .get("button.button-primary")
        .contains("Run Service")
        .click({ timeout: Timeouts.ANIMATION_TIMEOUT });

      // Wait for the table and the service to appear
      cy
        .get(".page-body-content table")
        .contains(serviceName, { timeout: Timeouts.SERVICE_DEPLOYMENT_TIMEOUT })
        .should("exist");

      // Get the table row and wait until it's Running
      cy
        .get(".page-body-content table")
        .getTableRowThatContains(serviceName)
        .contains("Running", { timeout: Timeouts.SERVICE_DEPLOYMENT_TIMEOUT })
        .should("exist");

      // Now click on the name
      cy
        .get(".page-body-content table")
        .getTableRowThatContains(serviceName)
        .get("a.table-cell-link-primary")
        .contains(serviceName)
        .click();

      // open edit screen
      cy
        .get(".page-header-actions .dropdown")
        .click()
        .get(".dropdown-menu-items")
        .contains("Edit")
        .click();

      // check if values are as expected
      cy
        .root()
        .getFormGroupInputFor("Service ID *")
        .should("have.value", `/${Cypress.env("TEST_UUID")}/${serviceName}`);

      cy
        .root()
        .getFormGroupInputFor("Container Image")
        .should("have.value", "python:3");
      //
      // TODO: Due to a bug in cypress you cannot type values with dots
      // cy
      //   .get('input[name=cpus]')
      //   .type('{selectall}0.5');
      //
      cy
        .root()
        .getFormGroupInputFor("Memory (MiB) *")
        .should("have.value", "32");
      cy.root().getFormGroupInputFor("Command").should("have.value", cmdline);

      // Select Networking section
      cy.root().get(".menu-tabbed-item").contains("Networking").click();

      // Select "Bridge"
      cy
        .root()
        .getFormGroupInputFor("Network Type")
        .should("have.value", "BRIDGE");

      // Click "Add Service Endpoint"
      cy.contains("Add Service Endpoint").click();

      // Setup HTTP endpoint
      cy
        .root()
        .getFormGroupInputFor("Container Port")
        .should("have.value", "8080");
      cy
        .root()
        .getFormGroupInputFor("Service Endpoint Name")
        .should("have.value", "http");
    });

    it("creates an app with ucr config and docker container", function() {
      const serviceName = "app-with-ucr-config-and-docker-container";
      const cmdline = "python3 -m http.server 8080";

      // Select 'Single Container'
      cy.contains("Single Container").click();

      // Select Universal Container Runtime (UCR)
      selectMesosRuntime();

      // Fill-in the input elements
      cy
        .root()
        .getFormGroupInputFor("Service ID *")
        .type(`{selectall}{rightarrow}${serviceName}`);
      cy.root().getFormGroupInputFor("Container Image").type("python:3");

      // Hack to allow entering decimals in number fields
      cy.root().getFormGroupInputFor("CPUs *").invoke("attr", "type", "text");
      cy.root().getFormGroupInputFor("CPUs *").type("{selectall}0.5");
      cy.root().getFormGroupInputFor("CPUs *").invoke("attr", "type", "number");

      cy.root().getFormGroupInputFor("Memory (MiB) *").type("{selectall}32");
      cy.root().getFormGroupInputFor("Command").type(cmdline);

      // Select Networking section
      cy.root().get(".menu-tabbed-item").contains("Networking").click();

      // Select "Bridge"
      cy.root().getFormGroupInputFor("Network Type").select("Bridge");

      // Click "Add Service Endpoint"
      cy.contains("Add Service Endpoint").click();

      // Setup HTTP endpoint
      cy.root().getFormGroupInputFor("Container Port").type("8080");
      cy.root().getFormGroupInputFor("Service Endpoint Name").type("http");

      // Check JSON view
      cy.contains("JSON Editor").click();

      // Click Review and Run
      cy
        .get("button.button-primary")
        .contains("Review & Run")
        .click({ timeout: Timeouts.ANIMATION_TIMEOUT });

      // Run service
      cy
        .get("button.button-primary")
        .contains("Run Service")
        .click({ timeout: Timeouts.ANIMATION_TIMEOUT });

      // Wait for the table and the service to appear
      cy
        .get(".page-body-content table")
        .contains(serviceName, { timeout: Timeouts.SERVICE_DEPLOYMENT_TIMEOUT })
        .should("exist");

      // Get the table row and wait until it's Running
      cy
        .get(".page-body-content table")
        .getTableRowThatContains(serviceName)
        .contains("Running", { timeout: Timeouts.SERVICE_DEPLOYMENT_TIMEOUT })
        .should("exist");

      // Now click on the name
      cy
        .get(".page-body-content table")
        .getTableRowThatContains(serviceName)
        .get("a.table-cell-link-primary")
        .contains(serviceName)
        .click();

      // open edit screen
      cy
        .get(".page-header-actions .dropdown")
        .click()
        .get(".dropdown-menu-items")
        .contains("Edit")
        .click();

      // check if values are as expected
      cy
        .root()
        .getFormGroupInputFor("Service ID *")
        .should("have.value", `/${Cypress.env("TEST_UUID")}/${serviceName}`);

      cy
        .root()
        .getFormGroupInputFor("Container Image")
        .should("have.value", "python:3");

      cy
        .root()
        .getFormGroupInputFor("Memory (MiB) *")
        .should("have.value", "32");
      cy.root().getFormGroupInputFor("Command").should("have.value", cmdline);

      // Select Networking section
      cy.root().get(".menu-tabbed-item").contains("Networking").click();

      // Select "Bridge"
      cy
        .root()
        .getFormGroupInputFor("Network Type")
        .should("have.value", "BRIDGE");

      // Setup HTTP endpoint
      cy
        .root()
        .getFormGroupInputFor("Container Port")
        .should("have.value", "8080");
      cy
        .root()
        .getFormGroupInputFor("Service Endpoint Name")
        .should("have.value", "http");
    });

    it("creates an app with ucr config and command", function() {
      const serviceName = "app-with-ucr-config-and-command";
      const cmdline = "while true; do echo 'test' ; sleep 100 ; done";

      // Select 'Single Container'
      cy.contains("Single Container").click();

      // Select Universal Container Runtime (UCR)
      selectMesosRuntime();

      // Fill-in the input elements
      cy
        .root()
        .getFormGroupInputFor("Service ID *")
        .type(`{selectall}{rightarrow}${serviceName}`);

      // Hack to allow entering decimals in number fields
      cy.root().getFormGroupInputFor("CPUs *").invoke("attr", "type", "text");
      cy.root().getFormGroupInputFor("CPUs *").type("{selectall}0.5");
      cy.root().getFormGroupInputFor("CPUs *").invoke("attr", "type", "number");

      cy.root().getFormGroupInputFor("Memory (MiB) *").type("{selectall}32");
      cy.root().getFormGroupInputFor("Command").type(cmdline);

      // Select Networking section
      cy.root().get(".menu-tabbed-item").contains("Networking").click();

      // Select "Bridge"
      cy.root().getFormGroupInputFor("Network Type").select("Bridge");

      // Click "Add Service Endpoint"
      cy.contains("Add Service Endpoint").click();

      // Setup HTTP endpoint
      cy.root().getFormGroupInputFor("Container Port").type("8080");
      cy.root().getFormGroupInputFor("Service Endpoint Name").type("http");

      // Check JSON view
      cy.contains("JSON Editor").click();

      // Click Review and Run
      cy
        .get("button.button-primary")
        .contains("Review & Run")
        .click({ timeout: Timeouts.ANIMATION_TIMEOUT });

      // Run service
      cy
        .get("button.button-primary")
        .contains("Run Service")
        .click({ timeout: Timeouts.ANIMATION_TIMEOUT });

      // Wait for the table and the service to appear
      cy
        .get(".page-body-content table")
        .contains(serviceName, { timeout: Timeouts.SERVICE_DEPLOYMENT_TIMEOUT })
        .should("exist");

      // Get the table row and wait until it's Running
      cy
        .get(".page-body-content table")
        .getTableRowThatContains(serviceName)
        .contains("Running", { timeout: Timeouts.SERVICE_DEPLOYMENT_TIMEOUT })
        .should("exist");

      // Now click on the name
      cy
        .get(".page-body-content table")
        .getTableRowThatContains(serviceName)
        .get("a.table-cell-link-primary")
        .contains(serviceName)
        .click();

      // open edit screen
      cy
        .get(".page-header-actions .dropdown")
        .click()
        .get(".dropdown-menu-items")
        .contains("Edit")
        .click();

      // check if values are as expected
      cy
        .root()
        .getFormGroupInputFor("Service ID *")
        .should("have.value", `/${Cypress.env("TEST_UUID")}/${serviceName}`);

      cy
        .root()
        .getFormGroupInputFor("Container Image")
        .should("have.value", "");

      cy
        .root()
        .getFormGroupInputFor("Memory (MiB) *")
        .should("have.value", "32");
      cy.root().getFormGroupInputFor("Command").should("have.value", cmdline);

      // Select Networking section
      cy.root().get(".menu-tabbed-item").contains("Networking").click();

      // Select "Bridge"
      cy
        .root()
        .getFormGroupInputFor("Network Type")
        .should("have.value", "BRIDGE");

      // Setup HTTP endpoint
      cy
        .root()
        .getFormGroupInputFor("Container Port")
        .should("have.value", "8080");
      cy
        .root()
        .getFormGroupInputFor("Service Endpoint Name")
        .should("have.value", "http");
    });

    it("creates an app with environment variables", function() {
      const serviceName = "app-with-environment-variables";
      const cmdline = "while true; do echo 'test' ; sleep 100 ; done";

      // Select 'Single Container'
      cy.contains("Single Container").click();

      // Select Universal Container Runtime (UCR)
      selectMesosRuntime();

      // Fill-in the input elements
      cy
        .root()
        .getFormGroupInputFor("Service ID *")
        .type(`{selectall}{rightarrow}${serviceName}`);
      //
      // TODO: Due to a bug in cypress you cannot type values with dots
      // cy
      //   .get('input[name=cpus]')
      //   .type('{selectall}0.5');
      //
      cy.root().getFormGroupInputFor("Memory (MiB) *").type("{selectall}10");
      cy.root().getFormGroupInputFor("Command").type(cmdline);

      // Select Environment section
      cy.root().get(".menu-tabbed-item").contains("Environment").click();

      // Add an environment variable
      cy.contains("Add Environment Variable").click();
      cy.get('input[name="env.0.key"]').type("camelCase");
      cy.get('input[name="env.0.value"]').type("test");

      // Add an environment variable
      cy.contains("Add Environment Variable").click();
      cy.get('input[name="env.1.key"]').type("snake_case");
      cy.get('input[name="env.1.value"]').type("test");

      // Add an environment variable
      cy.contains("Add Environment Variable").click();
      cy.get('input[name="env.2.key"]').type("lowercase");
      cy.get('input[name="env.2.value"]').type("test");

      // Add an environment variable
      cy.contains("Add Environment Variable").click();
      cy.get('input[name="env.3.key"]').type("UPPERCASE");
      cy.get('input[name="env.3.value"]').type("test");

      // Click Review and Run
      cy
        .get("button.button-primary")
        .contains("Review & Run")
        .click({ timeout: Timeouts.ANIMATION_TIMEOUT });

      // Run service
      cy
        .get("button.button-primary")
        .contains("Run Service")
        .click({ timeout: Timeouts.ANIMATION_TIMEOUT });

      // Wait for the table and the service to appear
      cy
        .get(".page-body-content table")
        .contains(serviceName, { timeout: Timeouts.SERVICE_DEPLOYMENT_TIMEOUT })
        .should("exist");

      // Get the table row and wait until it's Running
      cy
        .get(".page-body-content table")
        .getTableRowThatContains(serviceName)
        .contains("Running", { timeout: Timeouts.SERVICE_DEPLOYMENT_TIMEOUT })
        .should("exist");

      // Now click on the name
      cy
        .get(".page-body-content table")
        .getTableRowThatContains(serviceName)
        .get("a.table-cell-link-primary")
        .contains(serviceName)
        .click();

      // open edit screen
      cy
        .get(".page-header-actions .dropdown")
        .click()
        .get(".dropdown-menu-items")
        .contains("Edit")
        .click();

      // check if values are as expected
      cy
        .root()
        .getFormGroupInputFor("Service ID *")
        .should("have.value", `/${Cypress.env("TEST_UUID")}/${serviceName}`);

      cy
        .root()
        .getFormGroupInputFor("Memory (MiB) *")
        .should("have.value", "10");
      cy.root().getFormGroupInputFor("Command").should("have.value", cmdline);

      // Select Environment section
      cy.root().get(".menu-tabbed-item").contains("Environment").click();

      cy.get('input[name="env.0.key"]').should("have.value", "camelCase");
      cy.get('input[name="env.0.value"]').should("have.value", "test");

      cy.get('input[name="env.1.key"]').should("have.value", "snake_case");
      cy.get('input[name="env.1.value"]').should("have.value", "test");

      cy.get('input[name="env.2.key"]').should("have.value", "lowercase");
      cy.get('input[name="env.2.value"]').should("have.value", "test");

      cy.get('input[name="env.3.key"]').should("have.value", "UPPERCASE");
      cy.get('input[name="env.3.value"]').should("have.value", "test");
    });

    it.skip("creates an app with HTTP health check", function() {
      const serviceName = "app-with-http-health-check";

      // Select 'Single Container'
      cy.contains("Single Container").click();

      // Fill-in the input elements
      cy
        .root()
        .getFormGroupInputFor("Service ID *")
        .type(`{selectall}{rightarrow}${serviceName}`);
      //
      // TODO: Due to a bug in cypress you cannot type values with dots
      // cy
      //   .get('input[name=cpus]')
      //   .type('{selectall}0.5');
      //
      cy.root().getFormGroupInputFor("Memory (MiB) *").type("{selectall}32");
      cy.root().getFormGroupInputFor("Container Image").type("nginx");

      // Select Networking section
      cy.root().get(".menu-tabbed-item").contains("Networking").click();

      // Select "Bridge"
      cy.root().getFormGroupInputFor("Network Type").select("Bridge");

      // Click "Add Service Endpoint"
      cy.contains("Add Service Endpoint").click();

      // Setup HTTP endpoint
      cy.root().getFormGroupInputFor("Container Port").type("80");
      cy.root().getFormGroupInputFor("Service Endpoint Name").type("http");

      // Switch to health checks
      cy.contains("Health Checks").click();

      // Add a health check
      cy.contains("Add Health Check").click();
      cy.root().getFormGroupInputFor("Protocol").select("HTTP");
      cy.root().getFormGroupInputFor("Service Endpoint").select("http");
      cy.root().getFormGroupInputFor("Path").type("/");

      // Click Review and Run
      cy
        .get("button.button-primary")
        .contains("Review & Run")
        .click({ timeout: Timeouts.ANIMATION_TIMEOUT });

      // Run service
      cy
        .get("button.button-primary")
        .contains("Run Service")
        .click({ timeout: Timeouts.ANIMATION_TIMEOUT });

      // Wait for the table and the service to appear
      cy
        .get(".page-body-content table")
        .contains(serviceName, { timeout: Timeouts.SERVICE_DEPLOYMENT_TIMEOUT })
        .should("exist")
        .as("serviceName");

      cy
        .get("@serviceName")
        .parents("tr")
        .first()
        .contains("Running", { timeout: Timeouts.SERVICE_DEPLOYMENT_TIMEOUT })
        .should("exist");

      // Now click on the name
      cy
        .get(".page-body-content table")
        .getTableRowThatContains(serviceName)
        .get("a.table-cell-link-primary")
        .contains(serviceName)
        .click();

      // open edit screen
      cy
        .get(".page-header-actions .dropdown")
        .click()
        .get(".dropdown-menu-items")
        .contains("Edit")
        .click();

      // check if values are as expected
      cy
        .root()
        .getFormGroupInputFor("Service ID *")
        .should("have.value", `/${Cypress.env("TEST_UUID")}/${serviceName}`);

      cy
        .root()
        .getFormGroupInputFor("Memory (MiB) *")
        .should("have.value", "32");
      cy
        .root()
        .getFormGroupInputFor("Container Image")
        .should("have.value", "nginx");

      // Select Networking section
      cy.root().get(".menu-tabbed-item").contains("Networking").click();

      // Select "Bridge"
      cy
        .root()
        .getFormGroupInputFor("Network Type")
        .should("have.value", "BRIDGE");

      // Click "Add Service Endpoint"
      cy.contains("Add Service Endpoint").click();

      // Setup HTTP endpoint
      cy
        .root()
        .getFormGroupInputFor("Container Port")
        .should("have.value", "80");

      cy
        .root()
        .getFormGroupInputFor("Service Endpoint Name")
        .should("have.value", "http");

      // Switch to health checks
      cy.contains("Health Checks").click();

      cy
        .root()
        .getFormGroupInputFor("Protocol")
        .should("have.value", "MESOS_HTTP");

      // maybe testing for text would be better here
      cy
        .root()
        .getFormGroupInputFor("Service Endpoint")
        .should("have.value", "0");

      cy.root().getFormGroupInputFor("Path").should("have.value", "/");
    });

    it("creates an app with labels", function() {
      const serviceName = "app-with-labels";
      const cmdline = "while true; do echo 'test' ; sleep 100 ; done";

      // Select 'Single Container'
      cy.contains("Single Container").click();

      // Select Universal Container Runtime (UCR)
      selectMesosRuntime();

      // Fill-in the input elements
      cy
        .root()
        .getFormGroupInputFor("Service ID *")
        .type(`{selectall}{rightarrow}${serviceName}`);
      //
      // TODO: Due to a bug in cypress you cannot type values with dots
      // cy
      //   .get('input[name=cpus]')
      //   .type('{selectall}0.5');
      //
      cy.root().getFormGroupInputFor("Memory (MiB) *").type("{selectall}10");
      cy.root().getFormGroupInputFor("Command").type(cmdline);

      // Select Environment section
      cy.root().get(".menu-tabbed-item").contains("Environment").click();

      // Add an environment variable
      cy.contains("Add Label").click();
      cy.get('input[name="labels.0.key"]').type("camelCase");
      cy.get('input[name="labels.0.value"]').type("test");

      // Add an environment variable
      cy.contains("Add Label").click();
      cy.get('input[name="labels.1.key"]').type("snake_case");
      cy.get('input[name="labels.1.value"]').type("test");

      // Add an environment variable
      cy.contains("Add Label").click();
      cy.get('input[name="labels.2.key"]').type("lowercase");
      cy.get('input[name="labels.2.value"]').type("test");

      // Add an environment variable
      cy.contains("Add Label").click();
      cy.get('input[name="labels.3.key"]').type("UPPERCASE");
      cy.get('input[name="labels.3.value"]').type("test");

      // Click Review and Run
      cy
        .get("button.button-primary")
        .contains("Review & Run")
        .click({ timeout: Timeouts.ANIMATION_TIMEOUT });

      // Run service
      cy
        .get("button.button-primary")
        .contains("Run Service")
        .click({ timeout: Timeouts.ANIMATION_TIMEOUT });

      // Wait for the table and the service to appear
      cy
        .get(".page-body-content table")
        .contains(serviceName, { timeout: Timeouts.SERVICE_DEPLOYMENT_TIMEOUT })
        .should("exist");

      // Get the table row and wait until it's Running
      cy
        .get(".page-body-content table")
        .getTableRowThatContains(serviceName)
        .should("exist");

      // Now click on the name
      cy
        .get(".page-body-content table")
        .getTableRowThatContains(serviceName)
        .get("a.table-cell-link-primary")
        .contains(serviceName)
        .click();

      // open edit screen
      cy
        .get(".page-header-actions .dropdown")
        .click()
        .get(".dropdown-menu-items")
        .contains("Edit")
        .click();

      // check if values are as expected
      cy
        .root()
        .getFormGroupInputFor("Service ID *")
        .should("have.value", `/${Cypress.env("TEST_UUID")}/${serviceName}`);

      cy
        .root()
        .getFormGroupInputFor("Memory (MiB) *")
        .should("have.value", "10");
      cy.root().getFormGroupInputFor("Command").should("have.value", cmdline);

      // Select Environment section
      cy.root().get(".menu-tabbed-item").contains("Environment").click();

      // Add an environment variable
      cy.get('input[name="labels.0.key"]').should("have.value", "camelCase");
      cy.get('input[name="labels.0.value"]').should("have.value", "test");

      // Add an environment variable
      cy.get('input[name="labels.1.key"]').should("have.value", "snake_case");
      cy.get('input[name="labels.1.value"]').should("have.value", "test");

      // Add an environment variable
      cy.contains("Add Label").click();
      cy.get('input[name="labels.2.key"]').should("have.value", "lowercase");
      cy.get('input[name="labels.2.value"]').should("have.value", "test");

      // Add an environment variable
      cy.contains("Add Label").click();
      cy.get('input[name="labels.3.key"]').should("have.value", "UPPERCASE");
      cy.get('input[name="labels.3.value"]').should("have.value", "test");
    });

    it("creates an app with persistent volume", function() {
      const serviceName = "app-with-persistent-volume";
      const cmdline =
        "while true ; do echo 'test' > test/echo ; sleep 100 ; done";

      // Select 'Single Container'
      cy.contains("Single Container").click();

      // Select Universal Container Runtime (UCR)
      selectMesosRuntime();

      // Fill-in the input elements
      cy
        .root()
        .getFormGroupInputFor("Service ID *")
        .type(`{selectall}{rightarrow}${serviceName}`);
      //
      // TODO: Due to a bug in cypress you cannot type values with dots
      // cy
      //   .get('input[name=cpus]')
      //   .type('{selectall}0.5');
      //
      cy.root().getFormGroupInputFor("Memory (MiB) *").type("{selectall}10");
      cy.root().getFormGroupInputFor("Command").type(cmdline);

      // Select Volumes section
      cy.root().get(".menu-tabbed-item").contains("Volumes").click();

      // Add an environment variable
      cy.contains("Add Volume").click();
      cy.get(".button.dropdown-toggle").click();
      cy
        .root()
        .contains(".dropdown-select-item-title", "Local Persistent Volume")
        .click();
      cy.root().getFormGroupInputFor("Size (MiB)").type("128");
      cy.root().getFormGroupInputFor("Container Path").type("test").blur();

      // Click Review and Run
      cy
        .get("button.button-primary")
        .contains("Review & Run")
        .click({ timeout: Timeouts.ANIMATION_TIMEOUT });

      // Run service
      cy
        .get("button.button-primary")
        .contains("Run Service")
        .click({ timeout: Timeouts.ANIMATION_TIMEOUT });

      // Wait for the table and the service to appear
      cy
        .get(".page-body-content table")
        .contains(serviceName, { timeout: Timeouts.SERVICE_DEPLOYMENT_TIMEOUT })
        .should("exist");

      // Get the table row and wait until it's Running
      cy
        .get(".page-body-content table")
        .getTableRowThatContains(serviceName)
        .contains("Running", { timeout: Timeouts.SERVICE_DEPLOYMENT_TIMEOUT })
        .should("exist")
        .as("serviceName");

      cy
        .get("@serviceName")
        .parents("tr")
        .first()
        .contains("Running", { timeout: Timeouts.SERVICE_DEPLOYMENT_TIMEOUT })
        .should("exist");

      // Now click on the name
      cy
        .get(".page-body-content table")
        .getTableRowThatContains(serviceName)
        .get("a.table-cell-link-primary")
        .contains(serviceName)
        .click();

      // open edit screen
      cy
        .get(".page-header-actions .dropdown")
        .click()
        .get(".dropdown-menu-items")
        .contains("Edit")
        .click();

      // check if values are as expected
      cy
        .root()
        .getFormGroupInputFor("Service ID *")
        .should("have.value", `/${Cypress.env("TEST_UUID")}/${serviceName}`);

      cy.root().get(".menu-tabbed-item").contains("Volumes").click();

      cy
        .root()
        .getFormGroupInputFor("Volume Type")
        .should("have.value", "PERSISTENT");

      cy.root().getFormGroupInputFor("Size (MiB)").should("have.value", "128");

      cy
        .root()
        .getFormGroupInputFor("Container Path")
        .should("have.value", "test");
    });

    it("creates an app with service address", function() {
      const serviceName = "app-with-service-address";
      const command = "python3 -m http.server 8080";
      const containerImage = "python:3";

      // Select 'Single Container'
      cy.contains("Single Container").click();

      cy
        .root()
        .getFormGroupInputFor("Service ID *")
        .type(`{selectall}{rightarrow}${serviceName}`);

      // Hack to allow entering decimals in number fields
      cy.root().getFormGroupInputFor("CPUs *").invoke("attr", "type", "text");
      cy.root().getFormGroupInputFor("CPUs *").type("{selectall}0.5");
      cy.root().getFormGroupInputFor("CPUs *").invoke("attr", "type", "number");

      cy.root().getFormGroupInputFor("Memory (MiB) *").type("{selectall}32");

      cy.root().getFormGroupInputFor("Container Image").type(containerImage);

      cy.root().getFormGroupInputFor("Command").type(command);

      cy.get(".menu-tabbed-item").contains("Networking").click();

      cy
        .root()
        .getFormGroupInputFor("Network Type")
        .select("Virtual Network: dcos");

      cy.get(".button").contains("Add Service Endpoint").click();

      cy.root().getFormGroupInputFor("Container Port").type("8080");

      cy.root().getFormGroupInputFor("Service Endpoint Name").type("http");

      cy
        .get('input[name="portDefinitions.0.loadBalanced"]')
        .parents(".form-control-toggle")
        .click();

      cy
        .get("button")
        .contains("Review & Run")
        .click({ timeout: Timeouts.ANIMATION_TIMEOUT });

      cy
        .get("button")
        .contains("Run Service")
        .click({ timeout: Timeouts.ANIMATION_TIMEOUT });

      cy
        .get(".page-body-content table")
        .contains(serviceName, { timeout: Timeouts.SERVICE_DEPLOYMENT_TIMEOUT })
        .should("exist");

      cy
        .get(".page-body-content table")
        .getTableRowThatContains(serviceName)
        .should("exist");
    });

    it("creates an app with virtual network", function() {
      const serviceName = "app-with-virtual-network";
      const command = "python3 -m http.server 8080";
      const containerImage = "python:3";

      cy.contains("Single Container").click();

      cy
        .root()
        .getFormGroupInputFor("Service ID *")
        .type(`{selectall}{rightarrow}${serviceName}`);

      // Hack to allow entering decimals in number fields
      cy.root().getFormGroupInputFor("CPUs *").invoke("attr", "type", "text");
      cy.root().getFormGroupInputFor("CPUs *").type("{selectall}0.5");
      cy.root().getFormGroupInputFor("CPUs *").invoke("attr", "type", "number");

      cy.root().getFormGroupInputFor("Memory (MiB) *").type("{selectall}32");
      cy.root().getFormGroupInputFor("Container Image").type(containerImage);
      cy.root().getFormGroupInputFor("Command").type(command);

      cy.get(".menu-tabbed-item").contains("Networking").click();

      cy
        .root()
        .getFormGroupInputFor("Network Type")
        .select("Virtual Network: dcos");

      cy.get(".button").contains("Add Service Endpoint").click();
      cy.get('input[name="portDefinitions.0.containerPort"]').type("8080");
      cy.get('input[name="portDefinitions.0.name"]').type("http");

      cy.get(".button").contains("Add Service Endpoint").click();
      cy.get('input[name="portDefinitions.1.containerPort"]').type("8080");
      cy.get('input[name="portDefinitions.1.name"]').type("mapped");

      cy
        .get('input[name="portDefinitions.1.portMapping"]')
        .parents(".form-control-toggle")
        .click();

      cy
        .get('input[name="portDefinitions.1.automaticPort"]')
        .parents(".form-control-toggle")
        .click();

      cy.root().getFormGroupInputFor("Host Port").type("4200");

      cy
        .get("button")
        .contains("Review & Run")
        .click({ timeout: Timeouts.ANIMATION_TIMEOUT });

      cy
        .get("button")
        .contains("Run Service")
        .click({ timeout: Timeouts.ANIMATION_TIMEOUT });

      cy.get(".page-body-content table").contains(serviceName).should("exist");

      cy
        .get(".page-body-content table")
        .getTableRowThatContains(serviceName)
        .should("exist");
    });
  });
});
