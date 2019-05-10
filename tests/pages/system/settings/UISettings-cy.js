describe("UI Settings", function() {
  if (!Cypress.env("FULL_INTEGRATION_TEST")) {
    describe("Versions displayed", function() {
      it("displays UI version details", function() {
        cy.configureCluster({
          plugins: "ui-update-enabled",
          "ui-settings": "default"
        });

        cy.visitUrl({ url: "/settings/ui-settings" });
        cy.get(".breadcrumb__content").contains("UI Settings");

        cy.wait("@getUiVersion");
        cy.wait("@cosmosListVersions");

        cy.get("div.configuration-map").as("dcosUIDetails");

        cy.get("@dcosUIDetails")
          .configurationMapValue("Installed Version")
          .contains("0.0.0");

        cy.get("@dcosUIDetails")
          .configurationMapValue("Available Version")
          .contains("0.1.1");
      });

      it("doesn't display update when there is no update", function() {
        cy.configureCluster({
          cosmos: "no-versions",
          plugins: "ui-update-enabled",
          "ui-settings": "default"
        });

        cy.visitUrl({ url: "/settings/ui-settings" });
        cy.get(".breadcrumb__content").contains("UI Settings");

        cy.wait("@getUiVersion");
        cy.wait("@cosmosListVersions");

        cy.get("div.configuration-map").as("dcosUIDetails");

        cy.get("@dcosUIDetails")
          .configurationMapValue("Installed Version")
          .contains("0.0.0");

        cy.get("@dcosUIDetails")
          .configurationMapValue("Available Version")
          .should("not.exist");
      });

      it("displays update when not on default version", function() {
        cy.configureCluster({
          plugins: "ui-update-enabled",
          "ui-settings": "v0.1.0"
        });

        cy.visitUrl({ url: "/settings/ui-settings" });
        cy.get(".breadcrumb__content").contains("UI Settings");

        cy.wait("@getUiVersion");
        cy.wait("@cosmosListVersions");

        cy.get("div.configuration-map").as("dcosUIDetails");

        cy.get("@dcosUIDetails")
          .configurationMapValue("Available Version")
          .contains("0.1.1");
      });

      it("displays update when not on default version", function() {
        cy.configureCluster({
          plugins: "ui-update-enabled",
          "ui-settings": "v0.1.1"
        });

        cy.visitUrl({ url: "/settings/ui-settings" });
        cy.get(".breadcrumb__content").contains("UI Settings");

        cy.wait("@getUiVersion");
        cy.wait("@cosmosListVersions");

        cy.get("div.configuration-map").as("dcosUIDetails");

        cy.get("@dcosUIDetails")
          .configurationMapValue("Available Version")
          .should("not.exist");
      });

      it("displays fallback ui on cosmos error", function() {
        cy.configureCluster({
          cosmos: "error",
          plugins: "ui-update-enabled",
          "ui-settings": "default"
        });

        cy.visitUrl({ url: "/settings/ui-settings" });
        cy.get(".breadcrumb__content").contains("UI Settings");

        cy.wait("@cosmosListVersions");

        cy.wait(500);

        cy.get("div.configuration-map").as("dcosUIDetails");

        cy.get("@dcosUIDetails")
          .configurationMapValue("Installed Version")
          .contains("0.0.0");

        cy.get("@dcosUIDetails")
          .configurationMapValue("Available Version")
          .should("not.exist");

        cy.get("#uiDetailsRollback").should("not.exist");
      });
    });

    describe("Actions", function() {
      it("Displays Rollback, Update, Refresh", function() {
        cy.configureCluster({
          plugins: "ui-update-enabled",
          "ui-settings": "v0.1.0"
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

      it("Displays only rollback if version is current", function() {
        cy.configureCluster({
          cosmos: "no-versions",
          plugins: "ui-update-enabled",
          "ui-settings": "default"
        });

        cy.visitUrl({ url: "/settings/ui-settings" });
        cy.get(".breadcrumb__content").contains("UI Settings");

        cy.wait("@getUiVersion");
        cy.wait("@cosmosListVersions");

        cy.get("#uiDetailsRollback").contains("Rollback");
        cy.get("#uiDetailsStartUpdate").should("not.exist");
        cy.get("#uiDetailsRefreshVersion").should("not.exist");
      });

      it("Can perform a version rollback", function() {
        cy.configureCluster({
          cosmos: "no-versions",
          plugins: "ui-update-enabled",
          "update-service": "reset-pass",
          "ui-settings": "v0.1.0"
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
            "Content-Type": "application/json"
          }
        }).as("getUiVersionRefresh");

        cy.get("#uiDetailsRollback")
          .contains("Rollback")
          .click();

        cy.wait("@resetUiVersion");

        cy.get("#uiDetailsRollback").contains("Rolling back...");
        cy.get("#uiDetailsRollback").should("be.disabled");
        cy.get("#uiDetailsRefreshVersion").should("not.exist");

        cy.wait("@getUiVersionRefresh", { timeout: 65000 });

        cy.get("#uiDetailsRollback").contains("Rollback");
        cy.get("#uiDetailsRollback").should("not.be.disabled");
      });

      it("Can handle a rollback failure", function() {
        cy.configureCluster({
          cosmos: "no-versions",
          plugins: "ui-update-enabled",
          "update-service": "reset-fail",
          "ui-settings": "v0.1.0"
        });

        cy.visitUrl({ url: "/settings/ui-settings" });
        cy.get(".breadcrumb__content").contains("UI Settings");

        cy.wait("@getUiVersion");
        cy.wait("@cosmosListVersions");

        cy.get("#uiDetailsRollback")
          .contains("Rollback")
          .click();

        cy.wait("@resetUiVersion");

        cy.wait("@getUiVersion", { timeout: 65000 });

        cy.get("#uiDetailsRollback").contains("Rollback Failed!");
        cy.get("#uiDetailsRollback").should("be.disabled");
      });

      it("Can perform a version update", function() {
        cy.configureCluster({
          plugins: "ui-update-enabled",
          "update-service": "update-pass",
          "ui-settings": "default"
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
            "Content-Type": "application/json"
          }
        }).as("getUiVersionRefresh");

        cy.get("div.configuration-map").as("dcosUIDetails");

        cy.get("@dcosUIDetails")
          .configurationMapValue("Installed Version")
          .contains("0.0.0");

        cy.get("@dcosUIDetails")
          .configurationMapValue("Available Version")
          .contains("0.1.1");

        cy.get("#uiDetailsRefreshVersion").should("not.exist");

        cy.get("#uiDetailsStartUpdate").contains("Start Update");
        cy.get("#uiDetailsStartUpdate").click();

        cy.wait("@updateUiVersion");

        cy.get("#uiDetailsStartUpdate").contains("Updating...");
        cy.get("#uiDetailsStartUpdate").should("be.disabled");

        cy.get("#uiDetailsRollback").contains("Rollback");
        cy.get("#uiDetailsRollback").should("be.disabled");

        cy.wait("@getUiVersionRefresh", { timeout: 65000 });

        cy.get("#uiDetailsStartUpdate").should("not.exist");

        cy.get("#uiDetailsRefreshVersion").contains("Refresh page to load");
        cy.get("#uiDetailsRefreshVersion").should("not.be.disabled");

        cy.get("#uiDetailsRollback").contains("Rollback");
        cy.get("#uiDetailsRollback").should("not.be.disabled");
      });

      it("Can handle a version update failure", function() {
        cy.configureCluster({
          plugins: "ui-update-enabled",
          "update-service": "update-fail",
          "ui-settings": "default"
        });

        cy.visitUrl({ url: "/settings/ui-settings" });
        cy.get(".breadcrumb__content").contains("UI Settings");

        cy.wait("@getUiVersion");
        cy.wait("@cosmosListVersions");

        cy.get("div.configuration-map").as("dcosUIDetails");

        cy.get("@dcosUIDetails")
          .configurationMapValue("Installed Version")
          .contains("0.0.0");

        cy.get("@dcosUIDetails")
          .configurationMapValue("Available Version")
          .contains("0.1.1");

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
  }
});
