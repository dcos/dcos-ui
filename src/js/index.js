/* eslint-disable no-unused-vars */
import "react-hot-loader/patch";
import React from "react";
/* eslint-enable no-unused-vars */
import ReactDOM from "react-dom";
import { RequestUtil } from "mesosphere-shared-reactjs";
import PluginSDK from "PluginSDK";
import { AppContainer } from "react-hot-loader";
// Load in our CSS.
// TODO - DCOS-6452 - remove component @imports from index.less and
// require them in the component.js
import "../styles/index.less";
import "./utils/MomentJSConfig";
import { CONFIG_ERROR } from "./constants/EventTypes";
import ApplicationUtil from "./utils/ApplicationUtil";
import ConfigStore from "./stores/ConfigStore";
import RequestErrorMsg from "./components/RequestErrorMsg";
import App from "./components/App";
import appRoutes from "./routes/index";
import RouterUtil from "./utils/RouterUtil";
import NavigationServiceUtil from "./utils/NavigationServiceUtil";

const domElement = global.document.getElementById("application");

const routes = RouterUtil.buildRoutes(appRoutes.getRoutes());
const store = PluginSDK.Store;

const renderApp = Component => {
  ReactDOM.render(Component, domElement, function() {
    PluginSDK.Hooks.doAction("applicationRendered");
  });
};

// TODO: Implement loader that can concat many sprites into a single one
// We opt to load the sprite after the Javscript files are parsed because it
// is quite expensive for the browser to parse a sprite file. This way we
// don't block the JS execution.
setTimeout(function() {
  var ajax = new XMLHttpRequest();
  ajax.open("GET", "sprite.svg", true);
  ajax.send();
  ajax.onload = function() {
    var div = global.document.createElement("div");
    div.innerHTML = ajax.responseText;
    div.style.height = 0;
    div.style.overflow = "hidden";
    div.style.width = 0;
    div.style.visibility = "hidden";
    global.document.body.insertBefore(div, global.document.body.childNodes[0]);
  };
});

// Patch json
const oldJSON = RequestUtil.json;
RequestUtil.json = function(options = {}) {
  // Proxy error function so that we can trigger a plugin event
  const oldHandler = options.error;
  options.error = function() {
    if (typeof oldHandler === "function") {
      oldHandler.apply(null, arguments);
    }
    PluginSDK.Hooks.doAction("AJAXRequestError", ...arguments);
  };

  oldJSON(options);
};

(function() {
  function renderApplication() {
    // Allow overriding of application contents
    const contents = PluginSDK.Hooks.applyFilter("applicationContents", null);
    if (contents) {
      renderApp(contents);
    } else {
      if (PluginSDK.Hooks.applyFilter("delayApplicationLoad", true)) {
        // Let's make sure we get Mesos Summary data before we render app
        // Mesos may unreachable, so we will render even on request failure
        ApplicationUtil.beginTemporaryPolling(function() {
          ApplicationUtil.invokeAfterPageLoad(renderApplicationToDOM);
        });
      } else {
        renderApplicationToDOM();
      }

      function renderApplicationToDOM() {
        NavigationServiceUtil.registerRoutesInNavigation(routes[0].childRoutes);
        renderApp(
          <AppContainer> <App store={store} routes={routes} /></AppContainer>
        );
        PluginSDK.Hooks.doAction("routes", routes);
      }
    }
  }

  function onPluginsLoaded() {
    PluginSDK.Hooks.removeAction("pluginsConfigured", onPluginsLoaded);
    ConfigStore.removeChangeListener(CONFIG_ERROR, onConfigurationError);
    renderApplication();
  }

  function onConfigurationError() {
    // Try to find appropriate DOM element or fallback
    const element = global.document.querySelector("#canvas div") || domElement;
    const columnClasses = {
      "column-small-8": false,
      "column-small-offset-2": false,
      "column-medium-6": false,
      "column-medium-offset-3": false
    };

    ReactDOM.render(
      <RequestErrorMsg
        columnClasses={columnClasses}
        header="Error requesting UI Configuration"
      />,
      element
    );
  }

  function startApplication() {
    // Plugins events
    PluginSDK.Hooks.addAction("pluginsConfigured", onPluginsLoaded);
    ConfigStore.addChangeListener(CONFIG_ERROR, onConfigurationError);

    // Load configuration
    ConfigStore.fetchConfig();
  }

  if (!global.Intl) {
    require.ensure(["intl", "intl/locale-data/jsonp/en.js"], function(require) {
      require("intl");
      require("intl/locale-data/jsonp/en.js");

      startApplication();
    });
  } else {
    startApplication();
  }
})();

if (module.hot) {
  // renderApp(<App routes={routes} />);
  // console.log(module.hot.accept());
  module.hot.accept();
  if (module.hot._main) {
    const NewApp = require("./components/App").default;

    renderApp(<NewApp> <App store={store} routes={routes} /></NewApp>);
  }
  // const NewApp = require("./components/App").default;

  // renderApp(<NewApp routes={routes} />);
  // module.hot.accept("*", () => {
  //   const NewApp = require("./components/App").default;

  //   console.log(NewApp);
  //   renderApp(<NewApp routes={routes} />);
  // });
  // module.hot.accept();
}
