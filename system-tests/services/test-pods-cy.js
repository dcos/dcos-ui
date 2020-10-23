// strict will make this function fail in case there's no app to delete.
function deleteApp(name, { strict = true } = {}) {
  cy.visitUrl(`services/detail/%2F${name}/tasks`);
  cy.contains(name);
  cy.wait(2000);

  cy.get("body").then(($body) => {
    if (!strict && $body.text().includes("Service not found")) {
      return;
    }

    cy.get(".page-header-actions .dropdown").click();
    cy.contains("Delete").click();
    cy.get(".modal-body input").type(name);
    cy.get(".modal-footer").contains("Delete").click();

    // we've got a race condition here: when the deletion finished, it'll send us to the table view.
    // we thus just wait for 2 seconds for the deletion to be done here.
    cy.wait(2000);
    cy.visitUrl(`services/detail/%2F${name}/tasks`);
    cy.contains("Service not found");
  });
}

describe("Services", () => {
  /**
   * Test the pods
   */
  describe("Pods", () => {
    it("creates a pod with multiple containers", () => {
      const serviceName = "pod-with-multiple-containers";
      deleteApp(serviceName, { strict: false });

      const cmdline = "while true; do echo 'test' ; sleep 100 ; done";

      // Select 'Multi-container (Pod)'
      cy.visitUrl(`services/overview/create`);
      cy.contains("Multi-container").click();
      cy.getFormGroupInputFor("Service ID *").retype(`/${serviceName}`);

      // Select first container
      cy.get(".menu-tabbed-item").contains("container-1").click();

      // Configure container
      cy.getFormGroupInputFor("Container Name").retype("one");
      cy.getFormGroupInputFor("Container Image").type("nginx");
      cy.getFormGroupInputFor("CPUs *").retype("0.1");
      cy.getFormGroupInputFor("Memory (MiB) *").retype("10");
      cy.getFormGroupInputFor("Command").type(cmdline);

      // Go back to Service
      cy.get(".menu-tabbed-item").contains("Service").click();

      cy.contains("Add Container").click();

      // Ensure the name changes to 'Services'
      cy.get(".menu-tabbed-item").contains("Services");
      cy.get(".menu-tabbed-item").contains("container-2").click();

      // Configure container
      cy.getFormGroupInputFor("Container Name").retype("two");
      cy.getFormGroupInputFor("Container Image").type("nginx");
      cy.getFormGroupInputFor("CPUs *").retype("0.1");
      cy.getFormGroupInputFor("Memory (MiB) *").retype("10");
      cy.getFormGroupInputFor("Command").type(cmdline);

      // Run service
      cy.get("button.button-primary").contains("Review & Run").click();
      cy.get("button.button-primary").contains("Run Service").click();

      // Wait for the table and the service to appear
      cy.get(".page-body-content .service-table")
        .contains(serviceName)
        .get("a.table-cell-link-primary")
        .contains(`${serviceName}`)
        .click();

      // open edit screen
      cy.get(".page-header-actions .dropdown")
        .click()
        .get(".dropdown-menu-items")
        .contains("Edit")
        .click();

      // check
      cy.getFormGroupInputFor("Service ID *").should(
        "have.value",
        `/${serviceName}`
      );

      // First container
      cy.get(".menu-tabbed-item").contains("one").click();
      cy.getFormGroupInputFor("Container Name").should("have.value", "one");
      cy.getFormGroupInputFor("Container Image").should("have.value", "nginx");
      cy.getFormGroupInputFor("CPUs *").should("have.value", "0.1");
      cy.getFormGroupInputFor("Memory (MiB) *").should("have.value", "10");
      cy.getFormGroupInputFor("Command").contains(cmdline);

      // Second container
      cy.get(".menu-tabbed-item").contains("Service").click();
      cy.get(".menu-tabbed-item").contains("Services");
      cy.get(".menu-tabbed-item").contains("two").click({ force: true });
      cy.getFormGroupInputFor("Container Name").should("have.value", "two");
      cy.getFormGroupInputFor("Container Image").should("have.value", "nginx");
      cy.getFormGroupInputFor("CPUs *").should("have.value", "0.1");
      cy.getFormGroupInputFor("Memory (MiB) *").should("have.value", "10");
      cy.getFormGroupInputFor("Command").contains(cmdline);

      deleteApp(serviceName);
    });

    it("creates a pod with ephemeral volume", () => {
      const serviceName = "pod-with-ephemeral-volume";
      deleteApp(serviceName, { strict: false });
      const command = "while true ; do echo 'test' ; sleep 100 ; done";

      cy.visitUrl(`services/overview/create`);
      cy.contains("Multi-container (Pod)").click();
      cy.getFormGroupInputFor("Service ID *").retype(`/${serviceName}`);

      cy.get(".menu-tabbed-item").contains("container-1").click();

      cy.getFormGroupInputFor("CPUs *").retype("0.1");
      cy.getFormGroupInputFor("Memory (MiB) *").retype("10");
      cy.getFormGroupInputFor("Command").type(command);

      cy.get(".menu-tabbed-item").contains("Volumes").click();
      cy.get(".button").contains("Add Volume").click();
      cy.get(".button.dropdown-toggle").click();
      cy.contains(".dropdown-select-item-title", "Ephemeral Storage").click();
      cy.getFormGroupInputFor("Name").type("test");
      cy.getFormGroupInputFor("Container Path").type("test");

      cy.get("button").contains("Review & Run").click();
      cy.get("button").contains("Run Service").click();

      cy.get(".page-body-content .service-table")
        .contains(serviceName)
        .get("a.table-cell-link-primary")
        .contains(`${serviceName}`)
        .click();

      // open edit screen
      cy.get(".page-header-actions .dropdown")
        .click()
        .get(".dropdown-menu-items")
        .contains("Edit")
        .click();

      cy.getFormGroupInputFor("Service ID *").should(
        "have.value",
        `/${serviceName}`
      );

      cy.get(".menu-tabbed-item").contains("container-1").click();
      cy.getFormGroupInputFor("CPUs *").retype("0.1");
      cy.getFormGroupInputFor("Memory (MiB) *").should("have.value", "10");
      cy.getFormGroupInputFor("Command").should("have.value", command);

      cy.get(".menu-tabbed-item").contains("Volumes").click();
      cy.getFormGroupInputFor("Name").should("have.value", "test");
      cy.getFormGroupInputFor("Container Path").should("have.value", "test");
    });
  });
});
