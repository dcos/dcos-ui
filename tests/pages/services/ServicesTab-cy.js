describe('ServicesTab', function () {
  context('Service not found page', function () {
    beforeEach(function () {
      cy.configureCluster({
        mesos: '1-for-each-health',
        nodeHealth: true
      });

      cy.visitUrl({url: '/services/non-existing-service'});
    });

    it('should show the \'Not Found\' alert panel', function () {
      cy.get('.panel-content').contains('Not Found')
        .should('to.have.length', 1);
    });
  });

  context('Tab highlighting', function () {
    beforeEach(function () {
      cy.configureCluster({
        mesos: '1-for-each-health',
        nodeHealth: true
      });

      cy.visitUrl({url: '/services'});
    });

    it('should have an active services tab', function () {
      cy.get('.menu-tabbed-item-label.active .menu-tabbed-item-label-text').contains('Services')
        .should('to.have.length', 1);
    });

    it('should be able to go to deployments tab', function () {
      cy.get('.menu-tabbed-item-label').contains('Deployments').click();
      cy.get('.menu-tabbed-item-label.active .menu-tabbed-item-label-text')
        .contains('Deployments').should('to.have.length', 1);
    });
  });
});
