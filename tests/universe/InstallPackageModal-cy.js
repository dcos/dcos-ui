describe('Install Package Modal', function () {

  beforeEach(function () {
    cy
      .configureCluster({
        mesos: '1-task-healthy',
        universePackages: true
      })
      .visitUrl({url: '/universe'})
      .get('.page-content .button.button-success')
      .eq(0)
      .click();
  });

  it('displays install modal for package', function () {
    cy
      .get('.modal .form-element-inline-text')
      .should('contain', 'marathon-user');
  });

  it('displays config header for package', function () {
    cy
      .get('.modal-footer .button')
      .contains('View Configuration Details')
      .click();
    cy
      .get('.modal-header h4')
      .should('contain', 'marathon');
  });

  it('displays config values for package', function () {
    cy
      .get('.modal-footer .button')
      .contains('View Configuration Details')
      .click();
    cy
      .get('.modal-content-inner dt.emphasize')
      .contains('cpus')
      .next()
      .should('contain', '2');
  });

});
