describe('UserDropup [028]', function () {

  context('Sidebar button [029]', function () {

    beforeEach(function () {
      cy
        .configureCluster({
          mesos: '1-task-healthy',
          acl: true,
          plugins: 'authentication-enabled'
        });
    });

    it('should show the user\'s username when it is not a remote user [02a]',
      function () {
      cy
        .visitUrl({url: '/dashboard', logIn: true, remoteLogIn: false})
        .get('.sidebar .user-dropdown.dropdown-toggle .user-description')
        .should('contain', 'Joe Doe');
    });

    it('should display the user\'s username when it is a remote user',
      function () {
      cy
        .visitUrl({url: '/dashboard', logIn: true, remoteLogIn: true})
        .get('.sidebar .user-dropdown.dropdown-toggle .user-description')
        .should('contain', 'joe');
    });
  });

  context('Modal [02b]', function () {

    beforeEach(function () {
      cy
        .configureCluster({
          mesos: '1-task-healthy',
          acl: true,
          plugins: 'authentication-enabled'
        })
        .visitUrl({url: '/dashboard', logIn: true, remoteLogIn: false})
        .get('.sidebar .open .user-dropdown.dropdown-toggle')
          .as('sidebarButton')
        .click()
        .get('.user-dropdown-menu.dropdown .dropdown-menu').as('modal');

      cy
        .get("@modal")
        .get('.dropdown-menu-list li').as('list');
    });

    it('should show the user [02c]', function () {
      cy
        .get("@modal")
        .get('.user-description')
        .should('contain', 'Joe Doe');
    });

    it('should list 4 menu items [02d]', function () {
      cy
        .get("@list").eq(0)
        .should('contain', 'Documentation')
        .get("@list").eq(1)
        .should('contain', 'Talk with us')
        .get("@list").eq(2)
        .should('contain', 'Install CLI')
        .get("@list").eq(3)
        .should('contain', 'Sign Out');
    });

    it('should be able to sign out [08i]', function () {
      cy
        .get("@list").eq(3)
        .click();
      cy.hash().should('eq', '#/login');
    });

  });

});
