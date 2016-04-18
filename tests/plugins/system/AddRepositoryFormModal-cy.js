describe('Add Repository Form Modal', function () {

  beforeEach(function () {
    cy
      .configureCluster({
        mesos: '1-task-healthy',
        universePackages: true
      })
      .visitUrl({url: '/system/overview/repositories'})
      .get('.page-content .button.button-success')
      .contains('Add Repository')
      .click();
  });

  it('displays modal for adding repository', function () {
    cy
      .get('.modal h2')
      .should('contain', 'Add Repository');
  });

  it('displays two fields', function () {
    cy
      .get('.modal input')
      .should('to.have.length', 2);
  });

  it('should display error if both fields aren\'t filled out', function () {
    cy
      .get('.modal .modal-footer .button.button-success')
      .contains('Add')
      .click();

    cy.get('.modal .form-help-block')
      .eq(0)
      .should('contain', 'Field cannot be empty.');

    cy.get('.modal .form-help-block')
      .eq(1)
      .should('contain', 'Must be a valid url with http:// or https://');
  });

  it('should display error if not a valid url', function () {
    cy
      .get('.modal .modal-footer .button.button-success')
      .contains('Add')
      .click();

    cy.get('.modal .form-help-block')
      .should('contain', 'Must be a valid url with http:// or https://');
  });

  it('closes modal after add is successful', function () {
    cy
      .get('.modal input')
      .eq(0).type('Here we go!');
    cy
      .get('.modal input')
      .eq(1).type('http://there-is-no-stopping.us');
    cy
      .get('.modal .modal-footer .button.button-success')
      .contains('Add')
      .click();

    cy.get('modal').should(function ($modal) {
      expect($modal).to.not.exist;
    });
  });

  it('displays error in modal after add causes an error', function () {
    cy
      .route({
        method: 'POST',
        url: /repository\/add/,
        status: 400,
        response: {message: 'Could not add repository, just because...'}
      })
      .get('.modal input')
      .eq(0).type('Here we go!');
    cy
      .get('.modal input')
      .eq(1).type('http://there-is-no-stopping.us');
    cy
      .get('.modal .modal-footer .button.button-success')
      .contains('Add')
      .click();

    cy
      .get('.modal h4.text-danger')
      .should('contain', 'Could not add repository, just because...');
  });

  it('displays generic error in modal if no message is provided', function () {
    cy
      .route({
        method: 'POST',
        url: /repository\/add/,
        status: 400,
        response: {}
      })
      .get('.modal input')
      .eq(0).type('Here we go!');
    cy
      .get('.modal input')
      .eq(1).type('http://there-is-no-stopping.us');
    cy
      .get('.modal .modal-footer .button.button-success')
      .contains('Add')
      .click();

    cy
      .get('.modal h4.text-danger')
      .should('contain', 'An error has occurred');
  });

});
