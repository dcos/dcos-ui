
describe('User Details Sidepanel [02k]', function () {

  context('User [08f]', function () {
    beforeEach(function () {
      cy.configureCluster({
        mesos: '1-task-healthy',
        acl: true,
        plugins: 'organization-enabled'
      })
      .visitUrl({url: '/system/organization/users/quis', identify: true});
    });

    it('displays the correct user [05w]', function () {
      cy
        .get('.side-panel .side-panel-content-header-label .form-element-inline-text')
        .should(function ($header) {
          expect($header[0].textContent).to.equal('藍-Schüler Zimmer verfügt über einen Schreibtisch, Telefon, Safe in Notebook-Größe');
        });
    });

    it('has LDAP in subheader when user is external [056]', function() {
      cy
        .get('.side-panel .side-panel-content-header-label div')
        .should(function ($subheader) {
          expect($subheader[3].textContent).to.contain('External');
        });
    });

    it('sets the first tab as active [05y]', function () {
      cy
        .get('.side-panel .tabs .active')
        .should('contain', 'Permissions');
    });

    context('Group Membership [05z]', function () {

      beforeEach(function () {
        cy
          .get('.side-panel .tabs .tab-item-label')
          .contains('Group Membership')
          .click();
      });

      it('displays the groups that the member belongs to [05x]', function () {
        cy
          .get('.side-panel .table tbody')
          .should(function ($tbody) {
            expect($tbody.children().length).to.equal(4);
          });
      });

      it('displays the confirmation modal when clicking remove [060]', function () {
        cy
          .get('.side-panel .table tbody tr:eq(1) button')
          .click();

        cy
          .get('.confirm-modal')
          .should(function ($modal) {
            expect($modal.length).to.equal(1);
          });
      });

    });

    context('Delete User [042]', function () {
      beforeEach(function () {
        cy.get('.side-panel-header-actions-secondary').as('headerUserDelete');
      });

      it('shows delete modal when header delete button clicked [043]', function () {
        cy.get('@headerUserDelete')
          .find('.side-panel-header-action')
          .click();
        cy.get('.confirm-modal').should('to.have.length', 1);
      });

      it('returns to users page after user deleted [045]', function () {
        cy.route({
          method: 'DELETE',
          url: /users\/quis/,
          status: 200,
          response: {}
        });
        cy.get('@headerUserDelete')
          .find('.side-panel-header-action')
          .click();
        cy.get('.modal .button-danger').click();
        cy.url().should('contain', '/system/organization/users');
      });

      it('shows error when request to delete user fails [044]', function () {
        cy.route({
          method: 'DELETE',
          url: /users\/quis/,
          status: 400,
          response: {description: 'There was an error.'}
        });
        cy.get('@headerUserDelete')
          .find('.side-panel-header-action')
          .click();
        cy.get('.modal .button-danger').click();
        cy.get('.text-error-state').should('contain', 'There was an error.');
      });

    });

    context('User Details [063]', function () {

      beforeEach(function () {
        cy
          .get('.side-panel .tabs .tab-item-label')
          .contains('Details')
          .click();
        cy
          .get('.side-panel .side-panel-content-user-details .row').as('rows');
      });

      it('displays the username in the first row [064]', function () {
        cy.get('@rows')
          .should(function ($rows) {
            var firstRow = $rows[0];
            expect(firstRow.children[1].textContent).to.equal('quis');
          });
      });

      it('displays the password form in the second row [065]', function () {
        cy.get('@rows')
          .should(function ($rows) {
            var secondRow = $rows[1];
            expect(secondRow.children[1].children[0].nodeName).to.equal('FORM');
          });
      });

      it('switches the password label into a password input element [066]',
        function () {
        cy.get('.side-panel-content-user-details form .form-element-inline-text')
          .click();

        cy.get('form input')
          .should(function ($input) {
            expect($input.length).to.equal(1);
            expect($input[0].type).to.equal('password');
          });
      });

    });

    context('Permissions tab [02v]', function () {

      beforeEach(function () {
        cy.get('.side-panel').as('sidePanel');
      });

      it('displays \'Add Service\' in the dropdown box [02x]', function () {
        cy
          .get('@sidePanel')
          .get('.dropdown .dropdown-toggle')
          .should('contain', 'Add Service');
      });

      it('adds \'hidden\' class to \'Add Service\' item in the dropdown list', function () {
        cy
          .get('@sidePanel')
          .get('.dropdown .dropdown-toggle')
          .click();

        cy
          .get('@sidePanel')
          .get('.dropdown .dropdown-menu-list')
          .contains('Add Service')
          .should('have.class', 'hidden');
      });

      it('displays \'No services to add.\' when they are in permissions', function () {
        cy
          .get('@sidePanel')
          .get('.dropdown .dropdown-toggle')
          .click();

        cy
          .get('@sidePanel')
          .get('.dropdown .dropdown-menu-list')
          .should('contain', 'No services to add.');
      });

      it('shouldn\'t contain services that are already in permissions [02z]', function () {
        cy
          .get('@sidePanel')
          .get('.dropdown .dropdown-toggle')
          .click();

        cy
          .get('@sidePanel')
          .get('.dropdown-menu-list')
          .should(function (list) {
            var children = list.children();
            var result = false;
            for (var i = 0; i < children.length; i++) {
              if (children[i].textContent === 'marathon') {
                result = true;
              }
            }

            expect(result).to.equal(false);
          });
      });

      it('should have a table with a row containing a service [01c]', function () {
        cy
          .get('@sidePanel')
          .get('table td')
          .should('contain', 'Marathon');
      });

      it('displays the confirmation modal when clicking remove [060]', function () {
        cy
          .get('.side-panel .table tbody tr:eq(1) button')
          .click();

        cy
          .get('.confirm-modal')
          .should(function ($modal) {
            expect($modal.length).to.equal(1);
          });
      });

    });

  });

  context('Advanced ACLs Tab [0k4]', function () {

    context('no permissions set [0l1]', function () {

      beforeEach(function () {
        cy.configureCluster({
          mesos: '1-task-healthy',
          acl: true,
          userNoPermissions: true,
          plugins: 'organization-enabled'
        })
        .visitUrl({url: '/system/organization/users/quis', identify: true});

        cy.get('.side-panel .tabs .tab-item-label')
          .contains('Advanced ACLs')
          .click();
        cy.get('.side-panel table tbody tr').as('rows');
      });

      it('should have an empty table [08g]', function () {
        cy.get('@rows').should('have.length', 1);
        cy.get('@rows').eq(0).find('td').contains('No data');
      });

    });

    context('permissions set [0l7]', function () {

      beforeEach(function () {
        cy.configureCluster({
          mesos: '1-task-healthy',
          acl: true,
          plugins: 'organization-enabled'
        })
        .visitUrl({url: '/system/organization/users/quis', identify: true});

        cy.get('.side-panel .tabs .tab-item-label')
          .contains('Advanced ACLs')
          .click();
        cy.get('.side-panel table tbody tr').as('rows');
      });

      it('display resource names [0l8]', function () {
        cy.get('@rows').should('have.length', 4);
        cy.get('@rows').eq(1).find('td').contains('dcos:adminrouter:service:marathon');
      });

    });

    context('many permissions set [0ld]', function () {

      beforeEach(function () {
        cy.configureCluster({
          mesos: '1-task-healthy',
          acl: true,
          userManyPermissions: true,
          plugins: 'organization-enabled'
        })
        .visitUrl({url: '/system/organization/users/quis', identify: true});

        cy.get('.side-panel .tabs .tab-item-label')
          .contains('Advanced ACLs')
          .click();
        cy.get('.side-panel table tbody tr').as('rows');
      });

      it('display all permissions for resource [0le]', function () {
        cy.get('@rows').should('have.length', 4);
        cy.get('@rows').eq(1).find('td').eq(1)
          .contains('Read, Write, Update, Delete');
      });

    });

    context('delete permission [0lv]', function () {

      beforeEach(function () {
        cy.configureCluster({
          mesos: '1-task-healthy',
          acl: true,
          userManyPermissions: true,
          plugins: 'organization-enabled'
        })
        .visitUrl({url: '/system/organization/users/quis', identify: true});

        cy.get('.side-panel .tabs .tab-item-label')
          .contains('Advanced ACLs')
          .click();
        cy.get('.side-panel table tbody tr').as('rows');
      });

      it('delete all permissions [0lw]', function () {
        cy.configureCluster({
          acl: true,
          userPermissionDeleteAllow: true,
          userSinglePermission: true
        });

        cy.get('@rows').should('have.length', 4);
        cy.get('@rows').eq(1).contains('Remove').click();
        cy.get('@rows').should('have.length', 3);
      });

    });

    context('add permission [0lv]', function () {

      beforeEach(function () {
        cy.configureCluster({
          mesos: '1-task-healthy',
          acl: true,
          aclCreate: true,
          plugins: 'organization-enabled'
        })
        .visitUrl({url: '/system/organization/users/quis', identify: true});

        cy.get('.side-panel .tabs .tab-item-label')
          .contains('Advanced ACLs')
          .click();
        cy.get('.side-panel table tbody tr').as('rows');
      });

      it('adds permission [0lw]', function () {
        cy.configureCluster({
          acl: true,
          userSinglePermission: true
        });

        cy.get('.side-panel form')
          .find('input[name=resource]')
          .type('dcos:adminrouter:service:marathon');
        cy.get('.side-panel form')
          .find('input[name=action]').type('full');
        cy.get('.side-panel button').contains('Add Rule').click();
        cy.get('@rows').should('have.length', 3);
        cy.get('@rows').eq(1)
          .contains('dcos:adminrouter:service:marathon');
        cy.get('@rows').eq(1).contains('full');
      });

    });

  });

  context('ACL [08d]', function () {

    beforeEach(function () {
      cy.configureCluster({
        mesos: '1-task-healthy',
        acl: true,
        aclCreate: true,
        plugins: 'organization-enabled'
      })
      .visitUrl({url: '/system/organization/users/quis', identify: true});
    });

    it('should have an empty table [08g]', function () {
      cy
        .get('.side-panel table tr')
        .should(function ($tr) {
          expect($tr).to.have.length(2);
        });
    });

    it('creates ACL & adds permission for service [08e]', function () {
      cy
        .wait(2000)
        .get('.side-panel .dropdown .dropdown-toggle')
        .click()
        .wait(250);

      cy.configureCluster({acl: true});

      cy
        .get('.dropdown .dropdown-menu-list li')
        .contains('marathon')
        .click();

      cy
        .get('.side-panel table tr')
        .should('contain', 'Marathon');

    });
  });

});
