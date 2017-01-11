describe('Service Actions', function () {

  function clickHeaderAction(actionText) {
    cy.get('.page-header-actions .dropdown').click();
    cy.get('.dropdown-menu-items').contains(actionText).click();
  }

  beforeEach(function () {
    cy.configureCluster({
      mesos: '1-for-each-health',
      nodeHealth: true
    });

    cy.visitUrl({url: '/services/overview/%2Fcassandra-healthy'});
  });

  context('Edit Action', function () {
    beforeEach(function () {
      clickHeaderAction('Edit');
    });

    it('opens the correct service edit modal', function () {
      cy.get('.modal .menu-tabbed-view input[name="id"]')
        .should('to.have.value', '/cassandra-healthy');
    });

    it('closes modal on successful API request', function () {
      cy
        .route({
          method: 'PUT',
          url: /marathon\/v2\/apps\/\/cassandra\-healthy/,
          response: [],
          delay: 0
        });
      cy.get('.modal .modal-header .button')
        .contains('Review & Run')
        .click();
      cy.get('.modal .modal-header .button')
        .contains('Run Service')
        .click();
      cy.get('.modal').should('to.have.length', 0);
    });

    it('closes modal on secondary button click', function () {
      cy.get('.modal .modal-header .button')
        .contains('Cancel')
        .click();
      cy.get('.modal').should('to.have.length', 0);
    });
  });

  context('Destroy Action', function () {

    context('Application', function () {

      beforeEach(function () {
        cy.configureCluster({
          mesos: '1-task-healthy',
          nodeHealth: true
        });

        cy.visitUrl({url: '/services/overview/%2Fsleep'});
        clickHeaderAction('Destroy');
      });

      it('opens the correct service destroy dialog', function () {
        cy.get('.confirm-modal p span').contains('/sleep')
          .should('to.have.length', 1);
      });

      it('disables button during API request', function () {
        cy
          .route({
            method: 'DELETE',
            url: /marathon\/v2\/apps\/\/sleep/,
            response: [],
            delay: 0
          });
        cy.get('.confirm-modal .button-collection .button-danger')
          .as('primaryButton').click();
        cy.get('@primaryButton').should('have.class', 'disabled');
      });

      it('closes dialog on successful API request', function () {
        cy
          .route({
            method: 'DELETE',
            url: /marathon\/v2\/apps\/\/sleep/,
            response: [],
            delay: 0
          });
        cy.get('.confirm-modal .button-collection .button-danger').click();
        cy.get('.confirm-modal').should('to.have.length', 0);
      });

      it('shows error message on conflict', function () {
        cy
          .route({
            method: 'DELETE',
            status: 409,
            url: /marathon\/v2\/apps\/\/sleep/,
            response: {message: 'App is locked by one or more deployments.'}
          });
        cy.get('.confirm-modal .button-collection .button-danger').click();
        cy.get('.modal-body .text-danger')
          .should('to.have.text', 'App is locked by one or more deployments.');
      });

      it('shows error message on not authorized', function () {
        cy
          .route({
            method: 'DELETE',
            status: 403,
            url: /marathon\/v2\/apps\/\/sleep/,
            response: {message: 'Not Authorized to perform this action!'}
          });
        cy.get('.confirm-modal .button-collection .button-danger').click();
        cy.get('.modal-body .text-danger')
          .should('to.have.text', 'Not Authorized to perform this action!');
      });

      it('reenables button after faulty request', function () {
        cy
          .route({
            method: 'DELETE',
            status: 403,
            url: /marathon\/v2\/apps\/\/sleep/,
            response: {
              message: {message: 'Not Authorized to perform this action!'}
            },
            delay: 100
          });
        cy.get('.confirm-modal .button-collection .button-danger')
          .as('dangerButton').click();
        cy.get('@dangerButton').should('have.class', 'disabled');
        cy
          .wait(100)
          .get('@dangerButton').should('not.have.class', 'disabled');
      });

      it('closes dialog on secondary button click', function () {
        cy.get('.confirm-modal .button-collection .button').contains('Cancel')
          .click();
        cy.get('.confirm-modal').should('to.have.length', 0);
      });

    });

  });

  context('Scale Action', function () {

    beforeEach(function () {
      clickHeaderAction('Scale');
    });

    it('opens the correct service scale dialog', function () {
      cy.get('.modal-header').contains('Scale Service')
        .should('to.have.length', 1);
    });

    it('disables button during API request', function () {
      cy
        .route({
          method: 'PUT',
          url: /marathon\/v2\/apps\/\/cassandra\-healthy/,
          response: [],
          delay: 0
        });
      cy.get('.modal-footer .button-collection .button-primary')
        .as('primaryButton').click();
      cy.get('@primaryButton').should('have.class', 'disabled');
    });

    it('closes dialog on successful API request', function () {
      cy
        .route({
          method: 'PUT',
          url: /marathon\/v2\/apps\/\/cassandra\-healthy/,
          response: [],
          delay: 0
        });
      cy.get('.modal-footer .button-collection .button-primary').click();
      cy.get('.modal-body').should('to.have.length', 0);
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
      cy.get('.modal-body .text-danger')
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
      cy.get('.modal-body .text-danger')
        .should('to.have.text', 'Not Authorized to perform this action!');
    });

    it('reenables button after faulty request', function () {
      cy
        .route({
          method: 'PUT',
          url: /marathon\/v2\/apps\/\/cassandra\-healthy/,
          response: [],
          delay: 50
        });
      cy.get('.modal-footer .button-collection .button-primary')
        .as('primaryButton').click();
      cy.get('@primaryButton').should('have.class', 'disabled');
      cy.wait(100).get('@primaryButton').should('not.have.class', 'disabled');
    });

    it('closes dialog on secondary button click', function () {
      cy.get('.modal-footer .button-collection .button').contains('Cancel')
        .click();
      cy.get('.modal-body').should('to.have.length', 0);
    });
  });

  context('Suspend Action', function () {
    beforeEach(function () {
      clickHeaderAction('Suspend');
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
          delay: 0
        });
      cy.get('.confirm-modal .button-collection .button-primary')
        .as('primaryButton').click();
      cy.get('@primaryButton').should('have.class', 'disabled');
    });

    it('closes dialog on successful API request', function () {
      cy
        .route({
          method: 'PUT',
          url: /marathon\/v2\/apps\/\/cassandra\-healthy/,
          response: [],
          delay: 0
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
      cy.get('.confirm-modal .text-danger')
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
      cy.get('.confirm-modal .text-danger')
        .should('to.have.text', 'Not Authorized to perform this action!');
    });

    it('reenables button after faulty request', function () {
      cy
        .route({
          method: 'PUT',
          url: /marathon\/v2\/apps\/\/cassandra\-healthy/,
          response: [],
          delay: 50
        });
      cy.get('.confirm-modal .button-collection .button-primary')
        .as('primaryButton').click();
      cy.get('@primaryButton').should('have.class', 'disabled');
      cy.wait(100).get('@primaryButton').should('not.have.class', 'disabled');
    });

    it('closes dialog on secondary button click', function () {
      cy.get('.confirm-modal .button-collection .button').contains('Cancel')
        .click();
      cy.get('.confirm-modal').should('to.have.length', 0);
    });
  });

});
