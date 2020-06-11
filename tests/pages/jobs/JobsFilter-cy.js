describe("Job Search Filters", () => {
  context("Filters jobs table", () => {
    beforeEach(() => {
      cy.configureCluster({ mesos: "1-for-each-health", nodeHealth: true });
      cy.visitUrl({ url: "/jobs/overview" });
    });

    it("filters correctly on search string", () => {
      cy.get("tbody tr:visible").should("to.have.length", 4);
      cy.get(".filter-input-text").type("foo");
      cy.get("tbody tr:visible").should("to.have.length", 2);
    });

    it("sets the correct search string filter query params", () => {
      cy.get(".filter-input-text").type("foo");
      cy.location()
        .its("href")
        .should((href) => {
          const queries = href.split("?")[1];
          expect(decodeURIComponent(queries)).to.equal("searchString=foo");
        });
    });

    it("will clear filters by clear all link click", () => {
      cy.get(".filter-input-text").type("foo");
      cy.get(".form-control-group-add-on").last().click();
      cy.location()
        .its("href")
        .should((href) => {
          const queries = href.split("?")[1];
          expect(queries).to.equal(undefined);
        });
      cy.get("tbody tr:visible").should("to.have.length", 4);
    });
  });
});
