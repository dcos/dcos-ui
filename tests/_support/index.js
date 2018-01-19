const router = require("./utils/router");
const StringUtil = require("./utils/StringUtil");

Cypress.Commands.add("configureCluster", function(configuration) {
  if (Object.keys(configuration).length === 0) {
    return;
  }

  if (Cypress.env("FULL_INTEGRATION_TEST")) {
    // Assume login if not explicitly set to false
    if (configuration.logIn !== false) {
      cy
        .request(
          "POST",
          Cypress.env("CLUSTER_URL") + "/acs/api/v1/auth/login",
          { password: "deleteme", uid: "bootstrapuser" }
        )
        .then(function(response) {
          var cookies = response.headers["set-cookie"];
          cookies.forEach(function(cookie) {
            var sessionID = cookie.split("=")[0];
            // Set cookies for cypress
            Cypress.Cookies.set(sessionID, response.body.token);
            // Set cookies for application
            cy.window().then(function(win) {
              win.document.cookie = cookie;
            });
          });
        });
    }

    return;
  }

  router.clearRoutes();
  cy.server();

  if (configuration.mesos === "1-task-healthy") {
    cy
      .route({
        method: "POST",
        url: /mesos\/api\/v1\?subscribe/,
        response: require("../_fixtures/marathon-1-task/mesos-subscribe"),
        headers: {
          "Content-Type": "application/json"
        }
      })
      .route({
        method: "POST",
        url: /mesos\/api\/v1\?get_master/,
        response: "fx:marathon-1-task/mesos-get-master",
        headers: {
          "Content-Type": "application/json"
        }
      });

    router
      .route(/service\/marathon\/v2\/apps/, "fx:marathon-1-task/app")
      .route(
        /service\/marathon\/v2\/apps\/\/sleep\/versions/,
        "fx:marathon-1-task/versions"
      )
      .route(
        /service\/marathon\/v2\/apps\/\/sleep\/versions\/2015-08-28T01:26:14\.620Z/,
        "fx:marathon-1-task/app-version-1"
      )
      .route(
        /service\/marathon\/v2\/apps\/\/sleep\/versions\/2015-02-28T05:12:12\.221Z/,
        "fx:marathon-1-task/app-version-2"
      )
      .route(/service\/marathon\/v2\/groups/, "fx:marathon-1-task/groups")
      .route(
        /service\/marathon\/v2\/deployments/,
        "fx:marathon-1-task/deployments"
      )
      .route(/metronome\/v1\/jobs/, "fx:metronome/jobs")
      .route(/dcos-version/, "fx:dcos/dcos-version")
      .route(/history\/minute/, "fx:marathon-1-task/history-minute")
      .route(/history\/last/, "fx:marathon-1-task/summary")
      .route(/state-summary/, "fx:marathon-1-task/summary")
      .route(/overlay-master\/state/, "fx:mesos/overlay-master");
  }

  if (configuration.mesos === "1-pod") {
    router.route(
      /service\/marathon\/v2\/groups/,
      "fx:marathon-1-pod-group/groups"
    );
  }

  if (configuration.mesos === "1-empty-group") {
    router.route(/marathon\/v2\/groups/, "fx:marathon-1-group/groups");
  }

  if (configuration.mesos === "1-for-each-health") {
    cy
      .route({
        method: "POST",
        url: /mesos\/api\/v1\?subscribe/,
        response: require("../_fixtures/marathon-1-task/mesos-subscribe"),
        headers: {
          "Content-Type": "application/json"
        }
      })
      .route({
        method: "POST",
        url: /mesos\/api\/v1\?get_master/,
        response: "fx:marathon-1-task/mesos-get-master",
        headers: {
          "Content-Type": "application/json"
        }
      });

    router
      .route(/service\/marathon\/v2\/apps/, "fx:1-app-for-each-health/app")
      .route(/service\/marathon\/v2\/groups/, "fx:1-app-for-each-health/groups")
      .route(
        /service\/marathon\/v2\/deployments/,
        "fx:marathon-1-task/deployments"
      )
      .route(/metronome\/v1\/jobs/, "fx:metronome/jobs")
      .route(/dcos-version/, "fx:dcos/dcos-version")
      .route(/history\/last/, "fx:1-app-for-each-health/summary")
      .route(/state-summary/, "fx:1-app-for-each-health/summary")
      .route(/overlay-master\/state/, "fx:mesos/overlay-master");
  }

  if (configuration.mesos === "1-service-with-executor-task") {
    cy
      .route({
        method: "POST",
        url: /mesos\/api\/v1\?subscribe/,
        response: require("../_fixtures/1-service-with-executor-task/mesos-subscribe"),
        delay: 100,
        headers: {
          "Content-Type": "application/json"
        }
      })
      .route({
        method: "POST",
        url: /mesos\/api\/v1\?get_master/,
        response: "fx:1-service-with-executor-task/mesos-get-master",
        headers: {
          "Content-Type": "application/json"
        }
      });

    router
      .route(
        /service\/marathon\/v2\/apps/,
        "fx:1-service-with-executor-task/app"
      )
      .route(
        /service\/marathon\/v2\/groups/,
        "fx:1-service-with-executor-task/app"
      )
      .route(
        /service\/marathon\/v2\/deployments/,
        "fx:marathon-1-task/deployments"
      )
      .route(/service\/marathon\/v2\/queue/, "fx:marathon-1-task/queue")
      .route(/metronome\/v1\/jobs/, "fx:metronome/jobs")
      .route(
        /agent\/(.*)?\/files\/(.*)?\/runs\/(.*)?/,
        "fx:1-service-with-executor-task/browse"
      )
      .route(
        /agent\/(.*)?\/files\/browse/,
        "fx:1-service-with-executor-task/browse"
      )
      .route(/dcos-version/, "fx:dcos/dcos-version")
      .route(
        /history\/minute/,
        "fx:1-service-with-executor-task/history-minute"
      )
      .route(/history\/last/, "fx:1-service-with-executor-task/summary")
      .route(/state-summary/, "fx:1-service-with-executor-task/summary")
      .route(
        /agent\/.*\/slave\(1\)\/state/,
        "fx:1-service-with-executor-task/slave-state"
      );
  }

  if (configuration.mesos === "1-task-with-volumes") {
    cy
      .route({
        method: "POST",
        url: /mesos\/api\/v1\?subscribe/,
        response: require("../_fixtures/marathon-1-task/mesos-subscribe"),
        headers: {
          "Content-Type": "application/json"
        }
      })
      .route({
        method: "POST",
        url: /mesos\/api\/v1\?get_master/,
        response: "fx:marathon-1-task/mesos-get-master",
        headers: {
          "Content-Type": "application/json"
        }
      });

    router
      .route(/marathon\/v2\/apps/, "fx:marathon-1-task/app")
      .route(/marathon\/v2\/groups/, "fx:marathon-1-task-with-volumes/groups")
      .route(/marathon\/v2\/deployments/, "fx:marathon-1-task/deployments")
      .route(/dcos-version/, "fx:dcos/dcos-version")
      .route(/history\/minute/, "fx:marathon-1-task/history-minute")
      .route(/history\/last/, "fx:marathon-1-task/summary")
      .route(/state-summary/, "fx:marathon-1-task/summary");
  }

  if (configuration.mesos === "healthy-tasks-in-mesos-and-marathon") {
    cy
      .route({
        method: "POST",
        url: /mesos\/api\/v1\?subscribe/,
        response: require("../_fixtures/healthy-tasks-in-mesos-and-marathon//mesos-subscribe"),
        headers: {
          "Content-Type": "application/json"
        }
      })
      .route({
        method: "POST",
        url: /mesos\/api\/v1\?get_master/,
        response: "fx:marathon-1-task/mesos-get-master",
        headers: {
          "Content-Type": "application/json"
        }
      });

    router
      .route(
        /marathon\/v2\/groups/,
        "fx:healthy-tasks-in-mesos-and-marathon/groups"
      )
      .route(/history\/last/, "fx:healthy-tasks-in-mesos-and-marathon/summary")
      .route(/state-summary/, "fx:healthy-tasks-in-mesos-and-marathon/summary");
  }

  if (configuration.deployments === "one-deployment") {
    router
      .route(/marathon\/v2\/deployments/, "fx:deployments/one-deployment")
      .route(/service\/marathon\/v2\/groups/, "fx:marathon-1-group/kafka");
  }

  if (configuration.mesos === "1-service-suspended") {
    cy
      .route({
        method: "POST",
        url: /mesos\/api\/v1\?subscribe/,
        response: require("../_fixtures/marathon-1-task/mesos-subscribe"),
        headers: {
          "Content-Type": "application/json"
        }
      })
      .route({
        method: "POST",
        url: /mesos\/api\/v1\?get_master/,
        response: "fx:marathon-1-task/mesos-get-master",
        headers: {
          "Content-Type": "application/json"
        }
      });

    router
      .route(/service\/marathon\/v2\/apps/, "fx:marathon-1-task/app-suspended")
      .route(
        /service\/marathon\/v2\/groups/,
        "fx:marathon-1-task/groups-suspended"
      )
      .route(
        /service\/marathon\/v2\/deployments/,
        "fx:marathon-1-task/deployments"
      )
      .route(/history\/minute/, "fx:marathon-1-task/history-minute")
      .route(/history\/last/, "fx:marathon-1-task/summary")
      .route(/state-summary/, "fx:marathon-1-task/summary");
  }

  if (configuration.mesos === "1-sdk-service") {
    cy
      .route({
        method: "POST",
        url: /mesos\/api\/v1\?subscribe/,
        response: require("../_fixtures/marathon-1-task/mesos-subscribe"),
        headers: {
          "Content-Type": "application/json"
        }
      })
      .route({
        method: "POST",
        url: /mesos\/api\/v1\?get_master/,
        response: "fx:marathon-1-task/mesos-get-master",
        headers: {
          "Content-Type": "application/json"
        }
      });

    router
      .route(
        /service\/marathon\/v2\/groups/,
        "fx:marathon-1-task/groups-sdk-services"
      )
      .route(
        /service\/marathon\/v2\/deployments/,
        "fx:marathon-1-task/deployments"
      )
      .route(
        /service\/marathon\/v2\/apps\/\/services\/sdk-sleep\/versions/,
        "fx:marathon-1-task/versions"
      )
      .route(/history\/minute/, "fx:marathon-1-task/history-minute")
      .route(/history\/last/, "fx:marathon-1-task/summary")
      .route(/state-summary/, "fx:marathon-1-task/summary");
  }

  if (configuration.mesos === "1-suspended-sdk-service") {
    cy
      .route({
        method: "POST",
        url: /mesos\/api\/v1\?subscribe/,
        response: require("../_fixtures/marathon-1-task/mesos-subscribe"),
        headers: {
          "Content-Type": "application/json"
        }
      })
      .route({
        method: "POST",
        url: /mesos\/api\/v1\?get_master/,
        response: "fx:marathon-1-task/mesos-get-master",
        headers: {
          "Content-Type": "application/json"
        }
      });

    router
      .route(
        /service\/marathon\/v2\/groups/,
        "fx:marathon-1-task/groups-suspended-sdk-services"
      )
      .route(
        /service\/marathon\/v2\/deployments/,
        "fx:marathon-1-task/deployments"
      )
      .route(/history\/minute/, "fx:marathon-1-task/history-minute")
      .route(/history\/last/, "fx:marathon-1-task/summary")
      .route(/state-summary/, "fx:marathon-1-task/summary");
  }

  if (configuration.mesos === "1-service-suspended-single-instance") {
    cy
      .route({
        method: "POST",
        url: /mesos\/api\/v1\?subscribe/,
        response: require("../_fixtures/marathon-1-task/mesos-subscribe"),
        headers: {
          "Content-Type": "application/json"
        }
      })
      .route({
        method: "POST",
        url: /mesos\/api\/v1\?get_master/,
        response: "fx:marathon-1-task/mesos-get-master",
        headers: {
          "Content-Type": "application/json"
        }
      });

    router
      .route(
        /service\/marathon\/v2\/apps/,
        "fx:marathon-1-task/app-suspended-single-instance"
      )
      .route(
        /service\/marathon\/v2\/groups/,
        "fx:marathon-1-task/groups-suspended-single-instance"
      )
      .route(
        /service\/marathon\/v2\/deployments/,
        "fx:marathon-1-task/deployments"
      )
      .route(/history\/minute/, "fx:marathon-1-task/history-minute")
      .route(/history\/last/, "fx:marathon-1-task/summary")
      .route(/state-summary/, "fx:marathon-1-task/summary");
  }

  if (configuration.networkVIPSummaries) {
    router.route(
      /networking\/api\/v1\/summary/,
      "fx:networking/networking-vip-summaries"
    );
  }

  if (configuration.universePackages) {
    router
      // Packages
      .route({
        method: "POST",
        url: /package\/describe/,
        status: 200,
        response: "fx:cosmos/package-describe"
      })
      .route({
        method: "POST",
        url: /service\/describe/,
        status: 200,
        response: "fx:cosmos/service-describe"
      })
      .route({
        method: "POST",
        url: /service\/update/,
        status: 200,
        response: "fx:cosmos/service-update"
      })
      .route({
        method: "POST",
        url: /package\/list/,
        status: 200,
        response: "fx:cosmos/packages-list"
      })
      .route({
        method: "POST",
        url: /package\/list-versions/,
        status: 200,
        response: "fx:cosmos/package-list-versions"
      })
      .route({
        method: "POST",
        url: /package\/search/,
        status: 200,
        response: "fx:cosmos/packages-search"
      })
      .route({
        method: "POST",
        url: /package\/install/,
        status: 200,
        response: "fx:cosmos/package-install"
      })
      // Repositories
      .route({
        method: "POST",
        url: /repository\/list/,
        status: 200,
        response: "fx:cosmos/repositories-list"
      })
      .route({
        method: "POST",
        url: /repository\/add/,
        status: 200,
        response: "fx:cosmos/repositories-list"
      })
      .route({
        method: "POST",
        url: /repository\/delete/,
        status: 200,
        response: "fx:cosmos/repositories-list"
      });
  }

  if (configuration.componentHealth) {
    router
      .route(/system\/health\/v1\/units/, "fx:unit-health/units")
      .route(
        /system\/health\/v1\/units\/dcos-mesos-dns\.service/,
        "fx:unit-health/unit"
      )
      .route(
        /system\/health\/v1\/units\/dcos-mesos-dns\.service\/nodes/,
        "fx:unit-health/unit-nodes"
      )
      .route(
        /system\/health\/v1\/units\/dcos-mesos-dns\.service\/nodes\/10\.10\.0\.236/,
        "fx:unit-health/unit-node"
      );
  }

  if (configuration.nodeHealth) {
    router
      .route(
        /system\/health\/v1\/nodes(\?_timestamp=[0-9]+)?$/,
        "fx:unit-health/nodes"
      )
      .route(
        /system\/health\/v1\/nodes\/172\.17\.8\.101/,
        "fx:unit-health/node"
      )
      .route(
        /system\/health\/v1\/nodes\/(.*)\/units/,
        "fx:unit-health/node-units"
      )
      .route(
        /system\/health\/v1\/nodes\/172\.17\.8\.101\/nodes\/REPLACE/,
        "fx:unit-health/node-unit"
      );
  }

  if (configuration.jobDetails) {
    router.route(/jobs\/(.*)/, "fx:metronome/job");
  }

  // The app won't load until plugins are loaded
  var pluginsFixture = configuration.plugins || "no-plugins";
  router.route(/ui-config/, "fx:config/" + pluginsFixture + ".json");

  // Metadata
  router.route(/metadata(\?_timestamp=[0-9]+)?$/, "fx:dcos/metadata");
});

Cypress.Commands.add("clusterCleanup", function(fn) {
  if (Cypress.env("FULL_INTEGRATION_TEST")) {
    fn();
  }
});

Cypress.Commands.add("visitUrl", function(options) {
  var callback = function() {};

  if (options.logIn && options.remoteLogIn) {
    callback = function(win) {
      // {"uid":"ui-bot","description":"UI Automated Test Bot","is_remote":true}
      win.document.cookie =
        "dcos-acs-info-cookie=" +
        "eyJ1aWQiOiJ1aS1ib3QiLCJkZXNjcmlwdGlvbiI6IlVJIEF1dG9tYXRlZCBUZXN0IEJvdCIsImlzX3JlbW90ZSI6dHJ1ZX0K";
    };
  } else {
    callback = function(win) {
      // {"uid":"ui-bot","description":"UI Automated Test Bot"}
      win.document.cookie =
        "dcos-acs-info-cookie=" +
        "eyJ1aWQiOiJ1aS1ib3QiLCJkZXNjcmlwdGlvbiI6IlVJIEF1dG9tYXRlZCBUZXN0IEJvdCJ9Cg==";
    };
  }

  if (options.identify && options.fakeAnalytics) {
    var identifyCallback = callback;
    callback = function(win) {
      identifyCallback(win);
      win.analytics = {
        initialized: true,
        page() {},
        push() {},
        track() {}
      };
    };
  }

  var url = Cypress.env("CLUSTER_URL") + "/#" + options.url;
  cy.visit(url, { onBeforeLoad: callback });
});

Cypress.Commands.add("getAPIResponse", function(endpoint, callback) {
  router.getAPIResponse(endpoint, callback);
});

/**
 * Select the input element of the form group with the given label
 *
 * NOTE: This function ignores case and removes extraneous whitespaces, yet
 *       it performs a complete label match.
 *
 * This utility is used for selecting form elements by their visual name instead
 * of using a more specific CSS selector.
 *
 * This detects DOM structures like:
 *
 * <div class="form-group">
 *   <div ...
 *     <label>Track Name</label>
 *   </div>
 *   <div ...
 *     <input />    # .. or
 *     <select />   # .. or
 *     <textarea /> # .. or
 *     <div class="form-control" />
 *   </div>
 * </div>
 *
 * @param {jQuery.Element} elements - The DOM scope to search within
 * @param {String} label - The contents of the <label> to match
 */
Cypress.Commands.add("getFormGroupInputFor", function(elements, label) {
  const compareLabel = label.toLowerCase();
  const formGroup = elements.find(".form-group").filter(function(index, group) {
    const groupLabel = Cypress.$(group).find("label");
    if (groupLabel.length === 0) {
      return false;
    }

    return StringUtil.getContents(groupLabel[0]).toLowerCase() === compareLabel;
  });

  // If nothing found, return empty selection
  expect(formGroup).not.to.equal(null);

  // If we found a form group, return the input element within
  // (Note: <span class="form control"> is used to wrap <select>s)
  return formGroup.find("textarea, input, select, *:not(span).form-control");
});

/**
 * Return the text contents of all the selected elements
 *
 * This function will return an array with the text contents of every element
 * in the context. This function extracts the contents like so:
 *
 * - .ace_editor : Uses ACE Editor API to get contents
 * - input       : Returns the value property
 * - *           : Returns the innerText value
 *
 * @param {jQuery.Element} elements - The DOM scope to search within
 */
Cypress.Commands.add("contents", function(elements) {
  return elements
    .map(function(index, element) {
      const doc = element.ownerDocument;
      const win = doc.defaultView || doc.parentWindow;

      if (element.classList.contains("ace_editor")) {
        return win.ace.edit(element.id).getValue();
      } else if (element.value !== undefined) {
        return element.value;
      } else {
        return element.innerText;
      }
    })
    .get();
});

/**
 * Convert the strings in scope into a JSON object
 *
 * @param {jQuery.Element} elements - The DOM scope to search within
 */
Cypress.Commands.add("asJson", function(contents) {
  if (contents.length != null) {
    return contents.map(function(content) {
      return JSON.parse(content);
    });
  } else {
    return JSON.parse(contents);
  }
});

/**
 * Return all the <td> cells for the given column of the table
 *
 * This function collects all the <td /> cells for the given column (addressed
 * either by it's index, or by it's <th> contents).
 *
 * @param {jQuery.Element} elements - The DOM scope to search within
 * @param {String|Number} columNameOrIndex - The table index or the <th /> contents
 */
Cypress.Commands.add("getTableColumn", function(elements, columNameOrIndex) {
  const matchedRows = elements.find("tr");
  const headings = matchedRows.eq(0).find("th");
  let columnIndex = parseInt(columNameOrIndex, 10);

  if (Number.isNaN(columnIndex)) {
    const compareName = String(columNameOrIndex).toLowerCase();

    // Fallback to first column
    columnIndex = 0;
    headings.each(function(index, th) {
      if (StringUtil.getContents(th).toLowerCase() === compareName) {
        columnIndex = index;
      }
    });
  }

  // Collect all visible rows
  return matchedRows
    .slice(1)
    .filter(function(index, element) {
      return Cypress.$(element).is(":visible");
    })
    .map(function(index, element) {
      return element.querySelectorAll("td")[columnIndex];
    });
});

/**
 * Locate a table row that contains the given string and return the entire row
 *
 * This function searches all the <tr /> elements within the current scope and
 * checks if it contains the string given. If matched, the scope is filtered
 * to the <tr /> element(s) found.
 *
 * @param {jQuery.Element} elements - The DOM scope to search within
 * @param {String} contents - The contents of the <td /> to search
 */
Cypress.Commands.add("getTableRowThatContains", function(elements, contents) {
  let matchedRows = elements.find("tr");

  matchedRows = matchedRows.filter(function(index, row) {
    return Array.prototype.slice.apply(row.childNodes).some(function(child) {
      return child.innerText.indexOf(contents) !== -1;
    });
  });

  return Cypress.$(matchedRows);
});
