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
});
