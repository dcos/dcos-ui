const nestedRoutesToTest = [
  { url: "/networking/networks", parentMenuLabel: "Networking" },
  { url: "/settings/repositories", parentMenuLabel: "Settings" },
  { url: "/organization/users", parentMenuLabel: "Organization" }
];

describe("Sidebar", function() {
  beforeEach(function() {
    cy.configureCluster({
      mesos: "1-task-healthy",
      componentHealth: false
    });
  });

  context("Sidebar Items", function() {
    it("opens nested items in the sidebar when clicked", function() {
      cy.visitUrl({ url: "/dashboard", identify: true, fakeAnalytics: true });

      cy.get(".sidebar-sections .sidebar-menu-item")
        .contains("Settings")
        .as("settingsMenuItem");

      // The menu item should not contain a nested list.
      cy.get("@settingsMenuItem").should(function($anchorTag) {
        const $parentMenuItem = $anchorTag.closest("li.sidebar-menu-item");
        expect($parentMenuItem.hasClass("open")).to.equal(false);
        expect($parentMenuItem.find("ul li").length).to.equal(0);
      });

      cy.get("@settingsMenuItem").click();

      // Now the menu item should be expanded, so it contains a nested list.
      cy.get("@settingsMenuItem").should(function($anchorTag) {
        const $parentMenuItem = $anchorTag.closest("li.sidebar-menu-item");
        expect($parentMenuItem.hasClass("open")).to.equal(true);
        expect($parentMenuItem.find("ul li").length).to.equal(1);
      });
    });

    it("marks the active tab as selected", function() {
      cy.visitUrl({ url: "/dashboard", identify: true, fakeAnalytics: true });

      cy.get(".sidebar-sections .sidebar-menu-item")
        .contains("Jobs")
        .as("jobsMenuItem");

      // The jobs menu item should not be marked as selected.
      cy.get("@jobsMenuItem").should(function($anchorTag) {
        const $liElement = $anchorTag.closest("li");
        expect($liElement.hasClass("selected")).to.equal(false);
      });

      cy.get("@jobsMenuItem").click();

      // The jobs menu item should be marked as selected.
      cy.get("@jobsMenuItem").should(function($anchorTag) {
        const $liElement = $anchorTag.closest("li");
        expect($liElement.hasClass("selected")).to.equal(true);
      });
    });

    nestedRoutesToTest.forEach(function(nestedRoute) {
      it(`renders nested route ${
        nestedRoute.url
      } with parent selected when visiting directly`, function() {
        cy.visitUrl({
          url: nestedRoute.url,
          identify: true,
          fakeAnalytics: true
        });

        cy.get(".sidebar-sections .sidebar-menu-item")
          .contains(nestedRoute.parentMenuLabel)
          .as("parentMenuItem");

        // Now the menu item should be expanded, so it contains a nested list
        // with at least one item.
        cy.get("@parentMenuItem").should(function($anchorTag) {
          const $parentMenuItem = $anchorTag.closest("li.sidebar-menu-item");
          expect($parentMenuItem.hasClass("open")).to.equal(true);
          expect($parentMenuItem.find("ul li").length).to.be.at.least(1);
        });
      });
    });
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

  context("User Account Menu", function() {
    beforeEach(function() {
      cy.visitUrl({ url: "/dashboard", identify: true, fakeAnalytics: true });
    });

    it("has a click-target with exactly the same width as the sidebar", function() {
      cy.get(".sidebar").then(function($sidebar) {
        const sidebarWidth = $sidebar.get(0).getBoundingClientRect().width;

        cy.get(".header-dropdown").then(function($clickTarget) {
          expect($clickTarget.get(0).getBoundingClientRect().width).to.equal(
            sidebarWidth
          );
        });
      });
    });

    it("has a click-target whose children are not any wider than the sidebar itself", function() {
      cy.get(".header-dropdown").then(function($clickTarget) {
        const targetWidth = $clickTarget.get(0).getBoundingClientRect().width;

        cy.get(".header-dropdown *").then(function($children) {
          $children.each(function(index, child) {
            expect(child.getBoundingClientRect().width).to.be.lessThan(
              targetWidth
            );
          });
        });
      });
    });
  });

  context("Sidebar Docking", function() {
    beforeEach(function() {
      cy.clearLocalStorage();
      cy.visitUrl({ url: "/dashboard", identify: true, fakeAnalytics: true });
    });

    it("adds the proper class to the .sidebar-wrapper element", function() {
      cy.get(".application-wrapper").then(function($sidebarWrapper) {
        expect($sidebarWrapper.hasClass("sidebar-docked")).to.equal(true);
      });
    });

    it("renders within the viewport on initial load", function() {
      cy.get(".sidebar").then(function($sidebar) {
        const sidebarRect = $sidebar.get(0).getBoundingClientRect();

        // Assert that the sidebar's dimensions are within the viewport.
        expect(sidebarRect.left).to.equal(0);
        expect(sidebarRect.top).to.equal(0);
        expect(sidebarRect.right).to.be.greaterThan(0);

        cy.window().then(function($window) {
          expect(sidebarRect.bottom).to.equal($window.innerHeight);
        });
      });
    });

    it("offsets the page content so that they are sitting directly adjacent to one another without overlapping", function() {
      cy.get(".sidebar").then(function($sidebar) {
        const sidebarRect = $sidebar.get(0).getBoundingClientRect();

        cy.get(".page").then(function($page) {
          const pageRect = $page.get(0).getBoundingClientRect();

          expect(pageRect.left).to.equal(sidebarRect.right);
        });
      });
    });
  });
});
