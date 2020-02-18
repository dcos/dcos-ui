const fixture = require("../../_fixtures/marathon-1-task/deployments");

describe("Deployments Modal", () => {
  function openDeploymentsModal() {
    cy.get(".button")
      .contains("deployment")
      .click();
  }

  beforeEach(() => {
    cy.configureCluster({
      mesos: "1-for-each-health",
      deployments: "one-deployment",
      nodeHealth: true
    });

    cy.visitUrl({ url: "/services/overview/" });
  });

  context("Modal Trigger", () => {
    it("has a deployments button", () => {
      cy.get(".button")
        .contains("1 deployment")
        .should("to.have.length", 1);
    });

    it("opens the modal when clicking the deployments button", () => {
      openDeploymentsModal();

      cy.get(".modal").then($modal => {
        expect($modal.get().length).to.equal(1);
      });
    });
  });

  context("Modal Content", () => {
    beforeEach(() => {
      openDeploymentsModal();
    });

    it("closes when the close button is clicked", () => {
      cy.get(".modal").then($modal => {
        expect($modal.get().length).to.equal(1);
      });
      cy.get(".modal-footer button")
        .contains("Close")
        .click();
      cy.wait(700).then(() => {
        expect(document.querySelectorAll(".modal").length).to.equal(0);
      });
    });

    it("renders interesting things", () => {
      // the deployment count
      cy.get(".modal-header-title").then($header => {
        expect($header.get(0).textContent).to.contain("1 Active Deployment");
      });

      // one row per deployment
      cy.get(".modal tbody tr:visible").then($tableRows => {
        expect($tableRows.get().length).to.equal(1);
      });

      // the `id` column
      cy.get(".modal tbody tr:visible td").then($tableCells => {
        expect(
          $tableCells.get(0).querySelector(".collapsing-string-full-string")
            .textContent
        ).to.equal(fixture[0].id);
      });

      // the `started` column
      cy.get(".modal tbody tr:visible td").then($tableCells => {
        expect(
          $tableCells
            .get(1)
            .querySelector("time")
            .getAttribute("datetime")
        ).to.match(/2016-07-05T17:54:37/);
      });

      // the `status` column
      cy.get(".modal tbody tr:visible td").then($tableCells => {
        expect(
          $tableCells.get(2).querySelectorAll(".status-bar").length
        ).to.equal(1);
      });

      // it is auto-expanded to show services
      cy.get(
        ".modal tbody tr:visible td .expanding-table-child .table-cell-value"
      ).then($expandedChildText => {
        expect($expandedChildText.get(0).textContent).to.equal(
          fixture[0].affectedApps[0].replace(/^\//, "")
        );
      });
    });

    it("dismisses both modals when the rollback is performed", () => {
      cy.route({
        method: "DELETE",
        url: /marathon\/v2\/deployments/,
        status: 400,
        response: {
          version: fixture[0].version,
          deploymentId: fixture[0].id
        }
      });

      cy.get(".modal tbody tr:visible td .dropdown").click();
      cy.get(".dropdown-menu-items")
        .contains("Rollback")
        .click();
      cy.get(".modal button")
        .contains("Continue Rollback")
        .click();

      cy.wait(700).then(() => {
        expect(document.querySelectorAll(".modal").length).to.equal(0);
      });
    });
  });

  context("Rollback modal", () => {
    it("displays the rollback modal when clicked", () => {
      openDeploymentsModal();
      cy.get(".modal tbody tr:visible td .dropdown").click();
      cy.get(".dropdown-menu-items")
        .contains("Rollback")
        .click();
      cy.get(".modal").then($modals => {
        expect($modals.get().length).to.equal(2);
      });
    });

    it("displays a revert message for a non-starting deployment", () => {
      openDeploymentsModal();
      cy.get(".modal tbody tr:visible td .dropdown").click();
      cy.get(".dropdown-menu-items")
        .contains("Rollback")
        .click();
      cy.contains("revert the affected service");
    });

    it("displays a removal message for a starting deployment", () => {
      cy.server().route(
        /marathon\/v2\/deployments/,
        "fx:deployments/starting-deployment"
      );
      openDeploymentsModal();
      cy.get(".modal tbody tr:visible td .dropdown").click();
      cy.get(".dropdown-menu-items")
        .contains("Rollback")
        .click();
      cy.contains("delete the affected service");
    });
  });

  context("Stale Deployments", () => {
    beforeEach(() => {
      cy.server().route(
        /marathon\/v2\/deployments/,
        "fx:deployments/two-deployments-one-stale"
      );
      openDeploymentsModal();
    });

    it("shows stale deployment in modal", () => {
      cy.get(".deployments-table-column-id").contains("spark-history-stale");
    });
    it("shows status of stale deployment", () => {
      cy.get(".deployments-table-column-status").contains("StopApplication");
    });
  });

  context("Sorting", () => {
    beforeEach(() => {
      cy.server().route(
        /marathon\/v2\/deployments/,
        "fx:deployments/three-deployments"
      );
      openDeploymentsModal();
    });

    it("sorts by started", () => {
      cy.get(".table-header-title")
        .contains("Started")
        .click();
      cy.get(".caret--visible")
        .prev()
        .contains("Started");

      // First, second and third row.
      cy.get("tbody")
        .children()
        .eq(0)
        .contains("b4f69082-6f96-4c92-a778-37bf61c59686"); // July 2016
      cy.get("tbody")
        .children()
        .eq(1)
        .contains("staleId"); // November 2018
      cy.get("tbody")
        .children()
        .eq(2)
        .contains("staleId-2"); // January 2019

      cy.get(".table-header-title")
        .contains("Started")
        .click();
      cy.get("tbody")
        .children()
        .eq(2)
        .contains("b4f69082-6f96-4c92-a778-37bf61c59686");
      cy.get("tbody")
        .children()
        .eq(1)
        .contains("staleId");
      cy.get("tbody")
        .children()
        .eq(0)
        .contains("staleId-2");
    });
  });
});
