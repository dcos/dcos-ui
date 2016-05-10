xdescribe('Install Package Modal', function () {

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

  xit('displays install modal for package', function () {
    cy
      .get('.modal .modal-content')
      .should('contain', 'marathon');
  });

});
