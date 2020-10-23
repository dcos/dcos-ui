describe("Quota Tab", () => {
  context("No quota set", () => {
    beforeEach(() => {
      cy.configureCluster({
        mesos: "1-task-healthy-with-region",
        nodeHealth: true,
      });
      cy.visitUrl({ url: "/services/quota" });
    });

    it("Shows the quota tab", () => {
      cy.visitUrl({ url: "/services/overview" });
      cy.get(".menu-tabbed-item-label-text").contains("Quota").click();
    });

    it("Shows the no quota message", () => {
      cy.get(".panel-content").contains("No quota defined");
    });

    it("Shows a working back to services button", () => {
      cy.get(".button-primary").contains("Back to Services").click();
      cy.get(".service-table");
    });

    it("Shows actions dropdown", () => {
      cy.get(".page-header-actions [data-cy='primaryDropdownButton']")
        .contains("New")
        .click();

      cy.get("[data-cy='PopoverListItem']").contains("Run a Service");
      cy.get("[data-cy='PopoverListItem']").contains("Create Group");
    });

    it("Opens create service modal", () => {
      cy.get(".page-header-actions [data-cy='primaryDropdownButton']")
        .contains("New")
        .click();

      cy.get("[data-cy='PopoverListItem']").contains("Run a Service").click();
      cy.get(".create-service-modal-service-picker-options");
      cy.get(".text-align-center").contains("Single Container");
    });

    it("Opens create group modal", () => {
      cy.get(".page-header-actions [data-cy='primaryDropdownButton']")
        .contains("New")
        .click();

      cy.get("[data-cy='PopoverListItem']").contains("Create Group").click();
      cy.get(".create-service-modal-form-container");
      cy.get(".modal-full-screen-header-title").contains("New Group");
    });
  });

  context("Quota set", () => {
    beforeEach(() => {
      cy.configureCluster({
        mesos: "1-task-healthy-with-quota",
        nodeHealth: true,
      });
      cy.visitUrl({ url: "/services/quota" });
    });

    context("Quota table", () => {
      function getFirstRowName(name) {
        cy.get("[data-cy*='table-contentCell.col0']").first().contains(name);
      }

      function getSecondRowName(name) {
        cy.get("[data-cy*='table-contentCell.col0']").eq(1).contains(name);
      }

      function clickHeading(name) {
        cy.get(".TopRightGrid_ScrollWrapper").contains(name).click();
      }

      it("Shows the quota table", () => {
        cy.get(".quota-table");
      });

      it("Shows the info banner for services with no limit", () => {
        cy.get("#quota-no-limit-infobox").contains(
          "1 group has services not limited by quota. Update service roles to have quota enforced."
        );
      });

      it("Shows the correct headings", () => {
        cy.get(".ReactVirtualized__Grid").eq(0).contains("Name");
        cy.get(".TopRightGrid_ScrollWrapper").contains("Quota Limit");
        cy.get(".TopRightGrid_ScrollWrapper").contains("CPU Consumed");
        cy.get(".TopRightGrid_ScrollWrapper").contains("Memory Consumed");
        cy.get(".TopRightGrid_ScrollWrapper").contains("Disk Consumed");
        cy.get(".TopRightGrid_ScrollWrapper").contains("GPU Consumed");
      });

      it("Shows the correct number of rows", () => {
        cy.get("[data-cy*='table-contentCell.col0']").should("have.length", 4);
      });

      it("Sorts the table", () => {
        cy.get(".ReactVirtualized__Grid").eq(0).contains("Name").click();
        getFirstRowName("2_apps");
        getSecondRowName("10000_apps");

        cy.get(".ReactVirtualized__Grid").eq(0).contains("Name").click();
        getFirstRowName("1_app");
        getSecondRowName("10_apps");

        // by quota limit
        clickHeading("Quota Limit");
        getFirstRowName("2_apps");
        getSecondRowName("1_app");

        clickHeading("Quota Limit");
        getFirstRowName("10_apps");
        getSecondRowName("10000_apps");

        // by CPU consumed
        clickHeading("CPU Consumed");
        getFirstRowName("10000_apps");
        getSecondRowName("1_app");

        clickHeading("CPU Consumed");
        getFirstRowName("10_apps");
        getSecondRowName("2_apps");

        // by Memory consumed
        clickHeading("Memory Consumed");
        getFirstRowName("10000_apps");
        getSecondRowName("10_app");
        // getSecondRowName("1_app");

        clickHeading("Memory Consumed");
        getFirstRowName("10_apps");
        getSecondRowName("1_app");

        // by Disk consumed
        clickHeading("Disk Consumed");
        getFirstRowName("10_apps");
        getSecondRowName("10000_apps");

        clickHeading("Disk Consumed");
        getFirstRowName("10000_apps");
        getSecondRowName("1_app");

        // by GPU consumed
        clickHeading("GPU Consumed");
        getFirstRowName("10000_apps");
        getSecondRowName("10_apps");

        clickHeading("GPU Consumed");
        getFirstRowName("10_apps");
        getSecondRowName("1_app");
      });
    });

    context("Quota Detail", () => {
      beforeEach(() => {
        cy.get(".table-cell-link-primary").contains("10_apps").click();
      });

      it("Opens the quota detail page when we click on a group", () => {
        cy.get(".breadcrumb__content--text").contains("10_apps");
        cy.get(".quota-details");
      });

      it("Open the quota detail tab when we visit the correct url", () => {
        cy.visitUrl({ url: "/services/quota/%2F10000_apps" });
        cy.get(".breadcrumb__content--text").contains("10000_apps");
        cy.get(".quota-details");
      });

      it("Shows the info banner for services with no limit", () => {
        cy.visitUrl({ url: "/services/quota/%2F2_apps" });
        cy.get(".quota-info").contains(
          "1 service is not limited by quota. Update role to have quota enforced."
        );
      });

      it("Shows correct entries", () => {
        cy.get(".quota-card").should("have.length", 4);

        cy.get(".quota-card-title").contains("CPU");
        cy.get(".quota-card-title").contains("Memory");
        cy.get(".quota-card-title").contains("Disk");
        cy.get(".quota-card-title").contains("GPU");

        cy.get(".quota-card-main").eq(0).contains("25%");
        cy.get(".quota-card-main").eq(1).contains("13%");
        cy.get(".quota-card-main").eq(2).contains("50%");
        cy.get(".quota-card-main").eq(3).contains("N/A");

        cy.get(".quota-card-label").eq(0).contains("0.5 of 2 Cores");
        cy.get(".quota-card-label").eq(1).contains("128 MiB of 1 GiB");
        cy.get(".quota-card-label").eq(2).contains("5 MiB of 10 MiB");
        cy.get(".quota-card-label").eq(3).contains("No Limit");

        cy.get(".quota-progress-bar").should("have.length", 4);
      });
    });
    it("Quota detail table", () => {
      cy.visitUrl({ url: "/services/quota/%2F2_apps" });
      cy.get(".service-quota-table").scrollIntoView();
      cy.get(".table-cell-link-primary").contains("podEFGH");
      cy.get(".table-cell-value").contains("Not Applied");
    });
  });
});
