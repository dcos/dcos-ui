describe('Sidebar Filter', function () {
  context('Filters services table', function () {
    beforeEach(function () {
      // Remove once responsive filters are in place
      cy.viewport(1280, 800);

      cy.configureCluster({
        mesos: '1-for-each-health',
        nodeHealth: true
      });
      cy.visitUrl({url: '/services'});
    });

    it('filters correctly on Labels', function () {
      cy.get('.sidebar-filters .dropdown').contains('Labels').click();
      cy.get('.sidebar-filters .dropdown-menu .is-selectable').first().click();
      cy.get('tbody tr:visible').should('to.have.length', 4);
      cy.get('.sidebar-filters ul.list-unstyled li')
        .should('to.have.length', 1);
    });

    it('filters correctly on Idle', function () {
      cy.get('.sidebar-filters .label').contains('Idle').click();
      cy.get('tbody tr:visible').should('to.have.length', 1);
    });

    it('filters correctly on Unhealthy', function () {
      cy.get('.sidebar-filters .label').contains('Unhealthy').click();
      cy.get('tbody tr:visible').should('to.have.length', 1);
    });

    it('filters correctly on N/A', function () {
      cy.get('.sidebar-filters .label').contains('N/A').click();
      cy.get('tbody tr:visible').should('to.have.length', 2);
    });

    it('filters correctly on Healthy', function () {
      cy.get('.sidebar-filters .label').contains('Healthy').click();
      cy.get('tbody tr:visible').should('to.have.length', 1);
    });

    it('filters correctly on Running', function () {
      cy.get('.sidebar-filters .label').contains('Running').click();
      cy.get('tbody tr:visible').should('to.have.length', 4);
    });

    it('filters correctly on Deploying', function () {
      cy.get('.sidebar-filters .label').contains('Deploying').click();
      cy.get('tbody tr:visible').should('to.have.length', 1);
    });

    it('filters correctly on Suspended', function () {
      cy.get('.sidebar-filters .label').contains('Suspended').click();
      cy.get('tbody tr:visible').should('to.have.length', 1);
    });

    it('filters correctly on Waiting', function () {
      cy.get('.sidebar-filters .label').contains('Suspended').click();
      cy.get('tbody tr:visible').should('to.have.length', 1);
    });

    it('filters correctly on Delayed', function () {
      cy.get('.sidebar-filters .label').contains('Suspended').click();
      cy.get('tbody tr:visible').should('to.have.length', 1);
    });

    it('filters correctly on Universe', function () {
      cy.get('.sidebar-filters .label').contains('Universe').click();
      cy.get('tbody tr:visible').should('to.have.length', 4);
    });

    it('filters correctly on Volumes', function () {
      cy.get('.sidebar-filters .label').contains('Volumes').click();
      cy.get('tbody tr:visible').should('to.have.length', 1);
    });

    it('filters correctly on two filters', function () {
      cy.get('.sidebar-filters .label').contains('Healthy').click();
      cy.get('.sidebar-filters .label').contains('Unhealthy').click();
      cy.get('tbody tr').should('to.have.length', 4);
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
