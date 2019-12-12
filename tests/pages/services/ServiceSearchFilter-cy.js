import { getSearchParameter } from "../../_support/utils/testUtil";

describe("Service Search Filters", () => {
  context("Filters services table", () => {
    beforeEach(() => {
      cy.configureCluster({
        mesos: "1-for-each-health",
        nodeHealth: true
      });
      cy.visitUrl({ url: "/services/overview" });
    });

    it("filters correctly on search string", () => {
      cy.get(
        ".BottomLeftGrid_ScrollWrapper .ReactVirtualized__Grid__innerScrollContainer"
      )
        .children()
        .should("to.have.length", 4);
      cy.get(".filter-input-text").as("filterInputText");
      cy.get("@filterInputText").type("1{selectall}{backspace}unhealthy");
      cy.get(
        ".BottomLeftGrid_ScrollWrapper .ReactVirtualized__Grid__innerScrollContainer"
      )
        .children()
        .should("to.have.length", 1);
    });

    it("sets the correct search string filter query params", () => {
      cy.get(".filter-input-text").as("filterInputText");
      cy.get("@filterInputText").type(
        "1{selectall}{backspace}cassandra-healthy"
      );
      cy.hash().should(hash => {
        const searchParameter = getSearchParameter(hash);
        expect(decodeURIComponent(searchParameter)).to.equal(
          "q=cassandra-healthy"
        );
      });
    });

    it("will clear filters by clear all link click", () => {
      cy.get(".filter-input-text").as("filterInputText");
      cy.get("@filterInputText").type(
        "1{selectall}{backspace}cassandra-healthy"
      );
      cy.get("@filterInputText")
        .siblings(".form-control-group-add-on")
        .eq(1)
        .click();

      cy.hash().should(hash => {
        const searchParameter = getSearchParameter(hash);
        expect(decodeURIComponent(searchParameter)).to.equal("q=");
      });
      cy.get(
        ".BottomLeftGrid_ScrollWrapper .ReactVirtualized__Grid__innerScrollContainer"
      )
        .children()
        .should("to.have.length", 4);
    });
  });
});
