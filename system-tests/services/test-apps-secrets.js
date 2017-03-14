require('../_support/utils/ServicesUtil');

describe('Services', function () {

  const SECRET_NAME = `${Cypress.env('TEST_UUID')}-secret`;

  /**
   * Test the secrets creation
   */
  describe('Secrets', function () {

    beforeEach(function () {
      cy
        .visitUrl({url :'security/secrets'});
    });

    it('Creates a secret', function () {

      // Select '+'
      cy
        .get('.button.button-link.button-narrow')
        .click();

      // Wait for the 'Create New Secret' dialog to appear
      cy
        .get('.modal-header')
        .contains('Create New Secret')
        .should('exist');

      // Fill-in the secret details
      cy
        .root()
        .getFormGroupInputFor('ID')
        .type(SECRET_NAME);
      cy
        .root()
        .getFormGroupInputFor('Value')
        .type('something super secret here');

      // Create it
      cy
        .get('button.button-success')
        .contains('Create')
        .click();

      // Wait for it to appear in the list
      cy
        .get('.page-body-content table')
        .contains(SECRET_NAME)
        .should('exist');

    });

  });

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

    it('Create an app with secrets', function () {
      const serviceName = 'app-with-secret';
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

      // Select Environment section
      cy
        .root()
        .get('.menu-tabbed-item')
        .contains('Environment')
        .click();

      // Wait for a sec to populate the secrets
      cy
        .wait(500);

      // Add an a secret
      cy
        .contains('Add Secret')
        .click();
      cy
        .get('select[name="secrets.0.value"]')
        .select(SECRET_NAME);
      cy
        .get('input[name="secrets.0.envVar"]')
        .type('TEST_SECRET');

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
          'secrets': {
            'secret0': {
              'source': SECRET_NAME
            }
          },
          'env': {
            'TEST_SECRET': {
              'secret': 'secret0'
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
        .configurationSection('Secrets')
        .children('table')
        .getTableColumn('Secret')
        .contents()
        .should('deep.equal', [
          SECRET_NAME
        ]);
      cy
        .root()
        .configurationSection('Secrets')
        .children('table')
        .getTableColumn('Variable')
        .contents()
        .should('deep.equal', [
          'TEST_SECRET'
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

      // Wait for the table and the service to appear
      cy
        .get('.page-body-content table')
        .getTableRowThatContains(serviceName)
        .should('exist');

    });

  });

});
