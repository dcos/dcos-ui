it("Jobs Overview", () => {
  cy.configureCluster({ mesos: "1-for-each-health", nodeHealth: true });

  // //////////////////////////////////////////////////////////////////////////
  //                                COPS-6139                                //
  // //////////////////////////////////////////////////////////////////////////
  cy.log("does not make up group names (COPS-6139)");
  cy.visitUrl({ url: "/jobs/overview/some.group" });
  cy.get("[role=grid] [role=row]").contains("foo");
  cy.get("[role=grid] [role=row]").should("not.contain", "woops");

  // //////////////////////////////////////////////////////////////////////////
  //                                 FILTERS                                 //
  // //////////////////////////////////////////////////////////////////////////
  cy.log("filters correctly on search string");
  cy.visitUrl({ url: "/jobs/overview" });
  cy.get("[role=grid] [role=row]").should("have.length", 5);

  cy.log("sets the correct search string and filters");
  cy.get(".filter-input-text").type("foo");
  cy.location("hash").should("contain", "?searchString=foo");
  cy.get("[role=grid] [role=row]").should("have.length", 3);

  cy.log("resets the filter");
  cy.get(".form-control-group-add-on").last().click();
  cy.location("hash").should("not.contain", "?");
  cy.get("[role=grid] [role=row]").should("have.length", 5);

  // //////////////////////////////////////////////////////////////////////////
  //                                 CONTENT                                 //
  // //////////////////////////////////////////////////////////////////////////
  cy.get("[role=grid] [role=row]").should(($tableRows) => {
    expect($tableRows[1].textContent).to.equal("group");

    expect($tableRows[3].textContent).to.contain("Scheduled");
    expect($tableRows[4].textContent).to.contain("Running");

    expect($tableRows[3].textContent).to.contain("Failed");
    expect($tableRows[4].textContent).to.contain("Success");
  });

  cy.log("does not show duplicate jobs inside group");
  cy.get("[role=grid]").contains("group").click();
  // It should contain group.alpha and group.beta, but not group-foo.
  cy.get("[role=grid] [role=row]").should("have.length", 3);
});
