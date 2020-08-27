describe("Tasks Table", () => {
  context("Task row", () => {
    beforeEach(() => {
      cy.configureCluster({
        mesos: "1-service-with-executor-task",
        nodeHealth: true,
      });
    });

    it("displays task detail page on task click", () => {
      cy.visitUrl({ url: "/services/detail/%2Fcassandra" });
      cy.get('a[title="server-0_10a"]').click({ force: true });
      cy.get(".page-header").should("contain", "server-0");
    });

    context("Files tab", () => {
      beforeEach(() => {
        cy.visitUrl({
          url: "/services/detail/%2Fcassandra/tasks/server-0_10a",
        });
        cy.get(".page-header-navigation .menu-tabbed-item")
          .contains("Files")
          .click();
      });

      it("shows the contents of the Mesos sandbox", () => {
        const numberOfItems = 13;
        cy.get(".page-body-content tbody tr").should(($rows) => {
          expect($rows.length).to.equal(numberOfItems);
        });
      });

      it("shows directories as well as files", () => {
        cy.get(".page-body-content").contains("jre1.7.0_76");
      });
    });
  });

  context("displays logs", () => {
    beforeEach(() => {
      cy.configureCluster({
        mesos: "1-service-with-executor-task",
        nodeHealth: true,
      });

      cy.visitUrl({
        url: "/services/detail/%2Fcassandra/tasks/server-0_10a",
      });
      cy.get(".page-header-navigation .menu-tabbed-item")
        .contains("Logs")
        .click();
    });

    it("lets you switch between Error and Output", () => {
      cy.contains("Error").should("be.visible");
      cy.contains("Output").should("be.visible");
    });

    it("shows an error log", () => {
      cy.contains("hello world error log").should("be.visible");
    });

    it("shows an error for the missing stdout log", () => {
      cy.contains("Output").click();
      cy.wait(500);

      cy.contains("cannot retrieve the requested information").should(
        "be.visible"
      );
    });
  });

  context("For a Service", () => {
    beforeEach(() => {
      cy.configureCluster({
        mesos: "healthy-tasks-in-mesos-and-marathon",
      });
      cy.viewport("macbook-15");
      cy.visitUrl({ url: "/services/detail/%2Fconfluent-kafka" });
    });

    context("Running task without healthcheck", () => {
      beforeEach(() => {
        cy.get("table tr")
          .contains("broker-0__3c7ab984-a9b9-41fb-bb73-0569f88c657e")
          .closest("tr")
          .find("td")
          .as("tds");
      });

      it("correctly shows status", () => {
        cy.get("@tds").eq(6).contains("Running");
      });

      it("correctly shows health", () => {
        cy.get("@tds").eq(7).find(".dot").trigger("mouseover");
        cy.get('[data-cy="tooltipContent"]').contains(
          "No health checks available"
        );
      });
    });

    context("Running task with healthcheck", () => {
      beforeEach(() => {
        cy.get("table tr")
          .contains(
            "confluent-kafka.instance-825e1e2e-d6a6-11e6-a564-8605ecf0a9df._app.1"
          )
          .closest("tr")
          .find("td")
          .as("tds");
      });

      it("correctly shows status", () => {
        cy.get("@tds").eq(6).contains("Running");
      });

      it("correctly shows health", () => {
        cy.get("@tds")
          .eq(7)
          .find(".task-status-indicator")
          .trigger("mouseover");
        cy.get('[data-cy="tooltipContent"]').contains("Healthy");
      });
    });
  });

  context("Service tasks checkbox", () => {
    beforeEach(() => {
      cy.configureCluster({
        mesos: "1-service-with-executor-task",
      });
      cy.visitUrl({ url: "/services/detail/%2Fcassandra/tasks?_k=rh67gf" });
      cy.get("table tr").find(".form-element-checkbox").as("checkboxes");
    });

    function assertCheckboxLength() {
      cy.get("@checkboxes").should("have.length", 2);
    }

    function assertActionButtons() {
      cy.get(".filter-bar .button-collection .button-primary-link > span")
        .eq(0)
        .contains("Restart");
      cy.get(".button-collection .button-primary-link > span")
        .eq(1)
        .contains("Stop");
    }

    it("Select all tasks available and confirm action buttons exist", () => {
      assertCheckboxLength();
      cy.get("@checkboxes").eq(0).click();
      cy.get("@checkboxes")
        .eq(0)
        .find("input")
        .should(($checkbox) => {
          expect($checkbox[0].name).to.equal("headingCheckbox");
          expect($checkbox[0].checked).to.equal(true);
        });
      cy.get("@checkboxes")
        .eq(1)
        .find("input")
        .should(($checkbox) => {
          expect($checkbox[0].name).to.equal(
            "cassandra.instance-f3c25eea-da3d-11e5-af84-0242fa37187c._app.1"
          );
          expect($checkbox[0].checked).to.equal(true);
        });
      assertActionButtons();
    });

    it("Select first task available and confirm action buttons exist", () => {
      assertCheckboxLength();
      cy.get("@checkboxes")
        .eq(1)
        .find("input")
        .should(($checkbox) => {
          expect($checkbox[0].name).to.equal(
            "cassandra.instance-f3c25eea-da3d-11e5-af84-0242fa37187c._app.1"
          );
          expect($checkbox[0].checked).to.equal(false);
        });
      cy.get("@checkboxes").eq(1).click();
      cy.get("@checkboxes")
        .eq(1)
        .find("input")
        .should(($checkbox) => {
          expect($checkbox[0].checked).to.equal(true);
        });
      assertActionButtons();
    });
  });

  context("Task DSL filters", () => {
    beforeEach(() => {
      cy.configureCluster({
        mesos: "1-service-with-executor-task",
      });
      cy.visitUrl({ url: "/services/detail/%2Fcassandra/tasks?_k=rh67gf" });
    });

    it("Has by default the is:active filter", () => {
      cy.get(".form-control.filter-input-text").should(($input) => {
        expect($input.val()).to.equal("is:active");
      });
    });

    it("Filters tasks that name contains 'server-'", () => {
      cy.get(".form-control.filter-input-text").retype("server-");
      cy.get("table tr td.task-table-column-name").should("have.length", 3);
    });

    it("Filters tasks that are in active state", () => {
      cy.get(".form-control.filter-input-text").retype("is:active");
      cy.get("table tr td.task-table-column-name").should("have.length", 4);
    });

    it("Filters tasks that are in failed state", () => {
      cy.get(".form-control.filter-input-text").retype("is:failed");
      cy.get("table tr td.task-table-column-name").should("have.length", 0);
    });

    it("Filters tasks by region", () => {
      cy.get(".form-control.filter-input-text").retype("region:eu-central-1");
      cy.get("table tr td.task-table-column-name").should("have.length", 1);
      cy.get("td.task-table-column-region-address").contains("eu-central-1");
    });

    it("Filters tasks by zone", () => {
      cy.get(".form-control.filter-input-text").retype("zone:eu-central-1b");
      cy.get("table tr td.task-table-column-name").should("have.length", 1);
      cy.get("td.task-table-column-zone-address").contains("eu-central-1b");
    });
  });

  context("Service tasks region", () => {
    beforeEach(() => {
      cy.configureCluster({
        mesos: "1-service-with-executor-task",
      });
    });

    it("Shows the correct region", () => {
      cy.visitUrl({ url: "/services/detail/%2Fcassandra/tasks?_k=rh67gf" });
      cy.get("td.task-table-column-zone-address").eq(1).contains("N/A");
    });
  });

  describe("Sorting", () => {
    beforeEach(() => {
      cy.configureCluster({
        mesos: "1-task-healthy",
      });
    });

    it("sorts DESC by hostname", () => {
      cy.visitUrl({ url: "/services/detail/%2Fsleep/tasks" });
      cy.get("th.task-table-column-host-address").click();

      cy.get(":nth-child(1) > .task-table-column-host-address").contains(
        "dcos-01"
      );
      cy.get(":nth-child(2) > .task-table-column-host-address").contains(
        "dcos-02"
      );
      cy.get(":nth-child(3) > .task-table-column-host-address").contains(
        "dcos-03"
      );
    });

    it("sorts ASC by hostname", () => {
      cy.visitUrl({ url: "/services/detail/%2Fsleep/tasks" });
      cy.get("th.task-table-column-host-address").click();
      cy.get("th.task-table-column-host-address").click();

      cy.get(":nth-child(1) > .task-table-column-host-address").contains(
        "dcos-03"
      );
      cy.get(":nth-child(2) > .task-table-column-host-address").contains(
        "dcos-02"
      );
      cy.get(":nth-child(3) > .task-table-column-host-address").contains(
        "dcos-01"
      );
    });

    it("sorts DESC by region", () => {
      cy.visitUrl({ url: "/services/detail/%2Fsleep/tasks" });

      cy.get("th.task-table-column-region-address").click();

      cy.get(
        ':nth-child(1) > .task-table-column-region-address:contains("ap-northeast-1")'
      );
      cy.get(
        ':nth-child(2) > .task-table-column-region-address:contains("eu-central-1")'
      );
      cy.get(
        ':nth-child(3) > .task-table-column-region-address:contains("eu-central-1")'
      );
    });

    it("sorts ASC by region", () => {
      cy.visitUrl({ url: "/services/detail/%2Fsleep/tasks" });

      cy.get("th.task-table-column-region-address").click();
      cy.get("th.task-table-column-region-address").click();

      cy.get(
        ':nth-child(1) > .task-table-column-region-address:contains("eu-central-1")'
      );
      cy.get(
        ':nth-child(2) > .task-table-column-region-address:contains("eu-central-1")'
      );
      cy.get(
        ':nth-child(3) > .task-table-column-region-address:contains("ap-northeast-1")'
      );
    });

    it("sorts DESC by zone", () => {
      cy.visitUrl({ url: "/services/detail/%2Fsleep/tasks" });

      cy.get("th.task-table-column-zone-address").click();

      cy.get(
        ':nth-child(1) > .task-table-column-zone-address:contains("ap-northeast-1a")'
      );
      cy.get(
        ':nth-child(2) > .task-table-column-zone-address:contains("eu-central-1b")'
      );
      cy.get(
        ':nth-child(3) > .task-table-column-zone-address:contains("eu-central-1c")'
      );
    });

    it("sorts ASC by zone", () => {
      cy.visitUrl({ url: "/services/detail/%2Fsleep/tasks" });

      cy.get("th.task-table-column-zone-address").click();
      cy.get("th.task-table-column-zone-address").click();

      cy.get(
        ':nth-child(1) > .task-table-column-zone-address:contains("eu-central-1c")'
      );
      cy.get(
        ':nth-child(2) > .task-table-column-zone-address:contains("eu-central-1b")'
      );
      cy.get(
        ':nth-child(3) > .task-table-column-zone-address:contains("ap-northeast-1a")'
      );
    });
  });
});
