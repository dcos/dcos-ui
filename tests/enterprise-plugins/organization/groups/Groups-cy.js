describe("Groups", () => {
  context("Add Groups", () => {
    beforeEach(() => {
      cy.configureCluster({
        mesos: "1-task-healthy",
        plugins: "organization"
      });

      cy.route(
        "PUT",
        /acs\/api\/v1\/groups\/mygroup(\?_timestamp=[0-9]+)?$/,
        ""
      );

      cy.route(
        "GET",
        /acs\/api\/v1\/groups(\?_timestamp=[0-9]+)?$/,
        "fx:acl/groups-unicode"
      );
    });

    it("Validates when group name is blank", () => {
      cy.visitUrl({ url: "/organization/groups" });

      cy.get("button.button-primary-link").click();

      cy.get('.form-control[name="description"]')
        .type("{selectall}{backspace}")
        .type("{selectall}{backspace}");

      cy.get(".modal-footer button.button-primary")
        .contains("Create")
        .click();

      cy.get(".form-control-feedback").should($p => {
        // Should have found 2 elements
        expect($p.eq(0)).to.have.text("Field cannot be empty.");
      });
    });

    it("Can add new groups", () => {
      cy.visitUrl({ url: "/organization/groups" });

      cy.get("button.button-primary-link").click();

      cy.get('.form-control[name="description"]')
        .type("{selectall}{backspace}")
        .type("{selectall}{backspace}")
        .type("mygroup");

      cy.get(".modal-footer button.button-primary")
        .contains("Create")
        .click();
    });
  });
});
