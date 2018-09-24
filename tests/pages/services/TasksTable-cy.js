describe("Tasks Table", function() {
  context("Task row", function() {
    beforeEach(function() {
      cy.configureCluster({
        mesos: "1-service-with-executor-task",
        nodeHealth: true
      });
    });

    it("displays task detail page on task click", function() {
      cy.visitUrl({ url: "/services/detail/%2Fcassandra" });
      cy.get('a[title="server-0_10a"]').click({ force: true });
      cy.get(".page-header").should("contain", "server-0");
    });

    context("Files tab", function() {
      beforeEach(function() {
        cy.visitUrl({
          url: "/services/detail/%2Fcassandra/tasks/server-0_10a"
        });
        cy.get(".page-header-navigation .menu-tabbed-item")
          .contains("Files")
          .click();
      });

      it("shows the contents of the Mesos sandbox", function() {
        cy.get(".page-body-content tbody tr:visible").should(function($rows) {
          expect($rows.length).to.equal(13);
        });
      });

      it("shows directories as well as files", function() {
        cy.get(".page-body-content  .table-virtual-list").contains(
          "jre1.7.0_76"
        );
      });
    });
  });

  context("For a Service", function() {
    beforeEach(function() {
      cy.configureCluster({
        mesos: "healthy-tasks-in-mesos-and-marathon"
      });
      cy.viewport("macbook-15");
      cy.visitUrl({ url: "/services/detail/%2Fconfluent-kafka" });
    });

    context("Running task without healthcheck", function() {
      beforeEach(function() {
        cy.get("table tr")
          .contains("broker-0__3c7ab984-a9b9-41fb-bb73-0569f88c657e")
          .closest("tr")
          .find("td")
          .as("tds");
      });

      it("correctly shows status", function() {
        cy.get("@tds")
          .eq(6)
          .contains("Running");
      });

      it("correctly shows health", function() {
        cy.get("@tds")
          .eq(7)
          .find(".dot")
          .trigger("mouseover");
        cy.get(".tooltip").contains("No health checks available");
      });
    });

    context("Running task with healthcheck", function() {
      beforeEach(function() {
        cy.get("table tr")
          .contains("confluent-kafka.825e1e2e-d6a6-11e6-a564-8605ecf0a9df")
          .closest("tr")
          .find("td")
          .as("tds");
      });

      it("correctly shows status", function() {
        cy.get("@tds")
          .eq(6)
          .contains("Running");
      });

      it("correctly shows health", function() {
        cy.get("@tds")
          .eq(7)
          .find(".dot")
          .trigger("mouseover");
        cy.get(".tooltip").contains("Healthy");
      });
    });
  });

  context("Service tasks checkbox", function() {
    beforeEach(function() {
      cy.configureCluster({
        mesos: "1-service-with-executor-task"
      });
      cy.visitUrl({ url: "/services/detail/%2Fcassandra/tasks?_k=rh67gf" });
      cy.get("table tr")
        .find(".form-element-checkbox")
        .as("checkboxes");
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

    it("Select all tasks available and confirm action buttons exist", function() {
      assertCheckboxLength();
      cy.get("@checkboxes")
        .eq(0)
        .click();
      cy.get("@checkboxes")
        .eq(0)
        .find("input")
        .should(function($checkbox) {
          expect($checkbox[0].name).to.equal("headingCheckbox");
          expect($checkbox[0].checked).to.equal(true);
        });
      cy.get("@checkboxes")
        .eq(1)
        .find("input")
        .should(function($checkbox) {
          expect($checkbox[0].name).to.equal(
            "cassandra.f3c25eea-da3d-11e5-af84-0242fa37187c"
          );
          expect($checkbox[0].checked).to.equal(true);
        });
      assertActionButtons();
    });

    it("Select first task available and confirm action buttons exist", function() {
      assertCheckboxLength();
      cy.get("@checkboxes")
        .eq(1)
        .find("input")
        .should(function($checkbox) {
          expect($checkbox[0].name).to.equal(
            "cassandra.f3c25eea-da3d-11e5-af84-0242fa37187c"
          );
          expect($checkbox[0].checked).to.equal(false);
        });
      cy.get("@checkboxes")
        .eq(1)
        .click();
      cy.get("@checkboxes")
        .eq(1)
        .find("input")
        .should(function($checkbox) {
          expect($checkbox[0].checked).to.equal(true);
        });
      assertActionButtons();
    });
  });

  context("Task DSL filters", function() {
    beforeEach(function() {
      cy.configureCluster({
        mesos: "1-service-with-executor-task"
      });
      cy.visitUrl({ url: "/services/detail/%2Fcassandra/tasks?_k=rh67gf" });
    });

    it("Has by default the is:active filter", function() {
      cy.get(".form-control.filter-input-text").should(function($input) {
        expect($input.val()).to.equal("is:active");
      });
    });

    it("Filters tasks that name contains 'server-'", function() {
      cy.get(".form-control.filter-input-text").clear();
      cy.get(".form-control.filter-input-text").type("server-");
      cy.get("table tr td.task-table-column-name").should("to.have.length", 3);
    });

    it("Filters tasks that are in active state", function() {
      cy.get(".form-control.filter-input-text").clear();
      cy.get(".form-control.filter-input-text").type("is:active");
      cy.get("table tr td.task-table-column-name").should("to.have.length", 4);
    });

    it("Filters tasks by region", function() {
      cy.get(".form-control.filter-input-text").clear();
      cy.get(".form-control.filter-input-text").type("region:eu-central-1");
      cy.get("table tr td.task-table-column-name").should("to.have.length", 1);
      cy.get("td.task-table-column-region-address").contains("eu-central-1");
    });

    it("Filters tasks by zone", function() {
      cy.get(".form-control.filter-input-text").clear();
      cy.get(".form-control.filter-input-text").type("zone:eu-central-1b");
      cy.get("table tr td.task-table-column-name").should("to.have.length", 1);
      cy.get("td.task-table-column-zone-address").contains("eu-central-1b");
    });
  });

  context("Service tasks region", function() {
    beforeEach(function() {
      cy.configureCluster({
        mesos: "1-service-with-executor-task"
      });
    });

    it("Shows the correct region", function() {
      cy.visitUrl({ url: "/services/detail/%2Fcassandra/tasks?_k=rh67gf" });
      cy.get("td.task-table-column-zone-address")
        .eq(1)
        .contains("N/A");
    });
  });

  describe("Sorting", function() {
    beforeEach(function() {
      cy.configureCluster({
        mesos: "1-task-healthy"
      });
    });

    it("sorts DESC by hostname", function() {
      cy.visitUrl({ url: "/services/detail/%2Fsleep/tasks" });
      cy.get("th.task-table-column-host-address").click();

      cy.get(":nth-child(2) > .task-table-column-host-address").contains(
        "dcos-01"
      );
      cy.get(":nth-child(3) > .task-table-column-host-address").contains(
        "dcos-02"
      );
      cy.get(":nth-child(4) > .task-table-column-host-address").contains(
        "dcos-03"
      );
    });

    it("sorts ASC by hostname", function() {
      cy.visitUrl({ url: "/services/detail/%2Fsleep/tasks" });
      cy.get("th.task-table-column-host-address").click();
      cy.get("th.task-table-column-host-address").click();

      cy.get(":nth-child(2) > .task-table-column-host-address").contains(
        "dcos-03"
      );
      cy.get(":nth-child(3) > .task-table-column-host-address").contains(
        "dcos-02"
      );
      cy.get(":nth-child(4) > .task-table-column-host-address").contains(
        "dcos-01"
      );
    });

    it("sorts DESC by region", function() {
      cy.visitUrl({ url: "/services/detail/%2Fsleep/tasks" });

      cy.get("th.task-table-column-region-address").click();

      cy.get(":nth-child(2) > .task-table-column-region-address").contains(
        "ap-northeast-1"
      );
      cy.get(":nth-child(3) > .task-table-column-region-address").contains(
        "eu-central-1"
      );
      cy.get(":nth-child(4) > .task-table-column-region-address").contains(
        "eu-central-1"
      );
    });

    it("sorts ASC by region", function() {
      cy.visitUrl({ url: "/services/detail/%2Fsleep/tasks" });

      cy.get("th.task-table-column-region-address").click();
      cy.get("th.task-table-column-region-address").click();

      cy.get(":nth-child(2) > .task-table-column-region-address").contains(
        "eu-central-1"
      );
      cy.get(":nth-child(3) > .task-table-column-region-address").contains(
        "eu-central-1"
      );
      cy.get(":nth-child(4) > .task-table-column-region-address").contains(
        "ap-northeast-1"
      );
    });

    it("sorts DESC by zone", function() {
      cy.visitUrl({ url: "/services/detail/%2Fsleep/tasks" });

      cy.get("th.task-table-column-zone-address").click();

      cy.get(":nth-child(2) > .task-table-column-zone-address").contains(
        "ap-northeast-1a"
      );
      cy.get(":nth-child(3) > .task-table-column-zone-address").contains(
        "eu-central-1b"
      );
      cy.get(":nth-child(4) > .task-table-column-zone-address").contains(
        "eu-central-1c"
      );
    });

    it("sorts ASC by zone", function() {
      cy.visitUrl({ url: "/services/detail/%2Fsleep/tasks" });

      cy.get("th.task-table-column-zone-address").click();
      cy.get("th.task-table-column-zone-address").click();
      cy.get(":nth-child(2) > .task-table-column-zone-address").contains(
        "eu-central-1c"
      );
      cy.get(":nth-child(3) > .task-table-column-zone-address").contains(
        "eu-central-1b"
      );
      cy.get(":nth-child(4) > .task-table-column-zone-address").contains(
        "ap-northeast-1a"
      );
    });
  });
});
