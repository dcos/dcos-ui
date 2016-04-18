describe('System Page [04x]', function () {

  context('Bulk Groups Actions [04y]', function () {

    beforeEach(function () {
      cy.configureCluster({
        mesos: '1-task-healthy',
        acl: true,
        plugins: 'organization-enabled'
      })
      .route(/api\/v1\/groups/, 'fx:acl/groups-unicode-truncated')
      .visitUrl({url: '/system/organization/groups/', identify: true});

      cy.get('tbody .checkbox').as('checkboxes');
      cy.get('tbody .checkbox input').as('checkboxesState');
      cy.get('thead .checkbox').as('checkboxHeader');
      cy.get('thead .checkbox input').as('checkboxHeaderState');
    });

    it('sets heading checkbox indeterminate when checkbox toggled [04i]',
      function () {
        cy.get("@checkboxes").first().click();

        cy.get("@checkboxHeaderState").should(function ($checkboxHeader) {
          expect($checkboxHeader[0].indeterminate).to.equal(true);
        });
      }
    );

    it('sets heading checkbox checked when all checkboxes toggled [04j]',
      function () {
        cy.get("@checkboxes").click({multiple: true});

        cy.get("@checkboxes").should(function ($checkboxes) {
          expect($checkboxes).length.to.be(4);
        });

        cy.get("@checkboxHeaderState").should(function ($checkboxHeader) {
          expect($checkboxHeader[0].checked).to.equal(true);
        });
      }
    );

    it('sets heading checkbox indeterminate when checkbox untoggled [04k]',
      function () {
        cy.get("@checkboxes").click({multiple: true});
        cy.get("@checkboxes").first().click();

        cy.get("@checkboxHeaderState").should(function ($checkboxHeader) {
          expect($checkboxHeader[0].indeterminate).to.equal(true);
        });
      }
    );

    it('checks all checkboxes on heading checkbox checked [04l]',
      function () {
        cy.get("@checkboxHeader").click();

        cy.get("@checkboxesState").should(function ($checkboxHeader) {
          expect($checkboxHeader[0].checked).to.equal(true);
          expect($checkboxHeader[1].checked).to.equal(true);
          expect($checkboxHeader[2].checked).to.equal(true);
          expect($checkboxHeader[3].checked).to.equal(true);
        });
      }
    );

    it('unchecks all checkboxes on heading checkbox unchecked [04m]',
      function () {
        cy.get("@checkboxHeader").click();
        cy.get("@checkboxHeader").click();

        cy.get("@checkboxesState").should(function ($checkboxHeader) {
          expect($checkboxHeader[0].checked).to.equal(false);
          expect($checkboxHeader[1].checked).to.equal(false);
          expect($checkboxHeader[2].checked).to.equal(false);
          expect($checkboxHeader[3].checked).to.equal(false);
        });
      }
    );

  });

  context('Bulk Users Actions [04z]', function () {

    beforeEach(function () {
      cy.configureCluster({
        mesos: '1-task-healthy',
        acl: true,
        plugins: 'organization-enabled'
      })
      .route(/api\/v1\/users/, 'fx:acl/users-unicode-truncated')
      .visitUrl({url: '/system/organization/users/', identify: true});

      cy.get('tbody .checkbox').as('checkboxes');
      cy.get('tbody .checkbox input').as('checkboxesState');
      cy.get('thead .checkbox').as('checkboxHeader');
      cy.get('thead .checkbox input').as('checkboxHeaderState');
    });

    it("sets heading checkbox indeterminate when checkbox toggled [04d]",
      function () {
        cy.get("@checkboxes").first().click();

        cy.get("@checkboxHeaderState").should(function ($checkboxHeader) {
          expect($checkboxHeader[0].indeterminate).to.equal(true);
        });
      }
    );

    it("sets heading checkbox checked when all checkboxes toggled [04e]",
      function () {
        cy.get("@checkboxes").click({multiple: true});

        cy.get("@checkboxes").should(function ($checkboxes) {
          expect($checkboxes).length.to.be(2);
        });

        cy.get("@checkboxHeaderState").should(function ($checkboxHeader) {
          expect($checkboxHeader[0].checked).to.equal(true);
        });
      }
    );

    it("sets heading checkbox indeterminate when checkbox untoggled [04f]",
      function () {
        cy.get("@checkboxes").click({multiple: true});
        cy.get("@checkboxes").first().click();

        cy.get("@checkboxHeaderState").should(function ($checkboxHeader) {
          expect($checkboxHeader[0].indeterminate).to.equal(true);
        });
      }
    );

    it("checks all checkboxes on heading checkbox checked [04g]",
      function () {
        cy.get("@checkboxHeader").click();

        cy.get("@checkboxesState").should(function ($checkboxHeader) {
          expect($checkboxHeader[0].checked).to.equal(true);
          expect($checkboxHeader[1].checked).to.equal(true);
        });
      }
    );

    it("unchecks all checkboxes on heading checkbox unchecked [04h]",
      function () {
        cy.get("@checkboxHeader").click();
        cy.get("@checkboxHeader").click();

        cy.get("@checkboxesState").should(function ($checkboxHeader) {
          expect($checkboxHeader[0].checked).to.equal(false);
          expect($checkboxHeader[1].checked).to.equal(false);
        });
      }
    );

    context("LDAP Users [050]", function () {

      it("shows LDAP badge for LDAP users [051]", function () {
        cy.get(".badge").should(function ($badge) {
          expect($badge).length.to.be(2);
        });
      });


      it("disables checkbox of LDAP users [052]", function () {
        cy.get("@checkboxes").click({multiple: true});

        cy.get("@checkboxes").should(function ($checkboxes) {
          expect($checkboxes).length.to.be(2);
        });
      });

    });

    context("User Actions Dropdown [04p]", function () {

      it("shows dropdown when a checkbox is checked [04q]", function () {
        cy.get("@checkboxes").first().click();

        cy.get(".dropdown").should(function ($dropdown) {
          expect($dropdown.length).to.equal(1);
        });
      });

      it("doesn't show dropdown when nothing is checked [04r]",
        function () {
          cy.get(".dropdown").should(function ($dropdown) {
            expect($dropdown.length).to.equal(0);
          });
        }
      );

      it("shows correct user actions [04s]", function () {

        cy.get("@checkboxes").first().click();
        cy.get(".dropdown").click();
        cy.get(".dropdown .clickable").as("dropdownItems");

        cy.get("@dropdownItems").should(function ($items) {
          expect($items.length).to.equal(3);
          expect($items[0].textContent).to.contain("Add");
        });

      });

    });

    context("User Actions Modal [04v]", function () {

      beforeEach(function () {
        cy.get("@checkboxes").first().click();
        cy.get(".dropdown").click();
        cy.get(".dropdown .clickable").first().click();
      });

      it("shows the modal when dropdown is clicked [04u]", function () {
        cy.get(".modal").within(function () {
          cy.get("h3").should(function ($title) {
            expect($title[0].textContent).to.contain("Add");
          });
        });
      });

      it("shows validation error when confirm clicked without selection [04w]",
        function () {
          cy.get(".modal-footer .button-primary").click();
          cy.get(".text-error-state").should(function ($error) {
            expect($error[0].textContent).to.contain("Select from dropdown");
          });
        }
      );
    });

  });

});
