describe('Pod Detail Page', function () {

  beforeEach(function () {
    cy.configureCluster({
      mesos: '1-pod',
      nodeHealth: true
    });
  });

  context('Navigate to service detail page', function () {

    it('shows the \'Service Not Found\' alert panel in page contents', function () {
      cy.visitUrl({url: '/services/detail/non-existing-service'});
      cy.get('.page-body-content').contains('Service not found');
    });

    it('shows instances tab per default', function () {
      cy.visitUrl({url: '/services/detail/%2Fpodses'});

      cy
        .get('.menu-tabbed-item .active').contains('Instances')
        .get('.table').contains('podses');

      cy.hash().should('match', /services\/detail\/%2Fpodses\/tasks.*/);
    });

    it('shows configuration tab when clicked', function () {
      cy.visitUrl({url: '/services/detail/%2Fpodses'});

      cy.get('.menu-tabbed-item').contains('Configuration').click();

      cy
        .get('.menu-tabbed-item .active').contains('Configuration')
        .get('.configuration-map');

      cy.hash().should('match', /services\/detail\/%2Fpodses\/configuration.*/);
    });

    it('shows debug tab when clicked', function () {
      cy.visitUrl({url: '/services/detail/%2Fpodses'});

      cy.get('.menu-tabbed-item').contains('Debug').click();

      cy
        .get('.menu-tabbed-item .active').contains('Debug')
        .get('.page-body-content').contains('Last Changes');

      cy.hash().should('match', /services\/detail\/%2Fpodses\/debug.*/);
    });

  });

});
