describe('Nodes Side Panel', function() {

  beforeEach(function () {
    cy.configureCluster({
      mesos: '1-task-healthy',
      nodeHealth: true
    })
  });

  context('Navigate to side panel', function () {

    it('navigates to node side panel', function() {
      cy.visitUrl({url: '/nodes', identify: true, fakeAnalytics: true});
      cy.get('tr a').contains('dcos-01').click();

      cy.hash().should('match', /node-detail/);
      cy.get('.side-panel-content-header h1').should(function ($title) {
        expect($title).to.contain('dcos-01');
      });
    });

    it('shows error in side panel when node is invalid [10a]', function() {
      cy.visitUrl({url: '/nodes/list/node-detail/INVALID_NODE', identify: true, fakeAnalytics: true});

      cy.hash().should('match', /node-detail/);
      cy.get('.side-panel-content h3').should(function ($title) {
        expect($title).to.contain('Error finding node');
      });
    });
  });

});
