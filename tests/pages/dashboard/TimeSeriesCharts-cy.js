describe("Dashboard Time Series Charts [057]", function() {
  beforeEach(function() {
    cy.configureCluster({
      mesos: "1-task-healthy"
    }).visitUrl({ url: "/dashboard", identify: true, fakeAnalytics: true });
  });

  context("ResourceTimeSeriesChart [058]", function() {
    it("shows a valid percentage [059]", function() {
      cy.get(".dashboard-panel-chart-timeseries").within(function() {
        cy.get("span.unit.unit-primary").should(function($percentages) {
          var percentage1 = parseInt($percentages[0].textContent, 10);
          var percentage2 = parseInt($percentages[1].textContent, 10);

          expect(percentage1)
            .to.be.at.least(0)
            .and.to.be.lt(100);
          expect(percentage2)
            .to.be.at.least(0)
            .and.to.be.lt(100);
        });
      });
    });
  });
});
