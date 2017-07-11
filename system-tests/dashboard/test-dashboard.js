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

  function deleteService(serviceName) {
    // Delete the service
    cy.visitUrl(`services/overview/%2F${Cypress.env("TEST_UUID")}`);

    // Click on the serviceName of the package to delete
    cy
      .get(".page-body-content table")
      .getTableRowThatContains(serviceName)
      .get("a.table-cell-link-primary")
      .contains(serviceName)
      .click();

    // Click delete in the dropdown
    cy
      .get(".page-header-actions .dropdown")
      .click()
      .get(".dropdown-menu-items")
      .contains("Delete")
      .click();

    // Confirm the deletion
    cy.get(".modal.confirm-modal input").type(serviceName);
    cy.get(".modal.confirm-modal button.button-danger").click();

    cy
      .get(".page-body-content table")
      .contains(serviceName)
      .should("not.exist");
  }

  function createService(serviceName) {
    // First run a service
    cy.visitUrl(`services/overview/%2F${Cypress.env("TEST_UUID")}/create`);

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
  }

  it("increments CPU usage when service is started", function() {
    let label = cy
      .get(".panel-header")
      .contains("CPU Allocation")
      .parents(".panel")
      .find(".unit-label");

    let initialValue;
    label.should(function($label) {
      initialValue = parseFloat($label.text());
    });

    createService("dashboard-cpu-test-app");

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

    createService("dashboard-memory-test-app");

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

    createService("dashboard-disk-test-app");

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
    const serviceName = "test-service-appear-in-list";

    createService(serviceName);

    // Check that the dashboard is updated
    cy.visitUrl("dashboard");

    cy
      .get(".panel-header")
      .contains("Services Health")
      .parents(".panel")
      .find("li")
      .contains(serviceName);
  });

  it("new service increments task count in dashboard", function() {
    let tasksCountSpan = cy
      .get(".panel-header")
      .contains("Tasks")
      .parents(".panel")
      .find(".unit-primary");

    let tasksCountInitial;
    tasksCountSpan.should(function($label) {
      tasksCountInitial = parseFloat($label.text());
    });

    createService("test-service-updates-task-count");

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

  it("decrements CPU usage when service is stopped", function() {
    let label = cy
      .get(".panel-header")
      .contains("CPU Allocation")
      .parents(".panel")
      .find(".unit-label");

    let initialValue;
    label.should(function($label) {
      initialValue = parseFloat($label.text());
    });

    deleteService("dashboard-cpu-test-app");

    // Check that the dashboard is updated
    cy.visitUrl("dashboard");

    label = cy
      .get(".panel-header")
      .contains("CPU Allocation")
      .parents(".panel")
      .find(".unit-label");

    label.should(function($label) {
      const newValue = parseFloat($label.text());
      expect(newValue).to.eq(initialValue - 0.1);
    });
  });

  it("decrements memory usage when service is stopped", function() {
    let label = cy
      .get(".panel-header")
      .contains("Memory Allocation")
      .parents(".panel")
      .find(".unit-label");

    let initialValue;
    label.should(function($label) {
      initialValue = parseFloat($label.text());
    });

    deleteService("dashboard-memory-test-app");

    // Check that the dashboard is updated
    cy.visitUrl("dashboard");

    label = cy
      .get(".panel-header")
      .contains("Memory Allocation")
      .parents(".panel")
      .find(".unit-label");

    label.should(function($label) {
      const newValue = parseFloat($label.text());
      expect(newValue).to.eq(initialValue - 10);
    });
  });

  it("decrements disk usage when service is stopped", function() {
    let label = cy
      .get(".panel-header")
      .contains("Disk Allocation")
      .parents(".panel")
      .find(".unit-label");

    let initialValue;
    label.should(function($label) {
      initialValue = parseFloat($label.text());
    });

    deleteService("dashboard-disk-test-app");

    // Check that the dashboard is updated
    cy.visitUrl("dashboard");

    label = cy
      .get(".panel-header")
      .contains("Disk Allocation")
      .parents(".panel")
      .find(".unit-label");

    label.should(function($label) {
      const newValue = parseFloat($label.text());
      expect(newValue).to.eq(initialValue - 10);
    });
  });

  it("new service dissapears in services list on dashboard when stopped", function() {
    const serviceName = "test-service-appear-in-list";

    deleteService(serviceName);

    // Check that the dashboard is updated
    cy.visitUrl("dashboard");

    cy
      .get(".panel-header")
      .contains("Services Health")
      .parents(".panel")
      .find("li")
      .contains(serviceName)
      .should("not.exist");
  });

  it("new service decrements task count in dashboard when removed", function() {
    let tasksCountSpan = cy
      .get(".panel-header")
      .contains("Tasks")
      .parents(".panel")
      .find(".unit-primary");

    let tasksCountInitial;
    tasksCountSpan.should(function($label) {
      tasksCountInitial = parseFloat($label.text());
    });

    deleteService("test-service-updates-task-count");

    // Check that the dashboard is updated
    cy.visitUrl("dashboard");

    tasksCountSpan = cy
      .get(".panel-header")
      .contains("Tasks")
      .parents(".panel")
      .find(".unit-primary");

    tasksCountSpan.should(function($tasksCount) {
      const newValue = parseFloat($tasksCount.text());
      expect(newValue).to.eq(tasksCountInitial - 1);
    });
  });
});
