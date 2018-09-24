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
      cy.get('a[title="server-0_10a"]').click();
      cy.get(".page-header").should("contain", "server-0");
    });

    context("Files tab", function() {
      beforeEach(function() {
        cy.visitUrl({
          url: "/services/detail/%2Fcassandra/tasks/server-0_10a"
        });
        cy
          .get(".page-header-navigation .menu-tabbed-item")
          .contains("Files")
          .click();
      });

      it("shows the contents of the Mesos sandbox", function() {
        cy.get(".page-body-content tbody tr:visible").should(function($rows) {
          expect($rows.length).to.equal(13);
        });
      });

      it("shows directories as well as files", function() {
        cy
          .get(".page-body-content tbody tr:visible:first")
          .contains("jre1.7.0_76");
      });
    });

    it("shows an error for the missing stdout log", function() {
      cy.contains("Output").click();
      cy.wait(500);

      cy.contains("cannot retrieve the requested information").should(
        "be.visible"
      );
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
        cy
          .get("table tr")
          .contains("broker-0__3c7ab984-a9b9-41fb-bb73-0569f88c657e")
          .closest("tr")
          .find("td")
          .as("tds");
      });

      it("correctly shows status", function() {
        cy.get("@tds").eq(4).contains("Running");
      });

      it("correctly shows health", function() {
        cy.get("@tds").eq(5).find(".dot").triggerHover();
        cy.get(".tooltip").contains("No health checks available");
      });
    });

    context("Running task with healthcheck", function() {
      beforeEach(function() {
        cy
          .get("table tr")
          .contains("confluent-kafka.825e1e2e-d6a6-11e6-a564-8605ecf0a9df")
          .closest("tr")
          .find("td")
          .as("tds");
      });

      it("correctly shows status", function() {
        cy.get("@tds").eq(4).contains("Running");
      });

      it("correctly shows health", function() {
        cy.get("@tds").eq(5).find(".dot").triggerHover();
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
      cy.get("table tr").find(".form-element-checkbox").as("checkboxes");
    });

    function assertCheckboxLength() {
      cy.get("@checkboxes").should("have.length", 2);
    }

    function assertActionButtons() {
      cy
        .get(".filter-bar .button-collection .button-link > span")
        .eq(0)
        .contains("Restart");
      cy.get(".button-collection .button-link > span").eq(1).contains("Stop");
    }

    it("Select all tasks available and confirm action buttons exist", function() {
      assertCheckboxLength();
      cy.get("@checkboxes").eq(0).click();
      cy.get("@checkboxes").eq(0).find("input").should(function($checkbox) {
        expect($checkbox[0].name).to.equal("headingCheckbox");
        expect($checkbox[0].checked).to.equal(true);
      });
      cy.get("@checkboxes").eq(1).find("input").should(function($checkbox) {
        expect($checkbox[0].name).to.equal(
          "cassandra.f3c25eea-da3d-11e5-af84-0242fa37187c"
        );
        expect($checkbox[0].checked).to.equal(true);
      });
      assertActionButtons();
    });

    it("Select first task available and confirm action buttons exist", function() {
      assertCheckboxLength();
      cy.get("@checkboxes").eq(1).find("input").should(function($checkbox) {
        expect($checkbox[0].name).to.equal(
          "cassandra.f3c25eea-da3d-11e5-af84-0242fa37187c"
        );
        expect($checkbox[0].checked).to.equal(false);
      });
      cy.get("@checkboxes").eq(1).click();
      cy.get("@checkboxes").eq(1).find("input").should(function($checkbox) {
        expect($checkbox[0].checked).to.equal(true);
      });
      assertActionButtons();
    });
  });
});
