describe('Nodes Side Panel', function () {

  beforeEach(function () {
    cy.configureCluster({
      mesos: '1-task-healthy',
      nodeHealth: true
    })
  });

  context('Navigate to node detail page', function () {

    it('navigates to node side panel', function () {
      cy.visitUrl({url: '/nodes', identify: true, fakeAnalytics: true});
      cy.get('tr a').contains('dcos-01').click();

      cy.hash().should('match', /nodes\/[a-zA-Z0-9-]+/);
      cy.get('.page-content h1').should(function ($title) {
        expect($title).to.contain('dcos-01');
      });
    });

    it('shows error in side panel when node is invalid [10a]', function () {
      cy.visitUrl({url: '/nodes/INVALID_NODE', identify: true, fakeAnalytics: true});

      cy.hash().should('match', /nodes\/INVALID_NODE/);
      cy.get('.page-content h3').should(function ($title) {
        expect($title).to.contain('Error finding node');
      });
    });
  });

});
