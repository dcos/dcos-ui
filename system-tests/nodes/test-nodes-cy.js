const hostnameSelector =
  ".BottomLeftGrid_ScrollWrapper .ReactVirtualized__Grid__innerScrollContainer a";
const healthySelector =
  ".ReactVirtualized__Grid__innerScrollContainer .text-success";

describe("Nodes", function() {
  afterEach(() => {
    cy.window().then(win => {
      win.location.href = "about:blank";
    });
  });

  it("shows correct amount of nodes", () => {
    cy.visitUrl("/nodes");
    cy.get(hostnameSelector).should("have.length", 2);
  });

  it("shows all nodes as healthy", () => {
    cy.visitUrl("/nodes");
    cy.get(healthySelector).should("have.length", 2);
  });

  it("shows leader in master tab", () => {
    cy.visitUrl("/nodes");
    cy.get(".menu-tabbed-item-label")
      .contains("Masters")
      .click();
    cy.get(".configuration-map-section")
      .first()
      .find(".configuration-map-row.table-row .configuration-map-value")
      .each(node => {
        cy.wrap(node)
          .get(".loader")
          .should("not.exist");
      });
  });
});
