describe("Login Page", () => {
  beforeEach(() => {
    cy.configureCluster({
      plugins: "auth-secrets",
    });

    cy.route(
      "POST",
      /acs\/api\/v1\/auth\/login(\?_timestamp=[0-9]+)?$/,
      "successful"
    ).as("login");

    cy.visitUrl({ url: "/login" });

    cy.get(".form-control[name='uid']").retype("bootstrapuser");
  });

  it("allows user to log in via form", () => {
    cy.get(".form-control[name='password']").retype("deleteme");
    cy.get("button.button-primary").contains("Log In").click();
    cy.wait("@login").its("response.body").should("equal", "successful");
  });

  it("validates when password is missing", () => {
    cy.get(".form-control[name='password']").clear();
    cy.get("button.button-primary").contains("Log In").click();
    cy.get("form .form-control-feedback").should(
      "have.text",
      "Field cannot be empty."
    );
  });
});
