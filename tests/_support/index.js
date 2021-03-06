import xhrfetch from "./xhrfetch";

require("./formChildCommands");
require("./utils/ServicesUtil");

Cypress.Commands.add("configureCluster", (configuration) => {
  cy.server();

  // //////////////////////////////////////////////////////////////////////////
  //                                 DEFAULTS                                //
  // //////////////////////////////////////////////////////////////////////////

  cy.route(/dcos-version/, "fx:dcos/dcos-version");
  cy.route({
    method: "POST",
    url: /mesos\/api\/v1\?GET_VERSION/,
    response: require("../_fixtures/v1/get_version"),
    headers: { "Content-Type": "application/json" },
  })
    .route({
      method: "POST",
      url: /mesos\/api\/v1\?subscribe/,
      response: require("../_fixtures/marathon-1-task/mesos-subscribe").default,
      headers: {
        "Content-Type": "application/json",
      },
    })
    .route({
      method: "POST",
      url: /mesos\/api\/v1\?GET_MASTER/,
      response: "fx:marathon-1-task/mesos-get-master",
      headers: { "Content-Type": "application/json" },
    });

  // //////////////////////////////////////////////////////////////////////////
  //                                OVERRIDES                                //
  // //////////////////////////////////////////////////////////////////////////

  if (configuration.mesos === "cluster-overview") {
    cy.route({
      method: "POST",
      url: /mesos\/api\/v1\?GET_FLAGS/,
      response: require("../_fixtures/v1/get_flags"),
      headers: { "Content-Type": "application/json" },
    }).as("getFlags");
    cy.route({
      method: "POST",
      url: /mesos\/api\/v1\?GET_VERSION/,
      response: require("../_fixtures/v1/get_version"),
      headers: { "Content-Type": "application/json" },
    }).as("getVersion");
    cy.route({
      method: "POST",
      url: /mesos\/api\/v1\?GET_MASTER/,
      response: require("../_fixtures/v1/get_master"),
      headers: { "Content-Type": "application/json" },
    }).as("getMaster");
  }

  if (
    configuration.mesos === "1-task-healthy" ||
    configuration.mesos === "1-task-healthy-with-region" ||
    configuration.mesos === "1-task-healthy-with-offers" ||
    configuration.mesos === "1-task-delayed" ||
    configuration.mesos === "1-task-healthy-with-quota"
  ) {
    cy.route(/service\/marathon\/v2\/apps/, "fx:marathon-1-task/app")
      .route(/net\/v1\/nodes/, "fx:1-app-for-each-health/nodes")
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
      .route(/state-summary/, "fx:marathon-1-task/summary")
      .route(/overlay-master\/state/, "fx:mesos/overlay-master");

    if (configuration.mesos === "1-task-healthy-with-offers") {
      cy.route(
        /service\/marathon\/v2\/queue/,
        "fx:marathon-1-task/offers-queue"
      );
    }

    if (configuration.mesos === "1-task-delayed") {
      cy.route(
        /service\/marathon\/v2\/queue/,
        "fx:marathon-1-task/delayed-queue"
      );
    }

    if (configuration.mesos === "1-task-healthy-with-quota") {
      cy.route(/mesos\/roles/, "fx:quota-management/roles");
    }
  }

  if (configuration.mesos === "1-task-healthy-with-region") {
    switch (configuration.regions) {
      case 1:
        cy.route(
          /service\/marathon\/v2\/groups/,
          "fx:marathon-1-task/groups-region"
        );
        break;
      default:
        cy.route(
          /service\/marathon\/v2\/groups/,
          "fx:marathon-1-task/groups-two-regions"
        );
        break;
    }
  }

  if (
    configuration.mesos === "1-pod" ||
    configuration.mesos === "1-pod-delayed"
  ) {
    cy.route(/state-summary/, "fx:marathon-1-pod-group/summary");

    if (configuration.mesos === "1-pod") {
      cy.route(
        /service\/marathon\/v2\/groups/,
        "fx:marathon-1-pod-group/groups"
      );
    }

    if (configuration.mesos === "1-pod-delayed") {
      cy.route(
        /service\/marathon\/v2\/groups/,
        "fx:marathon-1-pod-group/groups-delayed"
      );
    }
  }

  if (configuration.mesos === "1-pod-delayed") {
    cy.route(/state-summary/, "fx:marathon-1-pod-group/summary")
      .route(/service\/marathon\/v2\/groups/, "fx:marathon-1-pod-group/groups")
      .route(
        /service\/marathon\/v2\/deployments/,
        "fx:marathon-1-task/deployments"
      )
      .route(
        /service\/marathon\/v2\/queue/,
        "fx:marathon-1-pod-group/groups-delayed-queue"
      );
  }

  if (configuration.mesos === "1-empty-group") {
    cy.route(/marathon\/v2\/groups/, "fx:marathon-1-group/groups");
  }

  if (configuration.mesos === "1-for-each-health") {
    cy.route({
      method: "POST",
      url: /mesos\/api\/v1\?subscribe/,
      response: require("../_fixtures/marathon-1-task/mesos-subscribe").default,
      headers: {
        "Content-Type": "application/json",
      },
    }).route({
      method: "POST",
      url: /mesos\/api\/v1\?GET_MASTER/,
      response: "fx:marathon-1-task/mesos-get-master",
      headers: {
        "Content-Type": "application/json",
      },
    });

    cy.route(/service\/marathon\/v2\/apps/, "fx:1-app-for-each-health/app")
      .route(/net\/v1\/nodes/, "fx:1-app-for-each-health/nodes")
      .route(/service\/marathon\/v2\/groups/, "fx:1-app-for-each-health/groups")
      .route(
        /service\/marathon\/v2\/deployments/,
        "fx:marathon-1-task/deployments"
      )
      .route(/metronome\/v1\/jobs/, "fx:metronome/jobs")
      .route(/state-summary/, "fx:1-app-for-each-health/summary")
      .route(/overlay-master\/state/, "fx:mesos/overlay-master");
  }

  if (configuration.mesos === "1-service-with-executor-task") {
    cy.route({
      method: "POST",
      url: /mesos\/api\/v1\?subscribe/,
      response: require("../_fixtures/1-service-with-executor-task/mesos-subscribe")
        .default,
      delay: 100,
      headers: {
        "Content-Type": "application/json",
      },
    }).route({
      method: "POST",
      url: /mesos\/api\/v1\?GET_MASTER/,
      response: "fx:1-service-with-executor-task/mesos-get-master",
      headers: {
        "Content-Type": "application/json",
      },
    });

    cy.route(
      /service\/marathon\/v2\/apps/,
      "fx:1-service-with-executor-task/app"
    )
      .route(/net\/v1\/nodes/, "fx:1-app-for-each-health/nodes")
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
      .route(
        /agent\/.*\/files\/read.*\/stderr/,
        "fx:1-service-with-executor-task/files-read"
      )
      .route(/agent\/.*\/files\/read.*\/stdout/, {}, { status: 404 })
      .route(/state-summary/, "fx:1-service-with-executor-task/summary")
      .route(
        /agent\/.*\/slave\(1\)\/state/,
        "fx:1-service-with-executor-task/slave-state"
      );
  }

  if (configuration.mesos === "1-task-with-volumes") {
    cy.route({
      method: "POST",
      url: /mesos\/api\/v1\?subscribe/,
      response: require("../_fixtures/marathon-1-task/mesos-subscribe").default,
      headers: {
        "Content-Type": "application/json",
      },
    }).route({
      method: "POST",
      url: /mesos\/api\/v1\?GET_MASTER/,
      response: "fx:marathon-1-task/mesos-get-master",
      headers: {
        "Content-Type": "application/json",
      },
    });

    cy.route(/marathon\/v2\/apps/, "fx:marathon-1-task/app")
      .route(/marathon\/v2\/groups/, "fx:marathon-1-task-with-volumes/groups")
      .route(/marathon\/v2\/deployments/, "fx:marathon-1-task/deployments")
      .route(/state-summary/, "fx:marathon-1-task/summary");
  }

  if (configuration.mesos === "healthy-tasks-in-mesos-and-marathon") {
    cy.route({
      method: "POST",
      url: /mesos\/api\/v1\?subscribe/,
      response: require("../_fixtures/healthy-tasks-in-mesos-and-marathon//mesos-subscribe")
        .default,
      headers: {
        "Content-Type": "application/json",
      },
    }).route({
      method: "POST",
      url: /mesos\/api\/v1\?GET_MASTER/,
      response: "fx:marathon-1-task/mesos-get-master",
      headers: {
        "Content-Type": "application/json",
      },
    });

    cy.route(
      /marathon\/v2\/groups/,
      "fx:healthy-tasks-in-mesos-and-marathon/groups"
    ).route(/state-summary/, "fx:healthy-tasks-in-mesos-and-marathon/summary");
  }

  if (configuration.deployments === "one-deployment") {
    cy.route(
      /marathon\/v2\/deployments/,
      "fx:deployments/one-deployment"
    ).route(/service\/marathon\/v2\/groups/, "fx:marathon-1-group/kafka");
  }

  if (configuration.mesos === "1-service-suspended") {
    cy.route({
      method: "POST",
      url: /mesos\/api\/v1\?subscribe/,
      response: require("../_fixtures/marathon-1-task/mesos-subscribe").default,
      headers: {
        "Content-Type": "application/json",
      },
    }).route({
      method: "POST",
      url: /mesos\/api\/v1\?GET_MASTER/,
      response: "fx:marathon-1-task/mesos-get-master",
      headers: {
        "Content-Type": "application/json",
      },
    });

    cy.route(/service\/marathon\/v2\/apps/, "fx:marathon-1-task/app-suspended")
      .route(
        /service\/marathon\/v2\/groups/,
        "fx:marathon-1-task/groups-suspended"
      )
      .route(
        /service\/marathon\/v2\/deployments/,
        "fx:marathon-1-task/deployments"
      )
      .route(/state-summary/, "fx:marathon-1-task/summary");
  }

  if (
    configuration.mesos === "1-service-recovering" ||
    configuration.mesos === "1-service-delayed"
  ) {
    cy.route(/service\/marathon\/v2\/apps/, "fx:marathon-1-task/recovering/app")
      .route(
        /service\/marathon\/v2\/groups/,
        "fx:marathon-1-task/recovering/groups"
      )
      .route(
        /service\/marathon\/v2\/deployments/,
        "fx:marathon-1-task/recovering/deployments"
      )
      .route(/state-summary/, "fx:marathon-1-task/summary");

    if (configuration.mesos === "1-service-recovering") {
      cy.route(
        /service\/marathon\/v2\/queue/,
        "fx:marathon-1-task/recovering/queue"
      );
    }

    if (configuration.mesos === "1-service-delayed") {
      cy.route(
        /service\/marathon\/v2\/queue/,
        "fx:marathon-1-task/delayed/queue"
      );
    }
  }

  if (configuration.mesos === "1-service-delayed") {
    cy.route(/service\/marathon\/v2\/apps/, "fx:marathon-1-task/recovering/app")
      .route(
        /service\/marathon\/v2\/groups/,
        "fx:marathon-1-task/recovering/groups"
      )
      .route(
        /service\/marathon\/v2\/deployments/,
        "fx:marathon-1-task/recovering/deployments"
      )
      .route(/service\/marathon\/v2\/queue/, "fx:marathon-1-task/delayed/queue")
      .route(/state-summary/, "fx:marathon-1-task/summary");
  }

  if (configuration.mesos === "1-service-deleting") {
    cy.route(/service\/marathon\/v2\/apps/, "fx:marathon-1-task/deleting/app")
      .route(
        /service\/marathon\/v2\/groups/,
        "fx:marathon-1-task/deleting/groups"
      )
      .route(
        /service\/marathon\/v2\/deployments/,
        "fx:marathon-1-task/deleting/deployments"
      )
      .route(
        /service\/marathon\/v2\/queue/,
        "fx:marathon-1-task/deleting/queue"
      )
      .route(/state-summary/, "fx:marathon-1-task/summary");
  }

  if (configuration.mesos === "1-sdk-service") {
    cy.route({
      method: "POST",
      url: /mesos\/api\/v1\?subscribe/,
      response: require("../_fixtures/marathon-1-task/mesos-subscribe").default,
      headers: {
        "Content-Type": "application/json",
      },
    }).route({
      method: "POST",
      url: /mesos\/api\/v1\?GET_MASTER/,
      response: "fx:marathon-1-task/mesos-get-master",
      headers: {
        "Content-Type": "application/json",
      },
    });

    cy.route(
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
      .route(/state-summary/, "fx:marathon-1-task/summary")
      .route({
        method: "POST",
        url: /package\/search(\?_timestamp=[0-9]+)?$/,
        response: require("../_fixtures/marathon-1-task/package-search"),
        headers: {
          "Content-Type": "application/vnd.dcos.package.search-request+json",
        },
      });
  }

  if (configuration.mesos === "1-suspended-sdk-service") {
    cy.route({
      method: "POST",
      url: /mesos\/api\/v1\?subscribe/,
      response: require("../_fixtures/marathon-1-task/mesos-subscribe").default,
      headers: {
        "Content-Type": "application/json",
      },
    }).route({
      method: "POST",
      url: /mesos\/api\/v1\?GET_MASTER/,
      response: "fx:marathon-1-task/mesos-get-master",
      headers: {
        "Content-Type": "application/json",
      },
    });

    cy.route(
      /service\/marathon\/v2\/groups/,
      "fx:marathon-1-task/groups-suspended-sdk-services"
    )
      .route(
        /service\/marathon\/v2\/deployments/,
        "fx:marathon-1-task/deployments"
      )
      .route(/state-summary/, "fx:marathon-1-task/summary");
  }

  if (configuration.mesos === "1-service-suspended-single-instance") {
    cy.route({
      method: "POST",
      url: /mesos\/api\/v1\?subscribe/,
      response: require("../_fixtures/marathon-1-task/mesos-subscribe").default,
      headers: {
        "Content-Type": "application/json",
      },
    }).route({
      method: "POST",
      url: /mesos\/api\/v1\?GET_MASTER/,
      response: "fx:marathon-1-task/mesos-get-master",
      headers: {
        "Content-Type": "application/json",
      },
    });

    cy.route(
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
      .route(/state-summary/, "fx:marathon-1-task/summary");
  }

  if (configuration.mesos === "no-agents") {
    cy.route(
      /system\/health\/v1\/nodes(\?_timestamp=[0-9]+)?$/,
      "fx:no-agents/nodes"
    ).route(/state-summary/, "fx:no-agents/summary");
  }

  if (configuration.networkVIPSummaries) {
    cy.route(
      /networking\/api\/v1\/summary/,
      "fx:networking/networking-vip-summaries"
    );
  }

  if (configuration.universePackages === true) {
    cy
      // Packages
      .route({
        method: "POST",
        url: /package\/describe/,
        status: 200,
        response: "fx:cosmos/package-describe",
      })
      .route({
        method: "POST",
        url: /service\/describe/,
        status: 200,
        response: "fx:cosmos/service-describe",
      })
      .route({
        method: "POST",
        url: /service\/update/,
        status: 200,
        response: "fx:cosmos/service-update",
      })
      .route({
        method: "POST",
        url: /package\/list/,
        status: 200,
        response: "fx:cosmos/packages-list",
      })
      .route({
        method: "POST",
        url: /package\/list-versions/,
        status: 200,
        response: "fx:cosmos/package-list-versions",
      })
      .route({
        method: "POST",
        url: /package\/search/,
        status: 200,
        response: "fx:cosmos/packages-search",
      })
      .route({
        method: "POST",
        url: /package\/install/,
        status: 200,
        response: "fx:cosmos/package-install",
      })
      // Repositories
      .route({
        method: "POST",
        url: /repository\/list/,
        status: 200,
        response: "fx:cosmos/repositories-list",
      })
      .route({
        method: "POST",
        url: /repository\/add/,
        status: 200,
        response: "fx:cosmos/repositories-list",
      })
      .route({
        method: "POST",
        url: /repository\/delete/,
        status: 200,
        response: "fx:cosmos/repositories-list",
      });
  }
  if (configuration.universePackages === "communityPackage") {
    cy
      // Packages
      .route({
        method: "POST",
        url: /package\/describe/,
        status: 200,
        response: "fx:cosmos/community-package-describe",
      });
  }

  if (configuration.universePackages === "dependencyPackage") {
    cy
      // Packages
      .route({
        method: "POST",
        url: /package\/describe/,
        status: 200,
        response: "fx:cosmos/dependency-package-describe",
      });
  }

  if (configuration.universePackages === "old") {
    cy
      // Packages
      .route({
        method: "POST",
        url: /package\/describe/,
        status: 200,
        response: "fx:cosmos/old-package-describe",
      });
  }
  if (configuration.universePackages === "older") {
    cy
      // Packages
      .route({
        method: "POST",
        url: /package\/describe/,
        status: 200,
        response: "fx:cosmos/older-package-describe",
      });
  }

  if (configuration.mesosStream) {
    cy.route({
      method: "POST",
      url: /mesos\/api\/v1\?subscribe/,
      response: require("../_fixtures/marathon-1-task/mesos-subscribe").default,
      headers: {
        "Content-Type": "application/json",
      },
    }).route({
      method: "POST",
      url: /mesos\/api\/v1\?GET_MASTER/,
      response: "fx:marathon-1-task/mesos-get-master",
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  if (configuration.componentHealth) {
    cy.route(/system\/health\/v1\/units/, "fx:unit-health/units")
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
    cy.route(
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
    cy.route(/jobs\/(.*)/, "fx:metronome/job");
  }

  if (configuration["ui-settings"]) {
    switch (configuration["ui-settings"]) {
      case "default":
        cy.route({
          method: "GET",
          url: /dcos-ui-update-service\/api\/v1\/version\//,
          response: "fx:ui-settings/default-version",
          headers: {
            "Content-Type": "application/json",
          },
        }).as("getUiVersion");
        break;
      case "v0.1.0":
        cy.route({
          method: "GET",
          url: /dcos-ui-update-service\/api\/v1\/version\//,
          response: "fx:ui-settings/version-010",
          headers: {
            "Content-Type": "application/json",
          },
        }).as("getUiVersion");
        break;
      case "v0.1.1":
        cy.route({
          method: "GET",
          url: /dcos-ui-update-service\/api\/v1\/version\//,
          response: "fx:ui-settings/version-011",
          headers: {
            "Content-Type": "application/json",
          },
        }).as("getUiVersion");
        break;
      case "error":
        cy.route({
          method: "GET",
          url: /dcos-ui-update-service\/api\/v1\/version\//,
          response: "Internal Server Error",
          status: 500,
        }).as("getUiVersion");
        break;
    }
    switch (configuration.cosmos) {
      case "no-versions":
        cy.route({
          method: "POST",
          url: /package\/list-versions/,
          status: 200,
          response: "fx:ui-settings/package-versions-none",
        }).as("cosmosListVersions");
        break;
      case "error":
        cy.route({
          method: "POST",
          url: /package\/list-versions/,
          status: 500,
          response: "Internal Server Error",
        }).as("cosmosListVersions");
        break;
      default:
        cy.route({
          method: "POST",
          url: /package\/list-versions/,
          status: 200,
          response: "fx:ui-settings/package-versions",
        }).as("cosmosListVersions");
        break;
    }
    switch (configuration["update-service"]) {
      case "reset-pass":
        cy.route({
          method: "DELETE",
          url: /dcos-ui-update-service\/api\/v1\/reset\//,
          response: "OK",
          headers: {
            "Content-Type": "text/plain",
          },
        }).as("resetUiVersion");
        break;
      case "reset-fail":
        cy.route({
          method: "DELETE",
          url: /dcos-ui-update-service\/api\/v1\/reset\//,
          response: "Internal Server Error",
          status: 500,
        }).as("resetUiVersion");
        break;
      case "update-pass":
        cy.route({
          method: "POST",
          url: /dcos-ui-update-service\/api\/v1\/update\/([\w\d.-]+)\//,
          response: "OK",
          headers: {
            "Content-Type": "text/plain",
          },
        }).as("updateUiVersion");
        break;
      case "update-fail":
        cy.route({
          method: "POST",
          url: /dcos-ui-update-service\/api\/v1\/update\/([\w\d.-]+)\//,
          response: "Internal Server Error",
          status: 500,
        }).as("updateUiVersion");
        break;
    }
  }

  if (configuration.groups) {
    const {
      marathonCreate,
      marathonCreateStatus,
      marathonEdit,
      marathonEditStatus,
      mesosQuotaUpdate,
      mesosQuotaUpdateStatus,
      marathonResourceLimits,
    } = configuration.groups;

    if (marathonCreate) {
      cy.route({
        method: "POST",
        url: /service\/marathon\/v2\/groups/,
        status: marathonCreateStatus || 200,
        response: `fx:marathon-group-management/${marathonCreate}`,
      }).as("createGroup");
    }
    if (marathonEdit) {
      cy.route({
        method: "PATCH",
        url: /service\/marathon\/v2\/groups/,
        status: marathonEditStatus || 200,
        response: `fx:marathon-group-management/${marathonEdit}`,
      }).as("editGroup");
    }
    if (mesosQuotaUpdate) {
      cy.route({
        method: "POST",
        url: /mesos\/api\/v1\?UPDATE_QUOTA/,
        status: mesosQuotaUpdateStatus || 201,
        response: `fx:quota-management/${mesosQuotaUpdate}`,
      }).as("updateQuota");
    }
    if (marathonResourceLimits) {
      cy.route({
        method: "GET",
        url: /service\/marathon\/v2\/groups/,
        status: 200,
        response: `fx:resource-limits/groups`,
      });
    }
  }

  // The app won't load until plugins are loaded
  const pluginsFixture = configuration.plugins || "no-plugins";
  cy.route(/ui-config/, "fx:config/" + pluginsFixture + ".json");

  // Metadata
  cy.route(/metadata(\?_timestamp=[0-9]+)?$/, "fx:dcos/metadata");
});

Cypress.Commands.add("visitUrl", (options) => {
  cy.visit(Cypress.env("CLUSTER_URL") + "/#" + options.url, {
    onBeforeLoad(win) {
      win.document.cookie =
        options.logIn && options.remoteLogIn
          ? // {"uid":"ui-bot","description":"UI Automated Test Bot","is_remote":true}
            "dcos-acs-info-cookie=eyJ1aWQiOiJ1aS1ib3QiLCJkZXNjcmlwdGlvbiI6IlVJIEF1dG9tYXRlZCBUZXN0IEJvdCIsImlzX3JlbW90ZSI6dHJ1ZX0K"
          : // {"uid":"ui-bot","description":"UI Automated Test Bot"}
            "dcos-acs-info-cookie=eyJ1aWQiOiJ1aS1ib3QiLCJkZXNjcmlwdGlvbiI6IlVJIEF1dG9tYXRlZCBUZXN0IEJvdCJ9Cg==";

      // mock a global analytics object
      win.analytics = {
        initialized: true,
        page() {},
        push() {},
        track() {},
      };

      // cypress is currently not capable of intercepting requests made with the
      // fetch-API. we're polyfilling fetch with something that uses XHRs under
      // the hood to be able to provide our own fixtures in the way we're used
      // to. we need to eval our own fetch on the inner iframe to cross the
      // barrier between cypress and the "test-frame".
      win.eval(`window.fetch = ${xhrfetch.toString()}`);
    },
  });
});

Cypress.Commands.add("retype", { prevSubject: true }, (subject, text) =>
  // we have some weird ceremony in front, so our dsl-filter plays nice.
  cy.wrap(subject).type(` {selectall} {backspace}${text}`)
);

beforeEach(() => {
  // now this runs prior to every test
  // across all files no matter what
  const settings = JSON.parse(localStorage.getItem("dcosUserSettings"));

  if (settings && settings.JSONEditor) {
    delete settings.JSONEditor;
    localStorage.setItem("dcosUserSettings", JSON.stringify(settings));
  }
});
