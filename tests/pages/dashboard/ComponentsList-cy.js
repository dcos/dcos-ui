describe("ComponentsList [10b]", function() {
  context("No Components Found [10f]", function() {
    // TODO: Turn into unit test
    it("shows error when components not found [10d]", function() {
      cy
        .configureCluster({
          mesos: "1-task-healthy",
          componentHealth: false
        })
        .visitUrl({ url: "/dashboard", identify: true, fakeAnalytics: true });

      cy
        .get(".dashboard-panel-list-component-health h3")
        .should(function($error) {
          expect($error).to.contain("Components Not Found");
        });
    });
  });

  context("Components List Widget [10e]", function() {
    beforeEach(function() {
      cy
        .configureCluster({
          mesos: "1-task-healthy",
          componentHealth: true
        })
        .visitUrl({ url: "/dashboard", identify: true, fakeAnalytics: true });
    });

    it("shows an acceptable number of components [10f]", function() {
      cy.get(".dashboard-panel-list-component-health").within(function() {
        cy.get("li").should(function($components) {
          expect($components.length).to.be.at.least(1).and.to.be.lte(5);
        });
      });
    });

    it("navigates to unit health page [10c]", function() {
      cy
        .get(".dashboard-panel-list-component-health .button")
        .contains("Components")
        .click();
      cy.hash().should("match", /components/);
    });
  });
});
