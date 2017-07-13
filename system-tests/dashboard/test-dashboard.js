require("../_support/utils/ServicesUtil");
const { Timeouts } = require("../_support/constants");

// same service name as defined in app.json
const SERVICE_NAME = "dashboard-test-service";

function deleteService() {
  cy.exec(
    `dcos marathon app remove /${Cypress.env("TEST_UUID")}/${SERVICE_NAME}`
  );
  cy.visitUrl(`services/overview/%2F${Cypress.env("TEST_UUID")}`);
  cy.get(".page-body-content table").contains(SERVICE_NAME).should("not.exist");
}

function createService() {
  cy.exec(
    `sed 's/dashboard-test-service/${Cypress.env("TEST_UUID")}\\/dashboard-test-service/g' /dcos-ui/system-tests/dashboard/app.json | dcos marathon app add`
  );
  cy.visitUrl(`services/overview/%2F${Cypress.env("TEST_UUID")}`);

  cy
    .get(".page-body-content table", {
      timeout: Timeouts.SERVICE_DEPLOYMENT_TIMEOUT
    })
    .contains(SERVICE_NAME, { timeout: Timeouts.SERVICE_DEPLOYMENT_TIMEOUT })
    .should("exist");
  cy
    .get(".page-body-content table")
    .getTableRowThatContains(SERVICE_NAME)
    .contains("Running", { timeout: Timeouts.SERVICE_DEPLOYMENT_TIMEOUT })
    .should("exist");
}

function getAllocationElementFor(name) {
  return cy
    .get(".panel-header")
    .contains(name)
    .parents(".panel")
    .find(".unit-label");
}

function getTaskCountElement() {
  return cy
    .get(".panel-header")
    .contains("Tasks")
    .parents(".panel")
    .find(".unit-primary");
}

describe("Dashboard", function() {
  describe("Create service tests", function() {
    beforeEach(() => {
      cy.visitUrl("dashboard");
      const label = getAllocationElementFor("CPU Allocation");
      label.should(function($label) {
        expect(parseFloat($label.text())).to.equal(0);
      });
    });

    afterEach(() => {
      deleteService();
      cy.window().then(win => {
        win.location.href = "about:blank";
      });
    });

    it("increments CPU usage when service is started", function() {
      let label = getAllocationElementFor("CPU Allocation");
      let initialValue;
      label.should(function($label) {
        initialValue = parseFloat($label.text());
      });

      createService();
      cy.visitUrl("dashboard");

      label = getAllocationElementFor("CPU Allocation");
      label.should(function($label) {
        const newValue = parseFloat($label.text());
        expect(newValue).to.eq(initialValue + 0.1);
      });
    });

    it("increments memory usage when service is started", function() {
      let label = getAllocationElementFor("Memory Allocation");
      let initialValue;
      label.should(function($label) {
        initialValue = parseFloat($label.text());
      });

      createService();
      cy.visitUrl("dashboard");

      label = getAllocationElementFor("Memory Allocation");
      label.should(function($label) {
        const newValue = parseFloat($label.text());
        expect(newValue).to.eq(initialValue + 10);
      });
    });

    it("increments disk usage when service is started", function() {
      let label = getAllocationElementFor("Disk Allocation");
      let initialValue;
      label.should(function($label) {
        initialValue = parseFloat($label.text());
      });

      createService();
      cy.visitUrl("dashboard");

      label = getAllocationElementFor("Disk Allocation");
      label.should(function($label) {
        const newValue = parseFloat($label.text());
        expect(newValue).to.eq(initialValue + 10);
      });
    });

    it("new service shows in services list on dashboard when started", function() {
      createService();
      cy.visitUrl("dashboard");

      cy
        .get(".panel-header")
        .contains("Services Health")
        .parents(".panel")
        .find("li")
        .contains(SERVICE_NAME);
    });

    it("new service increments task count in dashboard", function() {
      let taskCountElement = getTaskCountElement();
      let tasksCountInitial;
      taskCountElement.should(function($label) {
        tasksCountInitial = parseFloat($label.text());
      });

      createService();
      cy.visitUrl("dashboard");

      taskCountElement = getTaskCountElement();
      taskCountElement.should(function($tasksCount) {
        const newValue = parseFloat($tasksCount.text());
        expect(newValue).to.eq(tasksCountInitial + 1);
      });
    });
  });

  describe("Delete service tests", function() {
    beforeEach(() => {
      cy.visitUrl("dashboard");
      let label = getAllocationElementFor("CPU Allocation");
      label.should(function($label) {
        expect(parseFloat($label.text())).to.equal(0);
      });

      createService();
      cy.visitUrl("dashboard");
      label = getAllocationElementFor("CPU Allocation");
      label.should(function($label) {
        expect(parseFloat($label.text())).to.equal(0.1);
      });
    });

    afterEach(() => {
      cy.window().then(win => {
        win.location.href = "about:blank";
      });
    });

    it("decrements CPU usage when service is stopped", function() {
      let label = getAllocationElementFor("CPU Allocation");
      let initialValue;
      label.should(function($label) {
        initialValue = parseFloat($label.text());
      });

      deleteService();
      cy.visitUrl("dashboard");

      label = getAllocationElementFor("CPU Allocation");
      label.should(function($label) {
        const newValue = parseFloat($label.text());
        expect(newValue).to.eq(initialValue - 0.1);
      });
    });

    it("decrements memory usage when service is stopped", function() {
      let label = getAllocationElementFor("Memory Allocation");
      let initialValue;
      label.should(function($label) {
        initialValue = parseFloat($label.text());
      });

      deleteService();
      cy.visitUrl("dashboard");

      label = getAllocationElementFor("Memory Allocation");
      label.should(function($label) {
        const newValue = parseFloat($label.text());
        expect(newValue).to.eq(initialValue - 10);
      });
    });

    it("decrements disk usage when service is stopped", function() {
      let label = getAllocationElementFor("Disk Allocation");
      let initialValue;
      label.should(function($label) {
        initialValue = parseFloat($label.text());
      });

      deleteService();
      cy.visitUrl("dashboard");

      label = getAllocationElementFor("Disk Allocation");
      label.should(function($label) {
        const newValue = parseFloat($label.text());
        expect(newValue).to.eq(initialValue - 10);
      });
    });

    it("new service dissapears in services list on dashboard when stopped", function() {
      deleteService();
      cy.visitUrl("dashboard");

      cy
        .get(".panel-header")
        .contains("Services Health")
        .parents(".panel")
        .contains(SERVICE_NAME)
        .should("not.exist");
    });

    it("new service decrements task count in dashboard when removed", function() {
      let taskCountElement = getTaskCountElement();
      let tasksCountInitial;
      taskCountElement.should(function($label) {
        tasksCountInitial = parseFloat($label.text());
      });

      deleteService();
      cy.visitUrl("dashboard");

      taskCountElement = getTaskCountElement();
      taskCountElement.should(function($tasksCount) {
        const newValue = parseFloat($tasksCount.text());
        expect(newValue).to.eq(tasksCountInitial - 1);
      });
    });
  });
});
