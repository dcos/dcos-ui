describe("Tasks Table", function() {
  context("Task row", function() {
    beforeEach(function() {
      cy.configureCluster({
        mesos: "1-service-with-executor-task",
        nodeHealth: true
      });
    });

    it("displays task detail page on task click", function() {
      cy.visitUrl({ url: "/services/overview/%2Fcassandra" });
      cy.get('a[title="server-0_10a"]').click();
      cy.get(".page-header").should("contain", "server-0");
    });

    context("Files tab", function() {
      beforeEach(function() {
        cy.visitUrl({
          url: "/services/overview/%2Fcassandra/tasks/server-0_10a"
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
  });

  context("For a Service", function() {
    beforeEach(function() {
      cy.configureCluster({
        mesos: "healthy-tasks-in-mesos-and-marathon"
      });
      cy.viewport("macbook-15");
      cy.visitUrl({ url: "/services/overview/%2Fconfluent-kafka" });
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
});
