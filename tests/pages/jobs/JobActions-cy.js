describe("Job Actions", function() {
  context("Edit Action", function() {
    beforeEach(function() {
      cy.configureCluster({
        jobDetails: true,
        mesos: "1-for-each-health",
        nodeHealth: true
      });
      cy.visitUrl({ url: "/jobs/detail/foo" });

      cy.get(".page-header-actions .dropdown").click();
      cy.get(".dropdown-menu-items")
        .contains("Edit")
        .click();
    });

    it("opens the correct jobs edit modal", function() {
      cy.root()
        .getFormGroupInputFor("Job ID *")
        .should("to.have.value", "foo");
    });

    it("closes modal on successful API request", function() {
      cy.route({
        method: "PUT",
        url: /metronome\/v1\/jobs\/foo/,
        response: [],
        delay: 0
      });
      cy.route({
        method: "PUT",
        url: /metronome\/v1\/jobs\/foo\/schedules\/every-once-in-a-while/,
        response: [],
        delay: 0
      });
      cy.get(".modal .button-primary")
        .contains("Submit")
        .click();
      cy.get(".modal").should("to.have.length", 0);
    });

    it("closes modal on secondary button click", function() {
      cy.get(".modal .button")
        .contains("Cancel")
        .click();
      cy.get(".modal .button")
        .contains("Discard")
        .click();
      cy.get(".modal").should("to.have.length", 0);
    });
  });
});
