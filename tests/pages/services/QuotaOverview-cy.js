describe("Quota Tab", function() {
  context("No quota set", function() {
    beforeEach(function() {
      cy.configureCluster({
        mesos: "1-task-healthy",
        nodeHealth: true
      });
    });

    it("Shows the quota tab", function() {
      cy.visitUrl({ url: "/services/overview" });
      cy.get(".menu-tabbed-item-label-text")
        .contains("Quota")
        .click();
    });

    it("Shows the no quota message", function() {
      cy.visitUrl({ url: "/services/quota" });
      cy.get(".panel-content")
        .contains("No quota defined")
        .should("exist");
    });

    it("Shows a working back to services button", function() {
      cy.visitUrl({ url: "/services/quota" });
      cy.get(".button-primary")
        .contains("Back to Services")
        .click();
      cy.get(".service-table").should("exist");
    });
  });
});
