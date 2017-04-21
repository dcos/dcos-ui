describe("Job Search Filters", function() {
  context("Filters jobs table", function() {
    beforeEach(function() {
      cy.configureCluster({
        mesos: "1-for-each-health",
        nodeHealth: true
      });
      cy.visitUrl({ url: "/jobs" });
    });

    it("filters correctly on search string", function() {
      cy.get("tbody tr:visible").should("to.have.length", 3);
      cy.get(".filter-input-text").type("foo");
      cy.get("tbody tr:visible").should("to.have.length", 1);
    });

    xit("sets the correct search string filter query params", function() {
      cy.get(".filter-input-text").type("foo");
      cy.location().its("href").should(function(href) {
        var queries = href.split("?")[1];
        expect(decodeURIComponent(queries)).to.equal("searchString=foo");
      });
    });

    xit("will clear filters by clear all link click", function() {
      cy.get(".filter-input-text").type("foo");
      cy.get(".form-control-group-add-on").last().click();
      cy.location().its("href").should(function(href) {
        var queries = href.split("?")[1];
        expect(queries).to.equal(undefined);
      });
      cy.get("tbody tr:visible").should("to.have.length", 3);
    });
  });
});
