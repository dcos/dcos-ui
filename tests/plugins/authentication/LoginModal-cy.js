describe('LoginModal [01i]', function () {

  context('logging in [01k]', function () {

    beforeEach(function () {
      cy.configureCluster({
        mesos: '1-task-healthy',
        acl: true,
        plugins: 'authentication-enabled'
      })
      .route({
        method: 'POST',
        status: 201,
        url: /api\/v1\/auth\/login/,
        delay: 100,
        response: {uid: 'joe', description: 'Joe Doe'}
      })
      .route({
        method: 'GET',
        status: 200,
        url: /api\/v1\/users\/joe/,
        delay: 100,
        response: {uid: 'joe', description: 'Joe Doe'}
      })
      .visitUrl({url: '/', logIn: false});

      cy.get('.modal-container input[type=\'text\']').type('kennyt');
      cy.get('.modal-container input[type=\'password\']').type('1234');
    });

    it('should open the modal [01j]', function () {
      cy.get('.modal-container').should(function (modal) {
        expect(modal.length).to.equal(1);
      });
    });

    it('disables the buttons while request is pending on submit [01l]', function () {
      cy
        .get('.modal-footer .button')
        .click()
        .get('.modal-footer .button.disabled').should(function (button) {
          expect(button.length).to.equal(1);
        });
    });

    it('shows error when credentials are invalid [0ng]', function () {
      cy.route({
        method: 'POST',
        status: 401,
        url: /api\/v1\/auth\/login/,
        delay: 100,
        response: {description: 'foo'}
      });

      cy.get('.modal-footer .button').click();
      cy.get('.modal-body .container')
        .contains('Username and password do not match.');
    });

    it('removes error while form is submitting [0ni]', function () {
      cy.route({
        method: 'POST',
        status: 401,
        url: /api\/v1\/auth\/login/,
        delay: 200,
        response: {description: 'foo'}
      });

      cy.get('.modal-footer .button').click();
      cy.get('.modal-body .container')
        .contains('Username and password do not match.');
      cy.get('.modal-footer .button').click();
      cy.get('.modal-body .container')
        .should('not.contain', 'Username and password do not match.');
    });

    it('shows error on subsequent invalid logins [0nh]', function () {
      cy.route({
        method: 'POST',
        status: 401,
        url: /api\/v1\/auth\/login/,
        delay: 200,
        response: {description: 'foo'}
      });

      cy.get('.modal-footer .button').click();
      cy.get('.modal-body .container')
        .contains('Username and password do not match.');
      cy.get('.modal-footer .button').click();
      cy.get('.modal-body .container')
        .contains('Username and password do not match.');
    });

    it('routes to dashboard after login with admin [01m]', function () {
      cy
        .get('.modal-footer .button')
        .click()
        .wait(150);

      cy.hash().should('eq', '#/dashboard/');
    });

    it('redirects after successful login [02j]', function () {
      cy.visit("http://localhost:4200/?redirect=%2Ffoo%2Fbar#/login");
      cy.get('.modal-container input[type=\'text\']').type('kennyt');
      cy.get('.modal-container input[type=\'password\']').type('1234');

      cy.get('.modal-footer .button').click();

      cy.wait(500).location()
      .its('href').should('eq', 'http://localhost:4200/foo/bar');
    });

    it('redirects after successful login [0d9]', function () {
      cy.visit("http://localhost:4200/#/login?redirect=%2Fmesos");
      cy.get('.modal-container input[type=\'text\']').type('kennyt');
      cy.get('.modal-container input[type=\'password\']').type('1234');

      cy.get('.modal-footer .button').click();

      cy.wait(500).location()
      .its('href').should('eq', 'http://localhost:4200/mesos');
    });

    it('redirects after successful login [0da]', function () {
      cy.visit("http://localhost:4200/?redirect=%2Fmesos#/login");
      cy.get('.modal-container input[type=\'text\']').type('kennyt');
      cy.get('.modal-container input[type=\'password\']').type('1234');

      cy.get('.modal-footer .button').click();

      cy.wait(500).location()
      .its('href').should('eq', 'http://localhost:4200/mesos');
    });

    it('routes to access-denied after login with non admin login [0d1]', function () {
      cy
        .route({
          method: 'GET',
          status: 400,
          url: /api\/v1\/users\/joe/,
          delay: 100,
          response: {description: 'Some error'}
        })
        .wait(150);

      cy
        .get('.modal-footer .button')
        .click()
        .hash().should('eq', '#/access-denied');
    });
  });

  context('automatic log out [0d2]', function () {

    beforeEach(function () {
      cy.configureCluster({
        mesos: '1-task-healthy',
        acl: true,
        plugins: 'authentication-enabled'
      })
      .route({
        method: 'GET',
        status: 401,
        url: /apps/,
        response:''
      })
      .visitUrl({url: '/#/dashboard/', logIn: true});
    });

    it('logs users out on 401 response from server [0d3]', function () {
      cy.hash().should('eq', '#/login');
    });

  });

  context('show access denied when not an admin [0d7]', function () {

    beforeEach(function () {
      cy.configureCluster({
        mesos: '1-task-healthy',
        acl: true,
        plugins: 'authentication-enabled'
      })
      .route({
        method: 'GET',
        status: 403,
        url: /apps/,
        response: ''
      })
      .visitUrl({url: '/#/dashboard/', logIn: true});
    });

    it('shows access denied on 403 response from server [0d8]', function () {
      cy.hash().should('eq', '#/access-denied');
    });

  });

});
