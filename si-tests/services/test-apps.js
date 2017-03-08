describe('Services', function () {

  /**
   * Test the applications
   */
  describe('Applications', function () {

    beforeEach(function () {
      cy
        .visitUrl({url: `services/overview/%2F${Cypress.env('TEST_UUID')}/create`});
    });

    it('Creates an app with artifacts', function () {
      const serviceName = 'app-with-artifacts';
      const cmdline = 'while true; do echo \'test\' ; sleep 100 ; done';

      // Select 'Single Container'
      cy
        .contains('Single Container')
        .click();

      // Fill-in the input elements
      cy
        .get('input[name=id]')
        .type(`{selectall}{rightarrow}${serviceName}`);
      //
      // TODO: Due to a bug in cypress you cannot type values with dots
      // cy
      //   .get('input[name=cpus]')
      //   .type('{selectall}0.1');
      //
      cy
        .get('input[name=mem]')
        .type('{selectall}10');
      cy
        .get('textarea[name=cmd]')
        .type(cmdline);

      // More settings
      cy
        .contains('More Settings')
        .click();

      // Select Mesos runtime
      cy
        .contains('Mesos Runtime')
        .click();

      // Use some artifacts
      cy
        .contains('Add Artifact')
        .click();
      cy
        .get('input[name="fetch.0.uri"]')
        .type('http://lorempicsum.com/simpsons/600/400/1');
      cy
        .contains('Add Artifact')
        .click();
      cy
        .get('input[name="fetch.1.uri"]')
        .type('http://lorempicsum.com/simpsons/600/400/2');
      cy
        .contains('Add Artifact')
        .click();
      cy
        .get('input[name="fetch.2.uri"]')
        .type('http://lorempicsum.com/simpsons/600/400/3');

      // Check JSON view
      cy
        .contains('JSON Editor')
        .click();

      // Check contents of the JSON editor
      cy
        .get('#brace-editor')
        .shouldJsonMatch({
          'id': `/${Cypress.env('TEST_UUID')}/${serviceName}`,
          'cmd': cmdline,
          'cpus': 0.1,
          'mem': 10,
          'instances': 1,
          'fetch': [
            {
              'uri': 'http://lorempicsum.com/simpsons/600/400/1'
            },
            {
              'uri': 'http://lorempicsum.com/simpsons/600/400/2'
            },
            {
              'uri': 'http://lorempicsum.com/simpsons/600/400/3'
            }
          ]
        });

      // Click Review and Run
      cy
        .contains('Review & Run')
        .click();

      // Verify the review screen
      cy
        .root()
        .configurationSection('General')
        .configurationMapValue('Service ID')
        .contains(`/${Cypress.env('TEST_UUID')}/${serviceName}`);
      cy
        .root()
        .configurationSection('General')
        .configurationMapValue('Container Runtime')
        .contains('Mesos Runtime');
      cy
        .root()
        .configurationSection('General')
        .configurationMapValue('CPU')
        .contains('0.1');
      cy
        .root()
        .configurationSection('General')
        .configurationMapValue('Memory')
        .contains('10 MiB');
      cy
        .root()
        .configurationSection('General')
        .configurationMapValue('Disk')
        .contains('Not Configured');
      cy
        .root()
        .configurationSection('General')
        .configurationMapValue('Container Image')
        .contains('Not Supported');
      cy
        .root()
        .configurationSection('General')
        .configurationMapValue('Command')
        .contains(cmdline);
      cy
        .root()
        .configurationSection('Container Artifacts')
        .children('table')
        .getTableColumn('Artifact URI')
        .contents()
        .should('deep.equal', [
          'http://lorempicsum.com/simpsons/600/400/1',
          'http://lorempicsum.com/simpsons/600/400/2',
          'http://lorempicsum.com/simpsons/600/400/3'
        ]);

      // Run service
      cy
        .get('button.button-primary')
        .contains('Run Service')
        .click();

      // Wait for the table and the service to appear
      cy
        .get('.page-body-content table')
        .contains(serviceName)
        .should('exist');

    });

    it('Creates an app with command health check', function () {
      const serviceName = 'app-with-command-health-check';

      // Select 'Single Container'
      cy
        .contains('Single Container')
        .click();

      // Fill-in the input elements
      cy
        .get('input[name=id]')
        .type(`{selectall}{rightarrow}${serviceName}`);
      cy
        .get('input[name="container.docker.image"]')
        .type('nginx');
      //
      // TODO: Due to a bug in cypress you cannot type values with dots
      // cy
      //   .get('input[name=cpus]')
      //   .type('{selectall}0.5');
      //
      cy
        .get('input[name=mem]')
        .type('{selectall}32');

      // Select Networking section
      cy
        .root()
        .get('.menu-tabbed-item')
        .contains('Networking')
        .click();

      // Select "Bridge"
      cy
        .get('select[name="container.docker.network"]')
        .select('Bridge');

      // Click "Add Service Endpoint"
      cy
        .contains('Add Service Endpoint')
        .click();
      cy
        .get('input[name="portDefinitions.0.containerPort"]')
        .type('80');

      // Switch to health checks
      cy
        .contains('Health Checks')
        .click();

      // Add a health check
      cy
        .contains('Add Health Check')
        .click();
      cy
        .get('select[name="healthChecks.0.protocol"]')
        .select('Command');
      cy
        .get('textarea[name="healthChecks.0.command"]')
        .type('sleep 5; exit 0');

      // Check JSON view
      cy
        .contains('JSON Editor')
        .click();

      // Check contents of the JSON editor
      cy
        .get('#brace-editor')
        .shouldJsonMatch({
          'id': `/${Cypress.env('TEST_UUID')}/${serviceName}`,
          'instances': 1,
          'container': {
            'type': 'DOCKER',
            'docker': {
              'image': 'nginx',
              'network': 'BRIDGE',
              'portMappings': [
                {
                  'containerPort': 80,
                  'hostPort': 0,
                  'protocol': 'tcp'
                }
              ]
            }
          },
          'cpus': 0.1,
          'mem': 32,
          'healthChecks': [
            {
              'protocol': 'COMMAND',
              'command': {
                'value': 'sleep 5; exit 0'
              }
            }
          ]
        });

      // Click Review and Run
      cy
        .contains('Review & Run')
        .click();

      // Verify the review screen
      cy
        .root()
        .configurationSection('General')
        .configurationMapValue('Service ID')
        .contains(`/${Cypress.env('TEST_UUID')}/${serviceName}`);
      cy
        .root()
        .configurationSection('General')
        .configurationMapValue('Container Runtime')
        .contains('Docker Engine');
      cy
        .root()
        .configurationSection('General')
        .configurationMapValue('CPU')
        .contains('0.1');
      cy
        .root()
        .configurationSection('General')
        .configurationMapValue('Memory')
        .contains('32 MiB');
      cy
        .root()
        .configurationSection('General')
        .configurationMapValue('Disk')
        .contains('Not Configured');
      cy
        .root()
        .configurationSection('General')
        .configurationMapValue('Container Image')
        .contains('nginx');
      cy
        .root()
        .configurationSection('Network')
        .configurationMapValue('Network Type')
        .contains('BRIDGE');

      cy
        .root()
        .configurationSection('Service Endpoints')
        .getTableRowThatContains('80')
        .should('exist');

      cy
        .root()
        .configurationSection('Command Health Checks')
        .getTableRowThatContains('sleep 5; exit 0')
        .should('exist');

      // Run service
      cy
        .get('button.button-primary')
        .contains('Run Service')
        .click();

      // Wait for the table and the service to appear
      cy
        .get('.page-body-content table')
        .contains(serviceName)
        .should('exist');

      // Get the table row and look for health
      cy
        .get('.page-body-content table')
        .getTableRowThatContains(serviceName)
        .get('.bar.healthy', {timeout: 30000})
        .should('exist');

    });

  });

});
