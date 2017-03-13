describe('Services', function () {

  /**
   * Test the applications
   */
  describe('Applications', function () {

    beforeEach(function () {
      cy
        .visitUrl({url: `services/overview/%2F${Cypress.env('TEST_UUID')}/create`});
    });

    function selectMesosRuntime() {
      cy
        .contains('More Settings')
        .click();
      cy
        .contains('Mesos Runtime')
        .click();
    }

    it('Create a simple app', function () {
      const serviceName = 'app-with-inline-shell-script';
      const cmdline = 'while true; do echo \'test\' ; sleep 100 ; done';

      // Select 'Single Container'
      cy
        .contains('Single Container')
        .click();

      // Fill-in the input elements
      cy
        .root()
        .getFormGroupInputFor('Service ID *')
        .type(`{selectall}{rightarrow}${serviceName}`);
      //
      // TODO: Due to a bug in cypress you cannot type values with dots
      // cy
      //   .get('input[name=cpus]')
      //   .type('{selectall}0.5');
      //
      cy
        .root()
        .getFormGroupInputFor('Memory (MiB) *')
        .type('{selectall}10');
      cy
        .root()
        .getFormGroupInputFor('Command')
        .type(cmdline);

      // Select mesos runtime
      selectMesosRuntime();

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
          'instances': 1
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
        .should('exist');

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
        .root()
        .getFormGroupInputFor('Service ID *')
        .type(`{selectall}{rightarrow}${serviceName}`);
      //
      // TODO: Due to a bug in cypress you cannot type values with dots
      // cy
      //   .root()
      //   .getFormGroupInputFor('CPUs *')
      //   .type('{selectall}0.1');
      //
      cy
        .root()
        .getFormGroupInputFor('Memory (MiB) *')
        .type('{selectall}10');
      cy
        .root()
        .getFormGroupInputFor('Command')
        .type(cmdline);

      // Select mesos runtime
      selectMesosRuntime();

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
        .root()
        .getFormGroupInputFor('Service ID *')
        .type(`{selectall}{rightarrow}${serviceName}`);
      cy
        .root()
        .getFormGroupInputFor('Container Image')
        .type('nginx');
      //
      // TODO: Due to a bug in cypress you cannot type values with dots
      // cy
      //   .get('input[name=cpus]')
      //   .type('{selectall}0.5');
      //
      cy
        .root()
        .getFormGroupInputFor('Memory (MiB) *')
        .type('{selectall}32');

      // Select Networking section
      cy
        .root()
        .get('.menu-tabbed-item')
        .contains('Networking')
        .click();

      // Select "Bridge"
      cy
        .root()
        .getFormGroupInputFor('Network Type')
        .select('Bridge');

      // Click "Add Service Endpoint"
      cy
        .contains('Add Service Endpoint')
        .click();
      cy
        .root()
        .getFormGroupInputFor('Container Port')
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
        .root()
        .getFormGroupInputFor('Protocol')
        .select('Command');
      cy
        .root()
        .getFormGroupInputFor('Command')
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

    it('Create an app with docker config', function () {
      const serviceName = 'app-with-docker-config';
      const cmdline = 'python3 -m http.server 8080';

      // Select 'Single Container'
      cy
        .contains('Single Container')
        .click();

      // Fill-in the input elements
      cy
        .root()
        .getFormGroupInputFor('Service ID *')
        .type(`{selectall}{rightarrow}${serviceName}`);
      cy
        .root()
        .getFormGroupInputFor('Container Image')
        .type('python:3');
      //
      // TODO: Due to a bug in cypress you cannot type values with dots
      // cy
      //   .get('input[name=cpus]')
      //   .type('{selectall}0.5');
      //
      cy
        .root()
        .getFormGroupInputFor('Memory (MiB) *')
        .type('{selectall}32');
      cy
        .root()
        .getFormGroupInputFor('Command')
        .type(cmdline);

      // Select Networking section
      cy
        .root()
        .get('.menu-tabbed-item')
        .contains('Networking')
        .click();

      // Select "Bridge"
      cy
        .root()
        .getFormGroupInputFor('Network Type')
        .select('Bridge');

      // Click "Add Service Endpoint"
      cy
        .contains('Add Service Endpoint')
        .click();

      // Setup HTTP endpoint
      cy
        .root()
        .getFormGroupInputFor('Container Port')
        .type('8080');
      cy
        .root()
        .getFormGroupInputFor('Service Endpoint Name')
        .type('http');

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
          'instances': 1,
          'mem': 32,
          'container': {
            'type': 'DOCKER',
            'docker': {
              'image': 'python:3',
              'network': 'BRIDGE',
              'portMappings': [
                {
                  'name': 'http',
                  'hostPort': 0,
                  'containerPort': 8080,
                  'protocol': 'tcp'
                }
              ]
            }
          }
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
        .contains('python:3');

      cy
        .root()
        .configurationSection('Network')
        .configurationMapValue('Network Type')
        .contains('BRIDGE');
      cy
        .root()
        .configurationSection('Service Endpoints')
        .getTableRowThatContains('http')
        .should('exist');
      cy
        .root()
        .configurationSection('Service Endpoints')
        .getTableRowThatContains('8080')
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

      // Get the table row and wait until it's Running
      cy
        .get('.page-body-content table')
        .getTableRowThatContains(serviceName)
        .contains('Running')
        .should('exist');

    });

    it('Create an app with environment variables', function () {
      const serviceName = 'app-with-environment-variables';
      const cmdline = 'while true; do echo \'test\' ; sleep 100 ; done';

      // Select 'Single Container'
      cy
        .contains('Single Container')
        .click();

      // Fill-in the input elements
      cy
        .root()
        .getFormGroupInputFor('Service ID *')
        .type(`{selectall}{rightarrow}${serviceName}`);
      //
      // TODO: Due to a bug in cypress you cannot type values with dots
      // cy
      //   .get('input[name=cpus]')
      //   .type('{selectall}0.5');
      //
      cy
        .root()
        .getFormGroupInputFor('Memory (MiB) *')
        .type('{selectall}10');
      cy
        .root()
        .getFormGroupInputFor('Command')
        .type(cmdline);

      // Select mesos runtime
      selectMesosRuntime();

      // Select Networking section
      cy
        .root()
        .get('.menu-tabbed-item')
        .contains('Environment')
        .click();

      // Add an environment variable
      cy
        .contains('Add Environment Variable')
        .click();
      cy
        .get('input[name="env.0.key"]')
        .type('camelCase');
      cy
        .get('input[name="env.0.value"]')
        .type('test');

      // Add an environment variable
      cy
        .contains('Add Environment Variable')
        .click();
      cy
        .get('input[name="env.1.key"]')
        .type('snake_case');
      cy
        .get('input[name="env.1.value"]')
        .type('test');

      // Add an environment variable
      cy
        .contains('Add Environment Variable')
        .click();
      cy
        .get('input[name="env.2.key"]')
        .type('lowercase');
      cy
        .get('input[name="env.2.value"]')
        .type('test');

      // Add an environment variable
      cy
        .contains('Add Environment Variable')
        .click();
      cy
        .get('input[name="env.3.key"]')
        .type('UPPERCASE');
      cy
        .get('input[name="env.3.value"]')
        .type('test');

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
          'env': {
            'camelCase': 'test',
            'snake_case': 'test',
            'lowercase': 'test',
            'UPPERCASE': 'test'
          }
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
        .configurationSection('Environment Variables')
        .children('table')
        .getTableColumn('Key')
        .contents()
        .should('deep.equal', [
          'camelCase',
          'snake_case',
          'lowercase',
          'UPPERCASE'
        ]);
      cy
        .root()
        .configurationSection('Environment Variables')
        .children('table')
        .getTableColumn('Value')
        .contents()
        .should('deep.equal', [
          'test',
          'test',
          'test',
          'test'
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

      // Get the table row and wait until it's Running
      cy
        .get('.page-body-content table')
        .getTableRowThatContains(serviceName)
        .contains('Running', {timeout: 30000})
        .should('exist');

    });

    it('Create an app with external volume', function () {
      const serviceName = 'app-with-external-volume';
      const cmdline = 'while true ; do echo \'test\' > test/echo ; sleep 100 ; done';

      // Select 'Single Container'
      cy
        .contains('Single Container')
        .click();

      // Fill-in the input elements
      cy
        .root()
        .getFormGroupInputFor('Service ID *')
        .type(`{selectall}{rightarrow}${serviceName}`);
      //
      // TODO: Due to a bug in cypress you cannot type values with dots
      // cy
      //   .get('input[name=cpus]')
      //   .type('{selectall}0.5');
      //
      cy
        .root()
        .getFormGroupInputFor('Memory (MiB) *')
        .type('{selectall}64');
      cy
        .root()
        .getFormGroupInputFor('Command')
        .type(cmdline);

      // Select mesos runtime
      selectMesosRuntime();

      // Select Volumes section
      cy
        .root()
        .get('.menu-tabbed-item')
        .contains('Volumes')
        .click();

      // Add an environment variable
      cy
        .contains('Add External Volume')
        .click();
      cy
        .root()
        .getFormGroupInputFor('Name')
        .type('test');
      cy
        .root()
        .getFormGroupInputFor('Size (MiB)')
        .type('128');
      cy
        .root()
        .getFormGroupInputFor('Container Path')
        .type('test');

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
          'cpus': 0.1,
          'mem': 64,
          'cmd': cmdline,
          'container': {
            'volumes': [
              {
                'containerPath': 'test',
                'external': {
                  'name': 'test',
                  'provider': 'dvdi',
                  'options': {
                    'dvdi/driver': 'rexray'
                  },
                  'size': 128
                },
                'mode': 'RW'
              }
            ],
            'type': 'MESOS'
          }
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
        .contains('Universal Container Runtime');
      cy
        .root()
        .configurationSection('General')
        .configurationMapValue('CPU')
        .contains('0.1');
      cy
        .root()
        .configurationSection('General')
        .configurationMapValue('Memory')
        .contains('64 MiB');
      cy
        .root()
        .configurationSection('General')
        .configurationMapValue('Disk')
        .contains('Not Configured');

      cy
        .root()
        .configurationSection('Storage')
        .children('table')
        .getTableColumn('Volume')
        .contents()
        .should('deep.equal', [
          'External (test)'
        ]);
      cy
        .root()
        .configurationSection('Storage')
        .children('table')
        .getTableColumn('Size')
        .contents()
        .should('deep.equal', [
          '128 MiB'
        ]);
      cy
        .root()
        .configurationSection('Storage')
        .children('table')
        .getTableColumn('Mode')
        .contents()
        .should('deep.equal', [
          'RW'
        ]);
      cy
        .root()
        .configurationSection('Storage')
        .children('table')
        .getTableColumn('Container Mount Path')
        .contents()
        .should('deep.equal', [
          'test'
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

      // Get the table row and wait until it's Running
      cy
        .get('.page-body-content table')
        .getTableRowThatContains(serviceName)
        .contains('Running', {timeout: 30000})
        .should('exist');

    });

    it('Create an app with HTTP health check', function () {
      const serviceName = 'app-with-http-health-check';

      // Select 'Single Container'
      cy
        .contains('Single Container')
        .click();

      // Fill-in the input elements
      cy
        .root()
        .getFormGroupInputFor('Service ID *')
        .type(`{selectall}{rightarrow}${serviceName}`);
      //
      // TODO: Due to a bug in cypress you cannot type values with dots
      // cy
      //   .get('input[name=cpus]')
      //   .type('{selectall}0.5');
      //
      cy
        .root()
        .getFormGroupInputFor('Memory (MiB) *')
        .type('{selectall}32');
      cy
        .root()
        .getFormGroupInputFor('Container Image')
        .type('nginx');

      // Select Networking section
      cy
        .root()
        .get('.menu-tabbed-item')
        .contains('Networking')
        .click();

      // Select "Bridge"
      cy
        .root()
        .getFormGroupInputFor('Network Type')
        .select('Bridge');

      // Click "Add Service Endpoint"
      cy
        .contains('Add Service Endpoint')
        .click();

      // Setup HTTP endpoint
      cy
        .root()
        .getFormGroupInputFor('Container Port')
        .type('80');
      cy
        .root()
        .getFormGroupInputFor('Service Endpoint Name')
        .type('http');

      // Switch to health checks
      cy
        .contains('Health Checks')
        .click();

      // Add a health check
      cy
        .contains('Add Health Check')
        .click();
      cy
        .root()
        .getFormGroupInputFor('Protocol')
        .select('HTTP');
      cy
        .root()
        .getFormGroupInputFor('Service Endpoint')
        .select('http');
      cy
        .root()
        .getFormGroupInputFor('Path')
        .type('/');

      // Check JSON view
      cy
        .contains('JSON Editor')
        .click();

      // Check contents of the JSON editor
      cy
        .get('#brace-editor')
        .shouldJsonMatch({
          'id': `/${Cypress.env('TEST_UUID')}/${serviceName}`,
          'cpus': 0.1,
          'mem': 32,
          'instances': 1,
          'healthChecks': [
            {
              'portIndex': 0,
              'protocol': 'MESOS_HTTP',
              'path': '/'
            }
          ],
          'container': {
            'type': 'DOCKER',
            'docker': {
              'image': 'nginx',
              'network': 'BRIDGE',
              'portMappings': [
                {
                  'name': 'http',
                  'hostPort': 0,
                  'containerPort': 80,
                  'protocol': 'tcp'
                }
              ]
            }
          }
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
        .configurationSection('Service Endpoints')
        .children('table')
        .getTableColumn('Name')
        .contents()
        .should('deep.equal', [
          'http'
        ]);
      cy
        .root()
        .configurationSection('Service Endpoints')
        .children('table')
        .getTableColumn('Protocol')
        .contents()
        .should('deep.equal', [
          'tcp'
        ]);
      cy
        .root()
        .configurationSection('Service Endpoints')
        .children('table')
        .getTableColumn('Container Port')
        .contents()
        .should('deep.equal', [
          '80'
        ]);
      cy
        .root()
        .configurationSection('Service Endpoints')
        .children('table')
        .getTableColumn('Host Port')
        .contents()
        .should('deep.equal', [
          '0'
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

      // Get the table row and look for health
      cy
        .get('.page-body-content table')
        .getTableRowThatContains(serviceName)
        .get('.bar.healthy', {timeout: 30000})
        .should('exist');

    });

    it.only('Create an app with labels', function () {
      const serviceName = 'app-with-labels';
      const cmdline = 'while true; do echo \'test\' ; sleep 100 ; done';

      // Select 'Single Container'
      cy
        .contains('Single Container')
        .click();

      // Fill-in the input elements
      cy
        .root()
        .getFormGroupInputFor('Service ID *')
        .type(`{selectall}{rightarrow}${serviceName}`);
      //
      // TODO: Due to a bug in cypress you cannot type values with dots
      // cy
      //   .get('input[name=cpus]')
      //   .type('{selectall}0.5');
      //
      cy
        .root()
        .getFormGroupInputFor('Memory (MiB) *')
        .type('{selectall}10');
      cy
        .root()
        .getFormGroupInputFor('Command')
        .type(cmdline);

      // Select mesos runtime
      selectMesosRuntime();

      // Select Networking section
      cy
        .root()
        .get('.menu-tabbed-item')
        .contains('Environment')
        .click();

      // Add an environment variable
      cy
        .contains('Add Label')
        .click();
      cy
        .get('input[name="labels.0.key"]')
        .type('camelCase');
      cy
        .get('input[name="labels.0.value"]')
        .type('test');

      // Add an environment variable
      cy
        .contains('Add Label')
        .click();
      cy
        .get('input[name="labels.1.key"]')
        .type('snake_case');
      cy
        .get('input[name="labels.1.value"]')
        .type('test');

      // Add an environment variable
      cy
        .contains('Add Label')
        .click();
      cy
        .get('input[name="labels.2.key"]')
        .type('lowercase');
      cy
        .get('input[name="labels.2.value"]')
        .type('test');

      // Add an environment variable
      cy
        .contains('Add Label')
        .click();
      cy
        .get('input[name="labels.3.key"]')
        .type('UPPERCASE');
      cy
        .get('input[name="labels.3.value"]')
        .type('test');

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
          'labels': {
            'camelCase': 'test',
            'snake_case': 'test',
            'lowercase': 'test',
            'UPPERCASE': 'test'
          }
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
        .configurationSection('Labels')
        .children('table')
        .getTableColumn('Key')
        .contents()
        .should('deep.equal', [
          'camelCase',
          'snake_case',
          'lowercase',
          'UPPERCASE'
        ]);
      cy
        .root()
        .configurationSection('Labels')
        .children('table')
        .getTableColumn('Value')
        .contents()
        .should('deep.equal', [
          'test',
          'test',
          'test',
          'test'
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

      // Get the table row and wait until it's Running
      cy
        .get('.page-body-content table')
        .getTableRowThatContains(serviceName)
        .should('exist');

    });

  });

});
