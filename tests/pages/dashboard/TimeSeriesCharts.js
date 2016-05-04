describe('Dashboard Time Series Charts [057]', function () {

  beforeEach(function () {
    cy.configureCluster({
      mesos: '1-task-healthy'
    })
    .visitUrl({url: '/dashboard', identify: true, fakeAnalytics: true});
  });

  context('ResourceTimeSeriesChart [058]', function () {

    it('shows a valid percentage [059]', function () {
      cy.get('.h1').within(function () {
        cy.get('span').should(function ($percentages) {
          expect($percentages[0].textContent)
            .to.be.at.least(0)
            .and.to.be.lt(100);
          expect($percentages[1].textContent)
            .to.be.at.least(0)
            .and.to.be.lt(100);
        });
      });

    });

  });

});
