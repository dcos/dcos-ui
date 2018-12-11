describe("Deployments Modal", function() {
  function openDeploymentsModal(numDeployments = 1) {
    cy.get(".button").contains(numDeployments + " deployment").click();
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
    it("should have a deployments button", function() {
      cy.get(".button").contains("1 deployment").should("to.have.length", 1);
    });

    it("should open the modal when clicking the deployments button", function() {
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

    it("should close when the close button is clicked", function() {
      cy.get(".modal").then(function($modal) {
        expect($modal.get().length).to.equal(1);
      });
      cy.get(".modal-footer button").contains("Close").click();
      cy.wait(700).then(function() {
        expect(document.querySelectorAll(".modal").length).to.equal(0);
      });
    });

    it("should render the deployments count", function() {
      cy.get(".modal-header").then(function($header) {
        expect($header.get(0).textContent).to.equal("1 Active Deployment");
      });
    });

    it("should render one row per deployment", function() {
      cy.get(".modal tbody tr:visible").then(function($tableRows) {
        expect($tableRows.get().length).to.equal(1);
      });
    });

    it("should render the `id` column", function() {
      cy.get(".modal tbody tr:visible td").then(function($tableCells) {
        cy.getAPIResponse("marathon/v2/deployments", function(response) {
          expect(
            $tableCells.get(0).querySelector(".collapsing-string-full-string")
              .textContent
          ).to.equal(response[0].id);
        });
      });
    });

    it("should render the `started` column", function() {
      cy.get(".modal tbody tr:visible td").then(function($tableCells) {
        cy.getAPIResponse("marathon/v2/deployments", function(response) {
          expect(
            $tableCells.get(1).querySelector("time").getAttribute("datetime")
          ).to.equal(response[0].version);
        });
      });
    });

    it("should render the `status` column", function() {
      cy.get(".modal tbody tr:visible td").then(function($tableCells) {
        expect(
          $tableCells.get(2).querySelectorAll(".status-bar").length
        ).to.equal(1);
      });
    });

    it("should be auto-expanded to show services", function() {
      cy
        .get(
          ".modal tbody tr:visible td .expanding-table-child .table-cell-value"
        )
        .then(function($expandedChildText) {
          cy.getAPIResponse("marathon/v2/deployments", function(response) {
            expect($expandedChildText.get(0).textContent).to.equal(
              response[0].affectedApps[0].replace(/^\//, "")
            );
          });
        });
    });

    it("displays the rollback modal when clicked", function() {
      cy.get(".modal tbody tr:visible td .dropdown").click();
      cy.get(".dropdown-menu-items").contains("Rollback").click();
      cy.get(".modal").then(function($modals) {
        expect($modals.get().length).to.equal(2);
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
        cy.get(".dropdown-menu-items").contains("Rollback").click();
        cy.get(".modal button").contains("Continue Rollback").click();

        cy.wait(700).then(function() {
          expect(document.querySelectorAll(".modal").length).to.equal(0);
        });
      });
    });
  });

  context("Stale Deployments", function() {
    beforeEach(function() {
      cy.route(
        /marathon\/v2\/deployments/,
        "fx:deployments/two-deployments-one-stale"
      );
      cy.visitUrl({ url: "/services/overview/" });
      openDeploymentsModal(2);
    });
    it("shows stale deployment in modal", function() {
      cy.get(".deployments-table-column-id").contains("spark-history-stale");
    });
    it("shows status of stale deployment", function() {
      cy.get(".deployments-table-column-status").contains("StopApplication");
    });
  });
});
