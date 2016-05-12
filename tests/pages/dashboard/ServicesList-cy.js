describe('ServicesList', function () {

  context('Service List Widget', function () {

    beforeEach(function () {
      cy.configureCluster({
        mesos: '1-task-healthy'
      })
      .visitUrl({url: '/dashboard', identify: true, fakeAnalytics: true});
    });

    it('shows an acceptable number of components', function () {
      cy.get('.dashboard-panel-list-service-health').within(function () {
        cy.get('li').should(function ($components) {
          expect($components.length)
            .to.be.at.least(1)
            .and.to.be.lte(5);
        });
      });
    });

    it('navigates to services page', function () {
      cy.get('.dashboard-panel-list-service-health .more-button').click();
      cy.hash().should('match', /services/);
    });

  });
});
