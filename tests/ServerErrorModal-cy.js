describe('ServerErrorModal [01n]', function () {

  beforeEach(function () {
    cy.configureCluster({
      mesos: '1-task-healthy',
      acl: true,
      plugins: 'organization-enabled'
    })
    .visitUrl({url: '/', identify: true});
  });

  it('opens when group update error happens [02e]', function () {
    cy.route({
      method: 'PATCH',
      url: /api\/v1\/groups\/olis/,
      status: 422,
      response: {error: 'There was an error.'}
    })
    .visitUrl({url: '/system/organization/groups/olis', identify: true})
    .get('.side-panel .side-panel-content-header-label .form-element-inline-text')
    .click();

    cy.get('.side-panel').click();

    cy.get('.modal-header-title').should('contain', 'An error has occurred');
  });

  it('opens when user update error happens [02f]', function () {
    cy.route({
      method: 'PATCH',
      url: /api\/v1\/users\/quis/,
      status: 422,
      response: {error: 'There was an error.'}
    })
    .visit('http://localhost:4200/#/system/organization/users/quis')
    .get('.side-panel .side-panel-content-header-label .form-element-inline-text')
    .click();

    cy.get('.side-panel').click();

    cy.get('.modal-header-title').should('contain', 'An error has occurred');
  });

  it('opens when group user add error happens [02g]', function () {
    cy.route({
      method: 'PUT',
      url: /api\/v1\/groups\/olis\/users\/quis/,
      status: 422,
      response: {error: 'There was an error.'}
    })
    .visit('http://localhost:4200/#/system/organization/groups/olis')
    .get('.tabs .tab-item')
    .contains('Members')
    .click();

    cy.get('.dropdown-toggle').click();

    cy.get('.dropdown-menu-list .is-selectable')
      .contains("藍-Schüler Zimmer verfügt über einen Schreibtisch, Telefon, Safe in Notebook-Größe")
      .click();

    cy.get('.modal-header-title').should('contain', 'An error has occurred');
  });
});
