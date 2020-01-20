describe("Group Detail", () => {
  context("Add Groups/Users/Membership", () => {
    beforeEach(() => {
      cy.configureCluster({
        mesos: "1-task-healthy",
        plugins: "organization"
      });

      // Stub group/user API requests
      cy.route(
        /acs\/api\/v1\/groups\/olis\/permissions(\?_timestamp=[0-9]+)?$/,
        "fx:acl/group-permissions"
      );

      cy.route(
        /acs\/api\/v1\/groups\/olis\/users(\?_timestamp=[0-9]+)?$/,
        "fx:acl/group-users"
      );

      cy.route(/acs\/api\/v1\/groups\/olis\/users\?type=service$/, []);

      cy.route(
        /acs\/api\/v1\/groups(\?_timestamp=[0-9]+)?$/,
        "fx:acl/groups-unicode"
      );

      cy.route(
        /acs\/api\/v1\/groups\/olis(\?_timestamp=[0-9]+)?$/,
        "fx:acl/group-unicode"
      );

      cy.route(
        /acs\/api\/v1\/users(\?_timestamp=[0-9]+)?$/,
        "fx:acl/users-unicode"
      );

      // Stub add user to group request
      cy.route(
        "PUT",
        /acs\/api\/v1\/groups\/olis\/users\/[a-f0-9-]+(\?_timestamp=[0-9]+)?$/,
        "successful"
      ).as("addUser");
    });

    it("Can add users to groups", () => {
      cy.visitUrl({ url: "/organization/groups/olis" });

      cy.get(".menu-tabbed-item-label")
        .contains("Users")
        .click();

      // Opens list of users to add
      cy.get(".rbt-input-main").focus();

      // Add first user
      cy.get(".rbt-menu li")
        .should("to.be.visible")
        .eq(0)
        .click();

      // Assert that add user to group API was called
      cy.wait("@addUser")
        .its("response.body")
        .should("equal", "successful");
    });
  });
});
