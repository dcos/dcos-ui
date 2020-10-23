describe("Edit Job", () => {
  beforeEach(() => {
    cy.configureCluster({ jobDetails: true, mesos: "1-for-each-health" });
    cy.route({ method: "PUT", url: /metronome\/v1\/jobs\/foo/, response: [] });

    cy.visitUrl({ url: "/jobs/detail/foo" });
    cy.get(".page-header-actions .dropdown").click();
    cy.get(".dropdown-menu-items").contains("Edit").click();
  });

  it("opens and edits the correct job", () => {
    cy.getFormGroupInputFor("Job ID *").should("have.value", "foo");
    cy.get("input[name='job.id']").should("be.disabled");

    cy.log("check that we don't suggest the current job as a dependency");
    cy.get("label:contains(Dependencies)").click();
    cy.get("[data-cy=PopoverListItem]").should("contain", "group-foo");
    cy.get("[data-cy=PopoverListItem]").should("not.contain", /^foo$/);

    cy.get(".modal .button-primary").contains("Submit").click();
    cy.get(".modal").should("have.length", 0);
  });

  it("closes modal on secondary button click", () => {
    cy.get(".modal .button").contains("Cancel").click();
    cy.get(".modal .button").contains("Discard").click();
    cy.get(".modal").should("have.length", 0);
  });
});
