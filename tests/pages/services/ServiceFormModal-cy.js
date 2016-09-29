describe('Service Form Modal', function () {
  context('Root level', function () {
    beforeEach(function () {
      cy.configureCluster({
        mesos: '1-empty-group',
        nodeHealth: true
      });
      cy.visitUrl({url: '/services'});
    });

    it('has the right active navigation entry', function () {
      cy.get('.page-navigation-list .menu-tabbed-item.active')
        .should('to.have.text', 'Services');
    });

    it('Opens the right modal on click', function () {
      cy.get('.filter-bar-right .filter-bar-item')
        .contains('Deploy Service')
        .click();
      cy.get('.modal-form').should('to.have.length', 1);
    });

    it('contains the right group id in the modal', function () {
      cy.get('.filter-bar-right .filter-bar-item')
        .contains('Deploy Service')
        .click();
      cy.get('.modal-form input[name="id"]').should(function (nodeList) {
        expect(nodeList[0].value).to.equal('/');
      });
    });

    it('contains the right JSON in the JSON editor', function () {
      cy.get('.filter-bar-right .filter-bar-item')
        .contains('Deploy Service')
        .click();
      cy.get('.modal-form-title-label').click();

      cy.get('.ace_content').should(function (nodeList) {
        expect(nodeList[0].textContent).to.contain('"id": "/"');
      });
    });

    it('remembers the selected form tab when switching back from JSON', function () {
      cy.get('.filter-bar-right .filter-bar-item')
        .contains('Deploy Service')
        .click();

      cy.get('.sidebar-menu-item.clickable')
        .contains('Container Settings')
        .click();

      cy.get('.form-panel:visible .form-row-element h2.form-header').first()
        .should('to.have.text', 'Container Settings');

      // Switch to JSON
      cy.get('.modal-form-title-label').click();

      // Switch to JSON
      cy.get('.ace_content').should(function (nodeList) {
        expect(nodeList[0].textContent).to.contain('"id": "/"');
      });

      // Switch back to form
      cy.get('.modal-form-title-label').click();

      cy.get('.form-panel:visible .form-row-element h2.form-header').first()
        .should('to.have.text', 'Container Settings');

    });
  });

  context('Group level', function () {
    beforeEach(function () {
      cy.configureCluster({
        mesos: '1-empty-group',
        nodeHealth: true
      });
      cy.visitUrl({url: '/services/%2Fservices/'});
    });

    it('Opens the right modal on click', function () {
      cy.get('.filter-bar .button')
        .contains('Deploy Service')
        .click();

      cy.get('.modal-form').should('to.have.length', 1);
    });

    it('contains the right group id in the modal', function () {
      cy.get('.filter-bar .button')
        .contains('Deploy Service')
        .click();

      cy.get('.modal-form input[name="id"]').should(function (nodeList) {
        expect(nodeList[0].value).to.equal('/services/');
      });
    });

    it('contains the right JSON in the JSON editor', function () {
      cy.get('.filter-bar .button')
        .contains('Deploy Service')
        .click();

      cy.get('.modal-form-title-label').click();

      cy.get('.ace_content').should(function (nodeList) {
        expect(nodeList[0].textContent).to.contain('"id": "/services/"');
      });
    });
  });

  context('default values', function () {
    beforeEach(function () {
      cy.configureCluster({
        mesos: '1-empty-group',
        nodeHealth: true
      });
      cy.visitUrl({url: '/services'});
    });

    it('contains right cpus default value', function () {
      cy.get('.filter-bar-right .filter-bar-item')
        .contains('Deploy Service')
        .click();
      cy.get('.modal-form input[name="cpus"]').should(function (nodeList) {
        expect(nodeList[0].value).to.equal('1');
      });
    });

    it('contains right mem default value', function () {
      cy.get('.filter-bar-right .filter-bar-item')
        .contains('Deploy Service')
        .click();
      cy.get('.modal-form input[name="mem"]').should(function (nodeList) {
        expect(nodeList[0].value).to.equal('128');
      });
    });

    it('contains right instances default value', function () {
      cy.get('.filter-bar-right .filter-bar-item')
        .contains('Deploy Service')
        .click();
      cy.get('.modal-form input[name="instances"]').should(function (nodeList) {
        expect(nodeList[0].value).to.equal('1');
      });
    });

    it('contains right disk default value', function () {
      cy.get('.filter-bar-right .filter-bar-item')
        .contains('Deploy Service')
        .click();
      cy.get('.modal-form input[name="disk"]').should(function (nodeList) {
        expect(nodeList[0].value).to.equal('0');
      });
    });

    it('contains the right JSON in the JSON editor', function () {
      cy.get('.filter-bar-right .filter-bar-item')
        .contains('Deploy Service')
        .click();
      cy.get('.modal-form-title-label').click();

      cy.get('.ace_content').should(function (nodeList) {
        expect(nodeList[0].textContent).to.contain('"disk": 0');
        expect(nodeList[0].textContent).to.contain('"cpus": 1');
        expect(nodeList[0].textContent).to.contain('"instances": 1');
        expect(nodeList[0].textContent).to.contain('"mem": 128');
      });
    });
  });
});
