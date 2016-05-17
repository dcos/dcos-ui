Cypress.addParentCommand('configureCluster', function (configuration) {
  if (Object.keys(configuration).length === 0) {
    return;
  }

  if (Cypress.env('FULL_INTEGRATION_TEST')) {

    // Assume login if not explicitly set to false
    if (configuration.logIn !== false) {
      cy.request(
        'POST',
        Cypress.env('CLUSTER_URL') + '/acs/api/v1/auth/login',
        {password: 'deleteme', uid: 'bootstrapuser'}
      )
      .then(function (response) {
        let cookies = response.headers['set-cookie'];
        cookies.forEach(function (cookie) {
          let sessionID = cookie.split('=')[0];
          // Set cookies for cypress
          Cypress.Cookies.set(sessionID, response.body.token);
          // Set cookies for application
          cy.window().then(function (win) {
            win.document.cookie = cookie;
          });
        });
      });
    }

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

  if (configuration.mesos === '1-for-each-health') {
    cy
      .route(/apps/, 'fx:1-app-for-each-health/app')
      .route(/dcos-version/, 'fx:dcos/dcos-version')
      .route(/history\/minute/, 'fx:marathon-1-task/history-minute')
      .route(/history\/last/, 'fx:1-app-for-each-health/summary')
      .route(/state-summary/, 'fx:1-app-for-each-health/summary')
      .route(/state/, 'fx:marathon-1-task/state');
  }

  if (configuration.mesos === '1-service-with-executor-task') {
    cy
      .route(/apps/, 'fx:1-service-with-executor-task/app')
      .route(/slave\/(.*)?\/files\/(.*)?\/runs\/(.*)?/, 'fx:1-service-with-executor-task/browse')
      .route(/dcos-version/, 'fx:dcos/dcos-version')
      .route(/history\/minute/, 'fx:1-service-with-executor-task/history-minute')
      .route(/history\/last/, 'fx:1-service-with-executor-task/summary')
      .route(/master\/state/, 'fx:1-service-with-executor-task/state')
      .route(/state-summary/, 'fx:1-service-with-executor-task/summary')
      .route(/slave\/.*\/slave\(1\)\/state/, 'fx:1-service-with-executor-task/slave-state');
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
      .route(/system\/health\/v1\/units/, 'fx:unit-health/units')
      .route(/system\/health\/v1\/units\/dcos-mesos-dns\.service/, 'fx:unit-health/unit')
      .route(/system\/health\/v1\/units\/dcos-mesos-dns\.service\/nodes/, 'fx:unit-health/unit-nodes')
      .route(/system\/health\/v1\/units\/dcos-mesos-dns\.service\/nodes\/10\.10\.0\.236/, 'fx:unit-health/unit-node');
  }

  if (configuration.nodeHealth) {
    cy
      .route(/system\/health\/v1\/nodes(\?_timestamp=[0-9]+)?$/, 'fx:unit-health/nodes')
      .route(/system\/health\/v1\/nodes\/172\.17\.8\.101/, 'fx:unit-health/node')
      .route(/system\/health\/v1\/nodes\/(.*)\/units/, 'fx:unit-health/node-units')
      .route(/system\/health\/v1\/nodes\/172\.17\.8\.101\/nodes\/REPLACE/, 'fx:unit-health/node-unit');
  }

  if (configuration.servicePlan === '2-phases-in-progress') {
    cy
      .route(/service\/(.*)\/v1\/plan/, 'fx:service-plan/2-phases-in-progress');
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

  var url = Cypress.env('CLUSTER_URL') + '/#' + options.url;
  cy.visit(url, {onBeforeLoad: callback});
});
