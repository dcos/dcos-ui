describe("DirectoryFormModal", () => {
  context("Authentication", () => {
    beforeEach(() => {
      cy.configureCluster({
        mesos: "1-task-healthy",
        plugins: "directories"
      });

      cy.setCookie(
        "dcos-acs-info-cookie",
        btoa(
          `{"uid": "ui-bot", "description": "Bootstrap superuser", "is_remote": false}`
        )
      );

      cy.route(
        /acs\/api\/v1\/users\/ui-bot\/permissions(\?_timestamp=[0-9]+)?$/,
        "fx:acl/superuser"
      );

      cy.route({
        method: "GET",
        url: /acs\/api\/v1\/ldap\/config(\?_timestamp=[0-9]+)?$/,
        status: 400,
        response: {
          code: "ERR_LDAP_CONFIG_NOT_AVAILABLE",
          description: "No LDAP configuration stored yet",
          title: "400 Bad Request"
        }
      });

      // Stub every other route that could give 401
      cy.route(/navstar\/lashup\/key/, "")
        .route(/service\/marathon\/v2\/queue/, "")
        .route("POST", /package\/search/, "");

      cy.visitUrl({ url: "/settings/directory" });
      cy.contains("Add Directory").click();
    });

    it("does not show LDAP credentials form fields when 'Anonymous Bind' is selected", () => {
      cy.get(".multiple-form-modal-sidebar-tabs")
        .contains("Authentication")
        .click();

      cy.get(".form-control-toggle")
        .contains("Anonymous Bind")
        .click();

      cy.get(".row.authentication-method").should("have.length", 3);
    });

    it("does shows LDAP credentials form fields when 'LDAP Credentials' is selected", () => {
      cy.get(".multiple-form-modal-sidebar-tabs")
        .contains("Authentication")
        .click();

      cy.get(".form-control-toggle")
        .contains("LDAP Credentials")
        .click();

      cy.contains("Lookup DN");

      cy.contains("Lookup Password");
    });
  });
});
