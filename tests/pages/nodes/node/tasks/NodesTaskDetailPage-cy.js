describe("Nodes Task Detail Page", function() {
  beforeEach(function() {
    cy.configureCluster({
      mesos: "1-service-with-executor-task",
      nodeHealth: true
    });
  });

  context("Navigate to node task detail page", function() {
    context("Navigate to the tabs", function() {
      beforeEach(function() {
        cy.visitUrl({ url: "/nodes", identify: true, fakeAnalytics: true });
        cy.get("a.table-cell-link-primary")
          .eq(0)
          .click({ force: true });
        cy.get("a.table-cell-link-secondary")
          .eq(0)
          .click();
        cy.hash().should("match", /nodes\/[a-zA-Z0-9-]+\/tasks\/[a-zA-Z0-9-]+/);
      });

      it("navigates to node task detail page", function() {
        cy.get("h1.configuration-map-heading").contains("Configuration");
      });

      it("navigates to node task files page", function() {
        cy.get(".menu-tabbed-item-label")
          .contains("Files")
          .click();
        cy.get(".control-group").contains("Working Directory");
        cy.get("table.table").should("exist");
      });

      it("navigates to node task logs page", function() {
        cy.get(".menu-tabbed-item-label")
          .contains("Logs")
          .click();
        cy.get("pre.prettyprint").should("exist");
      });
    });

    it("loads page with data after hard reload", function() {
      cy.visitUrl({ url: "/nodes", identify: true });
      cy.get("a.table-cell-link-primary")
        .eq(0)
        .click({ force: true });
      cy.get("a.table-cell-link-secondary")
        .eq(0)
        .click();
      cy.hash().should("match", /nodes\/[a-zA-Z0-9-]+\/tasks\/[a-zA-Z0-9-]+/);

      cy.reload(true);

      cy.get("h1.configuration-map-heading").contains("Configuration");
    });
  });
});
