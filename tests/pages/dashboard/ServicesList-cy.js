describe("ServicesList", () => {
  context("Service List Widget", () => {
    beforeEach(() => {
      cy.configureCluster({
        mesos: "1-task-healthy"
      }).visitUrl({ url: "/dashboard", identify: true });
    });

    it("shows an acceptable number of components", () => {
      cy.get(".dashboard-panel-list-service-health").within(() => {
        cy.get("li").should($components => {
          expect($components.length)
            .to.be.at.least(1)
            .and.to.be.lte(5);
        });
      });
    });

    it("navigates to services page", () => {
      cy.get(".dashboard-panel-list-service-health .button")
        .contains("View all")
        .click();
      cy.hash().should("match", /services/);
    });
  });
});
