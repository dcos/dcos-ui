describe('Group Details Sidepanel [02k]', function () {

  context('Group [0mr]', function () {
    beforeEach(function () {
      cy.configureCluster({
        mesos: '1-task-healthy',
        acl: true,
        plugins: 'organization-enabled'
      })
      .visitUrl({url: '/system/organization/groups/olis', identify: true});
    });

    it('displays the correct group [040]', function () {
      cy
        .get('.side-panel .side-panel-content-header-label .form-element-inline-text')
        .should(function ($header) {
          expect($header[0].textContent).to.equal('藍-遙 遥 悠 遼 Größe');
        });
    });

    it('sets the first tab as active [041]', function () {
      cy
        .get('.side-panel .tabs .active')
        .should('contain', 'Permissions');
    });

    context('User Membership [05z]', function () {

      beforeEach(function () {
        cy
          .get('.side-panel .tabs .tab-item-label')
          .contains('Members')
          .click();
      });

      it('displays the users belong to the group [061]', function () {
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

  });

  context('Advanced ACLs Tab [0ms]', function () {

    context('no permissions set [0mt]', function () {

      beforeEach(function () {
        cy.configureCluster({
          mesos: '1-task-healthy',
          acl: true,
          groupNoPermissions: true,
          plugins: 'organization-enabled'
        })
      .visitUrl({url: '/system/organization/groups/olis', identify: true});

        cy.get('.side-panel .tabs .tab-item-label')
          .contains('Advanced ACLs')
          .click();
        cy.get('.side-panel table tbody tr').as('rows');
      });

      it('should have an empty table [0mu]', function () {
        cy.get('@rows').should('have.length', 1);
        cy.get('@rows').eq(0).find('td').contains('No data');
      });

    });

    context('permissions set [0mv]', function () {

      beforeEach(function () {
        cy.configureCluster({
          mesos: '1-task-healthy',
          acl: true,
          plugins: 'organization-enabled'
        })
      .visitUrl({url: '/system/organization/groups/olis', identify: true});

        cy.get('.side-panel .tabs .tab-item-label')
          .contains('Advanced ACLs')
          .click();
        cy.get('.side-panel table tbody tr').as('rows');
      });

      it('display resource names [0mw]', function () {
        cy.get('@rows').should('have.length', 3);
        cy.get('@rows').eq(1).find('td').contains('dcos:adminrouter:service:marathon');
      });

    });

    context('many permissions set [0mx]', function () {

      beforeEach(function () {
        cy.configureCluster({
          mesos: '1-task-healthy',
          acl: true,
          groupManyPermissions: true,
          plugins: 'organization-enabled'
        })
      .visitUrl({url: '/system/organization/groups/olis', identify: true});

        cy.get('.side-panel .tabs .tab-item-label')
          .contains('Advanced ACLs')
          .click();
        cy.get('.side-panel table tbody tr').as('rows');
      });

      it('display all permissions for resource [0my]', function () {
        cy.get('@rows').should('have.length', 4);
        cy.get('@rows').contains('Read, Write, Update, Delete');
      });

    });

    context('delete permission [0mz]', function () {

      beforeEach(function () {
        cy.configureCluster({
          mesos: '1-task-healthy',
          acl: true,
          groupManyPermissions: true,
          plugins: 'organization-enabled'
        })
      .visitUrl({url: '/system/organization/groups/olis', identify: true});

        cy.get('.side-panel .tabs .tab-item-label')
          .contains('Advanced ACLs')
          .click();
        cy.get('.side-panel table tbody tr').as('rows');
      });

      it('delete all permissions [0n0]', function () {
        cy.configureCluster({
          acl: true,
          groupPermissionDeleteAllow: true,
          groupSinglePermission: true
        });

        cy.get('@rows').should('have.length', 4);
        cy.get('@rows').eq(1).contains('Remove').click();
        cy.get('@rows').should('have.length', 3);
      });

    });

    context('add permission [0n1]', function () {

      beforeEach(function () {
        cy.configureCluster({
          mesos: '1-task-healthy',
          acl: true,
          aclCreate: true,
          groupNoPermissions: true,
          plugins: 'organization-enabled'
        })
      .visitUrl({url: '/system/organization/groups/olis', identify: true});

        cy.get('.side-panel .tabs .tab-item-label')
          .contains('Advanced ACLs')
          .click();
        cy.get('.side-panel table tbody tr').as('rows');
      });

      it('adds permission [0n2]', function () {
        cy.configureCluster({
          acl: true,
          groupSinglePermission: true
        });

        cy.get('.side-panel form')
          .find('input[name=resource]').type('dcos:adminrouter:service:marathon');
        cy.get('.side-panel form')
          .find('input[name=action]').type('full');
        cy.get('.side-panel button').contains('Add Rule').click();
        cy.get('@rows').should('have.length', 3);
        cy.get('@rows').eq(1).contains('dcos:adminrouter:service:marathon');
        cy.get('@rows').eq(1).contains('full');
      });

    });

  });

});
