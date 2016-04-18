describe('Access Denied Page [046]', function () {

  beforeEach(function () {
    cy.configureCluster({
      mesos: '1-task-healthy',
      acl: true,
      plugins: 'authentication-enabled'
    });
  });

  context('Authentication on [047]', function () {

    beforeEach(function () {
      cy.visitUrl({url: '/access-denied'});
    });

    it('should show access denied page [04a]',
      function () {
        cy.get('h3').should(function (title) {
          expect(title[0].textContent).to.equal('Access Denied');
        });
      }
    );
  });

  context('Authentication off [048]', function () {

    beforeEach(function () {
      cy.visitUrl({url: '/dashboard', logIn: true});
    });

    it('should show dashboard [04b]',
      function () {
        cy.get('h1').should(function (title) {
          expect(title[0].textContent).to.equal('Dashboard');
        });
      }
    );
  });

});
