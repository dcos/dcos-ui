describe("ComponentsList [10b]", () => {
  context("No Components Found [10f]", () => {
    // TODO: Turn into unit test
    it("shows error when components not found [10d]", () => {
      cy.configureCluster({
        mesos: "1-task-healthy",
        componentHealth: false,
      }).visitUrl({ url: "/dashboard", identify: true });

      cy.get(".dashboard-panel-list-component-health h3").should(($error) => {
        expect($error).to.contain("Components Not Found");
      });
    });
  });

  context("Components List Widget [10e]", () => {
    beforeEach(() => {
      cy.configureCluster({
        mesos: "1-task-healthy",
        componentHealth: true,
      }).visitUrl({ url: "/dashboard", identify: true });
    });

    it("shows an acceptable number of components [10f]", () => {
      cy.get(".dashboard-panel-list-component-health").within(() => {
        cy.get("li").should(($components) => {
          expect($components.length).to.be.at.least(1).and.to.be.lte(5);
        });
      });
    });

    it("navigates to unit health page [10c]", () => {
      cy.get(".dashboard-panel-list-component-health .button")
        .contains("Components")
        .click();
      cy.hash().should("match", /components/);
    });
  });
});
