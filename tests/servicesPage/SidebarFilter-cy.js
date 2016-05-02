describe('Sidebar Filter', function() {
  context('Filters services table', function () {
    beforeEach(function () {
      cy.configureCluster({
        mesos: '1-for-each-health',
        nodeHealth: true
      });
      cy.visitUrl({url: '/services'});
    });

    it('filters correctly on Idle', function () {
      cy.get('.sidebar-filters .label').contains('Idle').click();
      cy.get('tbody tr').should('to.have.length', 3);
    });

    it('filters correctly on Unhealthy', function () {
      cy.get('.sidebar-filters .label').contains('Unhealthy').click();
      cy.get('tbody tr').should('to.have.length', 3);
    });

    it('filters correctly on N/A', function () {
      cy.get('.sidebar-filters .label').contains('N/A').click();
      cy.get('tbody tr').should('to.have.length', 3);
    });

    it('filters correctly on Healthy', function () {
      cy.get('.sidebar-filters .label').contains('Healthy').click();
      cy.get('tbody tr').should('to.have.length', 3);
    });

    it('filters correctly on two filters', function () {
      cy.get('.sidebar-filters .label').contains('Healthy').click();
      cy.get('.sidebar-filters .label').contains('Unhealthy').click();
      cy.get('tbody tr').should('to.have.length', 4);
    });

    it('resets search input on filter change', function () {
      cy.get('.filter-input-text').as('filterInputText');
      cy.get('@filterInputText').type('cassandra-healthy');
      cy.get('.sidebar-filters .label').contains('Healthy').click();
      cy.get('@filterInputText').should('have.value', '');
    });

    it('sets the correct filter query params', function () {
      cy.get('.sidebar-filters .label').contains('Healthy').click();
      cy.get('.sidebar-filters .label').contains('Idle').click();
      cy.location().its('href').should(function (href) {
        var queries = href.split('?')[1];
        expect(decodeURIComponent(queries))
          .to.equal('filterHealth[]=1&filterHealth[]=2');
      });
    });

    it('will clear filters by clear link click', function () {
      cy.get('.sidebar-filters .label').contains('Healthy').click();
      cy.get('tbody tr').should('to.have.length', 3);
      cy.get('.sidebar-filters a').first().click();
      cy.get('tbody tr').should('to.have.length', 6);
    });

    it('will clear query params by clear link click', function () {
      cy.get('.sidebar-filters .label').contains('Healthy').click();
      cy.location().its('href').should(function (href) {
        var queries = href.split('?')[1];
        expect(decodeURIComponent(queries))
          .to.equal('filterHealth[]=1');
      });
      cy.get('.sidebar-filters a').first().click();
      cy.location().its('href').should(function (href) {
        var queries = href.split('?')[1];
        expect(queries).to.equal(undefined);
      });
    });
  });
});
