describe("Page Header Component", function() {
  beforeEach(function() {
    cy.configureCluster({
      mesos: "1-task-healthy"
    });
    cy.visitUrl({
      url: "/services/overview/%2Fsome%2Fgroup-with-pods"
    });
  });

  context("When breadcrumb contain less than 4 items", function() {
    it("doesn't truncate breadcrumb", function() {
      cy.get(".breadcrumbs.breadcrumbs--is-truncated").should("not.exist");
    });

    it("doesn't ellipsis breadcrumb items", function() {
      cy.get(".breadcrumb").each(function($currentBreadcrumb) {
        expect(
          $currentBreadcrumb[0].classList.value.indexOf(
            "breadcrumb--is-ellipsis"
          )
        ).to.equal(-1);
      });
    });
  });

  context("When breadcrumb contain more than 4 items", function() {
    beforeEach(function() {
      cy.get(".table-cell-link-primary").click();
    });

    it("truncate breadcrumb", function() {
      cy.get(".breadcrumbs").should("have.class", "breadcrumbs--is-truncated");
    });

    it("last two breadcrumbs are visible", function() {
      cy.get(".breadcrumb").then(function($breadcrumbs) {
        const lastItem = $breadcrumbs[$breadcrumbs.length - 1];
        const beforeLastItem = $breadcrumbs[$breadcrumbs.length - 3];

        expect(beforeLastItem.textContent).to.equal("group-with-pods");
        expect(lastItem.textContent).to.equal("podEFGHDeploying (1 of 10)");
      });
    });

    it("ellipsis breadcrumb in between first breadcrumb and two last breadcrumbs", function() {
      cy.get(".breadcrumb").then(function($breadcrumbs) {
        const firstItem = $breadcrumbs[0];
        const beforeLastItem = $breadcrumbs[$breadcrumbs.length - 3];
        const lastItem = $breadcrumbs[$breadcrumbs.length - 1];
        var isValid = true;

        if (
          firstItem.classList.value.indexOf("breadcrumb--is-ellipsis") !== -1 &&
          beforeLastItem.classList.value.indexOf("breadcrumb--is-ellipsis") !==
            -1 &&
          lastItem.classList.value.indexOf("breadcrumb--is-ellipsis") !== -1
        ) {
          isValid = false;
        }

        expect(isValid).to.equal(true);
      });
    });

    it("display path when hovering ellipsis", function() {
      cy.get(".breadcrumb--force-ellipsis").eq(0).triggerHover();

      cy.get(".tooltip").contains("some");
    });

    it("route back to services overview", function() {
      cy.get(".breadcrumb").eq(0).click();

      cy.window().then(function($window) {
        const hash = $window.location.hash;
        const formattedHash = hash.substring(0, hash.indexOf("?"));

        expect(formattedHash).to.equal("#/services/overview");
      });
    });
  });

  context("Breadcrumb when viewport is narrow", function() {
    beforeEach(function() {
      cy.viewport("iphone-6");
      cy.get(".table-cell-link-primary").click();
    });

    it("truncate breadcrumb on smaller screen", function() {
      cy.get(".breadcrumbs").should("have.class", "breadcrumbs--is-truncated");
    });
  });

  context("Page header", function() {
    beforeEach(function() {
      cy.viewport("macbook-15");
      cy.get(".table-cell-link-primary").click();
    });

    it("header tab active indicator is aligned with bottom page header component", function() {
      cy.get(".page-header").then(function($pageHeader) {
        const pageHeaderBottomPosition = $pageHeader[0].getBoundingClientRect()
          .bottom;
        const $pageHeaderActiveTab = $pageHeader.find(
          ".menu-tabbed-item-label.active"
        );
        const pageHeaderActiveTabBottomPosition = $pageHeaderActiveTab[
          0
        ].getBoundingClientRect().bottom;

        expect(pageHeaderBottomPosition).to.equal(
          pageHeaderActiveTabBottomPosition
        );
      });
    });
  });

  context("Page header in narrow screen", function() {
    beforeEach(function() {
      cy.viewport("iphone-6");
    });

    it("header actions is visible", function() {
      cy.get(".page-header-actions").should("exist");
    });
  });
});
