import { getSearchParameter } from "../../_support/utils/testUtil";

describe("Service Search Filters", function() {
  context("Filters services table", function() {
    beforeEach(function() {
      cy.configureCluster({
        mesos: "1-for-each-health",
        nodeHealth: true
      });
      cy.visitUrl({ url: "/services/overview" });
    });

    it("filters correctly on search string", function() {
      cy.get("tbody tr").should("to.have.length", 6);
      cy.get(".filter-input-text").as("filterInputText");
      cy.get("@filterInputText").type("unhealthy");
      cy.get("tbody tr").should("to.have.length", 3);
    });

    it("sets the correct search string filter query params", function() {
      cy.get(".filter-input-text").as("filterInputText");
      cy.get("@filterInputText").type("cassandra-healthy");
      cy.hash().should(function(hash) {
        const searchParameter = getSearchParameter(hash);
        expect(decodeURIComponent(searchParameter)).to.equal(
          "q=cassandra-healthy"
        );
      });
    });

    it("will clear filters by clear all link click", function() {
      cy.get(".filter-input-text").as("filterInputText");
      cy.get("@filterInputText").type("cassandra-healthy");
      cy
        .get("@filterInputText")
        .siblings(".form-control-group-add-on")
        .eq(1)
        .click();

      cy.hash().should(function(hash) {
        const searchParameter = getSearchParameter(hash);
        expect(decodeURIComponent(searchParameter)).to.equal("q=");
      });
      cy.get("tbody tr").should("to.have.length", 6);
    });
  });
});
