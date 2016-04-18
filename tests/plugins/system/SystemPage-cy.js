describe('System Page [05k]', function () {

  context('Groups Tab [05l]', function () {

    beforeEach(function () {
      cy.configureCluster({
        mesos: '1-task-healthy',
        acl: true,
        plugins: 'organization-enabled'
      })
      .visitUrl({url: '/system/organization/groups/', identify: true});
    });

    it('routes to the group page [05p]', function () {
      cy.get('.page-header-navigation .tab-item-label').contains('Groups')
        .click();
      cy.hash().should('match', /groups/);
    });

    it('shows the loading indicator before receiving data [06c]', function () {
      cy.get('.ball-scale').should(function ($loadingIndicator) {
        expect($loadingIndicator).length.to.be(1);
      });
    });

    it('shows the groups tab as active [05q]', function () {
      cy.get('.page-header-navigation .active').as('activeTab');
      cy.get('@activeTab').should('contain', 'Groups');
    });

    it('hides groups when no groups match the string [05r]', function () {
      cy.wait(250);
      cy.get('.groups-table-header input[type="text"]').as('filterTextbox');
      cy.get('.page-content-fill .table tbody tr').as('tableRows');

      cy.get('@filterTextbox').type('foo_bar_baz_qux');

      cy.get('@tableRows').should(function ($tableRows) {
        expect($tableRows).length.to.be(1);
      });
    });

    it('displays \'No data\' when it has filtered out all groups [05t]', function () {
      cy.get('.groups-table-header input[type="text"]').as('filterTextbox');
      cy.get('.page-content-fill .table tbody tr').as('tableRows');
      cy.get('@tableRows').get('td').as('tableRowCell');

      cy.get('@filterTextbox').type('foo_bar_baz_qux');

      cy.get('@tableRowCell').should(function ($tableCell) {
        expect($tableCell[0].textContent).to.equal('No data');
      });
    });

    it('shows all groups after clearing the filter [05s]', function () {
      cy.get('.groups-table-header input[type="text"]').as('filterTextbox');
      cy.get('.page-content-fill .table tbody tr').as('tableRows');
      cy.get('.groups-table-header .form-control-group-add-on a')
        .as('clearFilterButton');

      cy.get('@filterTextbox').type('foo_bar_baz_qux');
      cy.get('@clearFilterButton').click();

      cy.get('@tableRows').should(function ($tableRows) {
        expect($tableRows).length.to.be.above(10);
      });
    });

    it('allows users to filter by unicode characters [05u]', function () {
      cy.get('.groups-table-header input[type="text"]').as('filterTextbox');
      cy.get('.page-content-fill .table tbody tr').as('tableRows');

      cy.get('@filterTextbox').type('藍-遙 遥 悠 遼');
      cy.get('@tableRows').should(function ($tableRows) {
        expect($tableRows.length).to.equal(2);
      });
    });

  });

  context('Users Tab [05v]', function () {

    beforeEach(function () {
      cy.configureCluster({
        mesos: '1-task-healthy',
        acl: true,
        plugins: 'organization-enabled'
      })
      .visitUrl({url: '/system/organization/users/', identify: true});
    });

    it('routes to the user page [05x]', function () {
      cy.get('.page-header-navigation .tab-item-label').contains('Users')
        .click();
      cy.hash().should('match', /users/);
    });

    it('shows the loading indicator before receiving data [06f]', function () {
      cy.get('.ball-scale').should(function ($loadingIndicator) {
        expect($loadingIndicator).length.to.be(1);
      });
    });

    it('shows the users tab as active [05y]', function () {
      cy.get('.page-header-navigation .active').as('activeTab');
      cy.get('@activeTab').should('contain', 'Users');
    });

    context('Filters [053]', function () {

      it('hides users when no users match the string [05z]', function () {
        cy.get('.users-table-header input[type="text"]').as('filterTextbox');
        cy.get('.page-content-fill .table tbody tr').as('tableRows');

        cy.get('@filterTextbox').type('foo_bar_baz_qux');

        cy.get('@tableRows').should(function ($tableRows) {
          expect($tableRows).length.to.be(1);
        });
      });

      it('displays \'No data\' when it has filtered out all users [06a]', function () {
        cy.get('.users-table-header input[type="text"]').as('filterTextbox');
        cy.get('.page-content-fill .table tbody tr').as('tableRows');
        cy.get('@tableRows').get('td').as('tableRowCell');

        cy.get('@filterTextbox').type('foo_bar_baz_qux');

        cy.get('@tableRowCell').should(function ($tableCell) {
          expect($tableCell[0].textContent).to.equal('No data');
        });
      });

      it('shows all users after clearing the filter [06b]', function () {
        cy.get('.users-table-header input[type="text"]').as('filterTextbox');
        cy.get('.page-content-fill .table tbody tr').as('tableRows');
        cy.get('.users-table-header .form-control-group-add-on a')
        .as('clearFilterButton');

        cy.get('@filterTextbox').type('foo_bar_baz_qux');
        cy.get('@clearFilterButton').click();

        cy.get('@tableRows').should(function ($tableRows) {
          expect($tableRows).length.to.be.above(4);
        });
      });

      it('allows users to filter by unicode characters [06c]', function () {
        cy.get('.users-table-header input[type="text"]').as('filterTextbox');
        cy.get('.page-content-fill .table tbody tr').as('tableRows');

        cy.get('@filterTextbox').type('藍-遙 遥 悠 遼');
        cy.get('@tableRows').should(function ($tableRows) {
          expect($tableRows.length).to.equal(1);
        });
      });

      it('filters by local users [054]', function () {
        cy.get('.button-group').within(function () {
          cy.get('button').eq(1).click();
        });
        cy.get('.page-content-fill .table tbody tr .highlight').as('tableRows');

        cy.get('@tableRows').should(function ($tableRows) {
          expect($tableRows[1].textContent).to.contain('a inventore');
        });
      });

      it('filters by external users [055]', function () {
        cy.get('.button-group').within(function () {
          cy.get('button').eq(2).click();
        });
        cy.get('.page-content-fill .table tbody tr .highlight').as('tableRows');

        cy.get('@tableRows').should(function ($tableRows) {
          expect($tableRows[0].textContent).to.contain('a enim');
        });
      });

    });

  });

});
