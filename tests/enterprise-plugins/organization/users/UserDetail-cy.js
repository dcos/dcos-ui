describe("User Detail", () => {
  context("Group Memberships", () => {
    beforeEach(() => {
      cy.configureCluster({
        mesos: "1-task-healthy",
        plugins: "organization",
      });

      // Stub group/user API requests
      cy.route(
        /acs\/api\/v1\/users\/quis\/permissions(\?_timestamp=[0-9]+)?$/,
        "fx:acl/user-permissions"
      );

      cy.route(
        /acs\/api\/v1\/users\/quis\/groups(\?_timestamp=[0-9]+)?$/,
        "fx:acl/user-groups"
      );

      cy.route(
        /acs\/api\/v1\/users\/quis(\?_timestamp=[0-9]+)?$/,
        "fx:acl/user-unicode"
      );

      cy.route(
        /acs\/api\/v1\/acls(\?_timestamp=[0-9]+)?$/,
        "fx:acl/acls_empty"
      );

      cy.route(
        /acs\/api\/v1\/groups(\?_timestamp=[0-9]+)?$/,
        "fx:acl/groups-unicode"
      );

      // Stub add user to group request
      cy.route(
        "PUT",
        /acs\/api\/v1\/groups\/[ a-f0-9-]+\/users\/quis(\?_timestamp=[0-9]+)?$/,
        "successful"
      ).as("addGroup");
    });

    it("Can add users to groups", () => {
      cy.visitUrl({ url: "/organization/users/quis" });

      cy.get(".menu-tabbed-item-label").contains("Group Membership").click();

      // Opens list of users to add
      cy.get(".typeahead input").click();

      // Add first user
      cy.get("[data-cy=PopoverListItem]").should("to.be.visible").eq(0).click();

      // Assert that add user to group API was called
      cy.wait("@addGroup").its("response.body").should("equal", "successful");
    });
  });

  context("Editing User", () => {
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

      cy.route(
        "PATCH",
        /acs\/api\/v1\/users\/myserviceaccount(\?_timestamp=[0-9]+)?$/,
        "fx:acl/service-account"
      );

      cy.visitUrl({ url: "/organization/users/myserviceaccount" });
      cy.get(".page-header-actions").contains("Edit").click();
    });

    it("opens the edit modal", () => {
      cy.get(".modal").contains("Edit User");
    });

    it("shows the correct number of inputs", () => {
      cy.get("input.form-control").should("have.length", 3);
    });

    it("fails when passwords don't match", () => {
      cy.get(".form-control[name='password']").type("testpassword1");

      cy.get(".form-control[name='confirmPassword']").type("testpassword2");

      cy.get(".modal-footer button.button-primary").contains("Save").click();

      cy.get(".modal").contains("Passwords do not match.");
    });

    it("succeeds when all fields are correct", () => {
      cy.get(".form-control[name='description']").type("New Name");

      cy.get(".form-control[name='password']").type("test123");

      cy.get(".form-control[name='confirmPassword']").type("test123");

      cy.get(".modal-footer button.button-primary").contains("Save").click();

      cy.get(".modal").should("not.exist");
    });
  });

  context("Permissions", () => {
    beforeEach(() => {
      cy.configureCluster({
        mesos: "1-task-healthy",
        plugins: "organization",
      });
      // Stub group/user API requests
      cy.route(
        /acs\/api\/v1\/users\/quis\/permissions(\?_timestamp=[0-9]+)?$/,
        "fx:acl/user-permissions"
      );

      cy.route(
        /acs\/api\/v1\/users\/quis\/groups(\?_timestamp=[0-9]+)?$/,
        "fx:acl/user-groups"
      );

      cy.route(
        /acs\/api\/v1\/users\/quis(\?_timestamp=[0-9]+)?$/,
        "fx:acl/user-unicode"
      );

      cy.route(
        /acs\/api\/v1\/acls(\?_timestamp=[0-9]+)?$/,
        "fx:acl/acls_empty"
      );

      cy.route(
        /acs\/api\/v1\/groups(\?_timestamp=[0-9]+)?$/,
        "fx:acl/groups-unicode"
      );

      // Stub add user to group request
      cy.route(
        "PUT",
        /acs\/api\/v1\/groups\/[ a-f0-9-]+\/users\/quis(\?_timestamp=[0-9]+)?$/,
        "successful"
      ).as("addGroup");

      cy.visitUrl({ url: "/organization/users/quis" });
      cy.get(".button-primary").contains("Add Permission").click();
    });

    it("opens the permissions modal", () => {
      cy.get(".modal");
      cy.get(".text-overflow-break-word").contains(
        "Use the form below to build your permission."
      );
    });

    context("Permissions strings", () => {
      beforeEach(() => {
        cy.get(".muted").contains("Insert Permission String").click();
      });

      it("opens the permissions string input", () => {
        cy.get(".text-overflow-break-word").contains(
          "Use the form below to manually enter or paste permissions."
        );
      });

      it("shows an error for an incorrect permission", () => {
        cy.get(".content-editable").type("123");
        cy.get(".button-primary").contains("Add Permissions").click();
        cy.wait(2500);
        cy.get(".errorsAlert-message").contains("Unable to add 1 permission:");
      });

      it("shows a condensed error message for more that five errors", () => {
        cy.get(".content-editable").type(
          "a{enter}b{enter}c{enter}d{enter}e{enter}f{enter}g{enter}h{enter}i{enter}j{enter}k{enter}l{enter}m{enter}n{enter}o{enter}p"
        );
        cy.get(".button-primary").contains("Add Permissions").click();
        cy.wait(2500);
        cy.get(".errorsAlert-message").contains(
          "Unable to add 16 permissions:"
        );
        cy.get(".errorsAlert-message").contains("and 11 more.");
      });
    });
  });
});
