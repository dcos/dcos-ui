describe("Jobs Overview", () => {
  context("Jobs page loads correctly", () => {
    beforeEach(() => {
      cy.configureCluster({
        mesos: "1-for-each-health",
        nodeHealth: true,
      });
      cy.visitUrl({ url: "/jobs/overview" });
    });

    it("displays jobs overview page", () => {
      cy.get("tbody tr:visible").should("to.have.length", 3);
    });

    it("does not show status or last run for groups", () => {
      cy.get("tbody tr:visible").should(($tableRows) => {
        expect($tableRows[0].children[1].textContent).to.equal("");
        expect($tableRows[0].children[2].textContent).to.equal("");
      });
    });

    it("displays the proper job status", () => {
      cy.get("tbody tr:visible").should(($tableRows) => {
        expect($tableRows[1].children[1].textContent).to.equal("Scheduled");
        expect($tableRows[2].children[1].textContent).to.equal("Running");
      });
    });

    it("displays the proper last run status", () => {
      cy.get("tbody tr:visible").should(($tableRows) => {
        expect($tableRows[1].children[2].textContent).to.equal("Failed");
        expect($tableRows[2].children[2].textContent).to.equal("Success");
      });
    });

    it("does not show duplicate jobs inside group", () => {
      cy.get(".table-cell-link-primary").contains("group").click();
      // It should contain group.alpha and group.beta,
      // but not group-foo.
      cy.get("tbody tr:visible").should("to.have.length", 2);
    });
  });
});
