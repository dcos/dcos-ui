describe('Overlay Header Height [00j]', function () {

  beforeEach(function () {
    cy.configureCluster({
      mesos: '1-task-healthy'
    })
    .visitUrl({url: '/', identify: true, fakeAnalytics: true});
  });

  context('Headers [00n]', function () {

    beforeEach(function () {
      cy.get('.sidebar-menu-item').contains('Services').click();
      cy.get('table tbody tr').as('tableRows');
    });

    it('should render all overlay headers at the same height [00p]',
      function () {
      var sidePanelHeaderHeight = null;
      var overlayHeaderHeight = null;

      // Open the Marathon task.
      cy.get('@tableRows').contains('marathon').click();
      // Get the task panel's header.
      cy.get('.side-panel-header-container').as('sidePanelHeader');

      cy.get('@sidePanelHeader').should(function ($sidePanelHeader) {
        sidePanelHeaderHeight = $sidePanelHeader.outerHeight();
      });

      // Open the Marathon UI.
      cy.get('.side-panel-content-header-actions')
        .contains('Open Service')
        .click();

      // Get the service overlay's header.
      cy.get('.overlay-header-container').as('overlayHeader');

      cy.get('@overlayHeader').should(function ($overlayHeader) {
        overlayHeaderHeight = $overlayHeader.outerHeight();
        expect(sidePanelHeaderHeight).to.eq(overlayHeaderHeight);
      });
    });
  });
});
