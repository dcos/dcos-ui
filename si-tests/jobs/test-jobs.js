describe('Jobs', function () {

  it('Create a simple job', function () {
    const jobName = 'job-with-inline-shell-script';
    const fullJobName = `${Cypress.env('TEST_UUID')}.${jobName}`;
    const cmdline = 'while true; do echo \'test\' ; sleep 100 ; done';

    // Visit jobs
    cy
      .visitUrl({url: 'jobs'});

    // Click 'Create a job'
    // cy
    //   .get('.button.button-link.button-narrow')
    //   .click();
    cy
      .contains('Create a Job')
      .click();

    // Wait for the 'New Job' dialog to appear
    cy
      .get('.modal-header')
      .contains('New Job')
      .should('exist');

    // Fill-in the input elements
    cy
      .root()
      .getFormGroupInputFor('ID *')
      .type(`{selectall}${fullJobName}`);
    //
    // TODO: Due to a bug in cypress you cannot type values with dots
    // cy
    //   .root()
    //   .getFormGroupInputFor('CPUs')
    //   .type('{selectall}0.1');
    //
    cy
      .root()
      .getFormGroupInputFor('Mem (MiB)')
      .type('{selectall}32');
    cy
      .root()
      .getFormGroupInputFor('Command')
      .type(cmdline);

    // Check JSON mode
    cy
      .contains('JSON mode')
      .click();

    // Check contents of the JSON editor
    cy
      .get('#brace-editor')
      .shouldJsonMatch({
        'id': fullJobName,
        'run': {
          'cpus': 0.01,
          'mem': 32,
          'disk': 0,
          'cmd': cmdline
        },
        'schedules': []
      });

    // Click crate job
    cy
      .contains('Create Job')
      .click();

    // Switch to the group that will contain the service
    cy
      .visitUrl({url: `jobs/${Cypress.env('TEST_UUID')}`});

    // Wait for the table and the service to appear
    cy
      .get('.page-body-content table')
      .contains(jobName)
      .should('exist');

  });

});
