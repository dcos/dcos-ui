describe('Tasks Table', function () {

  context('Task row', function () {
    beforeEach(function () {
      cy.configureCluster({
        mesos: '1-service-with-executor-task',
        nodeHealth: true
      });
      cy.visitUrl({url: '/services/%2Fcassandra/'});
    });

    it('displays task detail page on task click', function () {
      cy.get('a[title="server-0"]').click();
      cy.get('.page-content h1').should('to.have.text', 'server-0_10ab666b-cf9b-44eb-bc53-b6dba1b7c737');
    });

  });
});
 
