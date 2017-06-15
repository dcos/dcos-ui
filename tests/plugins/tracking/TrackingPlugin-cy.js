xdescribe("Tracking Plugin Enabled [02w]", function() {
  beforeEach(function() {
    cy
      .configureCluster({
        mesos: "1-task-healthy",
        acl: true,
        plugins: "tracking-enabled"
      })
      .visitUrl({ url: "/", identify: true });
  });

  context("Sidebar [02x]", function() {
    it("should not disable cli in instructions [0df]", function() {
      cy.get(".sidebar-footer").find(".button").last().click();

      cy
        .get(".install-cli-modal-content pre")
        .should(
          "not.contain",
          "https://downloads.dcos.io/dcos-cli/install-optout.sh"
        );
      cy
        .get(".install-cli-modal-content pre")
        .should("not.contain", "./install-optout.sh");
    });
  });
});

xdescribe("Tracking Plugin Disabled [03d]", function() {
  beforeEach(function() {
    cy
      .configureCluster({
        mesos: "1-task-healthy",
        acl: true,
        plugins: "tracking-disabled"
      })
      .clearLocalStorage()
      .visitUrl({ url: "/" });
  });

  context("Sidebar [03c]", function() {
    it("should have no sidebar icons [03e]", function() {
      cy.get(".sidebar-footer").find(".button").should("to.have.length", 2);
    });

    it("should disable cli in instructions [0de]", function() {
      cy.get(".sidebar-footer").find(".button").last().click();

      cy
        .get(".install-cli-modal-content pre")
        .should(
          "contain",
          "https://downloads.dcos.io/dcos-cli/install-optout.sh"
        );
      cy
        .get(".install-cli-modal-content pre")
        .should("contain", "./install-optout.sh");
    });
  });

  context("Welcome Modal [03f]", function() {
    it("should not show modal when no email in localStorage [03g]", function() {
      cy.get(".modal").should("not");
    });

    context("Email in localStorage [03h]", function() {
      beforeEach(function() {
        cy.visitUrl({ url: "/", identify: true, fakeAnalytics: true });
      });

      it("should not show modal when 'email' in localStorage [03i]", function() {
        cy.get(".modal").should("not");
      });
    });
  });
});
