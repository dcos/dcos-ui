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

    function clickElementByText(text) {
      cy.contains(text).click();
    }

    afterEach(() => {
      cy.window().then(win => {
        win.location.href = "about:blank";
      });
    });

    function selectMesosRuntime() {
      clickElementByText("More Settings");
      clickElementByText("Mesos Runtime");
    }

    it("should create a simple app", function() {
      const serviceName = "app-with-inline-shell-script";
      const cmdline = "while true; do echo 'test' ; sleep 100 ; done";

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
      cy.root().getFormGroupInputFor("Memory (MiB) *").type("{selectall}10");
      cy.root().getFormGroupInputFor("Command").type(cmdline);

      // Select mesos runtime
      selectMesosRuntime();

      // Check JSON view
      cy.contains("JSON Editor").click();

      // Check contents of the JSON editor
      cy.get("#brace-editor").contents().asJson().should("deep.equal", [
        {
          id: `/${Cypress.env("TEST_UUID")}/${serviceName}`,
          cmd: cmdline,
          cpus: 0.1,
          mem: 10,
          instances: 1
        }
      ]);

      // Click Review and Run
      cy.contains("Review & Run").click();

      // Verify the review screen
      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Service ID")
        .contains(`/${Cypress.env("TEST_UUID")}/${serviceName}`);
      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Container Runtime")
        .contains("Mesos Runtime");
      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("CPU")
        .contains("0.1");
      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Memory")
        .contains("10 MiB");
      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Disk")
        .contains("Not Configured");

      // Run service
      cy.get("button.button-primary").contains("Run Service").click();

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

      // Test Mesos Runtime again? should be tested before...
    });

    it("should fail create the same app name again", function() {
      // same as above
      const serviceName = "app-with-inline-shell-script";
      const cmdline = "while true; do echo 'test' ; sleep 100 ; done";

      // Select 'Single Container'
      cy.contains("Single Container").click();

      // Fill-in the input elements
      cy
        .root()
        .getFormGroupInputFor("Service ID *")
        .type(`{selectall}{rightarrow}${serviceName}`);

      cy.root().getFormGroupInputFor("Command").type(cmdline);

      // Select mesos runtime
      selectMesosRuntime();

      // Check JSON view
      cy.contains("JSON Editor").click();

      // Click Review and Run
      cy.contains("button", "Review & Run").click();

      // Run service
      cy.contains("button", "Run Service").click();

      // Also no Error should exist
      cy
        .wait("@appsReq")
        .get(".alert-danger")
        .contains(
          `An app with id [/${Cypress.env("TEST_UUID")}/${serviceName}] already exists.`
        )
        .should("exist");
    });

    it("should create an app with artifacts", function() {
      const serviceName = "app-with-artifacts";
      const cmdline = "while true; do echo 'test' ; sleep 100 ; done";

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
      //   .root()
      //   .getFormGroupInputFor('CPUs *')
      //   .type('{selectall}0.1');
      //
      cy.root().getFormGroupInputFor("Memory (MiB) *").type("{selectall}10");
      cy.root().getFormGroupInputFor("Command").type(cmdline);

      // Select mesos runtime
      selectMesosRuntime();

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

      // Check JSON view
      cy.contains("JSON Editor").click();

      // Check contents of the JSON editor
      cy.get("#brace-editor").contents().asJson().should("deep.equal", [
        {
          id: `/${Cypress.env("TEST_UUID")}/${serviceName}`,
          cmd: cmdline,
          cpus: 0.1,
          mem: 10,
          instances: 1,
          fetch: [
            {
              uri: "http://lorempicsum.com/simpsons/600/400/1"
            },
            {
              uri: "http://lorempicsum.com/simpsons/600/400/2"
            },
            {
              uri: "http://lorempicsum.com/simpsons/600/400/3"
            }
          ]
        }
      ]);

      // Click Review and Run
      cy.contains("Review & Run").click();

      // Verify the review screen
      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Service ID")
        .contains(`/${Cypress.env("TEST_UUID")}/${serviceName}`);
      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Container Runtime")
        .contains("Mesos Runtime");
      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("CPU")
        .contains("0.1");
      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Memory")
        .contains("10 MiB");
      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Disk")
        .contains("Not Configured");
      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Container Image")
        .contains("Not Supported");
      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Command")
        .contains(cmdline);
      cy
        .root()
        .configurationSection("Container Artifacts")
        .children("table")
        .getTableColumn("Artifact URI")
        .contents()
        .should("deep.equal", [
          "http://lorempicsum.com/simpsons/600/400/1",
          "http://lorempicsum.com/simpsons/600/400/2",
          "http://lorempicsum.com/simpsons/600/400/3"
        ]);

      // Run service
      cy.get("button.button-primary").contains("Run Service").click();

      // Wait for the table and the service to appear
      cy.get(".page-body-content table").contains(serviceName).should("exist");

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

    it("should create an app with command health check", function() {
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

      // Check JSON view
      cy.contains("JSON Editor").click();

      // Check contents of the JSON editor
      cy.get("#brace-editor").contents().asJson().should("deep.equal", [
        {
          id: `/${Cypress.env("TEST_UUID")}/${serviceName}`,
          instances: 1,
          container: {
            type: "DOCKER",
            docker: {
              image: "nginx",
              network: "BRIDGE",
              portMappings: [
                {
                  containerPort: 80,
                  hostPort: 0,
                  protocol: "tcp"
                }
              ]
            }
          },
          cpus: 0.1,
          mem: 32,
          healthChecks: [
            {
              protocol: "COMMAND",
              command: {
                value: "sleep 5; exit 0"
              }
            }
          ]
        }
      ]);

      // Click Review and Run
      cy.contains("Review & Run").click();

      // Verify the review screen
      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Service ID")
        .contains(`/${Cypress.env("TEST_UUID")}/${serviceName}`);
      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Container Runtime")
        .contains("Docker Engine");
      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("CPU")
        .contains("0.1");
      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Memory")
        .contains("32 MiB");
      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Disk")
        .contains("Not Configured");
      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Container Image")
        .contains("nginx");
      cy
        .root()
        .configurationSection("Network")
        .configurationMapValue("Network Type")
        .contains("BRIDGE");

      cy
        .root()
        .configurationSection("Service Endpoints")
        .getTableRowThatContains("80")
        .should("exist");

      cy
        .root()
        .configurationSection("Command Health Checks")
        .getTableRowThatContains("sleep 5; exit 0")
        .should("exist");

      // Run service
      cy.get("button.button-primary").contains("Run Service").click();

      // Wait for the table and the service to appear
      cy
        .get(".page-body-content table")
        .contains(serviceName, { timeout: Timeouts.SERVICE_DEPLOYMENT_TIMEOUT })
        .should("exist");

      // Get the table row and look for health
      cy
        .get(".page-body-content table")
        .getTableRowThatContains(serviceName)
        .get(".bar.healthy", { timeout: Timeouts.SERVICE_DEPLOYMENT_TIMEOUT })
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

    it("should create an app with docker config", function() {
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

      // Check contents of the JSON editor
      cy.get("#brace-editor").contents().asJson().should("deep.equal", [
        {
          id: `/${Cypress.env("TEST_UUID")}/${serviceName}`,
          cmd: cmdline,
          cpus: 0.1,
          instances: 1,
          mem: 32,
          container: {
            type: "DOCKER",
            docker: {
              image: "python:3",
              network: "BRIDGE",
              portMappings: [
                {
                  name: "http",
                  hostPort: 0,
                  containerPort: 8080,
                  protocol: "tcp"
                }
              ]
            }
          }
        }
      ]);

      // Click Review and Run
      cy.contains("Review & Run").click();

      // Verify the review screen
      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Service ID")
        .contains(`/${Cypress.env("TEST_UUID")}/${serviceName}`);
      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Container Runtime")
        .contains("Docker Engine");
      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("CPU")
        .contains("0.1");
      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Memory")
        .contains("32 MiB");
      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Disk")
        .contains("Not Configured");
      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Container Image")
        .contains("python:3");

      cy
        .root()
        .configurationSection("Network")
        .configurationMapValue("Network Type")
        .contains("BRIDGE");
      cy
        .root()
        .configurationSection("Service Endpoints")
        .getTableRowThatContains("http")
        .should("exist");
      cy
        .root()
        .configurationSection("Service Endpoints")
        .getTableRowThatContains("8080")
        .should("exist");

      // Run service
      cy.get("button.button-primary").contains("Run Service").click();

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

    it("should create an app with environment variables", function() {
      const serviceName = "app-with-environment-variables";
      const cmdline = "while true; do echo 'test' ; sleep 100 ; done";

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
      cy.root().getFormGroupInputFor("Memory (MiB) *").type("{selectall}10");
      cy.root().getFormGroupInputFor("Command").type(cmdline);

      // Select mesos runtime
      selectMesosRuntime();

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

      // Check JSON view
      cy.contains("JSON Editor").click();

      // Check contents of the JSON editor
      cy.get("#brace-editor").contents().asJson().should("deep.equal", [
        {
          id: `/${Cypress.env("TEST_UUID")}/${serviceName}`,
          cmd: cmdline,
          cpus: 0.1,
          mem: 10,
          instances: 1,
          env: {
            camelCase: "test",
            snake_case: "test",
            lowercase: "test",
            UPPERCASE: "test"
          }
        }
      ]);

      // Click Review and Run
      cy.contains("Review & Run").click();

      // Verify the review screen
      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Service ID")
        .contains(`/${Cypress.env("TEST_UUID")}/${serviceName}`);
      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Container Runtime")
        .contains("Mesos Runtime");
      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("CPU")
        .contains("0.1");
      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Memory")
        .contains("10 MiB");
      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Disk")
        .contains("Not Configured");

      cy
        .root()
        .configurationSection("Environment Variables")
        .children("table")
        .getTableColumn("Key")
        .contents()
        .should("deep.equal", [
          "camelCase",
          "snake_case",
          "lowercase",
          "UPPERCASE"
        ]);
      cy
        .root()
        .configurationSection("Environment Variables")
        .children("table")
        .getTableColumn("Value")
        .contents()
        .should("deep.equal", ["test", "test", "test", "test"]);

      // Run service
      cy.get("button.button-primary").contains("Run Service").click();

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

    it("should create an app with external volume", function() {
      const serviceName = "app-with-external-volume";
      const cmdline =
        "while true ; do echo 'test' > test/echo ; sleep 100 ; done";
      const volumeName = `integration-test-dcos-ui-${Cypress.env("TEST_UUID")}`;

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
      cy.root().getFormGroupInputFor("Memory (MiB) *").type("{selectall}64");
      cy.root().getFormGroupInputFor("Command").type(cmdline);

      // Select mesos runtime
      selectMesosRuntime();

      // Select Volumes section
      cy.root().get(".menu-tabbed-item").contains("Volumes").click();

      // Add an environment variable
      cy.contains("Add External Volume").click();
      cy.root().getFormGroupInputFor("Name").type(volumeName);
      cy.root().getFormGroupInputFor("Size (GiB)").type("1");
      cy.root().getFormGroupInputFor("Container Path").type("test");

      // Check JSON view
      cy.contains("JSON Editor").click();

      // Check contents of the JSON editor
      cy.get("#brace-editor").contents().asJson().should("deep.equal", [
        {
          id: `/${Cypress.env("TEST_UUID")}/${serviceName}`,
          instances: 1,
          cpus: 0.1,
          mem: 64,
          cmd: cmdline,
          container: {
            volumes: [
              {
                containerPath: "test",
                external: {
                  name: volumeName,
                  provider: "dvdi",
                  options: {
                    "dvdi/driver": "rexray"
                  },
                  size: 1
                },
                mode: "RW"
              }
            ],
            type: "MESOS"
          }
        }
      ]);

      // Click Review and Run
      cy.contains("Review & Run").click();

      // Verify the review screen
      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Service ID")
        .contains(`/${Cypress.env("TEST_UUID")}/${serviceName}`);
      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Container Runtime")
        .contains("Mesos Runtime");
      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("CPU")
        .contains("0.1");
      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Memory")
        .contains("64 MiB");
      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Disk")
        .contains("Not Configured");

      cy
        .root()
        .configurationSection("Storage")
        .children("table")
        .getTableColumn("Volume")
        .contents()
        .should("deep.equal", [`External (${volumeName})`]);
      cy
        .root()
        .configurationSection("Storage")
        .children("table")
        .getTableColumn("Size")
        .contents()
        .should("deep.equal", ["1 GiB"]);
      cy
        .root()
        .configurationSection("Storage")
        .children("table")
        .getTableColumn("Mode")
        .contents()
        .should("deep.equal", ["RW"]);
      cy
        .root()
        .configurationSection("Storage")
        .children("table")
        .getTableColumn("Container Mount Path")
        .contents()
        .should("deep.equal", ["test"]);

      // Run service
      cy.get("button.button-primary").contains("Run Service").click();

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
        .should("have.value", "64");
      cy.root().getFormGroupInputFor("Command").should("have.value", cmdline);

      // Select Volumes section
      cy.root().get(".menu-tabbed-item").contains("Volumes").click();

      cy.root().getFormGroupInputFor("Name").should("have.value", volumeName);
      cy.root().getFormGroupInputFor("Size (GiB)").should("have.value", "1");
      cy
        .root()
        .getFormGroupInputFor("Container Path")
        .should("have.value", "test");
    });

    it("should create an app with HTTP health check", function() {
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

      // Check JSON view
      cy.contains("JSON Editor").click();

      // Check contents of the JSON editor
      cy.get("#brace-editor").contents().asJson().should("deep.equal", [
        {
          id: `/${Cypress.env("TEST_UUID")}/${serviceName}`,
          cpus: 0.1,
          mem: 32,
          instances: 1,
          healthChecks: [
            {
              portIndex: 0,
              protocol: "MESOS_HTTP",
              path: "/"
            }
          ],
          container: {
            type: "DOCKER",
            docker: {
              image: "nginx",
              network: "BRIDGE",
              portMappings: [
                {
                  name: "http",
                  hostPort: 0,
                  containerPort: 80,
                  protocol: "tcp"
                }
              ]
            }
          }
        }
      ]);

      // Click Review and Run
      cy.contains("Review & Run").click();

      // Verify the review screen
      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Service ID")
        .contains(`/${Cypress.env("TEST_UUID")}/${serviceName}`);
      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Container Runtime")
        .contains("Docker Engine");
      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("CPU")
        .contains("0.1");
      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Memory")
        .contains("32 MiB");
      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Disk")
        .contains("Not Configured");
      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Container Image")
        .contains("nginx");

      cy
        .root()
        .configurationSection("Service Endpoints")
        .children("table")
        .getTableColumn("Name")
        .contents()
        .should("deep.equal", ["http"]);
      cy
        .root()
        .configurationSection("Service Endpoints")
        .children("table")
        .getTableColumn("Protocol")
        .contents()
        .should("deep.equal", ["tcp"]);
      cy
        .root()
        .configurationSection("Service Endpoints")
        .children("table")
        .getTableColumn("Container Port")
        .contents()
        .should("deep.equal", ["80"]);
      cy
        .root()
        .configurationSection("Service Endpoints")
        .children("table")
        .getTableColumn("Host Port")
        .contents()
        .should("deep.equal", ["0"]);

      // Run service
      cy.get("button.button-primary").contains("Run Service").click();

      // Wait for the table and the service to appear
      cy
        .get(".page-body-content table")
        .contains(serviceName, { timeout: Timeouts.SERVICE_DEPLOYMENT_TIMEOUT })
        .should("exist");

      // Get the table row and look for health
      cy
        .get(".page-body-content table")
        .getTableRowThatContains(serviceName)
        .get(".bar.healthy", { timeout: Timeouts.SERVICE_DEPLOYMENT_TIMEOUT })
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

    it("should create an app with labels", function() {
      const serviceName = "app-with-labels";
      const cmdline = "while true; do echo 'test' ; sleep 100 ; done";

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
      cy.root().getFormGroupInputFor("Memory (MiB) *").type("{selectall}10");
      cy.root().getFormGroupInputFor("Command").type(cmdline);

      // Select mesos runtime
      selectMesosRuntime();

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

      // Check JSON view
      cy.contains("JSON Editor").click();

      // Check contents of the JSON editor
      cy.get("#brace-editor").contents().asJson().should("deep.equal", [
        {
          id: `/${Cypress.env("TEST_UUID")}/${serviceName}`,
          cmd: cmdline,
          cpus: 0.1,
          mem: 10,
          instances: 1,
          labels: {
            camelCase: "test",
            snake_case: "test",
            lowercase: "test",
            UPPERCASE: "test"
          }
        }
      ]);

      // Click Review and Run
      cy.contains("Review & Run").click();

      // Verify the review screen
      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Service ID")
        .contains(`/${Cypress.env("TEST_UUID")}/${serviceName}`);
      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Container Runtime")
        .contains("Mesos Runtime");
      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("CPU")
        .contains("0.1");
      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Memory")
        .contains("10 MiB");
      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Disk")
        .contains("Not Configured");

      cy
        .root()
        .configurationSection("Labels")
        .children("table")
        .getTableColumn("Key")
        .contents()
        .should("deep.equal", [
          "camelCase",
          "snake_case",
          "lowercase",
          "UPPERCASE"
        ]);
      cy
        .root()
        .configurationSection("Labels")
        .children("table")
        .getTableColumn("Value")
        .contents()
        .should("deep.equal", ["test", "test", "test", "test"]);

      // Run service
      cy.get("button.button-primary").contains("Run Service").click();

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

    it("should create an app with persistent volume", function() {
      const serviceName = "app-with-persistent-volume";
      const cmdline =
        "while true ; do echo 'test' > test/echo ; sleep 100 ; done";

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
      cy.root().getFormGroupInputFor("Memory (MiB) *").type("{selectall}10");
      cy.root().getFormGroupInputFor("Command").type(cmdline);

      // Select mesos runtime
      selectMesosRuntime();

      // Select Volumes section
      cy.root().get(".menu-tabbed-item").contains("Volumes").click();

      // Add an environment variable
      cy.contains("Add Local Volume").click();
      cy.root().getFormGroupInputFor("Volume Type").select("Persistent Volume");
      cy.root().getFormGroupInputFor("Size (MiB)").type("128");
      cy.root().getFormGroupInputFor("Container Path").type("test");

      // Check JSON view
      cy.contains("JSON Editor").click();

      // Check contents of the JSON editor
      cy.get("#brace-editor").contents().asJson().should("deep.equal", [
        {
          id: `/${Cypress.env("TEST_UUID")}/${serviceName}`,
          cmd: cmdline,
          cpus: 0.1,
          mem: 10,
          instances: 1,
          container: {
            volumes: [
              {
                persistent: {
                  size: 128
                },
                mode: "RW",
                containerPath: "test"
              }
            ],
            type: "MESOS"
          },
          residency: {
            relaunchEscalationTimeoutSeconds: 10,
            taskLostBehavior: "WAIT_FOREVER"
          }
        }
      ]);

      // Click Review and Run
      cy.contains("Review & Run").click();

      // Verify the review screen
      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Service ID")
        .contains(`/${Cypress.env("TEST_UUID")}/${serviceName}`);
      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Container Runtime")
        .contains("Mesos Runtime");
      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("CPU")
        .contains("0.1");
      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Memory")
        .contains("10 MiB");
      cy
        .root()
        .configurationSection("General")
        .configurationMapValue("Disk")
        .contains("Not Configured");

      cy
        .root()
        .configurationSection("Storage")
        .children("table")
        .getTableColumn("Volume")
        .contents()
        .should("deep.equal", ["Persistent Local"]);
      cy
        .root()
        .configurationSection("Storage")
        .children("table")
        .getTableColumn("Size")
        .contents()
        .should("deep.equal", ["128 MiB"]);
      cy
        .root()
        .configurationSection("Storage")
        .children("table")
        .getTableColumn("Mode")
        .contents()
        .should("deep.equal", ["RW"]);
      cy
        .root()
        .configurationSection("Storage")
        .children("table")
        .getTableColumn("Container Mount Path")
        .contents()
        .should("deep.equal", ["test"]);

      // Run service
      cy.get("button.button-primary").contains("Run Service").click();

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
  });
});
