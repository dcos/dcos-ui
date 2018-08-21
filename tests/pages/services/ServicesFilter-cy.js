// import { SERVER_RESPONSE_DELAY } from "../../_support/constants/Timeouts";
function setFilter(param) {
  cy.visitUrl({ url: "/services/overview" });
  cy.get("[placeholder='Filter']").click();
  cy.get("label")
    .contains(param)
    .click();
}

function testFilterByStatus(param) {
  setFilter(param);

  cy.get(".service-table")
    .getTableColumn("Status")
    .get(".status-bar-text")
    .contents()
    .each(function(v) {
      expect(v).to.eq(param);
    });
}

describe("Services Filter", function() {
  context("Status", function() {
    context("Running / Deploying tasks", function() {
      beforeEach(function() {
        cy.configureCluster({
          mesos: "1-task-healthy",
          nodeHealth: true
        });
      });

      it("Filters Running services", function() {
        testFilterByStatus("Running");
      });

      it("Filters Deploying services", function() {
        testFilterByStatus("Deploying");
      });
    });

    context("Suspended tasks", function() {
      beforeEach(function() {
        cy.configureCluster({
          mesos: "1-service-suspended",
          nodeHealth: true
        });
      });

      it("Filters Stopped services", function() {
        testFilterByStatus("Stopped");
      });
    });

    context("Recovering tasks", function() {
      beforeEach(function() {
        cy.configureCluster({
          mesos: "1-service-recovering",
          nodeHealth: true,
          mesosStream: true
        });
      });

      it("Filters Recovering services", function() {
        testFilterByStatus("Recovering");
      });
    });

    context("Deleting tasks", function() {
      beforeEach(function() {
        cy.configureCluster({
          mesos: "1-service-deleting",
          nodeHealth: true
        });
      });

      it("Filters Deleting services", function() {
        testFilterByStatus("Deleting");
      });
    });
  });

  context("Health", function() {
    beforeEach(function() {
      cy.configureCluster({
        mesos: "1-task-healthy",
        nodeHealth: true
      });
    });

    it("filters Healthy services", function() {
      setFilter("Healthy");

      cy.get(".service-table")
        .getTableColumn("Name")
        .get(".table-cell-link-primary")
        .contents()
        .each(function(v) {
          expect(v).to.eq("sleep");
        });
    });

    it("filters Unhealthy services", function() {
      setFilter("Unhealthy");

      cy.get(".service-table")
        .getTableColumn("Name")
        .get(".table-cell-link-primary")
        .contents()
        .should("deep.equal", ["unhealthy", "unhealthy-sleep"]);
    });

    it("filters N/A services", function() {
      setFilter("N/A");

      cy.get(".service-table")
        .getTableColumn("Name")
        .get(".table-cell-link-primary")
        .contents()
        .should("deep.equal", ["group-with-pods", "podEFGH"]);
    });
  });

  context("Other", function() {
    context("SDK", function() {
      beforeEach(function() {
        cy.configureCluster({
          mesos: "1-sdk-service",
          nodeHealth: true
        });
      });

      it("filters SDK services", function() {
        setFilter("Catalog");

        const serviceNames = ["sdk-sleep", "sdk-sleep-with-image"];

        cy.get(".service-table")
          .getTableColumn("Name")
          .get(".table-cell-link-primary")
          .contents()
          .each(function(v, index) {
            expect(v).to.eq(serviceNames[index]);
          });
      });
    });

    context("Pods", function() {
      beforeEach(function() {
        cy.configureCluster({
          mesos: "1-task-healthy",
          nodeHealth: true
        });
      });

      it("filters Pods", function() {
        setFilter("Pod");

        cy.get(".service-table")
          .getTableColumn("Name")
          .get(".table-cell-link-primary")
          .contents()
          .each(function(v) {
            expect(v).to.eq("podEFGH");
          });
      });
    });

    context("Volumes", function() {
      beforeEach(function() {
        cy.configureCluster({
          mesos: "1-task-healthy",
          nodeHealth: true
        });
      });

      it("filters services with Volumes", function() {
        setFilter("Volumes");

        cy.get(".service-table")
          .getTableColumn("Name")
          .get(".table-cell-link-primary")
          .contents()
          .each(function(v) {
            expect(v).to.eq("sleep");
          });
      });
    });
  });
});
