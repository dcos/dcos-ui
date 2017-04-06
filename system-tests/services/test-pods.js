require('../_support/utils/ServicesUtil');
const {Timeouts} = require('../_support/constants');

describe('Services', function () {

  /**
   * Test the pods
   */
  describe('Pods', function () {

    beforeEach(function () {
      cy
        .visitUrl(`services/overview/%2F${Cypress.env('TEST_UUID')}/create`);
    });

    it('Create a pod with multiple containers', function () {
      const serviceName = 'pod-with-multiple-containers';
      const cmdline = 'while true; do echo \'test\' ; sleep 100 ; done';

      // Select 'Multi-container (Pod)'
      cy
        .contains('Multi-container')
        .click();

      // Fill-in the input elements
      cy
        .root()
        .getFormGroupInputFor('Service ID *')
        .type(`{selectall}{rightarrow}${serviceName}`);

      // Select first container
      cy
        .root()
        .get('.menu-tabbed-item')
        .contains('container-1')
        .click();

      // Configure container
      cy
        .root()
        .getFormGroupInputFor('Container Name')
        .type('{selectall}first-container');
      cy
        .root()
        .getFormGroupInputFor('Container Image')
        .type('nginx');
      //
      // TODO: Due to a bug in cypress you cannot type values with dots
      // cy
      //   .root()
      //   .getFormGroupInputFor('CPUs')
      //   .type('{selectall}0.1');
      //
      cy
        .root()
        .getFormGroupInputFor('Memory (MiB) *')
        .type('{backspace}{backspace}{backspace}{backspace}10');
      cy
        .root()
        .getFormGroupInputFor('Command')
        .type(cmdline);

      // Go back to Service
      cy
        .root()
        .get('.menu-tabbed-item')
        .contains('Service')
        .click();

      // Add a container
      cy
        .contains('Add Container')
        .click();

      // Ensure the name changes to 'Services'
      cy
        .root()
        .get('.menu-tabbed-item')
        .contains('Services')
        .should('exist');

      // Select second container
      cy
        .root()
        .get('.menu-tabbed-item')
        .contains('container-2')
        .click();

      // Configure container
      cy
        .root()
        .getFormGroupInputFor('Container Name')
        .type('{selectall}second-container');
      cy
        .root()
        .getFormGroupInputFor('Container Image')
        .type('nginx');
      //
      // TODO: Due to a bug in cypress you cannot type values with dots
      // cy
      //   .root()
      //   .getFormGroupInputFor('CPUs')
      //   .type('{selectall}0.1');
      //
      cy
        .root()
        .getFormGroupInputFor('Memory (MiB) *')
        .type('{backspace}{backspace}{backspace}{backspace}10');
      cy
        .root()
        .getFormGroupInputFor('Command')
        .type(cmdline);

      // Check JSON view
      cy
        .contains('JSON Editor')
        .click();

      // Check contents of the JSON editor
      cy
        .get('#brace-editor')
        .contents()
        .asJson()
        .should('deep.equal', [{
          'id': `/${Cypress.env('TEST_UUID')}/${serviceName}`,
          'containers': [
            {
              'name': 'first-container',
              'resources': {
                'cpus': 0.1,
                'mem': 10
              },
              'image': {
                'id': 'nginx',
                'kind': 'DOCKER'
              },
              'exec': {
                'command': {
                  'shell': cmdline
                }
              }
            },
            {
              'name': 'second-container',
              'resources': {
                'cpus': 0.1,
                'mem': 10
              },
              'exec': {
                'command': {
                  'shell': cmdline
                }
              },
              'image': {
                'id': 'nginx',
                'kind': 'DOCKER'
              }
            }
          ],
          'scaling': {
            'kind': 'fixed',
            'instances': 1
          },
          'networks': [
            {
              'mode': 'host'
            }
          ]
        }]);

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
      //
      // TODO: Uncomment this when this gets merged
      //
      // cy
      //   .root()
      //   .configurationSection('General')
      //   .configurationMapValue('CPU')
      //   .contains('0.2 (0.1 first-container, 0.1 second-container)');
      // cy
      //   .root()
      //   .configurationSection('General')
      //   .configurationMapValue('Memory')
      //   .contains('20 MiB (10 MiB first-container, 10 MiB second-container)');
      //

      cy
        .root()
        .configurationSection('first-container')
        .configurationMapValue('Container Image')
        .contains('nginx');
      cy
        .root()
        .configurationSection('first-container')
        .configurationMapValue('CPUs')
        .contains('0.1');
      cy
        .root()
        .configurationSection('first-container')
        .configurationMapValue('Memory')
        .contains('10 MiB');
      cy
        .root()
        .configurationSection('first-container')
        .configurationMapValue('Command')
        .contains(cmdline);

      cy
        .root()
        .configurationSection('second-container')
        .configurationMapValue('Container Image')
        .contains('nginx');
      cy
        .root()
        .configurationSection('second-container')
        .configurationMapValue('CPUs')
        .contains('0.1');
      cy
        .root()
        .configurationSection('second-container')
        .configurationMapValue('Memory')
        .contains('10 MiB');
      cy
        .root()
        .configurationSection('second-container')
        .configurationMapValue('Command')
        .contains(cmdline);

      // Run service
      cy
        .get('button.button-primary')
        .contains('Run Service')
        .click();

      // Wait for the table and the service to appear
      cy
        .get('.page-body-content table')
        .contains(serviceName, {timeout: Timeouts.SERVICE_DEPLOYMENT_TIMEOUT})
        .should('exist');

    });

  });

});
