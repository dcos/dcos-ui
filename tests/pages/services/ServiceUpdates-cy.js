describe('Service Updates', function () {

  beforeEach(function () {
    cy
      .configureCluster({
        mesos: '1-service-with-executor-task',
        servicePlan: '2-phases-in-progress'
      })
      .visitUrl({url: '/services/%2Fcassandra'});
  });

  describe('Service Plan Progress Bar', function () {

    it('displays the service plan progress bar in the service detail subheader',
      function () {
      cy
        .get('.service-plan-progress-bar')
        .should(function ($progressBar) {
          expect($progressBar.length).to.equal(1);
        });
    });

    it('displays the status of the overall plan',
      function () {
      cy
        .get('.service-plan-progress-bar .progress-bar-label')
        .should(function ($planProgressLabel) {
          expect($planProgressLabel[0].textContent).to.contain('Updating');
        });
    });

    it('displays the phase that is currently active', function () {
      cy
        .get('.service-plan-progress-bar .progress-bar-phase-details')
        .should(function ($phaseProgressLabel) {
          expect($phaseProgressLabel[0].textContent.startsWith('Phase 2 of 2'))
            .to.be.true;
        });
    });

    it('displays the status of the phase that is currently active',
      function () {
      cy
        .get('.service-plan-progress-bar .progress-bar-phase-details')
        .should(function ($phaseProgressLabel) {
          expect($phaseProgressLabel[0].textContent).to.contain('Updating');
        });
    });

    it('displays the View Details link',
      function () {
      cy
        .get('.service-plan-progress-bar .progress-bar-phase-details a')
        .should(function ($viewDetails) {
          expect($viewDetails[0].textContent).to.contain('View Details');
        });
    });

    it('clicking View Details shows the service plan progress modal',
      function () {
      cy
        .get('.service-plan-progress-bar .progress-bar-phase-details a')
        .click();

      cy.get('.modal .service-plan-modal')
        .should(function ($modal) {
          expect($modal.length).to.equal(1);
        });
    });

  });

  describe('Service Plan Progress Modal', function () {

    beforeEach(function () {
      cy
        .get('.service-plan-progress-bar .progress-bar-phase-details a')
        .click();
    });

    it('displays the phase that is currently active', function () {
      cy
        .get('.modal .segmented-progress-bar-title')
        .should(function ($phaseProgressLabel) {
          expect($phaseProgressLabel[0].textContent.startsWith('Phase 2 of 2'))
            .to.be.true;
        });
    });

    it('displays the status of the phase that is currently active',
      function () {
      cy
        .get('.modal .segmented-progress-bar-title')
        .should(function ($phaseProgressLabel) {
          expect($phaseProgressLabel[0].textContent).to.contain('Updating');
        });
    });

    it('displays the Show Details link', function () {
      cy
        .get('.modal .segmented-progress-bar-title a')
        .should(function ($viewDetails) {
          expect($viewDetails[0].textContent).to.contain('Show Details');
        });
    });

    describe('Servie Plan Phase Progress Details', function () {

      beforeEach(function () {
        cy
          .get('.modal .segmented-progress-bar-title')
          .contains('Show Details')
          .click();
      });

      it('displays the phase details when clicking the Show Details link',
        function () {
        cy
          .get('.modal .service-plan-modal-details-content')
          .should(function ($phaseDetails) {
            expect($phaseDetails.length).to.equal(1);
          });
      });

      it('displays the blocks within the phase',
        function () {
        cy
          .get('.modal .service-plan-modal-details-content .service-plan-modal-details-block')
          .should(function ($blocks) {
            expect($blocks.length).to.equal(3);
          });
      });

      it('displays the block name and status when clicking on the blocks',
        function () {
        cy
          .get('.modal .service-plan-modal-details-content .service-plan-modal-details-block:nth-child(1)')
          .click();

        cy
          .get('.modal .service-plan-modal-details-heading')
          .should(function ($detailsHeading) {
            expect($detailsHeading).to.contain('broker-0: Complete');
          });

        cy
          .get('.modal .service-plan-modal-details-content .service-plan-modal-details-block:nth-child(2)')
          .click();

        cy
          .get('.modal .service-plan-modal-details-heading')
          .should(function ($detailsHeading) {
            expect($detailsHeading).to.contain('broker-1: In Progress');
          });

        cy
          .get('.modal .service-plan-modal-details-content .service-plan-modal-details-block:nth-child(3)')
          .click();

        cy
          .get('.modal .service-plan-modal-details-heading')
          .should(function ($detailsHeading) {
            expect($detailsHeading).to.contain('broker-2: Pending');
          });
      });

    });

  });

});
