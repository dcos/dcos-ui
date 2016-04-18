describe('Directories Page [02l]', function () {

  it('allows navigating to External Directory page [02q]', function () {
    cy.configureCluster({
      mesos: '1-task-healthy',
      acl: true,
      plugins: 'organization-enabled'
    })
    .visitUrl({url: '/', logIn: true});

    cy.get('.sidebar-menu').contains('System').click();
    cy.get('.tabs').contains('External Directory').click();
    cy.hash().should('match', /system\/organization\/directories/);
  });

  var addDirectoryBtnText = '+ Add Directory';

  context('No ldap config [02m]', function () {

    beforeEach(function () {
      cy.configureCluster({
        mesos: '1-task-healthy',
        acl: true,
        plugins: 'organization-enabled'
      })
      .visitUrl({url: '/system/organization/directories', logIn: true});

      cy.get('.page-content .button-success').as('addDirectoryBtn');
    });

    it('displays the add directory button [02n]', function () {
      cy.get('@addDirectoryBtn')
        .should(function ($button) {
          expect($button[0].textContent).to.equal(addDirectoryBtnText);
        });
    });

    it('display a modal when clicking the button [02o]', function () {
      cy.get('@addDirectoryBtn').click();
      cy.get('.modal .modal-header-title')
        .should(function ($header) {
          expect($header[0].textContent).to.equal('Add External Directory');
        });
    });

    it('closes modal when clicking Close button [02p]', function () {
      cy.get('@addDirectoryBtn').click();
      var mod = cy.get('.modal');
      cy.get('.modal .modal-footer button').contains('Close').click();
      cy.wait(1000);
      mod.should('be.null');
    });

    it('does not allow selecting StartTLS when SSL/TLS is selected [0jv]', function () {
      cy.get('@addDirectoryBtn').click();
      cy.get('.modal .modal-content').contains('Use SSL/TLS').click();
      cy.get('.modal .modal-content').contains('Use StartTLS')
        .closest('label').children('input').should(function ($checkbox) {
          expect($checkbox[0].disabled).to.be.true;
        });
    });

    it('enables checkbox after unselecting SSL/TLS [0jj]', function () {
      cy.get('@addDirectoryBtn').click();
      cy.get('.modal .modal-content').contains('Use SSL/TLS').click();
      cy.get('.modal .modal-content').contains('Use SSL/TLS').click();
      cy.get('.modal .modal-content').contains('Use StartTLS')
        .closest('label').children('input').should(function ($checkbox) {
          expect($checkbox[0].disabled).to.not.be.true;
        });
    });

    it('does not allow selecting SSL/TLS when StartTLS is selected [0jw]', function () {
      cy.get('@addDirectoryBtn').click();
      cy.get('.modal .modal-content').contains('Use StartTLS').click();
      cy.get('.modal .modal-content').contains('Use SSL/TLS')
        .closest('label').children('input').should(function ($checkbox) {
          expect($checkbox[0].disabled).to.be.true;
        });
    });

    it('enables checkbox after unselecting SSL/TLS [0jt]', function () {
      cy.get('@addDirectoryBtn').click();
      cy.get('.modal .modal-content').contains('Use StartTLS').click();
      cy.get('.modal .modal-content').contains('Use StartTLS').click();
      cy.get('.modal .modal-content').contains('Use SSL/TLS')
        .closest('label').children('input').should(function ($checkbox) {
          expect($checkbox[0].disabled).to.not.be.true;
        });
    });

  });


  context('LDAP config [02r]', function () {

    beforeEach(function () {
      cy.configureCluster({
        mesos: '1-task-healthy',
        acl: true,
        plugins: 'organization-enabled',
        singleLDAP: true
      })
      .visitUrl({url: '/system/organization/directories', logIn: true});
    });

    it('doesn\'t display the add button', function () {
      cy.get('.page-content button').should('not.html', addDirectoryBtnText);
    });

    it('displays information about external LDAP configuration [0b6]', function() {
      var lists = cy.get('.page-content dl.row').as('list');

      cy.get('@list').eq(0).contains('Host');
      cy.get('@list').eq(0).contains('ipa.demo1.freeipa.org');
      cy.get('@list').eq(1).contains('Port');
      cy.get('@list').eq(1).contains('636');
      cy.get('@list').eq(2).contains('Distinguished Name template');
      cy.get('@list').eq(2).contains('uid=%(username)s,cn=users,cn=accounts,dc=demo1,dc=freeipa,dc=org');
      cy.get('@list').eq(3).contains('Use SSL/TLS');
      cy.get('@list').eq(3).contains('Yes');
      cy.get('@list').eq(4).contains('Use StartTLS');
      cy.get('@list').eq(4).contains('No');
    });

    it('allows deleting a directory [0cj]', function () {
      cy.configureCluster({
        aclLDAPDeleteSuccess: true,
        acl: true // resets the singleLDAP configuration
      });

      cy.get('.page-content button').contains('Delete Directory').click();

      // Displays Add Directory button after deletino
      cy.get('.page-content .button-success').should(function ($button) {
        expect($button[0].textContent).to.equal(addDirectoryBtnText);
      });
    });

  });

  context('LDAP test [0b8]', function () {

    beforeEach(function () {
      cy.configureCluster({
        mesos: '1-task-healthy',
        acl: true,
        plugins: 'organization-enabled',
        singleLDAP: true
      })
      .visitUrl({url: '/system/organization/directories', logIn: true});

      cy.get('.page-content button').contains('Test Connection').click();
    });

    it('brings up a modal with fields [0b9]', function () {
      cy.get('.modal .modal-header-title').contains('Test External Directory');
    });

    it('contains a form with two inputs [0be]', function () {
      cy.get('.modal .form input').should(function ($inputs) {
        expect($inputs).length.to.be(2);
        var names = $inputs.map(function (i, el) {
          return cy.$(el).attr('name');
        });

        expect(names.get()).to.deep.eq(['uid', 'password']);
      });
    });

    it('shows error message on error test [0ca]', function () {
      cy.get('.modal .form input').eq(0).type('foo');
      cy.get('.modal .form input').eq(1).type('bar');
      cy.get('.modal button').contains('Test Connection').click();
      cy.get('.modal-generic-error .modal-content')
        .contains('Connection test failed.');
    });

    it('shows successful message on successful test [0c4]', function () {
      cy.configureCluster({aclLDAPTestSuccessful: true});

      cy.get('.modal .form input').eq(0).type('foo');
      cy.get('.modal .form input').eq(1).type('bar');
      cy.get('.modal button').contains('Test Connection').click();
      cy.get('.modal .modal-content')
        .contains('Connection with LDAP server was successful');
    });

  });

});
