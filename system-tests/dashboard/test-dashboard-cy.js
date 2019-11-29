require("../_support/utils/ServicesUtil");
const { createService, deleteService } = require("../_support/index");

const serviceDefinition = {
  id: `/${Cypress.env("TEST_UUID")}/dashboard-test-service`,
  instances: 1,
  portDefinitions: [],
  container: {
    docker: {
      image: "nginx"
    },
    type: "DOCKER",
    volumes: []
  },
  cpus: 0.1,
  mem: 10,
  requirePorts: false,
  networks: [],
  healthChecks: [],
  fetch: [],
  constraints: [],
  disk: 10,
  cmd: "while true; do echo 'test' ; sleep 100 ; done"
};

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

describe("Dashboard statistics", () => {
  it("changes when a service is started", () => {
    // SETUP
    cy.visitUrl("dashboard");
    getAllocationElementFor("CPU Allocation").should($label => {
      expect(parseFloat($label.text())).to.equal(0);
    });

    // CREATE SERVICE AND RUN ASSERTIONS
    createService(serviceDefinition);
    cy.visitUrl("dashboard");

    getAllocationElementFor("CPU Allocation").should($label => {
      expect(parseFloat($label.text())).to.eq(serviceDefinition.cpus);
    });

    getAllocationElementFor("Memory Allocation").should($label => {
      expect(parseFloat($label.text())).to.eq(serviceDefinition.mem);
    });

    getAllocationElementFor("Disk Allocation").should($label => {
      expect(parseFloat($label.text())).to.eq(serviceDefinition.disk);
    });

    // new service shows in services list on dashboard when started
    cy.get(".panel-header")
      .contains("Services Status")
      .parents(".panel")
      .find("li")
      .contains("dashboard-test-service");

    // new service increments task count in dashboard
    getTaskCountElement().should($tasksCount => {
      expect(parseFloat($tasksCount.text())).to.eq(1);
    });
  });

  it("changes when a service is stopped", () => {
    cy.visitUrl("dashboard");

    // VERIFY THE SERVICE FROM THE PREVIOUS TEST IS STILL UP AND RUNNING
    // we know that's not atomic testing, but starting and stopping stuff is expensive.
    getAllocationElementFor("CPU Allocation").should($label => {
      expect(parseFloat($label.text())).to.equal(serviceDefinition.cpus);
    });

    // DELETE SERVICE AND RUN ASSERTIONS
    deleteService(serviceDefinition.id);

    cy.visitUrl("dashboard");
    getAllocationElementFor("CPU Allocation").should($label => {
      expect(parseFloat($label.text())).to.eq(0);
    });

    getAllocationElementFor("Memory Allocation").should($label => {
      expect(parseFloat($label.text())).to.eq(0);
    });

    getAllocationElementFor("Disk Allocation").should($label => {
      expect(parseFloat($label.text())).to.eq(0);
    });

    // new service disapears in services list on dashboard when stopped
    cy.get(".panel-header")
      .contains("Services Status")
      .parents(".panel")
      .contains("dashboard-test-service")
      .should("not.exist");

    // new service decrements task count in dashboard when removed

    getTaskCountElement().should($tasksCount => {
      const newValue = parseFloat($tasksCount.text());
      expect(newValue).to.eq(0);
    });
  });
});
