describe('Overview Page [0dw]', function () {

  context('Components tab [0e0]', function () {

    beforeEach(function () {
      cy.configureCluster({
        mesos: '1-task-healthy',
        plugins: 'organization-enabled'
      })
      .visitUrl({url: '/system/overview', identify: true});
    });

    it('goes to Component Health page when Component tab clicked [0dz]',
      function () {
        cy.get('.page-header-navigation .tab-item-label')
          .contains('Components')
          .click();
        cy.hash().should('match', /components/);
      }
    );

    it('shows the Component Health tab as active [0e1]', function () {
      cy.get('.page-header-navigation .active').as('activeTab');
      cy.get('@activeTab').should('contain', 'Components');
    });

  });
});
