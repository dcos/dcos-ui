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
      .visitUrl({ url: "/universe/packages", logIn: true });

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
      .visitUrl({ url: "/universe", logIn: true });

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
      .visitUrl({ url: "/universe", logIn: true });

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
      .visitUrl({ url: "/universe", logIn: true });

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
      .visitUrl({ url: "/universe", logIn: true });

    cy.get(".panel-content h3").should("contain", "An Error Occurred");
  });

  context("searching", function() {
    beforeEach(function() {
      cy.visitUrl({ url: "/universe", logIn: true });
      cy.get("input").type("cass");
    });

    it("should hide selected panels", function() {
      cy.get(".panel").should(function($panels) {
        expect($panels.length).to.equal(0);
      });
    });

    it("should should only cassandra in table", function() {
      cy.get("tr").should(function($rows) {
        expect($rows.length).to.equal(4);
      });
    });
  });

  context("selected packages", function() {
    beforeEach(function() {
      cy.visitUrl({ url: "/universe", logIn: true });
      cy.get(".panel").as("panels");
    });

    it("should have the first 9 packages as selected", function() {
      cy.get("@panels").should(function($panels) {
        expect($panels.length).to.equal(9);
      });
    });
  });

  context("package panels", function() {
    beforeEach(function() {
      cy.visitUrl({ url: "/universe", logIn: true });
    });

    it("should open the modal when the panel button is clicked", function() {
      cy.get(".panel:first .button").click();

      cy.get(".modal").should(function($modal) {
        expect($modal.length).to.equal(1);
      });
    });

    it("shouldn't open the modal when the panel is clicked", function() {
      cy.get(".panel:first").click();

      cy.get(".modal").should(function($modal) {
        expect($modal.length).to.equal(0);
      });
    });
  });

  context("package table", function() {
    beforeEach(function() {
      cy.visitUrl({ url: "/universe", logIn: true });
    });

    it("should show the very last item in the table", function() {
      // Ensure table has rendered before beginning
      cy.get("table").get(".page-body").then(function($pageBodyResults) {
        const $pageBody = $pageBodyResults.get(0);
        // Adjust page-body for option (Mac OS)
        // 'Show scroll bars: Automatically based on mouse or trackpad'
        $pageBody.scrollTop = $pageBody.scrollHeight - $pageBody.clientHeight;
        cy.get(".page-body .gm-scroll-view").then(function($scrolViewResults) {
          const $gmScrolView = $scrolViewResults.get(0);
          // Adjust page-body for option (Mac OS)
          // 'Show scroll bars: Always'
          $gmScrolView.scrollTop =
            $gmScrolView.scrollHeight - $gmScrolView.clientHeight;
          cy.get("table").contains("zeppelin");
        });
      });
    });
  });
});
