describe("Users", () => {
  context("Add user modal", () => {
    beforeEach(() => {
      cy.configureCluster({
        mesos: "1-task-healthy",
        plugins: "organization"
      });

      cy.route(
        /acs\/api\/v1\/users(\?_timestamp=[0-9]+)?$/,
        "fx:acl/users-unicode"
      );

      cy.route(
        "PUT",
        /acs\/api\/v1\/users\/test-user(\?_timestamp=[0-9]+)?$/,
        ""
      );

      cy.visitUrl({ url: "/organization/users" });
      cy.get("button.button-primary-link").click();
    });

    it("opens add user modal", () => {
      cy.get(".modal").contains("Create New User");
    });

    it("shows the correct number of inputs", () => {
      cy.get("input.form-control").should("have.length", 5); // 1 for the filter and 4 for the input fields
    });

    it("fails when full name is missing", () => {
      cy.get('.form-control[name="uid"]').type("test-user");

      cy.get('.form-control[name="password"]').type("test-password");

      cy.get('.form-control[name="confirmPassword"]').type("test-password");

      cy.get(".modal-footer button.button-primary")
        .contains("Create User")
        .click();

      cy.get(".modal").contains("Field cannot be empty.");
    });

    it("fails when username is missing", () => {
      cy.get('.form-control[name="description"]').type("test-name");

      cy.get('.form-control[name="password"]').type("test-password");

      cy.get('.form-control[name="confirmPassword"]').type("test-password");

      cy.get(".modal-footer button.button-primary")
        .contains("Create User")
        .click();

      cy.get(".modal").contains("Field cannot be empty.");
    });

    it("fails when password is missing", () => {
      cy.get('.form-control[name="description"]').type("test-name");

      cy.get('.form-control[name="uid"]').type("test-user");

      cy.get(".modal-footer button.button-primary")
        .contains("Create User")
        .click();

      cy.get(".modal").contains("Field cannot be empty.");
    });

    it("fails when passwords don't match", () => {
      cy.get('.form-control[name="description"]').type("test-name");

      cy.get('.form-control[name="uid"]').type("test-user");

      cy.get('.form-control[name="password"]').type("test-password");

      cy.get('.form-control[name="confirmPassword"]').type("test-password2");

      cy.get(".modal-footer button.button-primary")
        .contains("Create User")
        .click();

      cy.get(".modal").contains("Passwords do not match.");
    });

    it("succeeds when all fields are correct", () => {
      cy.get('.form-control[name="description"]').type("test-name");

      cy.get('.form-control[name="uid"]').type("test-user");

      cy.get('.form-control[name="password"]').type("test-password");

      cy.get('.form-control[name="confirmPassword"]').type("test-password");

      cy.get(".modal-footer button.button-primary")
        .contains("Create User")
        .click();

      cy.get(".modal").should("not.exist");
    });

    it("clears password errors on close", () => {
      cy.get('.form-control[name="description"]').type("test-name");

      cy.get('.form-control[name="uid"]').type("test-user");

      cy.get('.form-control[name="password"]').type("test-password");

      cy.get('.form-control[name="confirmPassword"]').type("test-password2");

      cy.get(".modal-footer button.button-primary")
        .contains("Create User")
        .click();

      cy.get(".modal").contains("Passwords do not match.");
      cy.get(".button-primary-link")
        .contains("Cancel")
        .click();
      cy.get("button.button-primary-link").click();
      cy.get(".modal")
        .contains("Passwords do not match.")
        .should("not.exist");
    });
  });
});
