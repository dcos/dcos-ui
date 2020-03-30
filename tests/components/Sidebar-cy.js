const nestedRoutesToTest = [
  { url: "/networking/networks", parentMenuLabel: "Networking" },
  { url: "/settings/repositories", parentMenuLabel: "Settings" },
  { url: "/organization/users", parentMenuLabel: "Organization" },
];

describe("Sidebar", () => {
  beforeEach(() => {
    cy.configureCluster({
      mesos: "1-task-healthy",
      componentHealth: false,
    });
  });

  context("Sidebar Items", () => {
    it("opens nested items in the sidebar when clicked", () => {
      cy.visitUrl({ url: "/dashboard", identify: true });

      cy.get(".sidebar-sections .sidebar-menu-item")
        .contains("Settings")
        .as("settingsMenuItem");

      // The menu item should not contain a nested list.
      cy.get("@settingsMenuItem").should(($anchorTag) => {
        const $parentMenuItem = $anchorTag.closest("li.sidebar-menu-item");
        expect($parentMenuItem.hasClass("open")).to.equal(false);
        expect($parentMenuItem.find("ul li").length).to.equal(0);
      });

      cy.get("@settingsMenuItem").click();

      // Now the menu item should be expanded, so it contains a nested list.
      cy.get("@settingsMenuItem").should(($anchorTag) => {
        const $parentMenuItem = $anchorTag.closest("li.sidebar-menu-item");
        expect($parentMenuItem.hasClass("open")).to.equal(true);
        expect($parentMenuItem.find("ul li").length).to.equal(2);
      });
    });

    it("marks the active tab as selected", () => {
      cy.visitUrl({ url: "/dashboard", identify: true });

      cy.get(".sidebar-sections .sidebar-menu-item")
        .contains("Jobs")
        .as("jobsMenuItem");

      // The jobs menu item should not be marked as selected.
      cy.get("@jobsMenuItem").should(($anchorTag) => {
        const $liElement = $anchorTag.closest("li");
        expect($liElement.hasClass("selected")).to.equal(false);
      });

      cy.get("@jobsMenuItem").click();

      // The jobs menu item should be marked as selected.
      cy.get("@jobsMenuItem").should(($anchorTag) => {
        const $liElement = $anchorTag.closest("li");
        expect($liElement.hasClass("selected")).to.equal(true);
      });
    });

    nestedRoutesToTest.forEach((nestedRoute) => {
      it(`renders nested route ${nestedRoute.url} with parent selected when visiting directly`, () => {
        cy.visitUrl({ url: nestedRoute.url, identify: true });

        cy.get(".sidebar-sections .sidebar-menu-item")
          .contains(nestedRoute.parentMenuLabel)
          .as("parentMenuItem");

        // Now the menu item should be expanded, so it contains a nested list
        // with at least one item.
        cy.get("@parentMenuItem").should(($anchorTag) => {
          const $parentMenuItem = $anchorTag.closest("li.sidebar-menu-item");
          expect($parentMenuItem.hasClass("open")).to.equal(true);
          expect($parentMenuItem.find("ul li").length).to.be.at.least(1);
        });
      });
    });
  });

  context("Sidebar Wrapper", () => {
    it("is exactly the same width as the sidebar", () => {
      cy.get(".sidebar").then(($sidebar) => {
        const sidebarWidth = $sidebar.get(0).getBoundingClientRect().width;

        cy.get(".sidebar-wrapper").then(($sidebarWrapper) => {
          expect($sidebarWrapper.get(0).getBoundingClientRect().width).to.equal(
            sidebarWidth
          );
        });
      });
    });
  });

  context("Sidebar toggle", () => {
    beforeEach(() => {
      cy.clearLocalStorage();
      cy.visitUrl({ url: "/dashboard", identify: true });
    });

    it("adds the proper class to the .sidebar-wrapper element", () => {
      cy.get(".application-wrapper").then(($sidebarWrapper) => {
        expect($sidebarWrapper.hasClass("sidebar-docked")).to.equal(true);
      });
    });

    it("close/open sidebar when sidebarToggle button clicked", () => {
      // close sidebar
      cy.get(".header-bar-sidebar-toggle").click();
      cy.get(".sidebar-visible").should("not.exist");

      // open sidebar
      cy.get(".header-bar-sidebar-toggle").click();
      cy.get(".sidebar-visible");
    });

    it("automatically close sidebar when view is mobile/tablet", () => {
      cy.viewport("iphone-6");
      cy.get(".sidebar-visible.sidebar-docked").should("not.exist");

      // reset viewport back
      cy.viewport("macbook-15");
    });

    it("display overlay when sidebar is open on mobile/tablet", () => {
      cy.viewport("iphone-6");

      cy.get(".sidebar-visible.sidebar-docked");
      cy.get(".sidebar-backdrop");
    });

    it("close Sidebar clicking on overlay when sidebar is open on mobile/tablet", () => {
      cy.viewport("iphone-6");
      cy.get(".sidebar-backdrop").click({ force: true });
      cy.get(".sidebar-backdrop").should("not.exist");
    });
  });
});
