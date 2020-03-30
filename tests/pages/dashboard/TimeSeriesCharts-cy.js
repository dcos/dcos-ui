describe("Dashboard Time Series Charts [057]", () => {
  beforeEach(() => {
    cy.configureCluster({
      mesos: "1-task-healthy",
    }).visitUrl({ url: "/dashboard", identify: true });
  });

  context("ResourceTimeSeriesChart [058]", () => {
    it("shows a valid percentage [059]", () => {
      cy.get(".dashboard-panel-chart-timeseries").within(() => {
        cy.get("span.unit.unit-primary").should(($percentages) => {
          const percentage1 = parseInt($percentages[0].textContent, 10);
          const percentage2 = parseInt($percentages[1].textContent, 10);

          expect(percentage1).to.be.at.least(0).and.to.be.lt(100);
          expect(percentage2).to.be.at.least(0).and.to.be.lt(100);
        });
      });
    });
  });
});
