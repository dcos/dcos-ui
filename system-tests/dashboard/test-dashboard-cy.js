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

describe("Dashboard", () => {
  describe("Create service tests", () => {
    beforeEach(() => {
      cy.visitUrl("dashboard");
      const label = getAllocationElementFor("CPU Allocation");
      label.should($label => {
        expect(parseFloat($label.text())).to.equal(0);
      });
    });

    afterEach(() => {
      deleteService(serviceDefinition.id);
      cy.window().then(win => {
        win.location.href = "about:blank";
      });
    });

    it("increments CPU usage when service is started", () => {
      createService(serviceDefinition);
      cy.visitUrl("dashboard");

      const label = getAllocationElementFor("CPU Allocation");
      label.should($label => {
        const newValue = parseFloat($label.text());
        expect(newValue).to.eq(serviceDefinition.cpus);
      });
    });

    it("increments memory usage when service is started", () => {
      createService(serviceDefinition);
      cy.visitUrl("dashboard");

      const label = getAllocationElementFor("Memory Allocation");
      label.should($label => {
        const newValue = parseFloat($label.text());
        expect(newValue).to.eq(serviceDefinition.mem);
      });
    });

    it("increments disk usage when service is started", () => {
      createService(serviceDefinition);
      cy.visitUrl("dashboard");

      const label = getAllocationElementFor("Disk Allocation");
      label.should($label => {
        const newValue = parseFloat($label.text());
        expect(newValue).to.eq(serviceDefinition.disk);
      });
    });

    it("new service shows in services list on dashboard when started", () => {
      createService(serviceDefinition);
      cy.visitUrl("dashboard");

      const serviceName = serviceDefinition.id.substring(
        serviceDefinition.id.lastIndexOf("/") + 1
      );
      cy.get(".panel-header")
        .contains("Services Status")
        .parents(".panel")
        .find("li")
        .contains(serviceName);
    });

    it("new service increments task count in dashboard", () => {
      createService(serviceDefinition);
      cy.visitUrl("dashboard");

      const taskCountElement = getTaskCountElement();
      taskCountElement.should($tasksCount => {
        const newValue = parseFloat($tasksCount.text());
        expect(newValue).to.eq(1);
      });
    });
  });

  describe("Delete service tests", () => {
    beforeEach(() => {
      cy.visitUrl("dashboard");
      let label = getAllocationElementFor("CPU Allocation");
      label.should($label => {
        expect(parseFloat($label.text())).to.equal(0);
      });

      createService(serviceDefinition);
      cy.visitUrl("dashboard");
      label = getAllocationElementFor("CPU Allocation");
      label.should($label => {
        expect(parseFloat($label.text())).to.equal(serviceDefinition.cpus);
      });
    });

    afterEach(() => {
      cy.window().then(win => {
        win.location.href = "about:blank";
      });
    });

    it("decrements CPU usage when service is stopped", () => {
      deleteService(serviceDefinition.id);
      cy.visitUrl("dashboard");

      const label = getAllocationElementFor("CPU Allocation");
      label.should($label => {
        const newValue = parseFloat($label.text());
        expect(newValue).to.eq(0);
      });
    });

    it("decrements memory usage when service is stopped", () => {
      deleteService(serviceDefinition.id);
      cy.visitUrl("dashboard");

      const label = getAllocationElementFor("Memory Allocation");
      label.should($label => {
        const newValue = parseFloat($label.text());
        expect(newValue).to.eq(0);
      });
    });

    it("decrements disk usage when service is stopped", () => {
      deleteService(serviceDefinition.id);
      cy.visitUrl("dashboard");

      const label = getAllocationElementFor("Disk Allocation");
      label.should($label => {
        const newValue = parseFloat($label.text());
        expect(newValue).to.eq(0);
      });
    });

    it("new service disapears in services list on dashboard when stopped", () => {
      deleteService(serviceDefinition.id);
      cy.visitUrl("dashboard");

      const serviceName = serviceDefinition.id.substring(
        serviceDefinition.id.lastIndexOf("/") + 1
      );
      cy.get(".panel-header")
        .contains("Services Status")
        .parents(".panel")
        .contains(serviceName)
        .should("not.exist");
    });

    it("new service decrements task count in dashboard when removed", () => {
      deleteService(serviceDefinition.id);
      cy.visitUrl("dashboard");

      const taskCountElement = getTaskCountElement();
      taskCountElement.should($tasksCount => {
        const newValue = parseFloat($tasksCount.text());
        expect(newValue).to.eq(0);
      });
    });
  });
});
