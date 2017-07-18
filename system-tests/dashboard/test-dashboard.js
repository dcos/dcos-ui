require("../_support/utils/ServicesUtil");
const { createService, deleteService } = require("../_support/index");

// same parameters as defined in app.json
const SERVICE_JSON_PATH = "/dcos-ui/system-tests/dashboard/app.json";
const SERVICE_NAME = "dashboard-test-service";
const SERVICE_CPUS = 0.1;
const SERVICE_MEM = 10;
const SERVICE_DISK = 10;

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
      deleteService(SERVICE_NAME);
      cy.window().then(win => {
        win.location.href = "about:blank";
      });
    });

    it("increments CPU usage when service is started", function() {
      createService(SERVICE_NAME, SERVICE_JSON_PATH);
      cy.visitUrl("dashboard");

      const label = getAllocationElementFor("CPU Allocation");
      label.should(function($label) {
        const newValue = parseFloat($label.text());
        expect(newValue).to.eq(SERVICE_CPUS);
      });
    });

    it("increments memory usage when service is started", function() {
      createService(SERVICE_NAME, SERVICE_JSON_PATH);
      cy.visitUrl("dashboard");

      const label = getAllocationElementFor("Memory Allocation");
      label.should(function($label) {
        const newValue = parseFloat($label.text());
        expect(newValue).to.eq(SERVICE_MEM);
      });
    });

    it("increments disk usage when service is started", function() {
      createService(SERVICE_NAME, SERVICE_JSON_PATH);
      cy.visitUrl("dashboard");

      const label = getAllocationElementFor("Disk Allocation");
      label.should(function($label) {
        const newValue = parseFloat($label.text());
        expect(newValue).to.eq(SERVICE_DISK);
      });
    });

    it("new service shows in services list on dashboard when started", function() {
      createService(SERVICE_NAME, SERVICE_JSON_PATH);
      cy.visitUrl("dashboard");

      cy
        .get(".panel-header")
        .contains("Services Health")
        .parents(".panel")
        .find("li")
        .contains(SERVICE_NAME);
    });

    it("new service increments task count in dashboard", function() {
      createService(SERVICE_NAME, SERVICE_JSON_PATH);
      cy.visitUrl("dashboard");

      const taskCountElement = getTaskCountElement();
      taskCountElement.should(function($tasksCount) {
        const newValue = parseFloat($tasksCount.text());
        expect(newValue).to.eq(1);
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

      createService(SERVICE_NAME, SERVICE_JSON_PATH);
      cy.visitUrl("dashboard");
      label = getAllocationElementFor("CPU Allocation");
      label.should(function($label) {
        expect(parseFloat($label.text())).to.equal(SERVICE_CPUS);
      });
    });

    afterEach(() => {
      cy.window().then(win => {
        win.location.href = "about:blank";
      });
    });

    it("decrements CPU usage when service is stopped", function() {
      deleteService(SERVICE_NAME);
      cy.visitUrl("dashboard");

      const label = getAllocationElementFor("CPU Allocation");
      label.should(function($label) {
        const newValue = parseFloat($label.text());
        expect(newValue).to.eq(0);
      });
    });

    it("decrements memory usage when service is stopped", function() {
      deleteService(SERVICE_NAME);
      cy.visitUrl("dashboard");

      const label = getAllocationElementFor("Memory Allocation");
      label.should(function($label) {
        const newValue = parseFloat($label.text());
        expect(newValue).to.eq(0);
      });
    });

    it("decrements disk usage when service is stopped", function() {
      deleteService(SERVICE_NAME);
      cy.visitUrl("dashboard");

      const label = getAllocationElementFor("Disk Allocation");
      label.should(function($label) {
        const newValue = parseFloat($label.text());
        expect(newValue).to.eq(0);
      });
    });

    it("new service disapears in services list on dashboard when stopped", function() {
      deleteService(SERVICE_NAME);
      cy.visitUrl("dashboard");

      cy
        .get(".panel-header")
        .contains("Services Health")
        .parents(".panel")
        .contains(SERVICE_NAME)
        .should("not.exist");
    });

    it("new service decrements task count in dashboard when removed", function() {
      deleteService(SERVICE_NAME);
      cy.visitUrl("dashboard");

      const taskCountElement = getTaskCountElement();
      taskCountElement.should(function($tasksCount) {
        const newValue = parseFloat($tasksCount.text());
        expect(newValue).to.eq(0);
      });
    });
  });
});
