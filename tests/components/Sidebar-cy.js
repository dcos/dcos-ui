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

      cy
        .get(".sidebar-sections .sidebar-menu-item")
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

      cy
        .get(".sidebar-sections .sidebar-menu-item")
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
      it(`renders nested route ${nestedRoute.url} with parent selected when visiting directly`, function() {
        cy.visitUrl({
          url: nestedRoute.url,
          identify: true,
          fakeAnalytics: true
        });

        cy
          .get(".sidebar-sections .sidebar-menu-item")
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

    it("has a button with exactly the same width as the sidebar", function() {
      cy.get(".sidebar").then(function($sidebar) {
        const sidebarWidth = $sidebar.get(0).getBoundingClientRect().width;

        cy.get(".user-account-dropdown-button").then(function($button) {
          expect($button.get(0).getBoundingClientRect().width).to.equal(
            sidebarWidth
          );
        });
      });
    });

    it("has a button whose children are not any wider than the button itself", function() {
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

    it("shows the IP address of the cluster with a copy link", function() {
      cy.get(".user-account-dropdown-button").click();
      cy
        .get(".user-account-dropdown-menu li")
        .contains("52.34.108.176")
        .closest("li")
        .as("ipAddressMenuItem");

      cy.get("@ipAddressMenuItem").contains("Copy").should(function($copyLink) {
        expect($copyLink.get().length).to.equal(1);
        /* eslint-disable no-unused-expressions */
        expect($copyLink).to.not.be.visible;
        /* eslint-enable no-unused-expressions */
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

    it("renders the dock button at the bottom of the sidebar and window", function() {
      cy.get(".sidebar").then(function($sidebar) {
        const { bottom: sidebarBottom } = $sidebar
          .get(0)
          .getBoundingClientRect();

        cy.get(".sidebar-dock-container").then(function($dockIconContainer) {
          const { bottom: containerBottom } = $dockIconContainer
            .get(0)
            .getBoundingClientRect();

          expect(containerBottom).to.equal(sidebarBottom);

          cy.window().then(function($window) {
            expect(containerBottom).to.equal($window.innerHeight);
          });
        });
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

    it("moves the sidebar content offscreen when it is undocked", function() {
      cy.get(".sidebar-dock-trigger").click();

      // We need to wait for the sidebar's transition to end.
      cy.wait(500).get(".sidebar").then(function($sidebar) {
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
      cy.wait(500).get(".page").then(function($page) {
        const pageRect = $page.get(0).getBoundingClientRect();

        expect(pageRect.left).to.equal(0);
        expect(pageRect.top).to.equal(0);

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
