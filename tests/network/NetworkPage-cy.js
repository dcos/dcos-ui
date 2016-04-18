describe('Network Page [0hy]', function () {

  beforeEach(function () {
    cy.configureCluster({
      mesos: '1-task-healthy',
      acl: true,
      networkVIPSummaries: true
    });
  });

  it('goes to Network page when tab is clicked [0hz]', function () {
    cy
      .visitUrl({url: '/'})
      .get('.sidebar-menu-item')
      .contains('Network')
      .click();

    cy.hash().should('match', /network/);
  });

  it('shows the loading indicator before receiving data [06f]', function () {

    cy.get('.ball-scale').should(function ($loadingIndicator) {
      expect($loadingIndicator).length.to.be(1);
    });

  });

  describe('VIPsTable [0i0]', function () {

    it('renders the correct number of VIPs [0i3]', function () {
      cy
        .get('.table tbody')
        .should(function ($tbody) {
          expect($tbody.children().length).to.equal(5);
        });
    });

    it('allows filtering of the table by VIP [0i4]', function () {
      cy
        .get('.filter-input-text-group input')
        .type('1.2.3.4');

      cy
        .get('.table tbody')
        .should(function ($tbody) {
          expect($tbody.children().length).to.equal(3);
        });
    });

    it('displays all data when clearing the filter [0i5]', function () {
      cy
        .get('.filter-input-text-group a')
        .click();

      cy
        .get('.table tbody')
        .should(function ($tbody) {
          expect($tbody.children().length).to.equal(5);
        });
    });

    it('renders the successes and failures with the right classes [0i6]',
      function () {
        cy
          .get('.table tbody .text-success').should(function ($textSuccess) {
            expect($textSuccess.length).to.equal(3);
          });

        cy
          .get('.table tbody .text-danger').should(function ($textSuccess) {
            expect($textSuccess.length).to.equal(3);
          });
    });

  });

  describe('Sidepanel [0i0]', function () {

    it('opens the side panel when users click on the ip address [0i7]',
      function () {
      cy
        .get('.table tbody a').first().click();

      cy
        .get('.side-panel-large').should(function ($sidePanel) {
          expect($sidePanel.length).to.equal(1);
        });
    });

    describe('VIPDetailSidePanelContents [0if]', function () {

      describe('NetworkItemDetails', function () {

        beforeEach(function () {
          cy.get('.side-panel-content').as('sidePanel');
          cy.get('@sidePanel').get('.dropdown').as('dropdown');
          cy.get('@dropdown').get('.dropdown-toggle').as('dropdownToggle');
          cy.get('@sidePanel').get('.dygraph-chart-wrapper').as('chart');

          cy.get('@dropdownToggle').click();

          cy
            .get('@dropdown')
            .get('.dropdown-menu-list li')
            .contains('Successes and Failures')
            .click();
        });

        it('displays the correct number of backends', function () {
          cy
            .get('@dropdownToggle')
            .get('.dropdown-toggle-label-secondary')
            .should(function ($secondaryLabel) {
              expect($secondaryLabel[0].textContent).to.equal('3 Total Backends');
            });
        });
        
        // it('updates the y-axis when changing the dataset', function () {
        //   cy
        //     .get('@chart')
        //     .get('.dygraph-ylabel')
        //     .should(function ($yLabel) {
        //       expect($yLabel[0].textContent).to.equal('Requests');
        //     });
        //
        //   cy
        //     .get('@dropdownToggle')
        //     .click();
        //
        //   cy
        //     .get('@dropdown')
        //     .get('.dropdown-menu-list li')
        //     .contains('Application Reachability')
        //     .click();
        //
        //   cy
        //     .get('@chart')
        //     .get('.dygraph-ylabel')
        //     .should(function ($yLabel) {
        //       expect($yLabel[0].textContent).to.equal('App Reachability');
        //     });
        // });

        // it('updates the x-axis labels when changing the dataset', function () {
        //   cy
        //     .get('@chart')
        //     .get('.graph-legend > span')
        //     .as('legendItems')
        //     .should(function ($legendElements) {
        //       expect($legendElements.length).to.equal(2);
        //     });
        //
        //   cy
        //     .get('@dropdownToggle')
        //     .click();
        //
        //   cy
        //     .get('@dropdown')
        //     .get('.dropdown-menu-list li')
        //     .contains('IP Reachability')
        //     .click();
        //
        //   cy
        //     .get('@legendItems')
        //     .should(function ($legendElements) {
        //       expect($legendElements.length).to.equal(5);
        //     });
        // });

      });

      describe('BackendsTable [0i0]', function () {

        it('renders the correct number of backends [0i8]', function () {
          cy
            .get('.side-panel-large .table tbody')
            .should(function ($tbody) {
              expect($tbody.children().length).to.equal(5);
            });
        });

        it('allows filtering of the table by backends [0i9]', function () {
          cy
            .get('.side-panel-large .filter-input-text-group input')
            .type('10.10.11.12');

          cy
            .get('.side-panel-large .table tbody')
            .should(function ($tbody) {
              expect($tbody.children().length).to.equal(3);
            });
        });

        it('displays all backends when clearing the filter [0ia]', function () {
          cy
            .get('.side-panel-large .filter-input-text-group a')
            .click();

          cy
            .get('.side-panel-large .table tbody')
            .should(function ($tbody) {
              expect($tbody.children().length).to.equal(5);
            });
        });

        it('renders the successes and failures with the right classes [0ib]',
          function () {
            cy
              .get('.side-panel-large .table tbody .text-success')
              .should(function ($textSuccess) {
                expect($textSuccess.length).to.equal(3);
              });

            cy
              .get('.side-panel-large .table tbody .text-danger')
              .should(function ($textSuccess) {
                expect($textSuccess.length).to.equal(3);
              });
        });

      });

      describe('Sidepanel Tabs [0ic]', function () {

        it('it switches to the detail tab when the detail tab is clicked [0id]',
          function () {
            cy
              .get('.side-panel-large .tab-item-label')
              .contains('Details')
              .click();

            cy
              .get('.side-panel-large .tab-item.active')
              .should(function ($activeTab) {
                expect($activeTab).to.contain('Details');
              });
        });

      });

      describe('NetworkItemDetails [0i0]', function () {

        it('it renders the proper number of details [0ie]',
          function () {
            cy
              .get('.side-panel-large .tab-item-label')
              .contains('Details')
              .click();

            cy
              .get('.side-panel-large .network-item-details')
              .should(function ($networkItemDetails) {
                console.log($networkItemDetails.children());
                expect($networkItemDetails.children().length).to.equal(2);
              });
        });

      });

    });

    describe('BackendDetailsSidePanelContents [0ig]', function () {

      it('loads the backend details when clicking on a backend [0ih]', function () {
        cy
          .get('.side-panel-large .tab-item-label')
          .contains('Backends')
          .click();

        cy
          .get('.table tbody a.emphasize').first().click();

      });

      describe('ClientsTable [0ii]', function () {

        it('renders the correct number of clients [0i8]', function () {
          cy
            .get('.side-panel-large .table tbody')
            .should(function ($tbody) {
              expect($tbody.children().length).to.equal(3);
            });
        });

        it('allows filtering of the table by clients [0i9]', function () {
          cy
            .get('.side-panel-large .filter-input-text-group input')
            .type('10.10.11.13');

          cy
            .get('.side-panel-large .table tbody')
            .should(function ($tbody) {
              expect($tbody.children().length).to.equal(3);
            });
        });

        it('displays all backends when clearing the filter [0ia]', function () {
          cy
            .get('.side-panel-large .filter-input-text-group a')
            .click();

          cy
            .get('.side-panel-large .table tbody')
            .should(function ($tbody) {
              expect($tbody.children().length).to.equal(3);
            });
        });

        it('renders the successes and failures with the right classes [0ib]',
          function () {
            cy
              .get('.side-panel-large .table tbody td')
              .contains('Reachable')
              .should(function ($textSuccess) {
                expect($textSuccess.length).to.equal(1);
              });
        });

      });

      describe('Sidepanel Tabs [0ic]', function () {

        it('it switches to the detail tab when the detail tab is clicked [0id]',
          function () {
            cy
              .get('.side-panel-large .tab-item-label')
              .contains('Details')
              .click();

            cy
              .get('.side-panel-large .tab-item.active')
              .should(function ($activeTab) {
                expect($activeTab).to.contain('Details');
              });
        });

      });

      describe('NetworkItemDetails [0i0]', function () {

        it('it renders the proper number of details [0ie]',
          function () {
            cy
              .get('.side-panel-large .tab-item-label')
              .contains('Details')
              .click();

            cy
              .get('.side-panel-large .network-item-details')
              .should(function ($networkItemDetails) {
                console.log($networkItemDetails.children());
                expect($networkItemDetails.children().length).to.equal(2);
              });
        });

      });

    });

  });

});
