const hasRow = (k, v) => {
  cy.get(`.configuration-map-row:contains(${k})`).should("contain", v);
};
describe("UI Settings", () => {
  describe("Versions displayed", () => {
    it("displays UI version details", () => {
      cy.configureCluster({
        plugins: "ui-update-enabled",
        "ui-settings": "default",
      });

      cy.visitUrl({ url: "/settings/ui-settings" });
      cy.get(".breadcrumb__content").contains("UI Settings");

      hasRow("Installed Version", "0.0.0");
      hasRow("Available Version", "0.1.1");
    });

    it("doesn't display update when there is no update", () => {
      cy.configureCluster({
        cosmos: "no-versions",
        plugins: "ui-update-enabled",
        "ui-settings": "default",
      });
      cy.visitUrl({ url: "/settings/ui-settings" });

      hasRow("Installed Version", "0.0.0");
      cy.contains("Available Version").should("not.exist");
    });

    it("displays update when not on default version", () => {
      cy.configureCluster({
        plugins: "ui-update-enabled",
        "ui-settings": "v0.1.0",
      });

      cy.visitUrl({ url: "/settings/ui-settings" });
      hasRow("Available Version", "0.1.1");
    });

    it("displays update when not on default version", () => {
      cy.configureCluster({
        plugins: "ui-update-enabled",
        "ui-settings": "v0.1.1",
      });

      cy.visitUrl({ url: "/settings/ui-settings" });
      cy.contains("Available Version").should("not.exist");
    });

    it("displays fallback ui on cosmos error", () => {
      cy.configureCluster({
        cosmos: "error",
        plugins: "ui-update-enabled",
        "ui-settings": "default",
      });

      cy.visitUrl({ url: "/settings/ui-settings" });

      hasRow("Installed Version", "0.0.0");
      cy.contains("Available Version").should("not.exist");
      cy.get("#uiDetailsRollback").should("not.exist");
    });
  });

  describe("Actions", () => {
    it("Displays Rollback, Update, Refresh", () => {
      cy.configureCluster({
        plugins: "ui-update-enabled",
        "ui-settings": "v0.1.0",
      });

      cy.visitUrl({ url: "/settings/ui-settings" });
      cy.get(".breadcrumb__content").contains("UI Settings");

      cy.wait("@getUiVersion");
      cy.wait("@cosmosListVersions");

      cy.get("#uiDetailsRollback")
        .contains("Rollback")
        .should("not.be.disabled");
      cy.get("#uiDetailsStartUpdate")
        .contains("Start Update")
        .should("not.be.disabled");
      cy.get("#uiDetailsRefreshVersion")
        .contains("Refresh page to load")
        .should("not.be.disabled");
    });

    it("Displays only rollback if version is current", () => {
      cy.configureCluster({
        cosmos: "no-versions",
        plugins: "ui-update-enabled",
        "ui-settings": "default",
      });

      cy.visitUrl({ url: "/settings/ui-settings" });
      cy.get(".breadcrumb__content").contains("UI Settings");

      cy.wait("@getUiVersion");
      cy.wait("@cosmosListVersions");

      cy.get("#uiDetailsRollback").contains("Rollback");
      cy.get("#uiDetailsStartUpdate").should("not.exist");
      cy.get("#uiDetailsRefreshVersion").should("not.exist");
    });

    it("Can perform a version rollback", () => {
      cy.configureCluster({
        cosmos: "no-versions",
        plugins: "ui-update-enabled",
        "update-service": "reset-pass",
        "ui-settings": "v0.1.0",
      });

      cy.visitUrl({ url: "/settings/ui-settings" });
      cy.get(".breadcrumb__content").contains("UI Settings");

      cy.wait("@getUiVersion");
      cy.wait("@cosmosListVersions");

      cy.route({
        method: "GET",
        url: /dcos-ui-update-service\/api\/v1\/version\//,
        response: "fx:ui-settings/default-version",
        headers: {
          "Content-Type": "application/json",
        },
      }).as("getUiVersionRefresh");

      cy.get("#uiDetailsRollback").contains("Rollback").click();

      cy.wait("@resetUiVersion");

      cy.get("#uiDetailsRollback").contains("Rolling back...");
      cy.get("#uiDetailsRollback").should("be.disabled");
      cy.get("#uiDetailsRefreshVersion").should("not.exist");

      cy.wait("@getUiVersionRefresh");

      cy.get("#uiDetailsRollback").contains("Rollback");
      cy.get("#uiDetailsRollback").should("not.be.disabled");
    });

    it("Can handle a rollback failure", () => {
      cy.configureCluster({
        cosmos: "no-versions",
        plugins: "ui-update-enabled",
        "update-service": "reset-fail",
        "ui-settings": "v0.1.0",
      });

      cy.visitUrl({ url: "/settings/ui-settings" });
      cy.get(".breadcrumb__content").contains("UI Settings");

      cy.wait("@getUiVersion");
      cy.wait("@cosmosListVersions");

      cy.get("#uiDetailsRollback").contains("Rollback").click();

      cy.wait("@resetUiVersion");

      cy.wait("@getUiVersion");

      cy.get("#uiDetailsRollback").contains("Rollback Failed!");
      cy.get("#uiDetailsRollback").should("be.disabled");
    });

    it("Can perform a version update", () => {
      cy.configureCluster({
        plugins: "ui-update-enabled",
        "update-service": "update-pass",
        "ui-settings": "default",
      });

      cy.visitUrl({ url: "/settings/ui-settings" });
      cy.get(".breadcrumb__content").contains("UI Settings");

      cy.wait("@getUiVersion");
      cy.wait("@cosmosListVersions");

      // Update Route to return new version
      cy.route({
        method: "GET",
        url: /dcos-ui-update-service\/api\/v1\/version\//,
        response: "fx:ui-settings/version-011",
        headers: {
          "Content-Type": "application/json",
        },
      }).as("getUiVersionRefresh");

      hasRow("Installed Version", "0.0.0");
      hasRow("Available Version", "0.1.1");

      cy.get("#uiDetailsRefreshVersion").should("not.exist");

      cy.get("#uiDetailsStartUpdate").contains("Start Update");
      cy.get("#uiDetailsStartUpdate").click();

      cy.wait("@updateUiVersion");

      cy.get("#uiDetailsStartUpdate").contains("Updating...");
      cy.get("#uiDetailsStartUpdate").should("be.disabled");

      cy.get("#uiDetailsRollback").contains("Rollback");
      cy.get("#uiDetailsRollback").should("be.disabled");

      cy.wait("@getUiVersionRefresh");

      cy.get("#uiDetailsStartUpdate").should("not.exist");

      cy.get("#uiDetailsRefreshVersion").contains("Refresh page to load");
      cy.get("#uiDetailsRefreshVersion").should("not.be.disabled");

      cy.get("#uiDetailsRollback").contains("Rollback");
      cy.get("#uiDetailsRollback").should("not.be.disabled");
    });

    it("Can handle a version update failure", () => {
      cy.configureCluster({
        plugins: "ui-update-enabled",
        "update-service": "update-fail",
        "ui-settings": "default",
      });

      cy.visitUrl({ url: "/settings/ui-settings" });
      cy.get(".breadcrumb__content").contains("UI Settings");

      cy.wait("@getUiVersion");
      cy.wait("@cosmosListVersions");

      hasRow("Installed Version", "0.0.0");
      hasRow("Available Version", "0.1.1");

      cy.get("#uiDetailsStartUpdate")
        .contains("Start Update")
        .should("not.be.disabled")
        .click();

      cy.wait("@updateUiVersion");
      cy.wait("@getUiVersion");

      cy.get("#uiDetailsStartUpdate").contains("Update Failed!");
      cy.get("#uiDetailsStartUpdate").should("be.disabled");

      cy.get("#uiDetailsRollback").contains("Rollback");
      cy.get("#uiDetailsRollback").should("not.be.disabled");
    });
  });
});
