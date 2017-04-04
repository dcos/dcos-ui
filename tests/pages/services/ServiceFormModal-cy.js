describe('Service Form Modal', function () {

  context('Create', function () {

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

      it('uses Docker by default', function () {
        openServiceModal();
        openServiceJSON();
        cy.get('.ace_content').should(function (nodeList) {
          expect(nodeList[0].textContent).to.contain('"type": "DOCKER"');
        });
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

  context('Edit', function () {

    const SERVICE_SPEC = {
      id: '/sleep',
      cmd: 'sleep 3000',
      instances: 1,
      cpus: 1,
      mem: 128,
      disk: 0,
      gpus: 0,
      backoffSeconds: 1,
      backoffFactor: 1.15,
      maxLaunchDelaySeconds: 3600,
      container: {
        type: 'MESOS',
        volumes: [
          {
            containerPath: 'data-1',
            mode: 'RW',
            persistent: {
              size: 1,
              type: 'root'
            }
          },
          {
            containerPath: 'data-2',
            mode: 'RW',
            persistent: {
              size: 2,
              type: 'root'
            }
          },
          {
            containerPath: 'data-3',
            mode: 'RW',
            persistent: {
              size: 3,
              type: 'root'
            }
          }
        ]
      },
      upgradeStrategy: {
        minimumHealthCapacity: 0.5,
        maximumOverCapacity: 0
      },
      residency: {
        relaunchEscalationTimeoutSeconds: 10,
        taskLostBehavior: 'WAIT_FOREVER'
      },
      unreachableStrategy: {
        inactiveAfterSeconds: 3600,
        expungeAfterSeconds: 604800
      },
      killSelection: 'YOUNGEST_FIRST',
      portDefinitions: [
        {
          port: 10000,
          protocol: 'tcp'
        }
      ],
      requirePorts: true
    };

    beforeEach(function () {
      cy.configureCluster({
        mesos: '1-task-with-volumes',
        nodeHealth: true
      });

      cy.visitUrl({url: '/services/overview/%2Fsleep'});
      cy.get('.page-header-actions .dropdown').click();
      cy.get('.dropdown-menu-items').contains('Edit').click();
    });

    it('contains the right service id in the modal', function () {
      cy.get('.modal .menu-tabbed-view input[name="id"]')
        .should('to.have.value', '/sleep');
    });

    it('contains the right JSON in the JSON editor', function () {

      // Open JSON Editor
      cy.get('.modal .toggle-button + span').click();

      // Get Ace Editor instance from DOM as `textContent` only includes parts
      // of the JSON due to the Ace Editor rending optimizations.
      cy.window().then(function (window) {
        const editor = window.ace.edit('brace-editor');

        expect(JSON.parse(editor.getValue())).to.deep.equal(SERVICE_SPEC);
      });
    });
  });

  context('Picker', function () {

    beforeEach(function () {
      cy.configureCluster({
        mesos: '1-task-healthy'
      });
      cy.visitUrl({url: '/services/overview/%2F/create'});
    });

    it('should fill the entire viewport', function () {
      var isModalFullScreen = true;

      cy.window()
        .then(function ($window) {
          cy.get('.modal-full-screen')
            .should(function ($element) {
              if ($element[0].clientHeight !== $window.innerHeight || $element[0].clientWidth !== $window.innerWidth) {
                isModalFullScreen = false;
              }
              expect(isModalFullScreen).to.be.equal(true);
            });
        });
    });

    it('should be horizontally and vertically centered in the modal container', function () {
      cy.get('.modal-body-wrapper')
        .should(function ($modalWrapper) {
          const modalWrapperRect = $modalWrapper[0].getBoundingClientRect();
          const modalWrapperTop = Math.floor(modalWrapperRect.top + (modalWrapperRect.height / 2));
          const modalWrapperLeft = Math.floor(modalWrapperRect.left + (modalWrapperRect.width / 2));

          const $modalContent = $modalWrapper.find('.row.panel-grid');
          const modalContentRect = $modalContent[0].getBoundingClientRect();
          const modalContentTop = Math.floor(modalContentRect.top + (modalContentRect.height / 2));
          const modalContentLeft = Math.floor(modalContentRect.left + (modalContentRect.left / 2));

          const topPosDifference = Math.floor(modalWrapperTop - modalContentTop);
          const leftPosDifference = Math.floor(modalWrapperLeft - modalContentLeft);

          expect(topPosDifference <= modalContentTop).to.be.equal(true);
          expect(leftPosDifference <= modalContentTop).to.be.equal(true);
        });
    });

    it('should have four options to choose from', function () {
      cy.get('.panel-grid h5')
        .should(function (items) {
          const texts = items.map(function (i, el) {
            return cy.$(el).text();
          }).get();

          expect(texts).to.deep.eq([
            'Single Container',
            'Multi-container (Pod)',
            'JSON Configuration',
            'Install a Package'
          ]);
        });
    });

    it('should contain panes with the same width and height', function () {
      var isPanesSameSize = true;

      cy.get('.create-service-modal-service-picker-option')
        .should(function ($elements) {
          const firstElementWidth = $elements[0].clientWidth;
          const firstElementHeight = $elements[0].clientHeight;

          for (var i = 1; i <= $elements.length -1; i++) {
            const currentElementWidth = $elements[i].clientWidth;
            const currentElementHeight = $elements[i].clientHeight;

            if ( currentElementWidth !== firstElementWidth
              || currentElementHeight !== firstElementHeight) {
              isPanesSameSize = false;
            }
          }
          expect(isPanesSameSize).to.be.equal(true);
        });
    });

  });

  context('Create Layout (Single Container)', function () {

    beforeEach(function () {
      cy.configureCluster({
        mesos: '1-task-healthy'
      });

      cy.visitUrl({url: '/services/overview/%2F/create'});
      cy.get('.create-service-modal-service-picker-option')
        .contains('Single Container')
        .click();

    });

    context('Service: General', function () {

      it('Should have a "Service ID" field', function () {
        cy.get('.form-group')
          .contains('Service ID');
      });

      it('Should have a "Instances" field', function () {
        cy.get('.form-group')
          .contains('Instances');
      });

      it('Should have a "Container Image" field', function () {
        cy.get('.form-group')
          .contains('Container Image');
      });

      it('Should have a "CPUs" field', function () {
        cy.get('.form-group')
          .contains('CPUs');
      });

      it('Should have a "Memory (MiB)" field', function () {
        cy.get('.form-group')
          .contains('Memory (MiB)');
      });

      it('Should have a "Command" field', function () {
        cy.get('.form-group')
          .contains('Command');
      });

      it('Should not have a "Container Runtime" section', function () {
        cy.get('.menu-tabbed-view')
          .contains('Container Runtime')
          .should('to.have.length', 0);
      });

      it('Should not have a "Placement Constraints" section', function () {
        cy.get('.menu-tabbed-view')
          .contains('Placement Constraints')
          .should('to.have.length', 0);
      });

      it('Should not have a "Add Placement Constraint" link', function () {
        cy.get('.menu-tabbed-view .button.button-primary-link')
          .contains('Add Placement Constraint')
          .should('to.have.length', 0);
      });

      it('Should not have a "Advanced Settings" section', function () {
        cy.get('.menu-tabbed-view')
          .contains('Advanced Settings')
          .should('to.have.length', 0);
      });

      it('Should not have a "Grant Runtime Privileges" checkbox', function () {
        cy.get('.menu-tabbed-view')
          .contains('Grant Runtime Privileges')
          .should('to.have.length', 0);
      });

      it('Should not have a "Force Pull Image On Launch" checkbox', function () {
        cy.get('.menu-tabbed-view')
          .contains('Force Pull Image On Launch')
          .should('to.have.length', 0);
      });

      it('Should not have a "GPUs" field', function () {
        cy.get('.form-group')
          .contains('GPUs')
          .should('to.have.length', 0);
      });

      it('Should not have a "Disk (MiB)" field', function () {
        cy.get('.form-group')
          .contains('Disk (MiB)')
          .should('to.have.length', 0);
      });

      it('Should not have a "Add Artifact" link', function () {
        cy.get('.menu-tabbed-view .button.button-primary-link')
          .contains('Add Artifact')
          .should('to.have.length', 0);
      });
    });

    context('Service: More Settings', function () {

      beforeEach(function () {
        cy.get('a.clickable')
          .contains('More Settings')
          .click();
      });

      it('Should have a "Container Runtime" section', function () {
        cy.get('.menu-tabbed-view')
          .contains('Container Runtime');
      });

      it('Should have a "Placement Constraints" section', function () {
        cy.get('.menu-tabbed-view')
          .contains('Placement Constraints');
      });

      it('Should have a "Add Placement Constraint" link', function () {
        cy.get('.menu-tabbed-view .button.button-primary-link')
          .contains('Add Placement Constraint');
      });

      it('Should vertically align the placement constraint delete row button', function () {
        // We'll consider the two elements to be centered with one another if
        // their midpoints are within 5 pixels of one another.
        const alignmentThreshold = 5;

        cy.get('.menu-tabbed-view .button.button-primary-link')
          .contains('Add Placement Constraint').click();

        cy.get('.menu-tabbed-view input[name="constraints.0.fieldName"')
          .should(function ($inputElement) {
            const $wrappingLabel = $inputElement.closest('.form-group');
            const $deleteButtonFormGroup = $wrappingLabel.siblings('.form-group-without-top-label');

            const inputClientRect = $inputElement.get(0).getBoundingClientRect();
            const inputMidpoint = inputClientRect.top + (inputClientRect.height / 2);

            const deleteButtonClientRect = $deleteButtonFormGroup.find('.button').get(0).getBoundingClientRect();
            const deleteButtonMidpoint = deleteButtonClientRect.top + (deleteButtonClientRect.height / 2);

            const midpointDifference = Math.abs(inputMidpoint - deleteButtonMidpoint);

            expect(midpointDifference <= alignmentThreshold).to.equal(true);
          });
      });

      it('Should have a "Advanced Settings" section', function () {
        cy.get('.menu-tabbed-view')
          .contains('Advanced Settings');
      });

      it('Should have a "Grant Runtime Privileges" checkbox', function () {
        cy.get('.menu-tabbed-view')
          .contains('Grant Runtime Privileges');
      });

      it('Should have a "Force Pull Image On Launch" checkbox', function () {
        cy.get('.menu-tabbed-view')
          .contains('Force Pull Image On Launch');
      });

      it('Should have a "GPUs" field', function () {
        cy.get('.form-group')
          .contains('GPUs');
      });

      it('Should have a "Disk (MiB)" field', function () {
        cy.get('.form-group')
          .contains('Disk (MiB)');
      });

      it('Should have a "Add Artifact" link', function () {
        cy.get('.menu-tabbed-view .button.button-primary-link')
          .contains('Add Artifact');
      });

      context('Switching runtime', function () {
        it('switches from Docker to Mesos correctly', function () {
          cy.get('label')
            .contains('Mesos Runtime')
            .click();

          cy.get('.ace_content').should(function (nodeList) {
            expect(nodeList[0].textContent).not.to.contain('"container": {');
          });
        });
      });

    });
  });

  context('Create Layout (Multi Container)', function () {

    beforeEach(function () {
      cy.configureCluster({
        mesos: '1-task-healthy'
      });

      cy.visitUrl({url: '/services/overview/%2F/create'});
      cy.get('.create-service-modal-service-picker-option')
        .contains('Multi-container (Pod)')
        .click();

    });

    context('Service: General', function () {

      it('Should have a "Service ID" field', function () {
        cy.get('.form-group')
          .contains('Service ID');
      });

      it('Should have a "Instances" field', function () {
        cy.get('.form-group')
          .contains('Instances');
      });

    });

    context('Service: container settings', function () {
      beforeEach(function () {
        cy.get('.menu-tabbed-item')
          .contains('container-1')
          .click();
      });

      context('Service: More Settings', function () {

        beforeEach(function () {
          cy.get('a.clickable')
            .contains('More Settings')
            .click();
        });

        it('Should have a "Add Artifact" link', function () {
          cy.get('.menu-tabbed-view .button.button-primary-link')
            .contains('Add Artifact');
        });

      });

    });

  });

});
