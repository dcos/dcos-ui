describe("Add Repository Form Modal", function() {
  beforeEach(function() {
    cy
      .configureCluster({
        mesos: "1-task-healthy",
        universePackages: true
      })
      .visitUrl({ url: "/settings/repositories" })
      .get(".page-header-actions button")
      .click();
  });

  it("displays modal for adding repository", function() {
    cy.get(".modal h2").should("contain", "Add Repository");
  });

  it("displays three fields", function() {
    cy.get(".modal input").should("to.have.length", 3);
  });

  it("should display error if both fields aren't filled out", function() {
    cy
      .get(".modal .modal-footer .button.button-success")
      .contains("Add")
      .click();

    cy
      .get(".modal .form-control-feedback")
      .eq(0)
      .should("contain", "Field cannot be empty.");

    cy
      .get(".modal .form-control-feedback")
      .eq(1)
      .should("contain", "Must be a valid url with http:// or https://");
  });

  it("should display error if not a valid url", function() {
    cy
      .get(".modal .modal-footer .button.button-success")
      .contains("Add")
      .click();

    cy
      .get(".modal .form-control-feedback")
      .should("contain", "Must be a valid url with http:// or https://");
  });

  it("closes modal after add is successful", function() {
    cy
      .get(".modal input")
      .eq(0)
      .type("Here we go!")
      .get(".modal input")
      .eq(1)
      .type("http://there-is-no-stopping.us")
      .get(".modal input")
      .eq(2)
      .type("0")
      .get(".modal .modal-footer .button.button-success")
      .contains("Add")
      .click();

    cy.get(".modal").should("exist");

    // Clean up
    cy.clusterCleanup(function() {
      cy
        .get(".page-body-content")
        .contains("tr", "Here we go!")
        .find(".button.button-link.button-danger")
        .invoke("show")
        .click({ force: true });
      cy
        .get(".modal .modal-footer .button.button-danger")
        .contains("Remove Repository")
        .click();
    });
  });

  it("displays error in modal after add causes an error", function() {
    // We need to add a fixture for this test to pass.
    var url = "http://there-is-no-stopping.us";
    cy
      .route({
        method: "POST",
        url: /repository\/add/,
        status: 409,
        response: {
          message: "Conflict with " + url
        }
      })
      .get(".modal input")
      .eq(0)
      .type("Here we go!")
      .get(".modal input")
      .eq(1)
      .type(url)
      .get(".modal input")
      .eq(2)
      .type("0");
    cy
      .get(".modal .modal-footer .button.button-success")
      .contains("Add")
      .click();

    cy.get(".modal h4.text-danger").should("contain", url);
  });

  // TODO: Turn into unit test
  it("displays generic error in modal if no message is provided", function() {
    cy
      .route({
        method: "POST",
        url: /repository\/add/,
        status: 400,
        response: {}
      })
      .get(".modal input")
      .eq(0)
      .type("Here we go!");
    cy
      .get(".modal input")
      .eq(1)
      .type("http://there-is-no-stopping.us")
      .get(".modal input")
      .eq(2)
      .type("0");
    cy
      .get(".modal .modal-footer .button.button-success")
      .contains("Add")
      .click();

    cy.get(".modal h4.text-danger").should("contain", "An error has occurred");
  });
});
