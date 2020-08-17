describe("Jobs", () => {
  it("creates and deletes a job", () => {
    cy.visitUrl("jobs/overview");
    const jobName = "ucr";
    const cmdline = "while true; do echo 'test' ; sleep 100 ; done";

    // ////////////////////////////////////////////////////////////////////////
    //                                 CREATE                                //
    // ////////////////////////////////////////////////////////////////////////
    cy.contains("Create a Job").click();
    cy.get(".modal-header").contains("New Job");
    cy.getFormGroupInputFor("Job ID *").retype(jobName);
    cy.getFormGroupInputFor("CPUs *").type("{selectall}0.5");
    cy.getFormGroupInputFor("Mem (MiB) *").type("{selectall}32");
    cy.get("label").contains("Container Image").click();
    cy.getFormGroupInputFor("Command").type(cmdline);
    cy.getFormGroupInputFor("Container Image *").type("nginx");
    cy.contains("Submit").click();

    // ////////////////////////////////////////////////////////////////////////
    //                              TEST FIELDS                              //
    // ////////////////////////////////////////////////////////////////////////
    cy.get("[role=grid] a").contains(jobName).click();
    cy.get(".page-header-actions .dropdown").click();
    cy.get(".dropdown-menu-items").contains("Edit").click();
    cy.getFormGroupInputFor("Job ID *").should("have.value", jobName);
    cy.getFormGroupInputFor("CPUs *").should("have.value", "0.5");
    cy.getFormGroupInputFor("Mem (MiB) *").should("have.value", "32");
    cy.getFormGroupInputFor("Command").should("have.value", cmdline);
    cy.getFormGroupInputFor("Container Image *").should("have.value", "nginx");

    // ////////////////////////////////////////////////////////////////////////
    //                                 DELETE                                //
    // ////////////////////////////////////////////////////////////////////////
    cy.visitUrl(`jobs/overview`);
    cy.get("[role=grid] a").contains(jobName).click();
    cy.get(".page-header-actions .dropdown")
      .click()
      .get(".dropdown-menu-items")
      .contains("Delete")
      .click();
    cy.get(".modal .button-danger").contains("Delete Job").click();

    // Switch to the group that will contain the service
    cy.get("[role=grid]").should("not.contain", jobName);
  });
});
