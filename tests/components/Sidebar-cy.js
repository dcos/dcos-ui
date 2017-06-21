describe("Sidebar", function() {
  beforeEach(function() {
    cy
      .configureCluster({
        mesos: "1-task-healthy",
        componentHealth: false
      })
      .visitUrl({ url: "/dashboard", identify: true, fakeAnalytics: true });
  });

  context("Sidebar Wrapper", function() {
    it("is exactly the same width as the sidebar", function() {
      cy.get(".sidebar").then(function($sidebar) {
        const sidebarWidth = $sidebar.get(0).getBoundingClientRect().width;

        cy.get(".sidebar-wrapper").then(function($sidebarWrapper) {
          expect($sidebarWrapper.get(0).getBoundingClientRect().width).to.equal(
            sidebarWidth
          );
        });
      });
    });
  });

  context("User Account Dropdown Button", function() {
    it("is exactly the same width as the sidebar", function() {
      cy.get(".sidebar").then(function($sidebar) {
        const sidebarWidth = $sidebar.get(0).getBoundingClientRect().width;

        cy.get(".user-account-dropdown-button").then(function($button) {
          expect($button.get(0).getBoundingClientRect().width).to.equal(
            sidebarWidth
          );
        });
      });
    });

    it("does not have any children wider than itself", function() {
      cy.get(".user-account-dropdown-button").then(function($button) {
        const buttonWidth = $button.get(0).getBoundingClientRect().width;

        cy.get(".user-account-dropdown-button *").then(function($children) {
          $children.each(function(index, child) {
            expect(child.getBoundingClientRect().width).to.be.lessThan(
              buttonWidth
            );
          });
        });
      });
    });
  });
});
