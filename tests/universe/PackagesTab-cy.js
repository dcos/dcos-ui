describe('Packages Tab', function () {

  beforeEach(function () {
    cy.configureCluster({
      mesos: '1-task-healthy',
      universePackages: true
    });
  });

  it('should display correct error message for invalid repo uri', function () {
    cy
      .route({
        method: 'POST',
        url: /package\/search/,
        status: 400,
        response: {type: 'InvalidRepositoryUri', name: 'Invalid'}
      })
      .visitUrl({url: '/universe', logIn: true});

    cy
      .get('.page-content p.inverse.text-align-center')
      .should('contain', 'The URL for Invalid (repository) is not valid, or its host did not resolve. You might need to change the URL of Invalid. You can do that on the Repositories Settings page, uninstall it, and add the correct URL.');
  });

  it('should display correct message for \'no index\' error', function () {
    cy
      .route({
        method: 'POST',
        url: /package\/search/,
        status: 400,
        response: {type: 'IndexNotFound', name: 'Invalid'}
      })
      .visitUrl({url: '/universe', logIn: true});

    cy
      .get('.page-content p.inverse.text-align-center')
      .should('contain', 'The index file is missing in Invalid (repository). You might need to change the URL of Invalid. You can do that on the Repositories Settings page, uninstall it, and add the correct URL.');
  });

  it('should display correct message for missing package file', function () {
    cy
      .route({
        method: 'POST',
        url: /package\/search/,
        status: 400,
        response: {type: 'PackageFileMissing', name: 'Invalid'}
      })
      .visitUrl({url: '/universe', logIn: true});

    cy
      .get('.page-content p.inverse.text-align-center')
      .should('contain', 'The package file is missing in Invalid (repository). You might need to change the URL of Invalid. You can do that on the Repositories Settings page, uninstall it, and add the correct URL.');
  });

  it('should use default repository name if not provided', function () {
    cy
      .route({
        method: 'POST',
        url: /package\/search/,
        status: 400,
        response: {type: 'PackageFileMissing'}
      })
      .visitUrl({url: '/universe', logIn: true});

    cy
      .get('.page-content p.inverse.text-align-center')
      .should('contain', 'The package file is missing in a repository (repository). You might need to change the URL of a repository. You can do that on the Repositories Settings page, uninstall it, and add the correct URL.');
  });

  it('should default error message for missing package file', function () {
    cy
      .route({
        method: 'POST',
        url: /package\/search/,
        status: 400,
        response: {message: 'Some other error'}
      })
      .visitUrl({url: '/universe', logIn: true});

    cy
      .get('.page-content p.inverse.text-align-center')
      .should('contain', 'We have been notified of the issue, but would love to know more. Talk with us using Intercom. You can also join us on our Slack channel or send us an email at help@dcos.io.');
  });

  context('searching', function () {
    beforeEach(function () {
      cy.visitUrl({url: '/universe', logIn: true});
      cy.get('input').type('cass');
    });

    it('should hide selected panels', function () {
      cy.get('.panel').should(function ($panels) {
        expect($panels.length).to.equal(0);
      });
    });

    it('should should only cassandra in table', function () {
      cy.get('tr').should(function ($rows) {
        expect($rows.length).to.equal(4);
      });
    });
  });

  context('selected packages', function () {
    beforeEach(function () {
      cy.visitUrl({url: '/universe', logIn: true});
      cy.get('.panel').as('panels');
    });

    it('should have the first package as selected', function () {
      cy.get('@panels').should(function ($panels) {
        expect($panels.length).to.equal(1);
      });
    });
  });

});
