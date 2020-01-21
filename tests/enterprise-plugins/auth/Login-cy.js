describe("Login Page", () => {
  beforeEach(() => {
    cy.configureCluster({
      plugins: "auth-secrets"
    });

    cy.route(
      "POST",
      /acs\/api\/v1\/auth\/login(\?_timestamp=[0-9]+)?$/,
      "successful"
    ).as("login");

    cy.visitUrl({ url: "/login" });

    cy.get(".form-control[name='uid']")
      .type("{selectall}{backspace}")
      .type("{selectall}{backspace}")
      .type("bootstrapuser");
  });

  it("allows user to log in via form", () => {
    cy.get(".form-control[name='password']")
      .type("{selectall}{backspace}")
      .type("{selectall}{backspace}")
      .type("deleteme");

    cy.get("button.button-primary")
      .contains("Log In")
      .click();

    cy.wait("@login")
      .its("response.body")
      .should("equal", "successful");
  });

  it("validates when password is missing", () => {
    cy.get(".form-control[name='password']")
      .type("{selectall}{backspace}")
      .type("{selectall}{backspace}");

    cy.get("button.button-primary")
      .contains("Log In")
      .click();

    cy.get("form .form-control-feedback").should(
      "have.text",
      "Field cannot be empty."
    );
  });
});
