describe("LDAP users", () => {
  beforeEach(() => {
    cy.visitUrl("settings/directory");
  });

  afterEach(() => {
    cy.window().then(win => {
      win.location.href = "about:blank";
    });
  });

  it("add a LDAP directory", () => {
    cy.contains("Add Directory").click({ force: true });

    const hostName = "ads1.mesosphere.com";
    const port = 389;
    const lookupDn = "cn=lookupuser,cn=Users,dc=mesosphere,dc=com";
    const lookupPassword = "pw-l00kup";
    const userSearchBase = "cn=Users,dc=mesosphere,dc=com";
    const userSearchFilterTemplate = "(sAMAccountName=%(username)s)";
    const groupSearchBase = "cn=Users,dc=mesosphere,dc=com";
    const groupSearchFilterTemplate =
      "(&(objectclass=group)(sAMAccountName=%(groupname)s))";

    cy.root()
      .getFormGroupInputFor("Host")
      .type(hostName);

    cy.root()
      .getFormGroupInputFor("Port")
      .type(port);

    cy.root()
      .get(".multiple-form-modal-sidebar-tabs")
      .contains("Authentication")
      .click();

    cy.get(".form-control-toggle")
      .contains("LDAP Credentials")
      .click();

    cy.root()
      .getFormGroupInputFor("Lookup DN")
      .clear()
      .type(lookupDn);

    cy.root()
      .getFormGroupInputFor("Lookup Password")
      .type(lookupPassword);

    cy.get(".form-control-toggle")
      .contains("Search bind")
      .click();

    cy.root()
      .getFormGroupInputFor("User Search Base")
      .type(userSearchBase);

    cy.root()
      .getFormGroupInputFor("User Search Filter Template")
      .type(userSearchFilterTemplate);

    cy.root()
      .get(".multiple-form-modal-sidebar-tabs")
      .contains("Group Import")
      .click();

    cy.root()
      .getFormGroupInputFor("Group Search Base")
      .type(groupSearchBase);

    cy.root()
      .getFormGroupInputFor("Group Search Filter Template")
      .type(groupSearchFilterTemplate);

    cy.get(".modal button.button-primary")
      .contains("Add Directory")
      .click({ force: true });

    cy.get(".configuration-map-row").contains("ads1.mesosphere.com");
  });

  it("requires CA certificate only when client certificate is not empty", () => {
    cy.contains("Edit").click({ force: true });

    cy.get(".content-editable")
      .eq(0)
      .type("1");

    cy.get(".modal button.button-primary")
      .contains("Save Configuration")
      .click({ force: true });

    cy.get(".form-control-feedback").contains("Field cannot be empty");

    cy.get(".content-editable")
      .eq(0)
      .type("{selectall}{backspace}");

    cy.get(".form-control-feedback").should("not.exist");
  });

  it("test the ldap connection", () => {
    cy.contains("Test Connection").click({ force: true });

    cy.get("input[name='uid'").type("john2");
    cy.get("input[name='password'").type("pw-john2");
    cy.get(".modal button")
      .contains("Test Connection")
      .click();

    cy.contains("Connection with LDAP server was successful!");
  });

  // TODO: this test fails since we switched from dcos-launch to terraform.
  it.skip("test the authentication delegation", () => {
    // logout
    cy.get(".header-bar-dropdown-trigger")
      .first()
      .click();
    cy.get("li")
      .contains("Sign Out")
      .click();

    // login
    cy.get(".login-modal");
    cy.get("input[name='uid']").type("john3");
    cy.get("input[name='password']").type("pw-john3");
    cy.get("button.button-primary")
      .contains("Log In")
      .click();

    // expect access denied screen
    cy.get(".panel-content").contains("Access denied");
    cy.get(".panel-content")
      .contains("Log out")
      .click();

    // login as root user again
    cy.get(".login-modal");
    cy.get("input[name='uid']").type("bootstrapuser");
    cy.get("input[name='password']").type("deleteme");
    cy.get("button.button-primary")
      .contains("Log In")
      .click();

    // make sure the login is finished
    cy.contains("Dashboard");

    // assert that john3 appears in the list as "external"
    cy.visitUrl("organization/users");
    cy.get(".table-cell-link-primary")
      .contains("john3")
      .parents(".row")
      .contains("External");
  });

  it("explicitly import user", () => {
    cy.visitUrl("organization/users");
    cy.get(".breadcrumb").contains("Users");

    cy.get(".page-header-actions .dropdown")
      .click()
      .get(".dropdown-menu-items")
      .contains("Import LDAP User")
      .click();
    cy.get("input[name='username']").type("john2");
    cy.get(".button.button-primary")
      .contains("Add")
      .click();
    cy.get(".modal-body").contains("User john2 added.");
  });

  // Note: this test is unreliable because the group import endpoint is flaky.
  // See Jira: DCOS-17342 if having issues with this test.
  it("explicitly import group", () => {
    cy.visitUrl("organization/groups");
    cy.get(".breadcrumb").contains("Groups");

    cy.get(".page-header-actions .dropdown")
      .click()
      .get(".dropdown-menu-items")
      .contains("Import LDAP Group")
      .click();
    cy.get("input[name='groupname']").type("johngroup");
    cy.get(".button.button-primary")
      .contains("Add")
      .click();
    cy.get(".modal-body").contains("Group johngroup added.");
  });

  it("delete the LDAP directory", () => {
    cy.visitUrl("settings/directory");
    cy.get(".button-danger")
      .contains("Delete")
      .click();

    cy.get(".modal .button-danger")
      .contains("Delete")
      .click();

    cy.contains("Add Directory");
  });
});
