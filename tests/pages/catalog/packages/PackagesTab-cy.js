describe("Packages Tab", function() {
  beforeEach(function() {
    cy.configureCluster({
      mesos: "1-task-healthy",
      universePackages: true
    });
  });

  it("displays correct error message for invalid repo uri", function() {
    cy.route({
      method: "POST",
      url: /package\/search/,
      status: 400,
      response: {
        type: "RepositoryUriSyntax",
        name: "Invalid",
        message: "The url for Invalid does not have correct syntax"
      }
    }).visitUrl({ url: "/catalog/packages", logIn: true });

    cy.get(".page-body-content .message").should(
      "contain",
      "The url for Invalid does not have correct syntax. You can go to the Repositories Settings page to change installed repositories."
    );
  });

  it("displays correct message for 'no index' error", function() {
    cy.route({
      method: "POST",
      url: /package\/search/,
      status: 400,
      response: {
        type: "IndexNotFound",
        name: "Invalid",
        message: "The index file is missing in Invalid"
      }
    }).visitUrl({ url: "/catalog", logIn: true });

    cy.get(".page-body-content .message").should(
      "contain",
      "The index file is missing in Invalid. You can go to the Repositories Settings page to change installed repositories."
    );
  });

  it("displays correct message for missing package file", function() {
    cy.route({
      method: "POST",
      url: /package\/search/,
      status: 400,
      response: {
        type: "PackageFileMissing",
        name: "Invalid",
        message: "The package file is missing in Invalid"
      }
    }).visitUrl({ url: "/catalog", logIn: true });

    cy.get(".page-body-content .message").should(
      "contain",
      "The package file is missing in Invalid. You can go to the Repositories Settings page to change installed repositories."
    );
  });

  it("uses default repository name if not provided", function() {
    cy.route({
      method: "POST",
      url: /package\/search/,
      status: 400,
      response: {
        type: "PackageFileMissing",
        message: "The package file is missing in a repository"
      }
    }).visitUrl({ url: "/catalog", logIn: true });

    cy.get(".page-body-content .message").should(
      "contain",
      "The package file is missing in a repository. You can go to the Repositories Settings page to change installed repositories."
    );
  });

  it("shows default error message for missing package file", function() {
    cy.route({
      method: "POST",
      url: /package\/search/,
      status: 400,
      response: { message: "Some other error" }
    }).visitUrl({ url: "/catalog", logIn: true });

    cy.get(".panel-content h2").should("contain", "An Error Occurred");
  });

  context("searching", function() {
    beforeEach(function() {
      cy.visitUrl({ url: "/catalog", logIn: true });
      cy.get("input").type("cass");
    });

    it("hides certified panels", function() {
      cy.get("h1")
        .contains("Certified")
        .should(function($certifiedHeading) {
          expect($certifiedHeading.length).to.equal(0);
        });
    });

    it("shows only cassandra in panels", function() {
      cy.get(".panel").should(function($panels) {
        expect($panels.length).to.equal(1);
      });
    });

    it("shows message when no matching packages found", function() {
      cy.get("input").type("notfound");
      cy.contains("No results were found for your search");
    });
  });

  context("selected packages", function() {
    beforeEach(function() {
      cy.visitUrl({ url: "/catalog", logIn: true });
      cy.get("h1")
        .contains("Certified")
        .closest(".pod")
        .find(".panel")
        .as("panels");
    });

    it("has the first 9 packages as selected", function() {
      cy.get("@panels").should(function($panels) {
        expect($panels.length).to.equal(9);
      });
    });
  });

  context("package panels", function() {
    beforeEach(function() {
      cy.visitUrl({ url: "/catalog", logIn: true });
    });

    it("opens the modal when the panel button is clicked", function() {
      cy.get(".panel")
        .contains("arangodb")
        .click();
      cy.get(".button.button-primary")
        .contains("Review & Run")
        .click();

      cy.get(".modal").should(function($modal) {
        expect($modal.length).to.equal(1);
      });
    });

    it("doesn't open the modal when the panel is clicked", function() {
      cy.get(".panel")
        .contains("arangodb")
        .click();

      cy.get(".modal").should(function($modal) {
        expect($modal.length).to.equal(0);
      });
    });
  });

  context("respect DCOS version", function() {
    beforeEach(function() {
      cy.route(/dcos-version/, {
        version: "1.6",
        "dcos-image-commit": "null",
        "bootstrap-id": "null"
      }).visitUrl({ url: "/catalog", logIn: true });
    });

    it("cant install package because of DCOS version", function() {
      cy.get(".panel")
        .contains("arangodb")
        .click();
      cy.get(".button.button-primary")
        .contains("Review & Run")
        .parent()
        .should("be.disabled");
    });
  });
});
