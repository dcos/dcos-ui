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
    .each(v => {
      expect(v).to.eq(param);
    });
}

describe("Services Filter", () => {
  context("Status", () => {
    context("Running / Deploying tasks", () => {
      beforeEach(() => {
        cy.configureCluster({
          mesos: "1-task-healthy",
          nodeHealth: true
        });
      });

      it("Filters Running services", () => {
        testFilterByStatus("Running");
      });
    });

    context("Suspended tasks", () => {
      beforeEach(() => {
        cy.configureCluster({
          mesos: "1-service-suspended",
          nodeHealth: true
        });
      });

      it("Filters Stopped services", () => {
        testFilterByStatus("Stopped");
      });
    });

    context("Recovering tasks", () => {
      beforeEach(() => {
        cy.configureCluster({
          mesos: "1-service-recovering",
          nodeHealth: true,
          mesosStream: true
        });
      });

      it("Filters Recovering services", () => {
        testFilterByStatus("Recovering");
      });
    });

    context("Deleting tasks", () => {
      beforeEach(() => {
        cy.configureCluster({
          mesos: "1-service-deleting",
          nodeHealth: true
        });
      });

      it("Filters Deleting services", () => {
        testFilterByStatus("Deleting");
      });
    });
  });

  context("Health", () => {
    beforeEach(() => {
      cy.configureCluster({
        mesos: "1-task-healthy",
        nodeHealth: true
      });
    });

    it("filters Healthy services", () => {
      setFilter("Healthy");

      cy.get(".service-table")
        .getTableColumn("Name")
        .get(".table-cell-link-primary")
        .contents()
        .each(v => {
          expect(v).to.eq("sleep");
        });
    });

    it("filters Unhealthy services", () => {
      setFilter("Unhealthy");

      cy.get(".service-table")
        .getTableColumn("Name")
        .get(".table-cell-link-primary")
        .contents()
        .should("deep.equal", ["unhealthy", "unhealthy-sleep"]);
    });

    it("filters N/A services", () => {
      setFilter("N/A");

      cy.get(".service-table")
        .getTableColumn("Name")
        .get(".table-cell-link-primary")
        .contents()
        .should("deep.equal", [
          "1_app",
          "10_apps",
          "10000_apps",
          "2_apps",
          "group-with-pods",
          "net",
          "podEFGH",
          "podEFGH"
        ]);
    });
  });

  context("Other", () => {
    context("SDK", () => {
      beforeEach(() => {
        cy.configureCluster({
          mesos: "1-sdk-service",
          nodeHealth: true
        });
      });

      it("filters SDK services", () => {
        setFilter("Catalog");

        const serviceNames = ["sdk-sleep", "sdk-sleep-with-image"];

        cy.get(".service-table")
          .getTableColumn("Name")
          .get(".table-cell-link-primary")
          .contents()
          .each((v, index) => {
            expect(v).to.eq(serviceNames[index]);
          });
      });
    });

    context("Pods", () => {
      beforeEach(() => {
        cy.configureCluster({
          mesos: "1-task-healthy",
          nodeHealth: true
        });
      });

      it("filters Pods", () => {
        setFilter("Pod");

        cy.get(".service-table")
          .getTableColumn("Name")
          .get(".table-cell-link-primary")
          .contents()
          .each(v => {
            expect(v).to.eq("podEFGH");
          });
      });
    });

    context("Volumes", () => {
      beforeEach(() => {
        cy.configureCluster({
          mesos: "1-task-healthy",
          nodeHealth: true
        });
      });

      it("filters services with Volumes", () => {
        setFilter("Volumes");

        cy.get(".service-table")
          .getTableColumn("Name")
          .get(".table-cell-link-primary")
          .contents()
          .each(v => {
            expect(v).to.eq("sleep");
          });
      });
    });
  });
});
