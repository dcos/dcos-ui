describe("Packages Tab", () => {
  beforeEach(() => {
    cy.configureCluster({
      mesos: "1-task-healthy",
      universePackages: true,
    });
  });

  it("displays correct error message for invalid repo uri", () => {
    cy.route({
      method: "POST",
      url: /package\/search/,
      status: 400,
      response: {
        type: "RepositoryUriSyntax",
        name: "Invalid",
        message: "The url for Invalid does not have correct syntax",
      },
    }).visitUrl({ url: "/catalog/packages", logIn: true });

    cy.get(".page-body-content .infoBoxWrapper").should(
      "contain",
      "The url for Invalid does not have correct syntax."
    );

    cy.get(".page-body-content .infoBoxWrapper").should(
      "contain",
      "You can go to the Repositories Settings page to change installed repositories."
    );
  });

  it("displays correct message for 'no index' error", () => {
    cy.route({
      method: "POST",
      url: /package\/search/,
      status: 400,
      response: {
        type: "IndexNotFound",
        name: "Invalid",
        message: "The index file is missing in Invalid",
      },
    }).visitUrl({ url: "/catalog", logIn: true });

    cy.get(".page-body-content .infoBoxWrapper").should(
      "contain",
      "The index file is missing in Invalid."
    );

    cy.get(".page-body-content .infoBoxWrapper").should(
      "contain",
      "You can go to the Repositories Settings page to change installed repositories."
    );
  });

  it("displays correct message for missing package file", () => {
    cy.route({
      method: "POST",
      url: /package\/search/,
      status: 400,
      response: {
        type: "PackageFileMissing",
        name: "Invalid",
        message: "The package file is missing in Invalid",
      },
    }).visitUrl({ url: "/catalog", logIn: true });

    cy.get(".page-body-content .infoBoxWrapper").should(
      "contain",
      "The package file is missing in Invalid."
    );

    cy.get(".page-body-content .infoBoxWrapper").should(
      "contain",
      "You can go to the Repositories Settings page to change installed repositories."
    );
  });

  it("uses default repository name if not provided", () => {
    cy.route({
      method: "POST",
      url: /package\/search/,
      status: 400,
      response: {
        type: "PackageFileMissing",
        message: "The package file is missing in a repository",
      },
    }).visitUrl({ url: "/catalog", logIn: true });

    cy.get(".page-body-content .infoBoxWrapper").should(
      "contain",
      "The package file is missing in a repository."
    );
  });

  it("shows default error message for missing package file", () => {
    cy.route({
      method: "POST",
      url: /package\/search/,
      status: 400,
      response: { message: "Some other error" },
    }).visitUrl({ url: "/catalog", logIn: true });

    cy.get(".panel-content h2").should("contain", "An Error Occurred");
  });

  it("shows error message when the response is empty", () => {
    cy.route({
      method: "POST",
      url: /package\/search/,
      status: 400,
      response: {},
    }).visitUrl({ url: "/catalog", logIn: true });

    cy.get(".panel-content h2").should("contain", "An Error Occurred");
    cy.get(".errorsAlert-message").contains(
      "Looks Like Something is Wrong. Please try again."
    );
  });

  context("searching", () => {
    beforeEach(() => {
      cy.visitUrl({ url: "/catalog", logIn: true });
      cy.get("button").contains("All").click();
      cy.get("input").type("bitbuck");
    });

    it("hides certified panels", () => {
      cy.get("h1").contains("Certified").should("not.exist");
    });

    it("shows only bitbucket in panels", () => {
      cy.get(".panel").should("exist");
    });

    it("shows message when no matching packages found", () => {
      cy.get("input").type("notfound");
      cy.contains("No results were found for your search");
    });
  });

  context("selected packages", () => {
    beforeEach(() => {
      cy.visitUrl({ url: "/catalog", logIn: true });
      cy.get("h1")
        .contains("Certified")
        .closest(".pod")
        .find(".panel")
        .as("panels");
    });

    it("has the first 9 packages as selected", () => {
      cy.get("@panels").should(($panels) => {
        expect($panels.length).to.equal(9);
      });
    });
  });

  context("package panels", () => {
    beforeEach(() => {
      cy.visitUrl({ url: "/catalog", logIn: true });
    });

    it("opens the modal when the panel button is clicked", () => {
      cy.get(".panel").contains("arangodb").click();
      cy.get(".button.button-primary").contains("Review & Run").click();

      cy.get(".modal").should(($modal) => {
        expect($modal.length).to.equal(1);
      });
    });

    it("doesn't open the modal when the panel is clicked", () => {
      cy.get(".panel").contains("arangodb").click();

      cy.get(".modal").should(($modal) => {
        expect($modal.length).to.equal(0);
      });
    });
  });

  context("respect DCOS version", () => {
    beforeEach(() => {
      cy.route(/dcos-version/, {
        version: "1.6",
        "dcos-image-commit": "null",
        "bootstrap-id": "null",
      }).visitUrl({ url: "/catalog", logIn: true });
    });

    it("cant install package because of DCOS version", () => {
      cy.get(".panel").contains("arangodb").click();
      cy.get(".button.button-primary.disabled").contains("Review & Run");
    });
  });
});
