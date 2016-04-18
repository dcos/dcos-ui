describe('Task Side Panel', function () {

  beforeEach(function () {
    cy
      .configureCluster({
        mesos: '1-service-with-executor-task'
      })
      .visitUrl({url: '/services'});
    cy
      .get('.page-content table.table > tbody > tr')
      .contains('cassandra')
      .click();

    cy
      .get('.side-panel table.table > tbody > tr')
      .contains('server-0')
      .click();
  });

  it('displays correct task', function () {
    cy
      .get('.side-panel .side-panel-content-header-label')
      .should(function ($header) {
        expect($header[0].textContent).to.equal('server-0');
      });
  });

  it('displays elements in directory table', function () {
    cy
      .get('.side-panel table.table > tbody > tr')
      .should(function ($tableRows) {
        // 13 elements plus the two buffer elements
        expect($tableRows.length).to.equal(13 + 2);
      });
  });

  it('displays directory of task', function () {
    cy
      .get('.side-panel table.table > tbody > tr a:first')
      .should('contain', 'jre1.7.0_76');
  });

});
