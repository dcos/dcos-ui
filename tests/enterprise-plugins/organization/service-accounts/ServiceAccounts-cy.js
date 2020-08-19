describe("Service Accounts", () => {
  context("Edit Service Account", () => {
    beforeEach(() => {
      cy.configureCluster({
        mesos: "1-task-healthy",
        plugins: "organization",
      });

      cy.route(
        "GET",
        /acs\/api\/v1\/users\/myserviceaccount(\?_timestamp=[0-9]+)?$/,
        "fx:acl/service-account"
      );

      cy.route(
        "GET",
        /acs\/api\/v1\/users\/myserviceaccount\/groups(\?_timestamp=[0-9]+)?$/,
        "fx:acl/groups-unicode-truncated"
      );

      cy.route(
        "GET",
        /acs\/api\/v1\/users\/myserviceaccount\/permissions(\?_timestamp=[0-9]+)?$/,
        "fx:acl/user-permissions"
      );

      cy.route(
        "PUT",
        /acs\/api\/v1\/users\/myserviceaccount(\?_timestamp=[0-9]+)?$/,
        "fx:acl/service-account"
      );
    });

    it("Can edit the description", () => {
      cy.visitUrl({ url: "/organization/service-accounts/myserviceaccount" });

      cy.get(".button.button-primary").contains("Edit").click();

      cy.get('.form-control[name="description"]')
        .type("{selectall}{backspace}")
        .type("mynewserviceaccount");

      cy.get(".modal-footer button.button-primary").contains("Save").click();
    });
  });

  context("Add Service Account", () => {
    context("Auto-generating keypair", () => {
      context("Secret creation succeeds", () => {
        beforeEach(() => {
          cy.configureCluster({
            mesos: "1-task-healthy",
            plugins: "organization",
          });

          cy.route(
            "PUT",
            /acs\/api\/v1\/users\/myserviceaccount(\?_timestamp=[0-9]+)?$/,
            ""
          );

          cy.route(
            "PUT",
            /secrets\/v1\/secret\/default\/myserviceaccount-secret(\?_timestamp=[0-9]+)?$/,
            ""
          );
        });

        it("Validates when uid name is blank", () => {
          cy.visitUrl({ url: "/organization/service-accounts" });

          cy.get("button.button-primary-link").click();

          cy.get(".modal-footer button.button-primary")
            .contains("Create")
            .click();

          cy.get(".form-control-feedback").should(($p) => {
            expect($p.eq(0)).to.have.text("Field cannot be empty.");
          });
        });
      });
    });

    context("Secret creation fails", () => {
      beforeEach(() => {
        cy.configureCluster({
          mesos: "1-task-healthy",
          plugins: "organization",
        });
      });

      it("Shows unanchored errors for unknown secret errors", () => {
        cy.visitUrl({ url: "/organization/service-accounts" });

        cy.get("button.button-primary-link").click();
        cy.get('.form-control[name="uid"]').type("myserviceaccount");
        cy.get(".modal-footer button.button-primary")
          .contains("Create")
          .click();

        cy.get(".modal-footer button.button-primary").should("be.disabled");
        cy.get(".modal-footer button.button-primary").should("not.be.disabled");

        cy.get(".error-unanchored").should(($div) => {
          expect($div.eq(0)).to.have.text("An error has occurred.");
        });
      });
    });
  });

  context("Secret create fails and account delete fails", () => {
    beforeEach(() => {
      cy.configureCluster({
        mesos: "1-task-healthy",
        plugins: "organization",
      });

      cy.route(
        "PUT",
        /acs\/api\/v1\/users\/myserviceaccount(\?_timestamp=[0-9]+)?$/,
        ""
      );
    });

    it("Shows unanchored errors for fatal error and resets form", () => {
      cy.visitUrl({ url: "/organization/service-accounts" });

      cy.get("button.button-primary-link").click();

      cy.get('.form-control[name="uid"]').type("myserviceaccount");

      cy.get(".modal-footer button.button-primary").contains("Create").click();

      cy.get(".modal-footer button.button-primary").should("be.disabled");
      cy.get(".modal-footer button.button-primary").should("not.be.disabled");

      cy.get(".error-unanchored").contains(
        "Please delete this service account and try again or use the CLI."
      );

      cy.get(".form-control[name='uid']").should("have.value", "");
    });
  });
});
