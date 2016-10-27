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
      cy.get('.page-body-content .h1 .collapsing-string-full-string')
        .should('to.have.text', 'server-0');
    });

    context('Files tab', function () {

      beforeEach(function () {
        cy.visitUrl({
          url: '/services/overview/%2Fcassandra/tasks/server-0_10a'
        });
        cy.get('.page-body-content .menu-tabbed-item-label').contains('Files').click();
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
});

