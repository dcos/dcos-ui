describe('Job Details', function () {

  beforeEach(function () {
    cy.configureCluster({
      jobDetails: true,
      mesos: '1-for-each-health',
      nodeHealth: true
    });
    cy.visitUrl({url: '/jobs/foo'});
  });

  context('Job Details Header', function () {

    it('renders the proper job name', function () {
      cy.get('.page-header-heading').should('contain',
        'Foo Description');
    });

    it('renders the proper job status', function () {
      cy.get('.page-header-heading').should('contain', 'Failed');
    });

    it('renders the relative time of the longest running task', function () {
      cy.get('.page-header-heading').should('contain', '31 yrs ago');
    });

  });

  context('Run History Tab', function () {

    it('shows the correct number of jobs in the filter header', function () {
      cy.get('.page-content .list-inline.list-unstyled').should('contain',
        '2 Runs');
    });

    it('renders the correct number of jobs in the table', function () {
      cy.get('.job-run-history-table tbody tr').should(function ($rows) {
        // Four rows, two for the virtual list padding and two for the data.
        expect($rows.length).to.equal(4);
      });
    });

    it('does not show table children when row is not expanded', function () {
      cy.get('.job-run-history-table tbody tr').should(function ($rows) {
        // Four rows, two for the virtual list padding and two for the data.
        cy.get('.job-run-history-table tbody tr:nth-child(2)').as('tableRow');

        cy.get('@tableRow').find('td:first-child .job-run-history-table-child')
          .should(function ($children) {
            expect($children.length).to.equal(0);
          }
        );
      });
    });

    it('expands the table row when clicking a job run', function () {
      cy.get('.job-run-history-table tbody tr:nth-child(2)').as('tableRow');

      cy.get('@tableRow').find('.job-run-history-job-id').click();

      cy.get('@tableRow').find('.job-run-history-job-id').should('have.class', 'is-expanded');

      cy.get('@tableRow').find('td:first-child .job-run-history-table-child')
        .should(function ($children) {
          expect($children.length).to.equal(2);
        }
      );
    });

    it('expands a second table row when clicking another job run', function () {
      cy.get('.job-run-history-table tbody tr:nth-child(2)').as('tableRowA');
      cy.get('.job-run-history-table tbody tr:nth-child(3)').as('tableRowB');

      cy.get('@tableRowA').find('.job-run-history-job-id').click();
      cy.get('@tableRowB').find('.job-run-history-job-id').click();

      cy.get('.job-run-history-table .job-run-history-table-child')
        .should(function ($children) {
          // Four table columns, two table rows, each with two children.
          // 4 * 2 * 2 = 16
          expect($children.length).to.equal(16);
        }
      );
    });

  });

  context('Configuration Tab', function () {

    it('renders the correct amount of job configuration details', function () {
      cy.get('.page-content .tabs .tab-item').contains('Configuration').click();
      cy.get('.page-content dl').should(function ($elements) {
        expect($elements.length).to.equal(2);
      });
    });

    it('renders the job configuration data', function () {
      cy.get('.page-content .tabs .tab-item').contains('Configuration').click();
      cy.get('.page-content dl:nth-child(1)').should('contain', 'Command');
      cy.get('.page-content dl:nth-child(1)').should('contain', '/foo');
      cy.get('.page-content dl:nth-child(2)').should('contain', 'Schedule');
      cy.get('.page-content dl:nth-child(2)').should('contain', '0 1 6 9 *');
    });

  });

});
