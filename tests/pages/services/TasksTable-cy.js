describe('Tasks Table', function () {

  context('Task row', function () {
    beforeEach(function () {
      cy.configureCluster({
        mesos: '1-service-with-executor-task',
        nodeHealth: true
      });
    });

    it('displays task detail page on task click', function () {
      cy.visitUrl({url: '/services/overview/%2Fcassandra'});
      cy.get('a[title="server-0_10a"]')
        .click();
      cy.get('.page-header').should('contain', 'server-0');
    });

    context('Files tab', function () {

      beforeEach(function () {
        cy.visitUrl({
          url: '/services/overview/%2Fcassandra/tasks/server-0_10a'
        });
        cy.get('.page-header-navigation .menu-tabbed-item').contains('Files').click();
      });

      it('shows the contents of the Mesos sandbox', function () {
        cy.get('.page-body-content tbody tr:visible')
          .should(function ($rows) {
            expect($rows.length).to.equal(13);
          });
      });

      it('shows directories as well as files', function () {
        cy.get('.page-body-content tbody tr:visible:first')
          .contains('jre1.7.0_76');
      });

    });

  });

  context('For a Service', function () {

    beforeEach(function () {
      cy.configureCluster({
        mesos: 'healthy-tasks-in-mesos-and-marathon'
      });
      cy.viewport('macbook-15');
      cy.visitUrl({url: '/services/overview/%2Fconfluent-kafka'});
    });

    context('Running task without healthcheck', function () {

      beforeEach(function () {
        cy.get('table tr')
          .contains('broker-0__110e02b3-b6a3-4979-be56-7e5535757ebf')
          .closest('tr').find('td').as('tds');
      });

      it('correctly shows status', function () {
        cy.get('@tds').eq(4).contains('Running');
      });

      it('correctly shows health', function () {
        cy.get('@tds').eq(5).find('.dot')
          .triggerHover();
        cy.get('.tooltip').contains('No health checks available');
      });

    });

    context('Running task with healthcheck', function () {

      beforeEach(function () {
        cy.get('table tr')
          .contains('confluent-kafka.4e941eb7-c642-11e6-9066-5a8a388c67a1')
          .closest('tr').find('td').as('tds');
      });

      it('correctly shows status', function () {
        cy.get('@tds').eq(4).contains('Running');
      });

      it('correctly shows health', function () {
        cy.get('@tds').eq(5).find('.dot')
          .triggerHover();
        cy.get('.tooltip').contains('Healthy');
      });

    });

  });

});

