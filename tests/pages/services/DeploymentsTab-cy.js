xdescribe("Deployments Tab", function() {
  context("Tab highlighting", function() {
    beforeEach(function() {
      cy.configureCluster({
        mesos: "1-for-each-health",
        deployments: "one-deployment",
        nodeHealth: true
      });

      cy.visitUrl({ url: "/services/deployments/" });
    });

    it("should have an active deployments tab", function() {
      cy
        .get(".menu-tabbed-item-label.active .menu-tabbed-item-label-text")
        .contains("Deployments")
        .should("to.have.length", 1);
    });

    it("should be able to go to services tab", function() {
      cy.get(".menu-tabbed-item-label").contains("Services").click();
      cy
        .get(".menu-tabbed-item-label.active .menu-tabbed-item-label-text")
        .contains("Services")
        .should("to.have.length", 1);
    });

    it("should be able to go to services tab by clicking service", function() {
      cy.get(".deployment-service-name span").contains("kafka").click();
      cy
        .get(".menu-tabbed-item-label.active .menu-tabbed-item-label-text")
        .contains("Services")
        .should("to.have.length", 1);
    });
  });
});
