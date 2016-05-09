describe('Node Health Tab [0fa]', function () {
  var nodeDetailHash;

  beforeEach(function () {
    cy.configureCluster({
      mesos: '1-task-healthy',
      nodeHealth: true
    })
  });

  context('Navigate to tab [0fb]', function () {

    it('navigates to health tab [0fc]', function () {
      cy.visitUrl({url: '/#/nodes', identify: true, fakeAnalytics: true});
      cy.get('tr a').eq(0).click();
      cy.get('.tab-item').contains('Health').click();

      // Store hash for later use
      cy.hash().should(function (currentHash) {
        nodeDetailHash = currentHash;
      });

      cy.hash().should('match', /nodes\/[a-zA-Z0-9-]+/);
      cy.get('.page-content .h4').should(function ($title) {
        expect($title).to.contain('Health Checks');
      });
    });
  });

  context('Health Tab [0fd]', function () {

    beforeEach(function () {
      cy.visitUrl({url: nodeDetailHash, identify: true, fakeAnalytics: true});

      cy.get('.tab-item').contains('Health').click();

      cy.get('.page-content .form-control input[type=\'text\']').as('filterTextbox');
      cy.get('button').contains('Health Checks').as('filterHealth');
    });

    it('filters by health [0fe]', function () {
      cy.get('@filterHealth').click();
      cy.get('.dropdown').find('li').contains('Healthy').click();
      cy.get('.page-content td .text-success').should(function ($row) {
        expect($row.length).to.be.at.least(5);
      });
    });

    it('filters by health check name [0ff]', function () {
      cy.get('@filterTextbox').type('logrotate');
      cy.get('.page-content').within(function () {
        cy.get('td a').should(function ($row) {
          expect($row.length).to.be.at.least(2);
        });
      });
    });

  });

});
