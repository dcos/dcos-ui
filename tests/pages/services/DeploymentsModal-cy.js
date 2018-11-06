describe("Deployments Modal", function() {
  function openDeploymentsModal() {
    cy.get(".button")
      .contains("1 deployment")
      .click();
  }

  beforeEach(function() {
    cy.configureCluster({
      mesos: "1-for-each-health",
      deployments: "one-deployment",
      nodeHealth: true
    });

    cy.visitUrl({ url: "/services/overview/" });
  });

  context("Modal Trigger", function() {
    it("has a deployments button", function() {
      cy.get(".button")
        .contains("1 deployment")
        .should("to.have.length", 1);
    });

    it("opens the modal when clicking the deployments button", function() {
      openDeploymentsModal();

      cy.get(".modal").then(function($modal) {
        expect($modal.get().length).to.equal(1);
      });
    });
  });

  context("Modal Content", function() {
    beforeEach(function() {
      openDeploymentsModal();
    });

    it("closes when the close button is clicked", function() {
      cy.get(".modal").then(function($modal) {
        expect($modal.get().length).to.equal(1);
      });
      cy.get(".modal-footer button")
        .contains("Close")
        .click();
      cy.wait(700).then(function() {
        expect(document.querySelectorAll(".modal").length).to.equal(0);
      });
    });

    it("renders the deployments count", function() {
      cy.get(".modal-header").then(function($header) {
        expect($header.get(0).textContent).to.equal("1 Active Deployment");
      });
    });

    it("renders one row per deployment", function() {
      cy.get(".modal tbody tr:visible").then(function($tableRows) {
        expect($tableRows.get().length).to.equal(1);
      });
    });

    it("renders the `id` column", function() {
      cy.get(".modal tbody tr:visible td").then(function($tableCells) {
        cy.getAPIResponse("marathon/v2/deployments", function(response) {
          expect(
            $tableCells.get(0).querySelector(".collapsing-string-full-string")
              .textContent
          ).to.equal(response[0].id);
        });
      });
    });

    it("renders the `started` column", function() {
      cy.get(".modal tbody tr:visible td").then(function($tableCells) {
        cy.getAPIResponse("marathon/v2/deployments", function(response) {
          expect(
            $tableCells
              .get(1)
              .querySelector("time")
              .getAttribute("datetime")
          ).to.equal(response[0].version);
        });
      });
    });

    it("renders the `status` column", function() {
      cy.get(".modal tbody tr:visible td").then(function($tableCells) {
        expect(
          $tableCells.get(2).querySelectorAll(".status-bar").length
        ).to.equal(1);
      });
    });

    it("is auto-expanded to show services", function() {
      cy.get(
        ".modal tbody tr:visible td .expanding-table-child .table-cell-value"
      ).then(function($expandedChildText) {
        cy.getAPIResponse("marathon/v2/deployments", function(response) {
          expect($expandedChildText.get(0).textContent).to.equal(
            response[0].affectedApps[0].replace(/^\//, "")
          );
        });
      });
    });

    it("dismisses both modals when the rollback is performed", function() {
      cy.getAPIResponse("marathon/v2/deployments", function(response) {
        cy.route({
          method: "DELETE",
          url: /marathon\/v2\/deployments/,
          status: 400,
          response: {
            version: response[0].version,
            deploymentId: response[0].id
          }
        });

        cy.get(".modal tbody tr:visible td .dropdown").click();
        cy.get(".dropdown-menu-items")
          .contains("Rollback")
          .click();
        cy.get(".modal button")
          .contains("Continue Rollback")
          .click();

        cy.wait(700).then(function() {
          expect(document.querySelectorAll(".modal").length).to.equal(0);
        });
      });
    });
  });

  context("Rollback modal", function() {
    it("displays the rollback modal when clicked", function() {
      openDeploymentsModal();
      cy.get(".modal tbody tr:visible td .dropdown").click();
      cy.get(".dropdown-menu-items")
        .contains("Rollback")
        .click();
      cy.get(".modal").then(function($modals) {
        expect($modals.get().length).to.equal(2);
      });
    });

    it("displays a revert message for a non-starting deployment", function() {
      openDeploymentsModal();
      cy.get(".modal tbody tr:visible td .dropdown").click();
      cy.get(".dropdown-menu-items")
        .contains("Rollback")
        .click();
      cy.contains("revert the affected service");
    });

    it("displays a removal message for a starting deployment", function() {
      cy.server().route(
        /marathon\/v2\/deployments/,
        "fx:deployments/starting-deployment"
      );
      cy.visitUrl({ url: "/services/overview/" });
      openDeploymentsModal();
      cy.get(".modal tbody tr:visible td .dropdown").click();
      cy.get(".dropdown-menu-items")
        .contains("Rollback")
        .click();
      cy.contains("delete the affected service");
    });
  });
});
