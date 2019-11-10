describe("Page Header Component", () => {
  beforeEach(() => {
    cy.configureCluster({
      mesos: "1-task-healthy"
    });
    cy.visitUrl({
      url: "/services/overview/%2Fsome%2Fgroup-with-pods"
    });
  });

  context("When breadcrumb contain less than 4 items", () => {
    it("doesn't truncate breadcrumb", () => {
      cy.get(".breadcrumbs.breadcrumbs--is-truncated").should("not.exist");
    });

    it("doesn't ellipsis breadcrumb items", () => {
      cy.get(".breadcrumb").each($currentBreadcrumb => {
        expect(
          $currentBreadcrumb[0].classList.value.indexOf(
            "breadcrumb--is-ellipsis"
          )
        ).to.equal(-1);
      });
    });
  });

  context("When breadcrumb contain more than 4 items", () => {
    beforeEach(() => {
      cy.get(".table-cell-link-primary").click();
    });

    it("truncate breadcrumb", () => {
      cy.get(".breadcrumbs").should("have.class", "breadcrumbs--is-truncated");
    });

    it("last two breadcrumbs are visible", () => {
      cy.get(".breadcrumb").then($breadcrumbs => {
        const lastItem = $breadcrumbs[$breadcrumbs.length - 1];
        const beforeLastItem = $breadcrumbs[$breadcrumbs.length - 3];

        expect(beforeLastItem.textContent).to.equal("group-with-pods");
        expect(lastItem.textContent).to.equal("podEFGH");
      });
    });

    it("ellipsis breadcrumb in between first breadcrumb and two last breadcrumbs", () => {
      cy.get(".breadcrumb").then($breadcrumbs => {
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

    it("display path when hovering ellipsis", () => {
      cy.get(".breadcrumb--force-ellipsis")
        .eq(0)
        .trigger("mouseover");

      cy.get(".tooltip").contains("some");
    });

    it("route back to services overview", () => {
      cy.get(".breadcrumb")
        .eq(0)
        .click();

      cy.window().then($window => {
        const hash = $window.location.hash;
        const formattedHash = hash.substring(0, hash.indexOf("?"));

        expect(formattedHash).to.equal("#/services/overview");
      });
    });
  });

  context("Breadcrumb when viewport is narrow", () => {
    beforeEach(() => {
      cy.viewport("iphone-6");
      cy.get(".table-cell-link-primary").click();
    });

    it("truncate breadcrumb on smaller screen", () => {
      cy.get(".breadcrumbs").should("have.class", "breadcrumbs--is-truncated");
    });
  });

  context("Page header", () => {
    beforeEach(() => {
      cy.viewport("macbook-15");
      cy.get(".table-cell-link-primary").click();
    });

    it("header tab active indicator is aligned with bottom page header component", () => {
      cy.get(".page-header").then($pageHeader => {
        const pageHeaderBottomPosition = $pageHeader[0].getBoundingClientRect()
          .bottom;
        const $pageHeaderActiveTab = $pageHeader.find(
          ".menu-tabbed-item-label.active"
        );
        const pageHeaderActiveTabBottomPosition = $pageHeaderActiveTab[0].getBoundingClientRect()
          .bottom;

        expect(pageHeaderBottomPosition).to.equal(
          pageHeaderActiveTabBottomPosition - 1
        );
      });
    });
  });

  context("Page header in narrow screen", () => {
    beforeEach(() => {
      cy.viewport("iphone-6");
    });

    it("header actions is visible", () => {
      cy.get(".page-header-actions");
    });
  });
});
