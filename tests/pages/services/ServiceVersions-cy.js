describe('Service Versions', function () {

  context('Configuration Tab', function () {
    beforeEach(function () {
      cy.configureCluster({
        mesos: '1-task-healthy',
        nodeHealth: true
      });

      cy.visitUrl({url: '/services/%2Fsleep/'});
      cy.wait(1500);
      cy.get('.tab-item .tab-item-label-text')
        .contains('Configuration').click();
      cy.wait(1000);
    });

    it('opens the current service version on default', function () {
      cy.get('.page-content h4').contains('Current Version')
        .should('to.have.length', 1);
    });

    it('renders the version dropdown with the current locale version as default',
    function () {
      cy.get('.page-content .dropdown .button span')
        .contains(new Date('2015-08-28T01:26:14.620Z').toLocaleString())
        .should('to.have.length', 1);
    });

    it('renders the selected service version', function () {
      cy.get('.page-content .dropdown .button span')
        .contains(new Date('2015-08-28T01:26:14.620Z').toLocaleString())
        .parent()
        .click();

      cy.wait(1500);

      cy.get('.page-content .dropdown .dropdown-menu-list ul li:eq(1)')
        .click();

      cy.wait(1500);

      cy.get('.page-content h4')
        .contains('Previous Version (' +
          new Date('2015-02-28T05:12:12.221Z').toLocaleString() + ')')
        .should('to.have.length', 1);
    });

    it('applies the selected service version', function () {
      cy
        .route({
          method: 'PUT',
          url: /marathon\/v2\/apps\/\/sleep/,
          response: {
            "deploymentId": "5ed4c0c5-9ff8-4a6f-a0cd-f57f59a34b43",
            "version": "2015-09-29T15:59:51.164Z"
          },
          delay: 500
        });

      cy.get('.page-content .dropdown .button span')
        .contains(new Date('2015-08-28T01:26:14.620Z').toLocaleString())
        .parent()
        .click();

      cy.wait(1500);

      cy.get('.page-content .dropdown .dropdown-menu-list ul li:eq(1)')
        .click();

      cy.wait(1500);

      cy.get('.page-content h4')
        .contains('Previous Version (' +
          new Date('2015-02-28T05:12:12.221Z').toLocaleString() + ')')
        .should('to.have.length', 1);

      cy.get('.page-content .tab button.button')
        .contains('Apply').click();
    });

    it('opens correct edit modal of the selected service version', function () {
      cy.get('.page-content .dropdown .button span')
        .contains(new Date('2015-08-28T01:26:14.620Z').toLocaleString())
        .parent()
        .click();

      cy.wait(1500);

      cy.get('.page-content .dropdown .dropdown-menu-list ul li:eq(1)')
        .click();

      cy.wait(1500);

      cy.get('.page-content h4')
        .contains('Previous Version (' +
          new Date('2015-02-28T05:12:12.221Z').toLocaleString() + ')')
        .should('to.have.length', 1);

      cy.get('.page-content .tab button.button')
        .contains('Edit').click();

      cy.get('.modal .form-panel textarea[name="cmd"]')
        .should('to.have.value', 'sleep 1000');
    });
  });

});
