describe('Jobs Overview', function () {
  context('Jobs page loads correctly', function () {
    beforeEach(function () {
      cy.configureCluster({
        mesos: '1-for-each-health',
        nodeHealth: true
      });
      cy.visitUrl({url: '/jobs'});
    });

    it('has the right active navigation entry', function () {
      cy.get('.page-header-navigation .tab-item.active')
        .should('to.have.text', 'Jobs');
    });

    it('displays empty jobs overview page', function () {
      cy.get('.page-content .panel-content h3')
        .should('to.have.text', 'No Jobs Created');
    });
  });
});
