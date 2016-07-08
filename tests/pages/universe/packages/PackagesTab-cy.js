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
        response: {type: 'RepositoryUriSyntax', name: 'Invalid', message: 'The url for Invalid does not have correct syntax.'}
      })
      .visitUrl({url: '/universe', logIn: true});

    cy
      .get('.page-body-content .text-overflow-break-word')
      .should('contain', 'The url for Invalid does not have correct syntax. You can go to the Repositories Settings page to change installed repositories.');
  });

  it('should display correct message for \'no index\' error', function () {
    cy
      .route({
        method: 'POST',
        url: /package\/search/,
        status: 400,
        response: {type: 'IndexNotFound', name: 'Invalid', message: 'The index file is missing in Invalid.'}
      })
      .visitUrl({url: '/universe', logIn: true});

    cy
      .get('.page-body-content .text-overflow-break-word')
      .should('contain', 'The index file is missing in Invalid. You can go to the Repositories Settings page to change installed repositories.');
  });

  it('should display correct message for missing package file', function () {
    cy
      .route({
        method: 'POST',
        url: /package\/search/,
        status: 400,
        response: {type: 'PackageFileMissing', name: 'Invalid', message: 'The package file is missing in Invalid.'}
      })
      .visitUrl({url: '/universe', logIn: true});

    cy
      .get('.page-body-content .text-overflow-break-word')
      .should('contain', 'The package file is missing in Invalid. You can go to the Repositories Settings page to change installed repositories.');
  });

  it('should use default repository name if not provided', function () {
    cy
      .route({
        method: 'POST',
        url: /package\/search/,
        status: 400,
        response: {type: 'PackageFileMissing', message: 'The package file is missing in a repository.'}
      })
      .visitUrl({url: '/universe', logIn: true});

    cy
      .get('.page-body-content .text-overflow-break-word')
      .should('contain', 'The package file is missing in a repository. You can go to the Repositories Settings page to change installed repositories.');
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
      .get('.page-body-content .h3.text-align-center')
      .should('contain', 'An Error Occurred');
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
