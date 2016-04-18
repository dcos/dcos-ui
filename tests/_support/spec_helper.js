Cypress.addParentCommand('configureCluster', function (configuration) {
  if (Object.keys(configuration).length === 0) {
    return;
  }

  cy.chain().server();

  if (configuration.mesos === '1-task-healthy') {
    cy
      .route(/apps/, 'fx:marathon-1-task/app')
      .route(/dcos-version/, 'fx:dcos/dcos-version')
      .route(/history\/minute/, 'fx:marathon-1-task/history-minute')
      .route(/history\/last/, 'fx:marathon-1-task/summary')
      .route(/state-summary/, 'fx:marathon-1-task/summary')
      .route(/state/, 'fx:marathon-1-task/state');
  }

  if (configuration.mesos === '1-service-with-executor-task') {
    cy
      .route(/apps/, 'fx:1-service-with-executor-task/app')
      .route(/browse\.json/, 'fx:1-service-with-executor-task/browse')
      .route(/dcos-version/, 'fx:dcos/dcos-version')
      .route(/history\/minute/, 'fx:1-service-with-executor-task/history-minute')
      .route(/history\/last/, 'fx:1-service-with-executor-task/summary')
      .route(/master\/state/, 'fx:1-service-with-executor-task/state')
      .route(/state-summary/, 'fx:1-service-with-executor-task/summary')
      .route(/slave\/.*\/slave\(1\)\/state/, 'fx:1-service-with-executor-task/slave-state');
  }

  if (configuration.acl) {
    cy
      .route(/acls(\?type=.*?)?/, 'fx:acl/acls-unicode')
      .route({
        method: 'GET',
        url: /api\/v1\/ldap\/config/,
        status: 400,
        response: 'fx:acl/acls-config-empty'
      })
      .route({
        method: 'POST',
        url: /api\/v1\/ldap\/config\/test/,
        status: 400,
        response: 'fx:acl/acls-config-server-test-error'
      })
      .route({
        status: 400,
        url: /api\/v1\/ldap\/config/,
        response: ''
      })
      .route({
        status: 200,
        url: /auth\/logout/,
        response: ''
      })
      .route(/api\/v1\/groups/, 'fx:acl/groups-unicode')
      .route(/groups\/olis/, 'fx:acl/group-unicode')
      .route(/groups\/olis\/users/, 'fx:acl/group-users')
      .route(/groups\/olis\/permissions/, 'fx:acl/group-permissions')
      .route(/api\/v1\/users/, 'fx:acl/users-unicode')
      .route(/users\/quis/, 'fx:acl/user-unicode')
      .route(/users\/quis\/groups/, 'fx:acl/user-groups')
      .route(/users\/quis\/permissions/, 'fx:acl/user-permissions');

    if (configuration.singleLDAP) {
      cy.route(/api\/v1\/ldap\/config/, 'fx:acl/acls-config-1-server');
    }

    // User endpoints
    if (configuration.userNoPermissions) {
      cy.route(/users\/quis\/permissions/, 'fx:acl/user-permissions-empty');
    }

    if (configuration.userManyPermissions) {
      cy.route(/users\/quis\/permissions/, 'fx:acl/user-permissions-many');
    }

    if (configuration.userSinglePermission) {
      cy.route(/users\/quis\/permissions/, 'fx:acl/user-permissions-single');
    }

    if (configuration.userPermissionDeleteAllow) {
      cy.route({
        method: 'DELETE',
        url: /api\/v1\/acls\/.*?\/users\/quis/,
        status: 200,
        response: {}
      })
    }

    // Group endpoints
    if (configuration.groupNoPermissions) {
      cy.route(/groups\/olis\/permissions/, 'fx:acl/group-permissions-empty');
    }

    if (configuration.groupManyPermissions) {
      cy.route(/groups\/olis\/permissions/, 'fx:acl/group-permissions-many');
    }

    if (configuration.groupSinglePermission) {
      cy.route(/groups\/olis\/permissions/, 'fx:acl/group-permissions-single');
    }

    if (configuration.groupPermissionDeleteAllow) {
      cy.route({
        method: 'DELETE',
        url: /api\/v1\/acls\/.*?\/groups\/olis/,
        status: 200,
        response: {}
      })
    }
  }

  if (configuration.aclLDAPTestSuccessful) {
    cy.route({
      method: 'POST',
      url: /api\/v1\/ldap\/config/,
      status: 200,
      response: 'fx:acl/acls-config-server-test-success'
    });
  }

  if (configuration.aclLDAPDeleteSuccess) {
    cy.route({
      method: 'DELETE',
      url: /api\/v1\/ldap\/config/,
      status: 200,
      response: ''
    });
  }

  if (configuration.LDAPUserCreate) {
    if (configuration.LDAPUserCreate === 'success') {
      cy.route({
        method: 'POST',
        status: 200,
        url: /acs\/api\/v1\/ldap\/importuser/,
        response: {}
      });
    }

    if (configuration.LDAPUserCreate === 'error') {
      cy.route({
        method: 'POST',
        status: 400,
        url: /acs\/api\/v1\/ldap\/importuser/,
        response: {description: 'No LDAP Configured'}
      })
    }
  }

  if (configuration.aclCreate) {
    cy
      .route(/acls(\?type=.*?)?/, 'fx:acl/acls_empty')
      .route(/users\/quis\/permissions/, 'fx:acl/user-permissions-empty')
      .route(/groups\/olis\/permissions/, 'fx:acl/group-permissions-empty')
      .route({
        url: /acls\/dcos:adminrouter:service:marathon/,
        method: 'PUT',
        status: 200,
        response: ''
      });
  }

  if (configuration.aclsWithMarathon) {
    cy
      .route(/acls\?type=service/, 'fx:acl/acls-unicode');
  }

  if (configuration.networkVIPSummaries) {
    cy
      .route(/networking\/api\/v1\/summary/,
        'fx:networking/networking-vip-summaries');
  }

  if (configuration.universePackages) {
    cy
      // Packages
      .route({
        method: 'POST',
        url: /package\/describe/,
        status: 200,
        response: 'fx:cosmos/package-describe'
      })
      .route({
        method: 'POST',
        url: /package\/list/,
        status: 200,
        response: 'fx:cosmos/packages-list'
      })
      .route({
        method: 'POST',
        url: /package\/search/,
        status: 200,
        response: 'fx:cosmos/packages-search'
      })
      // Repositories
      .route({
        method: 'POST',
        url: /repository\/list/,
        status: 200,
        response: 'fx:cosmos/repositories-list'
      })
      .route({
        method: 'POST',
        url: /repository\/add/,
        status: 200,
        response: 'fx:cosmos/repositories-list'
      })
      .route({
        method: 'POST',
        url: /repository\/delete/,
        status: 200,
        response: 'fx:cosmos/repositories-list'
      });
  }

  if (configuration.componentHealth) {
    cy
      .route(/system\/health\/v1\/components/, 'fx:unit-health/units')
      .route(/system\/health\/v1\/units\/mesos_dns_service/, 'fx:unit-health/unit')
      .route(/system\/health\/v1\/units\/mesos_dns_service\/nodes/, 'fx:unit-health/unit-nodes')
      .route(/system\/health\/v1\/units\/mesos_dns_service\/nodes\/167\.114\.218\.155/, 'fx:unit-health/unit-node');
  }

  if (configuration.nodeHealth) {
    cy
      .route(/system\/health\/v1\/nodes/, 'fx:unit-health/nodes')
      .route(/system\/health\/v1\/nodes\/172\.17\.8\.101/, 'fx:unit-health/node')
      .route(/system\/health\/v1\/nodes\/(.*)\/components/, 'fx:unit-health/node-units')
      .route(/system\/health\/v1\/nodes\/172\.17\.8\.101\/nodes\/REPLACE/, 'fx:unit-health/node-unit');
  }

  // The app won't load until plugins are loaded
  var pluginsFixture = configuration.plugins || 'no-plugins';
  cy.route(/ui-config/, 'fx:config/' + pluginsFixture + '.json');

  // Metadata
  cy.route(/metadata(\?_timestamp=[0-9]+)?$/, 'fx:dcos/metadata');
});

Cypress.addParentCommand('visitUrl', function (options) {
  var callback = function () {};

  if (options.logIn && !options.remoteLogIn) {
    callback = function (win) {
      // {"uid":"joe","description":"Joe Doe"}
      win.document.cookie = 'dcos-acs-info-cookie=' +
        'eyJ1aWQiOiJqb2UiLCJkZXNjcmlwdGlvbiI6IkpvZSBEb2UifQ==';
    };
  } else if (options.logIn && options.remoteLogIn) {
    callback = function (win) {
      // {"uid":"joe","description":"Joe Doe","is_remote":true}
      win.document.cookie = 'dcos-acs-info-cookie=' +
        'eyJ1aWQiOiJqb2UiLCJkZXNjcmlwdGlvbiI6IkpvZSBEb2UiLCJpc19yZW1vdGUiOnRydWV9';
    };
  } else if (options.identify) {
    callback = function (win) {
      win.localStorage.setItem('email', 'ui-bot@dcos.io');
    };
  }

  if (options.identify && options.fakeAnalytics) {
    var identifyCallback = callback;
    callback = function (win) {
      identifyCallback(win);
      win.analytics = {
        initialized: true,
        page: function () {},
        push: function () {},
        track: function () {}
      };
    };
  }

  var url = 'http://localhost:4200/#' + options.url;
  cy.visit(url, {onBeforeLoad: callback});
});
