const user = {
  description: "name",
  uid: "test-user",
  password: "password",
  confirmPassword: "password",
};
const submit = (data) => {
  Object.entries({ ...user, ...data }).forEach(([k, v]) => {
    cy.get(`.form-control[name="${k}"]`).retype(v);
  });
  cy.get(".modal-footer button.button-primary").contains("Create User").click();
};

context("Add user modal", () => {
  beforeEach(() => {
    cy.configureCluster({ mesos: "1-task-healthy", plugins: "organization" });
    cy.route(/acs\/api\/v1\/users/, "fx:acl/users-unicode");
    cy.route("PUT", /acs\/api\/v1\/users\/test-user/, "");
    cy.visitUrl({ url: "/organization/users" });
    cy.get("button.button-primary-link").click();
  });

  it("fails when full name is missing", () => {
    submit({ description: "" });
    cy.get(".modal").contains("Field cannot be empty.");
  });

  it("fails when username is missing", () => {
    submit({ uid: "" });
    cy.get(".modal").contains("Field cannot be empty.");
  });

  it("fails when password is missing", () => {
    submit({ password: "" });
    cy.get(".modal").contains("Field cannot be empty.");
  });

  it("fails when passwords don't match", () => {
    submit({ confirmPassword: "OHNOES" });
    cy.get(".modal").contains("Passwords do not match.");

    cy.get(".button-primary-link").contains("Cancel").click();
    cy.get("button.button-primary-link").click();
    cy.get(".modal").contains("Passwords do not match.").should("not.exist");
  });

  it("succeeds when all fields are correct", () => {
    submit();
    cy.get(".modal").should("not.exist");
  });
});
