describe('Node Health Tab [0fa]', function() {

  beforeEach(function () {
    cy.configureCluster({
      mesos: '1-task-healthy',
      nodeHealth: true
    })
  });

  context('Navigate to tab [0fb]', function () {

    it('navigates to health tab [0fc]', function() {
      cy.visitUrl({url: '/nodes', identify: true, fakeAnalytics: true});
      cy.get('tr a').contains('dcos-01').click();
      cy.get('.tab-item').contains('Health').click();

      cy.hash().should('match', /node-detail/);
      cy.get('.side-panel-tab-content .h4').should(function ($title) {
        expect($title).to.contain('Health Checks');
      });
    });
  });

  context('Health Tab [0fd]', function () {

    beforeEach(function () {
      cy.visitUrl({url: '/nodes/list/node-detail/20151002-000353-1695027628-5050-1177-S0', identify: true, fakeAnalytics: true});

      cy.get('.tab-item').contains('Health').as('healthTabButton');
      cy.get('@healthTabButton').click();
      cy.get('.side-panel-tab-content').within(function () {
        cy.get('.form-control input[type=\'text\']').as('filterTextbox');
        cy.get('button').contains('Health Checks').as('filterHealth');
      });
    });

    it('filters by health [0fe]', function () {
      cy.get('@filterHealth').click();
      cy.get('.dropdown').find('li').contains('Healthy').click();
      cy.get('.side-panel-tab-content').within(function () {
        cy.get('span').filter('.text-success').should(function ($row) {
          expect($row.length).to.equal(18);
        });
      });
    });

    it('filters by health check name [0ff]', function () {
      cy.get('@filterTextbox').type('logrotate');
      cy.get('.side-panel-tab-content').within(function () {
        cy.get('td a').should(function ($row) {
          expect($row.length).to.equal(2);
        });
      });
    });

  });

});
