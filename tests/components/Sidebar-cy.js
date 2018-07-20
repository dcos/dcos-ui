const HEADER_BAR_HEIGHT = 32;

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

  // TODO: remove skip when sidebar new header toggle enabled
  context.skip("Sidebar toggle", function() {
    beforeEach(function() {
      cy.clearLocalStorage();
      cy.visitUrl({ url: "/dashboard", identify: true, fakeAnalytics: true });
    });

    it("adds the proper class to the .sidebar-wrapper element", function() {
      cy.get(".application-wrapper").then(function($sidebarWrapper) {
        expect($sidebarWrapper.hasClass("sidebar-docked")).to.equal(true);
      });
    });

    it("close/open sidebar when sidebarToggle button clicked", function() {
      // close sidebar
      cy.get(".page-header-sidebar-toggle").click();
      cy.get(".sidebar-visible").should("not.exist");

      // open sidebar
      cy.get(".page-header-sidebar-toggle").click();
      cy.get(".sidebar-visible").should("exist");
    });

    it("automatically close sidebar when view is mobile/tablet", function() {
      cy.viewport("iphone-6");
      cy.get(".sidebar-visible.sidebar-docked").should("not.exist");

      // reset viewport back
      cy.viewport("macbook-15");
    });

    it("display overlay when sidebar is open on mobile/tablet", function() {
      cy.viewport("iphone-6");

      cy.get(".sidebar-visible.sidebar-docked").should("exist");
      cy.get(".sidebar-backdrop").should("exist");
    });

    it("close Sidebar clicking on overlay when sidebar is open on mobile/tablet", function() {
      cy.viewport("iphone-6");
      cy.get(".sidebar-backdrop").click({ force: true });
      cy.get(".sidebar-backdrop").should("not.exist");
    });

    it("moves the sidebar content offscreen when it is undocked", function() {
      cy.get(".sidebar-dock-trigger").click();

      // We need to wait for the sidebar's transition to end.
      cy.wait(500)
        .get(".sidebar")
        .then(function($sidebar) {
          const sidebarRect = $sidebar.get(0).getBoundingClientRect();

          // Assert that the sidebar's dimensions are outside of the viewport.
          expect(sidebarRect.left).to.be.lessThan(0);
          expect(sidebarRect.left).to.equal(sidebarRect.width * -1);
          expect(sidebarRect.right).to.equal(0);
        });
    });

    it("expands the page content to fill the viewport when sidebar is undocked", function() {
      cy.get(".sidebar-dock-trigger").click();

      // We need to wait for the sidebar's transition to end.
      cy.wait(500)
        .get(".page")
        .then(function($page) {
          const pageRect = $page.get(0).getBoundingClientRect();

          expect(pageRect.left).to.equal(0);
          expect(pageRect.top).to.equal(HEADER_BAR_HEIGHT);

          cy.window().then(function($window) {
            expect(pageRect.right).to.equal($window.innerWidth);
            expect(pageRect.bottom).to.equal($window.innerHeight);
          });
        });
    });

    it("enters the viewport when the hamburger menu in the page header is clicked", function() {
      cy.get(".sidebar-dock-trigger").click();

      // We need to wait for the sidebar's exiting transition to end.
      cy.wait(500);

      // Let's first ensure that the sidebar is actually out of the viewport.
      cy.get(".sidebar").then(function($sidebar) {
        const sidebarRect = $sidebar.get(0).getBoundingClientRect();
        expect(sidebarRect.left).to.be.lessThan(0);
        expect(sidebarRect.right).to.equal(0);
      });

      cy.get(".page-header-sidebar-toggle").click();

      // We need to wait for the sidebar's entrance transition to end.
      cy.wait(500);

      cy.get(".sidebar").then(function($sidebar) {
        const sidebarRect = $sidebar.get(0).getBoundingClientRect();
        expect(sidebarRect.left).to.equal(0);
        expect(sidebarRect.right).to.be.greaterThan(0);
        expect(sidebarRect.right).to.equal(sidebarRect.width);
      });
    });

    it("renders on top of the page content when its visibility is toggled in undocked mode", function() {
      cy.get(".sidebar-dock-trigger").click();

      // We need to wait for the sidebar's exiting transition to end.
      cy.wait(500);

      cy.get(".page-header-sidebar-toggle").click();

      // We need to wait for the sidebar's entrance transition to end.
      cy.wait(500);

      cy.get(".page").then(function($page) {
        const pageRect = $page.get(0).getBoundingClientRect();
        expect(pageRect.left).to.equal(0);
      });

      cy.get(".sidebar-backdrop").click();

      // We need to wait for the sidebar's exit transition to end.
      cy.wait(500);

      cy.get(".sidebar").then(function($sidebar) {
        const sidebarRect = $sidebar.get(0).getBoundingClientRect();
        expect(sidebarRect.left).to.be.lessThan(0);
        expect(sidebarRect.right).to.equal(0);
      });
    });
  });
});
