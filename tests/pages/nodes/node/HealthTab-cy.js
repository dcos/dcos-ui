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
      cy.visitUrl({url: '/nodes', identify: true, fakeAnalytics: true});
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
      cy.get('.page-content td .text-success').should(function ($healthyRows) {
        cy.get('@filterHealth').click();
        cy.get('.dropdown').find('li').contains('Healthy').click();
        // Healthy rows should remain
        cy.get('.page-content td .text-success').should(function ($row) {
          expect($row.length).to.equal($healthyRows.length);
        });
        // Unhealthy rows should not show
        cy.get('.page-content td .text-danger').should(function ($row) {
          expect($row.length).to.equal(0);
        });
      });
    });

    it('filters by health check name [0ff]', function () {
      cy.get('.page-content td a').should(function ($allRows) {
        var logrotateRows = $allRows.filter(function (i, el) {
          return el.textContent.toLowerCase().indexOf('logrotate') !== -1;
        });

        cy.get('@filterTextbox').type('logrotate');
        cy.get('.page-content td a').should(function ($rows) {
          expect($rows.length).to.equal(logrotateRows.length);
        });
      })
    });

  });

});
