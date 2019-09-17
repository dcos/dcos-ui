describe("Quota Tab", function() {
  context("No quota set", function() {
    beforeEach(function() {
      cy.configureCluster({
        mesos: "1-task-healthy-with-region",
        nodeHealth: true
      });
      cy.visitUrl({ url: "/services/quota" });
    });

    it("Shows the quota tab", function() {
      cy.visitUrl({ url: "/services/overview" });
      cy.get(".menu-tabbed-item-label-text")
        .contains("Quota")
        .click();
    });

    it("Shows the no quota message", function() {
      cy.get(".panel-content").contains("No quota defined");
    });

    it("Shows a working back to services button", function() {
      cy.get(".button-primary")
        .contains("Back to Services")
        .click();
      cy.get(".service-table");
    });

    it("Shows actions dropdown", function() {
      cy.get(".page-header-actions [data-cy='primaryDropdownButton']")
        .contains("New")
        .click();

      cy.get("[data-cy='PopoverListItem']").contains("Run a Service");
      cy.get("[data-cy='PopoverListItem']").contains("Create Group");
    });

    it("Opens create service modal", function() {
      cy.get(".page-header-actions [data-cy='primaryDropdownButton']")
        .contains("New")
        .click();

      cy.get("[data-cy='PopoverListItem']")
        .contains("Run a Service")
        .click();
      cy.get(".create-service-modal-service-picker-options");
      cy.get(".text-align-center").contains("Single Container");
    });

    it("Opens create group modal", function() {
      cy.get(".page-header-actions [data-cy='primaryDropdownButton']")
        .contains("New")
        .click();

      cy.get("[data-cy='PopoverListItem']")
        .contains("Create Group")
        .click();
      cy.get(".create-service-modal-form-container");
      cy.get(".modal-full-screen-header-title").contains("New Group");
    });
  });

  context("Quota set", function() {
    beforeEach(function() {
      cy.configureCluster({
        mesos: "1-task-healthy-with-quota",
        nodeHealth: true
      });
      cy.visitUrl({ url: "/services/quota" });
    });

    context("Quota table", function() {
      function getFirstRowName(name) {
        cy.get(".ReactVirtualized__Grid")
          .eq(2)
          .children()
          .first()
          .children()
          .first()
          .contains(name);
      }

      function getSecondRowName(name) {
        cy.get(".ReactVirtualized__Grid")
          .eq(2)
          .children()
          .first()
          .children()
          .eq(1)
          .contains(name);
      }

      function clickHeading(name) {
        cy.get(".TopRightGrid_ScrollWrapper")
          .contains(name)
          .click();
      }

      it("Shows the quota table", function() {
        cy.get(".quota-table");
      });

      it("Shows the info banner for services with no limit", function() {
        cy.get("#quota-no-limit-infobox").contains(
          "1 group has services not limited by quota. Update service roles to have quota enforced."
        );
      });

      it("Shows the correct headings", function() {
        cy.get(".ReactVirtualized__Grid")
          .eq(0)
          .contains("Name");
        cy.get(".TopRightGrid_ScrollWrapper").contains("Quota Limit");
        cy.get(".TopRightGrid_ScrollWrapper").contains("CPU Consumed");
        cy.get(".TopRightGrid_ScrollWrapper").contains("Memory Consumed");
        cy.get(".TopRightGrid_ScrollWrapper").contains("Disk Consumed");
        cy.get(".TopRightGrid_ScrollWrapper").contains("GPU Consumed");
      });

      it("Shows the correct number of rows", function() {
        cy.get(".ReactVirtualized__Grid")
          .eq(2)
          .children()
          .first()
          .children()
          .should("to.have.length", 4);
      });

      it("Sorts the table by name", function() {
        cy.get(".ReactVirtualized__Grid")
          .eq(0)
          .contains("Name")
          .click();
        getFirstRowName("2_apps");
        getSecondRowName("10000_apps");

        cy.get(".ReactVirtualized__Grid")
          .eq(0)
          .contains("Name")
          .click();
        getFirstRowName("1_app");
        getSecondRowName("10_apps");
      });

      it("Sorts the table by quota limit", function() {
        clickHeading("Quota Limit");
        getFirstRowName("2_apps");
        getSecondRowName("1_app");

        clickHeading("Quota Limit");
        getFirstRowName("10_apps");
        getSecondRowName("10000_apps");
      });

      it("Sorts the table by CPU consumed", function() {
        clickHeading("CPU Consumed");
        getFirstRowName("10000_apps");
        getSecondRowName("1_app");

        clickHeading("CPU Consumed");
        getFirstRowName("10_apps");
        getSecondRowName("2_apps");
      });

      it("Sorts the table by Memory consumed", function() {
        clickHeading("Memory Consumed");
        getFirstRowName("10000_apps");
        getSecondRowName("1_app");

        clickHeading("Memory Consumed");
        getFirstRowName("10_apps");
        getSecondRowName("1_app");
      });

      it("Sorts the table by Disk consumed", function() {
        clickHeading("Disk Consumed");
        getFirstRowName("10_apps");
        getSecondRowName("10000_apps");

        clickHeading("Disk Consumed");
        getFirstRowName("10000_apps");
        getSecondRowName("1_app");
      });

      it("Sorts the table by GPU consumed", function() {
        clickHeading("GPU Consumed");
        getFirstRowName("10000_apps");
        getSecondRowName("10_apps");

        clickHeading("GPU Consumed");
        getFirstRowName("10_apps");
        getSecondRowName("1_app");
      });
    });

    context("Quota Detail", function() {
      beforeEach(function() {
        cy.get(".table-cell-link-primary")
          .contains("10_apps")
          .click();
      });

      it("Opens the quota detail page when we click on a group", function() {
        cy.get(".breadcrumb__content--text").contains("10_apps");
        cy.get(".quota-details");
      });

      it("Open the quota detail tab when we visit the correct url", function() {
        cy.visitUrl({ url: "/services/quota/%2F10000_apps" });
        cy.get(".breadcrumb__content--text").contains("10000_apps");
        cy.get(".quota-details");
      });

      it("Shows the info banner for services with no limit", function() {
        cy.visitUrl({ url: "/services/quota/%2F2_apps" });
        cy.get(".quota-info").contains(
          "1 service is not limited by quota. Update role to have quota enforced."
        );
      });

      it("Shows the correct number of cards", function() {
        cy.get(".quota-card").should("have.length", 4);
      });

      it("Shows the correct card titles", function() {
        cy.get(".quota-card-title").contains("CPU");
        cy.get(".quota-card-title").contains("Memory");
        cy.get(".quota-card-title").contains("Disk");
        cy.get(".quota-card-title").contains("GPU");
      });

      it("Shows percent or N/A for each card", function() {
        cy.get(".quota-card-main")
          .eq(0)
          .contains("25%");
        cy.get(".quota-card-main")
          .eq(1)
          .contains("13%");
        cy.get(".quota-card-main")
          .eq(2)
          .contains("50%");
        cy.get(".quota-card-main")
          .eq(3)
          .contains("N/A");
      });

      it("Shows consumed of limit or no limit for each card", function() {
        cy.get(".quota-card-label")
          .eq(0)
          .contains("0.5 of 2 Cores");
        cy.get(".quota-card-label")
          .eq(1)
          .contains("128 of 1024 MiB");
        cy.get(".quota-card-label")
          .eq(2)
          .contains("5 of 10 MiB");
        cy.get(".quota-card-label")
          .eq(3)
          .contains("No Limit");
      });

      it("Shows progress bars", function() {
        cy.get(".quota-progress-bar").should("have.length", 4);
      });

      context("Quota detail table", function() {
        beforeEach(function() {
          cy.visitUrl({ url: "/services/quota/%2F2_apps" });
          cy.get(".service-quota-table").scrollIntoView();
        });

        it("Shows quota table", function() {
          cy.get(".service-quota-table");
        });

        it("Shows table values", function() {
          cy.get(".table-cell-link-primary").contains("podEFGH");
          cy.get(".table-cell-value").contains("Not Applied");
        });
      });
    });
  });
});
