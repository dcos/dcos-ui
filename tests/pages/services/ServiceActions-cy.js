describe('Service Actions', function () {

  context('Edit Action', function () {
    beforeEach(function () {
      cy.configureCluster({
        mesos: '1-for-each-health',
        nodeHealth: true
      });

      cy.visitUrl({url: '/services/%2Fcassandra-healthy/'});
      cy.get('.button-collection .button').contains('Edit').click();
    });

    it('opens the correct service edit modal', function () {
      cy.get('.modal .form-panel input[name="id"]')
        .should('to.have.value', '/cassandra-healthy');
    });

    it('closes modal on successful API request', function () {
      cy
        .route({
          method: 'PUT',
          url: /marathon\/v2\/apps\/\/cassandra\-healthy/,
          response: [],
          delay: 500
        });
      cy.get('.modal .button-collection .button-success')
        .contains('Change and deploy configuration')
        .click();
      cy.get('.modal').should('to.have.length', 0);
    });

    it('closes modal on secondary button click', function () {
      cy.get('.modal .button-collection .button').contains('Cancel')
        .click();
      cy.get('.modal').should('to.have.length', 0);
    });
  });

  context('Destroy Action', function () {
    beforeEach(function () {
      cy.configureCluster({
        mesos: '1-for-each-health',
        nodeHealth: true
      });

      cy.visitUrl({url: '/services/%2Fcassandra-healthy/'});
      cy.get('.button-collection .button').contains('More').click();
      cy.get('.dropdown-menu-list li').contains('Destroy').click();
    });

    it('opens the correct service destroy dialog', function () {
      cy.get('.confirm-modal p span').contains('/cassandra-healthy')
        .should('to.have.length', 1);
    });

    it('disables button during API request', function () {
      cy
        .route({
          method: 'DELETE',
          url: /marathon\/v2\/apps\/\/cassandra\-healthy/,
          response: [],
          delay: 2000
        });
      cy.get('.confirm-modal .button-collection .button-danger')
        .as('primaryButton').click();
      cy.wait(1000);
      cy.get('@primaryButton').should('have.class', 'disabled');
    });

    it('closes dialog on successful API request', function () {
      cy
        .route({
          method: 'DELETE',
          url: /marathon\/v2\/apps\/\/cassandra\-healthy/,
          response: [],
          delay: 500
        });
      cy.get('.confirm-modal .button-collection .button-danger').click();
      cy.get('.confirm-modal').should('to.have.length', 0);
    });

    it('shows error message on conflict', function () {
      cy
        .route({
          method: 'DELETE',
          status: 409,
          url: /marathon\/v2\/apps\/\/cassandra\-healthy/,
          response: {
            message: 'App is locked by one or more deployments.'
          }
        });
      cy.get('.confirm-modal .button-collection .button-danger').click();
      cy.get('.confirm-modal p.text-danger')
        .should('to.have.text', 'App is locked by one or more deployments.');
    });

    it('shows error message on not authorized', function () {
      cy
        .route({
          method: 'DELETE',
          status: 403,
          url: /marathon\/v2\/apps\/\/cassandra\-healthy/,
          response: {
            message: 'Not Authorized to perform this action!'
          }
        });
      cy.get('.confirm-modal .button-collection .button-danger').click();
      cy.get('.confirm-modal p.text-danger')
        .should('to.have.text', 'Not Authorized to perform this action!');
    });

    it('reenables button after faulty request', function () {
      cy
        .route({
          method: 'DELETE',
          status: 403,
          url: /marathon\/v2\/apps\/\/cassandra\-healthy/,
          response: {
            message: 'Not Authorized to perform this action!'
          },
          delay: 2000
        });
      cy.get('.confirm-modal .button-collection .button-danger')
        .as('dangerButton').click();
      cy.wait(500);
      cy.get('@dangerButton').should('have.class', 'disabled');
      cy.wait(3500);
      cy.get('@dangerButton').should('not.have.class', 'disabled');
    });

    it('closes dialog on secondary button click', function () {
      cy.get('.confirm-modal .button-collection .button').contains('Cancel')
        .click();
      cy.get('.confirm-modal').should('to.have.length', 0);
    });
  });

  context('Scale Action', function () {
    beforeEach(function () {
      cy.configureCluster({
        mesos: '1-for-each-health',
        nodeHealth: true
      });

      cy
        .route({
          url: /marathon\/v2\/apps\/\/cassandra\-healthy/,
          delay: 500
        });

      cy.visitUrl({url: '/services/%2Fcassandra-healthy/'});
      cy.get('.button-collection .button').contains('More').click();
      cy.get('.dropdown-menu-list li').contains('Scale').click();
    });

    it('opens the correct service scale dialog', function () {
      cy.get('.modal-content h2').contains('Scale Service')
        .should('to.have.length', 1);
    });

    it('disables button during API request', function () {
      cy
        .route({
          method: 'PUT',
          url: /marathon\/v2\/apps\/\/cassandra\-healthy/,
          response: [],
          delay: 2000
        });
      cy.get('.modal-footer .button-collection .button-primary')
        .as('primaryButton').click();
      cy.wait(1000);
      cy.get('@primaryButton').should('have.class', 'disabled');
    });

    it('closes dialog on successful API request', function () {
      cy
        .route({
          method: 'PUT',
          url: /marathon\/v2\/apps\/\/cassandra\-healthy/,
          response: [],
          delay: 500
        });
      cy.get('.modal-footer .button-collection .button-primary').click();
      cy.get('.modal-content').should('to.have.length', 0);
    });

    it('shows error message on conflict', function () {
      cy
        .route({
          method: 'PUT',
          status: 409,
          url: /marathon\/v2\/apps\/\/cassandra\-healthy/,
          response: {
            message: 'App is locked by one or more deployments.'
          }
        });
      cy.get('.modal-footer .button-collection .button-primary').click();
      cy.get('.modal-content h4.text-danger')
        .should('to.have.text', 'App is locked by one or more deployments.');
    });

    it('shows error message on not authorized', function () {
      cy
        .route({
          method: 'PUT',
          status: 403,
          url: /marathon\/v2\/apps\/\/cassandra\-healthy/,
          response: {
            message: 'Not Authorized to perform this action!'
          }
        });
      cy.get('.modal-footer .button-collection .button-primary').click();
      cy.get('.modal-content h4.text-danger')
        .should('to.have.text', 'Not Authorized to perform this action!');
    });

    it('reenables button after faulty request', function () {
      cy
        .route({
          method: 'PUT',
          url: /marathon\/v2\/apps\/\/cassandra\-healthy/,
          response: [],
          delay: 2000
        });
      cy.get('.modal-footer .button-collection .button-primary')
        .as('primaryButton').click();
      cy.wait(1000);
      cy.get('@primaryButton').should('have.class', 'disabled');
      cy.wait(3500);
      cy.get('@primaryButton').should('not.have.class', 'disabled');
    });

    it('closes dialog on secondary button click', function () {
      cy.get('.modal-footer .button-collection .button').contains('Cancel')
        .click();
      cy.get('.modal-content').should('to.have.length', 0);
    });
  });

  context('Suspend Action', function () {
    beforeEach(function () {
      cy.configureCluster({
        mesos: '1-for-each-health',
        nodeHealth: true
      });

      cy
        .route({
          url: /marathon\/v2\/apps\/\/cassandra\-healthy/,
          delay: 500
        });

      cy.visitUrl({url: '/services/%2Fcassandra-healthy/'});
      cy.get('.button-collection .button').contains('More').click();
      cy.get('.dropdown-menu-list li').contains('Suspend').click();
    });

    it('opens the correct service suspend dialog', function () {
      cy.get('.confirm-modal p span').contains('/cassandra-healthy')
        .should('to.have.length', 1);
    });

    it('disables button during API request', function () {
      cy
        .route({
          method: 'PUT',
          url: /marathon\/v2\/apps\/\/cassandra\-healthy/,
          response: [],
          delay: 2000
        });
      cy.get('.confirm-modal .button-collection .button-primary')
        .as('primaryButton').click();
      cy.wait(1000);
      cy.get('@primaryButton').should('have.class', 'disabled');
    });

    it('closes dialog on successful API request', function () {
      cy
        .route({
          method: 'PUT',
          url: /marathon\/v2\/apps\/\/cassandra\-healthy/,
          response: [],
          delay: 500
        });
      cy.get('.confirm-modal .button-collection .button-primary').click();
      cy.get('.confirm-modal').should('to.have.length', 0);
    });

    it('shows error message on conflict', function () {
      cy
        .route({
          method: 'PUT',
          status: 409,
          url: /marathon\/v2\/apps\/\/cassandra\-healthy/,
          response: {
            message: 'App is locked by one or more deployments.'
          }
        });
      cy.get('.confirm-modal .button-collection .button-primary').click();
      cy.get('.confirm-modal p.text-danger')
        .should('to.have.text', 'App is locked by one or more deployments.');
    });

    it('shows error message on not authorized', function () {
      cy
        .route({
          method: 'PUT',
          status: 403,
          url: /marathon\/v2\/apps\/\/cassandra\-healthy/,
          response: {
            message: 'Not Authorized to perform this action!'
          }
        });
      cy.get('.confirm-modal .button-collection .button-primary').click();
      cy.get('.confirm-modal p.text-danger')
        .should('to.have.text', 'Not Authorized to perform this action!');
    });

    it('reenables button after faulty request', function () {
      cy
        .route({
          method: 'PUT',
          url: /marathon\/v2\/apps\/\/cassandra\-healthy/,
          response: [],
          delay: 2000
        });
      cy.get('.confirm-modal .button-collection .button-primary')
        .as('primaryButton').click();
      cy.wait(1000);
      cy.get('@primaryButton').should('have.class', 'disabled');
      cy.wait(3500);
      cy.get('@primaryButton').should('not.have.class', 'disabled');
    });

    it('closes dialog on secondary button click', function () {
      cy.get('.confirm-modal .button-collection .button').contains('Cancel')
        .click();
      cy.get('.confirm-modal').should('to.have.length', 0);
    });
  });

});
