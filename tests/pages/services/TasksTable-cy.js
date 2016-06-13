describe('Tasks Table', function () {

  context('Task row', function () {
    beforeEach(function () {
      cy.configureCluster({
        mesos: '1-service-with-executor-task',
        nodeHealth: true
      });
    });

    it('displays task detail page on task click', function () {
      cy.visitUrl({url: '/services/%2Fcassandra/'});
      cy.get('a[title="server-0"]').click();
      cy.get('.page-content h1').should('to.have.text', 'server-0');
    });

    context('Files tab', function () {

      beforeEach(function () {
        cy.visitUrl({
          url: '/services/%2Fcassandra/tasks/server-0_10ab666b-cf9b-44eb-bc53-b6dba1b7c737/'
        });
        cy.get('.page-content .tab-item-label').contains('Files').click();
      });

      it('shows the contents of the Mesos sandbox', function () {
        cy.get('.page-content tbody tr:visible')
          .should(function ($rows) {
            expect($rows.length).to.equal(13);
          });
      });

      it('shows directories as well as files', function () {
        cy.get('.page-content tbody tr:visible:first')
          .contains('jre1.7.0_76');
      });

    });

  });
});

