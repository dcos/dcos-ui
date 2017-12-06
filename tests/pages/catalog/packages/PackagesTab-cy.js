describe("Packages Tab", function() {
  beforeEach(function() {
    cy.configureCluster({
      mesos: "1-task-healthy",
      universePackages: true
    });
  });

  it("should display correct error message for invalid repo uri", function() {
    cy
      .route({
        method: "POST",
        url: /package\/search/,
        status: 400,
        response: {
          type: "RepositoryUriSyntax",
          name: "Invalid",
          message: "The url for Invalid does not have correct syntax"
        }
      })
      .visitUrl({ url: "/catalog/packages", logIn: true });

    cy
      .get(".page-body-content .alert-content")
      .should(
        "contain",
        "The url for Invalid does not have correct syntax. You can go to the Repositories Settings page to change installed repositories."
      );
  });

  it("should display correct message for 'no index' error", function() {
    cy
      .route({
        method: "POST",
        url: /package\/search/,
        status: 400,
        response: {
          type: "IndexNotFound",
          name: "Invalid",
          message: "The index file is missing in Invalid"
        }
      })
      .visitUrl({ url: "/catalog", logIn: true });

    cy
      .get(".page-body-content .alert-content")
      .should(
        "contain",
        "The index file is missing in Invalid. You can go to the Repositories Settings page to change installed repositories."
      );
  });

  it("should display correct message for missing package file", function() {
    cy
      .route({
        method: "POST",
        url: /package\/search/,
        status: 400,
        response: {
          type: "PackageFileMissing",
          name: "Invalid",
          message: "The package file is missing in Invalid"
        }
      })
      .visitUrl({ url: "/catalog", logIn: true });

    cy
      .get(".page-body-content .alert-content")
      .should(
        "contain",
        "The package file is missing in Invalid. You can go to the Repositories Settings page to change installed repositories."
      );
  });

  it("should use default repository name if not provided", function() {
    cy
      .route({
        method: "POST",
        url: /package\/search/,
        status: 400,
        response: {
          type: "PackageFileMissing",
          message: "The package file is missing in a repository"
        }
      })
      .visitUrl({ url: "/catalog", logIn: true });

    cy
      .get(".page-body-content .alert-content")
      .should(
        "contain",
        "The package file is missing in a repository. You can go to the Repositories Settings page to change installed repositories."
      );
  });

  it("should default error message for missing package file", function() {
    cy
      .route({
        method: "POST",
        url: /package\/search/,
        status: 400,
        response: { message: "Some other error" }
      })
      .visitUrl({ url: "/catalog", logIn: true });

    cy.get(".panel-content h3").should("contain", "An Error Occurred");
  });

  context("searching", function() {
    beforeEach(function() {
      cy.visitUrl({ url: "/catalog", logIn: true });
      cy.get("input").type("cass");
    });

    it("should hide certified panels", function() {
      cy.get("h1").contains("Certified").should(function($certifiedHeading) {
        expect($certifiedHeading.length).to.equal(0);
      });
    });

    it("should show only cassandra in panels", function() {
      cy.get(".panel").should(function($panels) {
        expect($panels.length).to.equal(1);
      });
    });
  });

  context("selected packages", function() {
    beforeEach(function() {
      cy.visitUrl({ url: "/catalog", logIn: true });
      cy
        .get("h1")
        .contains("Certified")
        .closest(".pod")
        .find(".panel")
        .as("panels");
    });

    it("should have the first 9 packages as selected", function() {
      cy.get("@panels").should(function($panels) {
        expect($panels.length).to.equal(9);
      });
    });
  });

  context("package panels", function() {
    beforeEach(function() {
      cy.visitUrl({ url: "/catalog", logIn: true });
    });

    it("should open the modal when the panel button is clicked", function() {
      cy.get(".panel").contains("arangodb").click();
      cy.get(".button.button-primary").contains("Review & Run").click();

      cy.get(".modal").should(function($modal) {
        expect($modal.length).to.equal(1);
      });
    });

    it("shouldn't open the modal when the panel is clicked", function() {
      cy.get(".panel").contains("arangodb").click();

      cy.get(".modal").should(function($modal) {
        expect($modal.length).to.equal(0);
      });
    });
  });
});
