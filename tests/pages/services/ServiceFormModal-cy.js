describe('Service Form Modal', function () {

  function openServiceModal() {
    cy.get('.page-header-actions button')
      .first()
      .click();
  }

  function clickRunService() {
    cy.get('.panel .button')
      .contains('Run a Service')
      .click();
  }

  function openServiceForm() {
    cy.get('.create-service-modal-service-picker-option')
      .contains('Single Container')
      .click();
  }

  function openServiceJSON() {
    cy.get('.create-service-modal-service-picker-option')
      .contains('JSON Configuration')
      .click();
  }

  beforeEach(function () {
    cy.configureCluster({
      mesos: '1-empty-group',
      nodeHealth: true
    });
    cy.visitUrl({url: '/services/overview'});
  });

  context('Root level', function () {

    it('Opens the right modal on click', function () {
      openServiceModal();
      cy.get('.modal-full-screen').should('to.have.length', 1);
    });

    it('contains the right group id in the form modal', function () {
      openServiceModal();
      openServiceForm();
      cy.get('.modal .menu-tabbed-view input[name="id"]')
        .should('to.have.value', '/');
    });

    it('contains the right JSON in the JSON editor', function () {
      openServiceModal();
      openServiceJSON();
      cy.get('.ace_content').should(function (nodeList) {
        expect(nodeList[0].textContent).to.contain('"id": "/"');
      });
    });

    it('remembers the selected form tab when switching back from JSON', function () {
      openServiceModal();
      openServiceForm();

      cy.get('.menu-tabbed-item')
        .contains('Networking')
        .click();

      cy.get('.menu-tabbed-view-container h2').first()
        .should('to.have.text', 'Networking');

      // Switch to JSON
      cy.get('.modal-full-screen-actions label').click();

      cy.get('.ace_content').should(function (nodeList) {
        expect(nodeList[0].textContent).to.contain('"id": "/"');
      });

      // Switch back to form
      cy.get('.modal-full-screen-actions label').click();

      cy.get('.menu-tabbed-view-container h2').first()
        .should('to.have.text', 'Networking');

    });
  });

  context('Group level', function () {

    beforeEach(function () {
      cy.visitUrl({url: '/services/overview/%2Fservices'});
    });

    it('Opens the right modal on click', function () {
      clickRunService();
      cy.get('.modal-full-screen').should('to.have.length', 1);
    });

    it('contains the right group id in the modal', function () {
      clickRunService();
      openServiceForm();
      cy.get('.modal .menu-tabbed-view input[name="id"]')
        .should('to.have.value', '/services/');
    });

    it('contains the right JSON in the JSON editor', function () {
      clickRunService();
      openServiceJSON();
      cy.get('.ace_content').should(function (nodeList) {
        expect(nodeList[0].textContent).to.contain('"id": "/services/"');
      });
    });
  });

  context('default values', function () {
    function getFormValue(name) {
      openServiceModal();
      openServiceForm();

      return cy.get('.modal .menu-tabbed-view input[name="' + name + '"]');
    }

    it('contains right cpus default value', function () {
      getFormValue('cpus')
        .should('to.have.value', '0.1');
    });

    it('contains right mem default value', function () {
      getFormValue('mem')
        .should('to.have.value', '128');
    });

    it('contains right instances default value', function () {
      getFormValue('instances')
        .should('to.have.value', '1');
    });

    it('contains the right JSON in the JSON editor', function () {
      openServiceModal();
      openServiceJSON();
      cy.get('.ace_content').should(function (nodeList) {
        expect(nodeList[0].textContent).to.contain('"cpus": 0.1');
        expect(nodeList[0].textContent).to.contain('"instances": 1');
        expect(nodeList[0].textContent).to.contain('"mem": 128');
      });
    });
  });
});
