describe('Nodes Page', function () {

  beforeEach(function () {
    cy.configureCluster({
      mesos: '1-for-each-health',
      nodeHealth: true
    });
    cy.visitUrl({url: '/nodes'});
  });

  context('Filters nodes table', function () {

    it('should show all nodes', function () {
      cy.get('tbody tr').should('contain', 'dcos-01');
      cy.get('tbody tr').should('contain', '167.114.218.155');
      cy.get('tbody tr').should('contain', '167.114.218.156');
    });

    it('should only show healthy node', function () {
      cy.get('.filter-bar').as('filterBar');
      cy.get('@filterBar').contains('Healthy').click();

      cy.get('tbody tr').should('not.contain', 'dcos-01');
      cy.get('tbody tr').should('not.contain', '167.114.218.156');
      cy.get('tbody tr').should('contain', '167.114.218.155');
    });

    it('should only show unhealthy node', function () {
      cy.get('.filter-bar').as('filterBar');
      cy.get('@filterBar').contains('Unhealthy').click();

      cy.get('tbody tr').should('not.contain', 'dcos-01');
      cy.get('tbody tr').should('not.contain', '167.114.218.155');
      cy.get('tbody tr').should('contain', '167.114.218.156');
    });

    it('should only show nodes with service', function () {
      cy.get('.filter-bar').as('filterBar');
      cy.get('@filterBar').contains('Filter by Service').click();
      cy.get('.dropdown-menu').contains('cassandra-healthy').click();

      cy.get('tbody tr').should('not.contain', '167.114.218.156');
      cy.get('tbody tr').should('not.contain', '167.114.218.155');
      cy.get('tbody tr').should('contain', 'dcos-01');
    });

  });

  context('Filters nodes grid', function () {

    beforeEach(function () {
      cy.visitUrl({url: '/nodes/grid'});
    });

    it('should show all nodes', function () {
      // Navigate to the grid using button
      cy.visitUrl({url: '/nodes'});
      cy.get('.filter-bar').as('filterBar');
      cy.get('@filterBar').contains('Grid').click();

      cy.get('.nodes-grid-dials').should('contain', '3%');
      cy.get('.nodes-grid-dials').should('contain', '5%');
      cy.get('.nodes-grid-dials').should('contain', '19%');
    });

    it('should only show cassandra-healthy nodes', function () {
      cy.get('.filter-bar').as('filterBar');
      cy.get('@filterBar').contains('Filter by Service').click();
      cy.get('.dropdown-menu').contains('cassandra-healthy').click();

      cy.get('.nodes-grid-dials').should('contain', '3%');
      cy.get('.nodes-grid-dials').should('not.contain', '5%');
      cy.get('.nodes-grid-dials').should('not.contain', '19%');
    });

    it('should not display any nodes', function () {
      cy.get('.filter-bar').as('filterBar');
      cy.get('@filterBar').contains('Filter by Service').click();
      cy.get('.dropdown-menu').contains('cassandra-na').click();

      cy.get('.nodes-grid-dials').should('not.contain', '3%');
      cy.get('.nodes-grid-dials').should('not.contain', '5%');
      cy.get('.nodes-grid-dials').should('not.contain', '19%');
    });

    it('should only show unhealthy node', function () {
      cy.get('.filter-bar').as('filterBar');
      cy.get('@filterBar').contains('Filter by Service').click();
      cy.get('.dropdown-menu').contains('cassandra-unhealthy').click();
      cy.get('@filterBar').contains('Healthy').click();

      cy.get('.nodes-grid-dials').should('not.contain', '3%');
      cy.get('.nodes-grid-dials').should('contain', '5%');
      cy.get('.nodes-grid-dials').should('not.contain', '19%');
    });

  });

});
