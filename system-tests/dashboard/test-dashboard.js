require("../_support/utils/ServicesUtil");
const { Timeouts } = require("../_support/constants");

describe("Dashboard", function() {
  beforeEach(() => {
    cy.visitUrl("dashboard");
  });

  afterEach(() => {
    cy.window().then(win => {
      win.location.href = "about:blank";
    });
  });

  it("updates CPU usage when service is started", function() {
    let label = cy
      .get(".panel-header")
      .contains("CPU Allocation")
      .parents(".panel")
      .find(".unit-label");

    let initialValue;
    label.should(function($label) {
      initialValue = parseFloat($label.text());
    });

    // First run a service
    cy.visitUrl(`services/overview/%2F${Cypress.env("TEST_UUID")}/create`);

    const serviceName = "dashboard-cpu-test-app";
    const cmdline = "while true; do echo 'test' ; sleep 100 ; done";

    // Select 'Single Container'
    cy.contains("Single Container").click();

    // Fill-in the input elements
    cy
      .root()
      .getFormGroupInputFor("Service ID *")
      .type(`{selectall}{rightarrow}${serviceName}`);

    cy.root().getFormGroupInputFor("Memory (MiB) *").type("{selectall}10");
    cy.root().getFormGroupInputFor("Command").type(cmdline);
    cy.root().getFormGroupInputFor("Container Image").type("nginx");

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
        portDefinitions: [],
        container: {
          type: "DOCKER",
          volumes: [],
          docker: {
            image: "nginx"
          }
        },
        requirePorts: false,
        networks: [],
        healthChecks: [],
        fetch: [],
        constraints: []
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

    cy.get("button.button-primary").contains("Run Service").click();

    // Wait for the table and the service to appear
    cy
      .get(".page-body-content table", {
        timeout: Timeouts.SERVICE_DEPLOYMENT_TIMEOUT
      })
      .contains(serviceName, { timeout: Timeouts.SERVICE_DEPLOYMENT_TIMEOUT })
      .should("exist");

    // Check that the dashboard is updated
    cy.visitUrl("dashboard");

    label = cy
      .get(".panel-header")
      .contains("CPU Allocation")
      .parents(".panel")
      .find(".unit-label");

    label.should(function($label) {
      const newValue = parseFloat($label.text());
      expect(newValue).to.eq(initialValue + 0.1);
    });
  });

  it("updates memory usage when service is started", function() {
    let label = cy
      .get(".panel-header")
      .contains("Memory Allocation")
      .parents(".panel")
      .find(".unit-label");

    let initialValue;
    label.should(function($label) {
      initialValue = parseFloat($label.text());
    });

    // First run a service
    cy.visitUrl(`services/overview/%2F${Cypress.env("TEST_UUID")}/create`);

    const serviceName = "dashboard-memory-test-app";
    const cmdline = "while true; do echo 'test' ; sleep 100 ; done";

    // Select 'Single Container'
    cy.contains("Single Container").click();

    // Fill-in the input elements
    cy
      .root()
      .getFormGroupInputFor("Service ID *")
      .type(`{selectall}{rightarrow}${serviceName}`);

    cy.root().getFormGroupInputFor("Memory (MiB) *").type("{selectall}10");
    cy.root().getFormGroupInputFor("Command").type(cmdline);
    cy.root().getFormGroupInputFor("Container Image").type("nginx");

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
        portDefinitions: [],
        container: {
          type: "DOCKER",
          volumes: [],
          docker: {
            image: "nginx"
          }
        },
        requirePorts: false,
        networks: [],
        healthChecks: [],
        fetch: [],
        constraints: []
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

    cy.get("button.button-primary").contains("Run Service").click();

    // Wait for the table and the service to appear
    cy
      .get(".page-body-content table", {
        timeout: Timeouts.SERVICE_DEPLOYMENT_TIMEOUT
      })
      .contains(serviceName, { timeout: Timeouts.SERVICE_DEPLOYMENT_TIMEOUT })
      .should("exist");

    // Check that the dashboard is updated
    cy.visitUrl("dashboard");

    label = cy
      .get(".panel-header")
      .contains("Memory Allocation")
      .parents(".panel")
      .find(".unit-label");

    label.should(function($label) {
      const newValue = parseFloat($label.text());
      expect(newValue).to.eq(initialValue + 10);
    });
  });

  it("updates disk usage when service is started", function() {
    let label = cy
      .get(".panel-header")
      .contains("Disk Allocation")
      .parents(".panel")
      .find(".unit-label");

    let initialValue;
    label.should(function($label) {
      initialValue = parseFloat($label.text());
    });

    // First run a service
    cy.visitUrl(`services/overview/%2F${Cypress.env("TEST_UUID")}/create`);

    const serviceName = "dashboard-disk-test-app";
    const cmdline = "while true; do echo 'test' ; sleep 100 ; done";

    // Select 'Single Container'
    cy.contains("Single Container").click();

    // Fill-in the input elements
    cy
      .root()
      .getFormGroupInputFor("Service ID *")
      .type(`{selectall}{rightarrow}${serviceName}`);

    cy.root().getFormGroupInputFor("Memory (MiB) *").type("{selectall}10");
    cy.root().getFormGroupInputFor("Command").type(cmdline);
    cy.root().getFormGroupInputFor("Container Image").type("nginx");

    cy.contains("More Settings").click();
    cy.root().getFormGroupInputFor("Disk (MiB)").type("{selectall}10");

    // Check JSON view
    cy.contains("JSON Editor").click();

    // Check contents of the JSON editor
    cy.get("#brace-editor").contents().asJson().should("deep.equal", [
      {
        id: `/${Cypress.env("TEST_UUID")}/${serviceName}`,
        cmd: cmdline,
        cpus: 0.1,
        mem: 10,
        disk: 10,
        instances: 1,
        portDefinitions: [],
        container: {
          type: "DOCKER",
          volumes: [],
          docker: {
            image: "nginx"
          }
        },
        requirePorts: false,
        networks: [],
        healthChecks: [],
        fetch: [],
        constraints: []
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
      .contains("10 MiB");

    cy.get("button.button-primary").contains("Run Service").click();

    // Wait for the table and the service to appear
    cy
      .get(".page-body-content table", {
        timeout: Timeouts.SERVICE_DEPLOYMENT_TIMEOUT
      })
      .contains(serviceName, { timeout: Timeouts.SERVICE_DEPLOYMENT_TIMEOUT })
      .should("exist");

    // Check that the dashboard is updated
    cy.visitUrl("dashboard");

    label = cy
      .get(".panel-header")
      .contains("Disk Allocation")
      .parents(".panel")
      .find(".unit-label");

    label.should(function($label) {
      const newValue = parseFloat($label.text());
      expect(newValue).to.eq(initialValue + 10);
    });
  });

  it("new service shows in services list on dashboard when started", function() {
    // First run a service
    cy.visitUrl(`services/overview/%2F${Cypress.env("TEST_UUID")}/create`);

    const serviceName = "test-service-appear-in-list";
    const cmdline = "while true; do echo 'test' ; sleep 100 ; done";

    // Select 'Single Container'
    cy.contains("Single Container").click();

    // Fill-in the input elements
    cy
      .root()
      .getFormGroupInputFor("Service ID *")
      .type(`{selectall}{rightarrow}${serviceName}`);

    cy.root().getFormGroupInputFor("Memory (MiB) *").type("{selectall}10");
    cy.root().getFormGroupInputFor("Command").type(cmdline);
    cy.root().getFormGroupInputFor("Container Image").type("nginx");

    cy.contains("More Settings").click();
    cy.root().getFormGroupInputFor("Disk (MiB)").type("{selectall}10");

    // Check JSON view
    cy.contains("JSON Editor").click();

    // Check contents of the JSON editor
    cy.get("#brace-editor").contents().asJson().should("deep.equal", [
      {
        id: `/${Cypress.env("TEST_UUID")}/${serviceName}`,
        cmd: cmdline,
        cpus: 0.1,
        mem: 10,
        disk: 10,
        instances: 1,
        portDefinitions: [],
        container: {
          type: "DOCKER",
          volumes: [],
          docker: {
            image: "nginx"
          }
        },
        requirePorts: false,
        networks: [],
        healthChecks: [],
        fetch: [],
        constraints: []
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
      .contains("10 MiB");

    cy.get("button.button-primary").contains("Run Service").click();

    // Wait for the table and the service to appear
    cy
      .get(".page-body-content table", {
        timeout: Timeouts.SERVICE_DEPLOYMENT_TIMEOUT
      })
      .contains(serviceName, { timeout: Timeouts.SERVICE_DEPLOYMENT_TIMEOUT })
      .should("exist");

    // Check that the dashboard is updated
    cy.visitUrl("dashboard");

    cy
      .get(".panel-header")
      .contains("Services Health")
      .parents(".panel")
      .find("li")
      .contains(serviceName);
  });

  it("new service updates task count in dashboard", function() {
    let tasksCountSpan = cy
      .get(".panel-header")
      .contains("Tasks")
      .parents(".panel")
      .find(".unit-primary");

    let tasksCountInitial;
    tasksCountSpan.should(function($label) {
      tasksCountInitial = parseFloat($label.text());
    });

    // First run a service
    cy.visitUrl(`services/overview/%2F${Cypress.env("TEST_UUID")}/create`);

    const serviceName = "test-service-updates-task-count";
    const cmdline = "while true; do echo 'test' ; sleep 100 ; done";

    // Select 'Single Container'
    cy.contains("Single Container").click();

    // Fill-in the input elements
    cy
      .root()
      .getFormGroupInputFor("Service ID *")
      .type(`{selectall}{rightarrow}${serviceName}`);

    cy.root().getFormGroupInputFor("Memory (MiB) *").type("{selectall}10");
    cy.root().getFormGroupInputFor("Command").type(cmdline);
    cy.root().getFormGroupInputFor("Container Image").type("nginx");

    cy.contains("More Settings").click();
    cy.root().getFormGroupInputFor("Disk (MiB)").type("{selectall}10");

    // Check JSON view
    cy.contains("JSON Editor").click();

    // Check contents of the JSON editor
    cy.get("#brace-editor").contents().asJson().should("deep.equal", [
      {
        id: `/${Cypress.env("TEST_UUID")}/${serviceName}`,
        cmd: cmdline,
        cpus: 0.1,
        mem: 10,
        disk: 10,
        instances: 1,
        portDefinitions: [],
        container: {
          type: "DOCKER",
          volumes: [],
          docker: {
            image: "nginx"
          }
        },
        requirePorts: false,
        networks: [],
        healthChecks: [],
        fetch: [],
        constraints: []
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
      .contains("10 MiB");

    cy.get("button.button-primary").contains("Run Service").click();

    // Wait for the table and the service to appear
    cy
      .get(".page-body-content table", {
        timeout: Timeouts.SERVICE_DEPLOYMENT_TIMEOUT
      })
      .contains(serviceName, { timeout: Timeouts.SERVICE_DEPLOYMENT_TIMEOUT })
      .should("exist");

    // Check that the dashboard is updated
    cy.visitUrl("dashboard");

    tasksCountSpan = cy
      .get(".panel-header")
      .contains("Tasks")
      .parents(".panel")
      .find(".unit-primary");

    tasksCountSpan.should(function($tasksCount) {
      const newValue = parseFloat($tasksCount.text());
      expect(newValue).to.eq(tasksCountInitial + 1);
    });
  });
});
