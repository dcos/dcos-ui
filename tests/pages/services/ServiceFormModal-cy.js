function openTab(tab) {
  cy.get(".menu-tabbed-item-label").contains(tab).click();
}

function openServiceModal() {
  cy.get(".page-header-actions button").first().click();
  cy.contains("Run a Service").click();
}

function clickRunService() {
  cy.get(".panel .button").contains("Run a Service").click();
}

function openServiceForm() {
  cy.get(".create-service-modal-service-picker-option")
    .contains("Single Container")
    .click();
}

function openServiceJSON() {
  cy.get(".create-service-modal-service-picker-option")
    .contains("JSON Configuration")
    .click();
}

describe("Service Form Modal", () => {
  describe("Vertical Bursting", () => {
    beforeEach(() => {
      cy.configureCluster({
        mesos: "1-empty-group",
        nodeHealth: true,
      });
      cy.visitUrl({ url: "/services/overview/create" });
    });
    describe("Single Container", () => {
      it("is available in the Form", () => {
        cy.contains("Single Container").click();
        cy.contains("More Settings").click();
        cy.getFormGroupInputFor("CPUs")
          .filter("input[name='limits.cpus']")
          .retype("1");
        cy.getFormGroupInputFor("Memory (MiB)")
          .filter("input[name='limits.mem']")
          .retype("42");
        cy.get("label").contains("JSON Editor").click();

        cy.get("#brace-editor")
          .contents()
          .asJson()
          .should("deep.equal", [
            {
              id: "/",
              instances: 1,
              portDefinitions: [],
              container: { type: "MESOS", volumes: [] },
              cpus: 0.1,
              mem: 128,
              requirePorts: false,
              networks: [],
              healthChecks: [],
              fetch: [],
              constraints: [],
              resourceLimits: { cpus: 1, mem: 42 },
            },
          ]);
      });
    });
    describe("Multi Container", () => {
      it("is available in the Form", () => {
        cy.contains("Multi-container (Pod)").click();
        cy.get(".menu-tabbed-item").contains("container-1").click();
        cy.contains("More Settings").click();
        cy.getFormGroupInputFor("CPUs")
          .filter("input[name='containers.0.limits.cpus']")
          .retype("0.5");
        cy.getFormGroupInputFor("Memory (MiB)")
          .filter("input[name='containers.0.limits.mem']")
          .retype("42");
        cy.get("label").contains("JSON Editor").click();

        cy.get("#brace-editor")
          .contents()
          .asJson()
          .should("deep.equal", [
            {
              id: "/",
              containers: [
                {
                  name: "container-1",
                  resources: { cpus: 0.1, mem: 128 },
                  resourceLimits: { mem: 42, cpus: 0.5 },
                },
              ],
              scaling: { instances: 1, kind: "fixed" },
              networks: [{ mode: "host" }],
              volumes: [],
              fetch: [],
              scheduling: { placement: { constraints: [] } },
            },
          ]);
      });

      it("parses unlimited and number values", () => {
        cy.contains("Multi-container (Pod)").click();
        cy.get("label").contains("JSON Editor").click();

        cy.window().then((window) => {
          const editor = window.ace.edit("brace-editor");

          editor.setValue(`{
  "id": "/app-with-resource-limits",
  "containers": [
    {
      "name": "container-1",
      "resources": { "cpus": 0.1, "mem": 128 },
      "resourceLimits": {
        "cpus": "unlimited",
        "mem": 42
      }
    }
  ]
}`);
        });

        cy.contains("container-1").click();

        cy.contains("More Settings").click();
        cy.getFormGroupInputFor("CPUs")
          .filter("input[name='containers.0.limits.cpus.unlimited']")
          .focus()
          .should("be.checked");
        cy.getFormGroupInputFor("Memory (MiB)")
          .filter("input[name='containers.0.limits.mem']")
          .should("have.value", "42");
      });
    });
  });

  context("Create", () => {
    beforeEach(() => {
      cy.configureCluster({ mesos: "1-empty-group", nodeHealth: true });
      cy.visitUrl({ url: "/services/overview" });
    });

    context("Root level", () => {
      it("Should Autofocus on the Service ID input field", () => {
        openServiceModal();
        openServiceForm();
        cy.focused().should("have.attr.name", "id");
        cy.get('.modal .menu-tabbed-view input[name="id"]').should(
          "to.have.value",
          "/"
        );

        cy.get(".ace_content").should((nodeList) => {
          expect(nodeList[0].textContent).to.contain('"id": "/"');
        });
      });

      it("redirects to the catalog page after click install package", () => {
        openServiceModal();
        cy.contains("Install a Package").click();
        cy.url().should("contain", "/catalog");
      });

      describe("Form errors", () => {
        it("displays an error only after Review & Run is clicked", () => {
          openServiceModal();
          openServiceForm();

          cy.get('[name="id"]').clear();

          cy.get(".infoBoxWrapper").should("not.be.visible");

          // Click review and run
          cy.get(".modal-full-screen-actions")
            .contains("button", "Review & Run")
            .click();

          cy.get(".infoBoxWrapper")
            .contains("Service ID must be defined")
            .should("be.visible");

          cy.get('[name="id"]').type("/hello-world");

          // Now automatic revalidation happens without clicking Review & Run again
          cy.get(".infoBoxWrapper")
            .contains("Service ID must be defined")
            .should("not.be.visible");
        });

        it("displays an error badge for the Services tab", () => {
          openServiceModal();
          openServiceForm();

          cy.get('[name="id"]').clear("");

          cy.get(".modal-full-screen-actions")
            .contains("button", "Review & Run")
            .click();

          cy.get(".errorsAlert-listItem")
            .should(($items) => {
              expect($items.length).to.equal(2);
            })
            .then(($items) => {
              cy.get('.active > .menu-tabbed-item-label span[role="button"]')
                .contains($items.length.toString())
                .should("be.visible");
            });

          cy.get('[name="id"]').type("/hello-world");
          cy.get('[name="container.docker.image"]').type("nginx");

          cy.get(
            '.active > .menu-tabbed-item-label span[role="button"]'
          ).should("not.be.visible");
        });
        it("displays an error badge for a container tab", () => {
          openServiceModal();
          cy.get(".create-service-modal-service-picker-option")
            .contains("Multi-container (Pod)")
            .click();

          cy.get(".menu-tabbed-item").contains("container-1").click();

          cy.get('[name="containers.0.name"]').retype("!!!");

          cy.get(".modal-full-screen-actions")
            .contains("button", "Review & Run")
            .click();

          cy.get(".errorsAlert-listItem")
            .should(($items) => {
              expect($items.length).to.equal(1);
            })
            .then(($items) => {
              cy.get('.active > .menu-tabbed-item-label span[role="button"]')
                .contains($items.length.toString())
                .should("be.visible");
            });

          cy.get('[name="containers.0.name"]').retype("hello-world").blur();

          cy.get(
            '.active > .menu-tabbed-item-label span[role="button"]'
          ).should("not.be.visible");
        });
        it("focuses the last field with an error when clicking to a tab with an error", () => {
          openServiceModal();
          openServiceForm();

          cy.get('[name="id"]').clear();

          cy.get(".modal-full-screen-actions")
            .contains("button", "Review & Run")
            .click();

          cy.get(".menu-tabbed-item").contains("Placement").click();

          cy.get(".modal-wrapper .menu-tabbed-item")
            .contains("Service")
            .click();

          cy.focused().should("have.attr.name", "cmd");
        });
      });

      describe("JSON errors", () => {
        it("displays an error with invalid JSON", () => {
          openServiceModal();
          openServiceForm();

          // Switch to JSON
          cy.get(".modal-full-screen-actions label")
            .contains("JSON Editor")
            .click();

          cy.get(".ace_text-input").focus().retype("", { force: true });

          cy.get(".infoBoxWrapper")
            .contains("Unexpected end of JSON input")
            .should("be.visible");
        });

        it("clears the JSON error once it is fixed", () => {
          openServiceModal();
          openServiceForm();

          // Switch to JSON
          cy.get(".modal-full-screen-actions label")
            .contains("JSON Editor")
            .click();

          // TODO: sometimes the editor does not yet have the content we're deleting in this step
          cy.get(".ace_text-input").focus().retype("", { force: true });

          cy.get(".infoBoxWrapper")
            .contains("Unexpected end of JSON input")
            .should("be.visible");

          // The closing } is auto inserted
          cy.get(".ace_text-input")
            .focus()
            .retype('{{}\n\t"id": "/foo"\n', { force: true });

          cy.get(".infoBoxWrapper").should("not.be.visible");
          cy.get("input[name=id]").should("have.value", "/foo");
        });

        context("Clearing JSON errors when re-opening", () => {
          beforeEach(() => {
            openServiceModal();
          });

          it("clears JSON errors when re-opening the single container service form", () => {
            openServiceForm(); // Select "Single container".
            cy.get(".modal .toggle-button + span").click(); // Open the JSON Editor.
            cy.get(".button").contains("Review & Run").click(); // Try to submit.
            cy.get(".ace_error"); // Verify errors in the JSON.
            cy.get(".modal-header button").contains("Back").click(); // Go back.
            cy.contains("button", "Discard").click(); // Confirm.
            openServiceForm(); // Select "Single container" again.
            cy.get(".ace_editor"); // The JSON Editor should be open.
            cy.get(".ace_error").should("not.exist"); // Verify no errors in the JSON.
          });

          it("clears JSON errors when re-opening the pod form", () => {
            cy.get(".create-service-modal-service-picker-option")
              .contains("Multi-container (Pod)")
              .click(); // Select "Pod".
            cy.get(".modal .toggle-button + span").click(); // Open the JSON Editor.
            cy.get(".form-group").find('[name="id"]').type("{backspace}"); // Introduce an error by deleting the ID.
            cy.get(".button").contains("Review & Run").click(); // Try to submit.
            cy.get(".ace_error"); // Verify errors in the JSON.
            cy.get(".modal-header button").contains("Back").click(); // Go back.
            cy.contains("button", "Discard").click(); // Confirm.
            cy.get(".create-service-modal-service-picker-option")
              .contains("Multi-container (Pod)")
              .click(); // Select "Pod" again.
            cy.get(".ace_editor"); // The JSON Editor should be open.
            cy.get(".ace_error").should("not.exist"); // Verify no errors in the JSON.
          });

          it("clears JSON errors when re-opening the JSON form", () => {
            cy.get(".create-service-modal-service-picker-option")
              .contains("JSON Configuration")
              .click(); // Select "JSON Configuration".
            cy.get(".button").contains("Review & Run").click(); // Try to submit.
            cy.get(".ace_error"); // Verify errors in the JSON.
            cy.get(".modal-header button").contains("Back").click(); // Go back.
            cy.get(".create-service-modal-service-picker-option")
              .contains("JSON Configuration")
              .click(); // Select "JSON Configuration" again.
            cy.get(".ace_error").should("not.exist"); // Verify no errors in the JSON.
          });
        });
      });
    });

    context("Group level", () => {
      beforeEach(() => {
        cy.visitUrl({ url: "/services/overview/%2Fmy-group" });
      });

      it("Opens the right modal on click", () => {
        clickRunService();
        cy.get(".modal-full-screen").should("have.length", 1);
      });

      it("contains the right group id in the modal", () => {
        clickRunService();
        openServiceForm();
        cy.get('.modal .menu-tabbed-view input[name="id"]').should(
          "to.have.value",
          "/my-group/"
        );
      });

      it("contains the right JSON in the JSON editor", () => {
        clickRunService();
        openServiceJSON();
        cy.get(".ace_content").should((nodeList) => {
          expect(nodeList[0].textContent).to.contain('"id": "/my-group/"');
        });
      });
    });

    it("has the correct default values", () => {
      const getFormValue = (name) =>
        cy.get('.modal .menu-tabbed-view input[name="' + name + '"]');

      openServiceModal();
      openServiceForm();

      getFormValue("cpus").should("have.value", "0.1");
      getFormValue("mem").should("have.value", "128");
      getFormValue("instances").should("have.value", "1");

      cy.get(".ace_content").should(([el]) => {
        expect(el.textContent).to.contain('"type": "MESOS"');
        expect(el.textContent).to.contain('"cpus": 0.1');
        expect(el.textContent).to.contain('"instances": 1');
        expect(el.textContent).to.contain('"mem": 128');
      });
    });

    describe("switching to multi-container", () => {
      beforeEach(() => {
        openServiceModal();
        openServiceForm();
        cy.get("a.clickable").contains("Add another container").click();
        cy.get(".button-primary").contains("Switch to Pod").click();
      });

      it("successfully opens all tabs", () => {
        const assertTab = (name) => {
          openTab(name);
          cy.get(".form-group-heading-content").contains(name);
        };

        assertTab("Placement");
        openTab("Volumes");
        cy.get("h1.flush-top").contains("Volumes");
        assertTab("Health Checks");
        assertTab("Environment");
      });
    });

    it("persists the state of the JSON editor after a reload", () => {
      openServiceModal();
      openServiceForm();
      // Open JSON Editor.
      cy.get(".modal .toggle-button + span").click();
      cy.reload();
      openServiceForm();
      cy.get(".modal-full-screen-side-panel").should(
        "have.class",
        "is-visible"
      );
      // Close JSON Editor.
      cy.get(".modal .toggle-button + span").click();
      cy.reload();
      openServiceForm();
      cy.get(".modal-full-screen-side-panel").should(
        "not.have.class",
        "is-visible"
      );
    });
  });

  context("Multi-container - Review & Run", () => {
    beforeEach(() => {
      cy.configureCluster({ mesos: "1-task-healthy" });

      cy.visitUrl({ url: "/services/overview/%2F/create" });
      cy.get(".create-service-modal-service-picker-option")
        .contains("Multi-container (Pod)")
        .click();

      // Fill in SERVICE ID
      cy.get('[name="id"]').retype("/test-review-and-run");
    });

    it("Should contain two containers at review and run modal", () => {
      // Add a second container
      cy.get(".menu-tabbed-view .button.button-primary-link")
        .contains("Add Container")
        .click();

      // Click review and run
      cy.get(".modal-full-screen-actions")
        .contains("button", "Review & Run")
        .click();

      // assert review and run modal
      cy.get(".detail-view-section-heading.configuration-map-heading")
        .eq(1)
        .contains("Containers")
        .siblings()
        .should("have.length", 2);
    });
  });

  context("Multi-container - Edit", () => {
    it("sets vip port when host does not match app id", () => {
      cy.configureCluster({
        mesos: "1-pod",
      });

      cy.visitUrl({ url: "/services/detail/%2Fcustomvip" });
      cy.get(".page-header-actions .dropdown").click();
      cy.get(".dropdown-menu-items").contains("Edit").click();
      openTab("Networking");
      cy.get("[name='containers.0.endpoints.0.vipPort']").type(5);

      cy.contains(".marathon.l4lb.thisdcos.directory:5005");
    });
  });

  context("Comprehensible error messages", () => {
    function clickReviewAndRun() {
      cy.get(".button-primary").contains("Review & Run").click();
    }

    function typeInInput(inputName, text) {
      cy.get(".create-service-modal-form")
        .find('[name="' + inputName + '"]')
        .retype(text);
    }

    function clearInput(inputName) {
      cy.get(".create-service-modal-form")
        .find('[name="' + inputName + '"]')
        .clear();
    }

    function clickCheckbox(text) {
      cy.get(".create-service-modal-form").contains(text).click();
    }

    function clickButton(text) {
      cy.get(".button").contains(text).click();
    }

    function clickDropdownItem(parent, item) {
      cy.get(".dropdown-toggle").contains(parent).click();
      cy.get(".dropdown-menu-items").contains(item).click();
    }

    function clickSelectItem(name, item) {
      cy.get(".form-control-select")
        .find('[name="' + name + '"]')
        .select(item);
    }

    function errorMessageShouldContain(text) {
      cy.get(".infoBoxWrapper");
      cy.get(".infoBoxWrapper").should("contain", text);
    }

    beforeEach(() => {
      cy.configureCluster({
        mesos: "1-empty-group",
        nodeHealth: true,
      });
      cy.visitUrl({ url: "/services/overview/create" });
    });

    context("Single Container", () => {
      beforeEach(() => {
        cy.get(".create-service-modal-service-picker-option")
          .contains("Single Container")
          .click();
      });

      it("show comprehensible errors", () => {
        cy.get("a.clickable").contains("More Settings").click();
        cy.get(".gm-scroll-view").last().scrollTo("bottom");

        typeInInput("gpus", "-1");
        typeInInput("disk", "-1");
        clickReviewAndRun();
        errorMessageShouldContain("GPUs must be bigger than or equal to 0.");
        errorMessageShouldContain("Disk must be bigger than or equal to 0.");

        typeInInput("gpus", "0");
        cy.get(".flex-align-items-center").contains("Docker").click();
        clickReviewAndRun();
        errorMessageShouldContain(
          'Container Image must be specified when using the Docker Engine runtime. You can change runtimes under "Advanced Settings".'
        );
      });

      it("displays comprehensible error for invalid advanced constraint value", () => {
        openTab("Placement");
        clickButton("Add Placement Constraint");
        clickDropdownItem("Select ...", "Group By");
        typeInInput("constraints.0.fieldName", "1");
        typeInInput("constraints.0.value", "-1");
        clickReviewAndRun();
        errorMessageShouldContain(
          "Placement advanced constraints values must only contain characters between 0-9 for operator GROUP_BY."
        );
      });

      it("displays comprehensible error for invalid service endpoint values", () => {
        openTab("Networking");
        clickSelectItem("networks.0.network", "Bridge");
        clickButton("Add Service Endpoint");
        clickCheckbox("Assign Automatically");
        clickCheckbox("Enable Load Balanced Service Address");
        typeInInput("portDefinitions.0.containerPort", "-1");
        typeInInput("portDefinitions.0.name", "-1");
        typeInInput("portDefinitions.0.hostPort", "-1");
        typeInInput("portDefinitions.0.vipPort", "-1");

        clickReviewAndRun();
        errorMessageShouldContain(
          "Service endpoint container ports must be bigger than or equal to 0."
        );
        errorMessageShouldContain(
          "Service endpoint host ports must be bigger than or equal to 0."
        );
        errorMessageShouldContain(
          "Service endpoint names may only contain digits (0-9), dashes (-) and lowercase letters (a-z) e.g. web-server. The name may not begin or end with a dash."
        );
        errorMessageShouldContain(
          "Service endpoint host ports label for VIP must be in the following format: <ip-addres|name>:<port>."
        );
      });

      it("displays comprehensible error for missing properties for Host Volume", () => {
        openTab("Volumes");
        clickButton("Add Volume");
        clickDropdownItem("Select ...", "Host Volume");
        typeInInput("volumes.0.containerPath", "1");
        clickReviewAndRun();
        errorMessageShouldContain("Volume properties must be defined.");
      });

      it("displays comprehensible error for missing properties for Local Persistent Volume", () => {
        openTab("Volumes");
        clickButton("Add Volume");
        clickDropdownItem("Select ...", "Local Persistent Volume");
        typeInInput("volumes.0.containerPath", "1");
        clickReviewAndRun();
        errorMessageShouldContain("Volume properties must be defined.");
      });

      it("displays comprehensible error for missing environment label key", () => {
        openTab("Environment");
        clickButton("Add Label");
        typeInInput("labels.0.key", " ");
        clickReviewAndRun();
        errorMessageShouldContain(
          "Environment variable label keys must not start or end with whitespace characters."
        );
      });
    });

    context("Multi Container", () => {
      beforeEach(() => {
        cy.get(".create-service-modal-service-picker-option")
          .contains("Multi-container (Pod)")
          .click();
      });

      context("Container Tab", () => {
        beforeEach(() => {
          openTab("container-1");
        });

        it("displays comprehensible error for missing containers", () => {
          clearInput("containers.0.name");
          clearInput("containers.0.resources.cpus");
          clearInput("containers.0.resources.mem");
          clickReviewAndRun();
          errorMessageShouldContain(
            "Containers must contain at least one item."
          );
        });

        it("displays comprehensible error for missing container props", () => {
          clearInput("containers.0.name");
          typeInInput("containers.0.resources.cpus", "-1");
          typeInInput("containers.0.resources.mem", "-1");
          clickReviewAndRun();
          errorMessageShouldContain("Container names must be defined.");
          errorMessageShouldContain(
            "Container CPUs must be bigger than or equal to 0.001."
          );
          errorMessageShouldContain(
            "Container Memory must be bigger than or equal to 0.001."
          );
        });
      });

      it("displays comprehensible error for invalid service endpoint values", () => {
        openTab("Networking");
        clickButton("Add Service Endpoint");
        clickCheckbox("Assign Automatically");
        clickCheckbox("TCP");
        clickCheckbox("Enable Load Balanced Service Address");

        typeInInput("containers.0.endpoints.0.name", "-1");
        typeInInput("containers.0.endpoints.0.hostPort", "-1");
        typeInInput("containers.0.endpoints.0.vipPort", "-1");

        clickReviewAndRun();
        errorMessageShouldContain(
          "Service endpoint host ports must be bigger than or equal to 0."
        );
        errorMessageShouldContain(
          "Service endpoint names may only contain digits (0-9), dashes (-) and lowercase letters (a-z) e.g. web-server. The name may not begin or end with a dash."
        );
        errorMessageShouldContain(
          "Service endpoint protocol must be selected."
        );
        errorMessageShouldContain(
          "Service endpoint host ports label for VIP must be in the following format: <ip-addres|name>:<port>."
        );
      });

      it("displays comprehensible error for invalid properties for volumes", () => {
        openTab("Volumes");
        clickButton("Add Volume");
        clickDropdownItem("Select ...", "Local Persistent Volume");
        typeInInput("volumeMounts.0.name", " ");
        typeInInput("volumeMounts.0.size", "-1");
        typeInInput("volumeMounts.0.mountPath.0", " ");
        clickReviewAndRun();
        errorMessageShouldContain(
          "Volumes name may only contain digits (0-9), dashes (-) and lowercase letters (a-z) e.g. web-server. The name may not begin or end with a dash."
        );
        errorMessageShouldContain(
          "Volumes size must be bigger than or equal to 0."
        );
      });

      it("displays comprehensible error for invalid properties for health checks", () => {
        openTab("Health Checks");
        clickButton("Add Health Check");
        clickSelectItem("containers.0.healthCheck.protocol", "HTTP");
        clickButton("Advanced Health Check Settings");
        [
          "containers.0.healthCheck.http.path",
          "containers.0.healthCheck.gracePeriodSeconds",
          "containers.0.healthCheck.intervalSeconds",
          "containers.0.healthCheck.timeoutSeconds",
          "containers.0.healthCheck.maxConsecutiveFailures",
        ].forEach((input) => {
          typeInInput(input, "-1");
        });
        clickReviewAndRun();
        errorMessageShouldContain(
          "Health check service endpoint must be defined."
        );
        errorMessageShouldContain(
          "Health check grace periods must be bigger than or equal to 0."
        );
        errorMessageShouldContain(
          "Health check intervals must be bigger than or equal to 0."
        );
        errorMessageShouldContain(
          "Health check max failures must be bigger than or equal to 0."
        );
        errorMessageShouldContain(
          "Health check timeouts must be bigger than or equal to 0."
        );
      });
    });
  });
});
