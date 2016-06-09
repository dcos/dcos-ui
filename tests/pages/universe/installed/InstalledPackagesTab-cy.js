xdescribe('Installed Packages Tab', function () {

  beforeEach(function () {
    cy
      .configureCluster({
        mesos: '1-task-healthy',
        universePackages: true
      })
      .visitUrl({url: '/universe/installed-packages'});
  });

  it('activates the correct tab', function () {
    cy
      .get('.page-navigation-list .tab-item.active .tab-item-label')
      .should('contain', 'Installed');
  });

  it('displays a table of installed packages', function () {
    cy
      .get('table.table > tbody > tr .package-table-heading')
      .as('itemNames');

    cy
      .get('@itemNames').eq(0)
      .should('contain', 'arangodb')
      .get('@itemNames').eq(1)
      .should('contain', 'marathon-user');
  });

  it('allows users to filter packages', function () {
    cy.get('.page-content input[type="text"]').as('filterTextbox');
    cy
      .get('table.table > tbody > tr .package-table-heading')
      .as('itemNames');

    cy.get('@filterTextbox').type('marathon');
    cy.get('@itemNames').should(function ($itemNames) {
      expect($itemNames.length).to.equal(1);
      expect($itemNames.first()).to.contain('marathon');
    });
  });

  it('displays \'No data\' when it has filtered out all packages', function () {
    cy.get('.page-content input[type="text"]').as('filterTextbox');
    cy.get('table.table > tbody > tr').as('tableRows');
    cy.get('@tableRows').get('td').as('tableRowCell');

    cy.get('@filterTextbox').type('foo_bar_baz_qux');

    cy.get('@tableRowCell').should(function ($tableCell) {
      expect($tableCell[0].textContent).to.equal('No data');
    });
  });

  it('displays uninstall modal when uninstall is clicked', function () {
    cy.get('.button.button-link.button-danger').eq(0).invoke('show').click({force: true});
    cy
      .get('.modal .modal-footer .button.button-danger')
      .should('contain', 'Uninstall');
  });
});
